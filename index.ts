

import typia, { is } from "typia";
import { ClassData, DataShapesClient, PropertyData } from "./queries.js";
import fs from "fs";
import { Dictionary } from "underscore";

const dss_url = 'https://dss.semtech.lv/api';
const client = new DataShapesClient(dss_url);
console.log("Fetching ontologies...");
console.log((await client.fetchOntologies()).filter(o => o.db_schema_name.startsWith('dbpedia')));

client.ontologies = ['dbpedia'];

interface BaseItem {
    variable: string;
}

interface PredicateItem extends BaseItem {

    subjects: Set<string>; // variable or property IRIs that are subjects for this predicate
    objects: Set<string>; // variable or property IRIs that are objects for this predicate

    // getSubjects(term_map: QueryDB): Promise<Item[]>;
    // getObjects(term_map: QueryDB): Promise<Item[]>;

}

interface ObjectItem extends BaseItem {
    incoming: Set<string>; // variable or property IRIs that point to this item
    outgoing: Set<string>; // variable or property IRIs that this item points to
    // getOutgoingFromIncoming(client: DataShapesClient, term_map: QueryDB, max_depth?: number, depth?: number) : Promise<Set<string>>;
}

class Item implements ObjectItem, PredicateItem {
    public incoming: Set<string>; // variable or property IRIs that point to this item
    public outgoing: Set<string>; // variable or property IRIs that this item points to
    public subjects: Set<string>;
    public objects: Set<string>;
    public variable: string;

    constructor(name: string) {
        this.incoming = new Set<string>();
        this.outgoing = new Set<string>();
        this.subjects = new Set<string>();
        this.objects = new Set<string>();
        this.variable = name;
    }

}

type IRI = string;
type QueryTerm = Item | IRI;

class QueryDB {
    private _dictionary: Dictionary<Item>;

    constructor() {
        this._dictionary = {};
    }
    getOrCreateItem(term: string): QueryTerm {
        if (isVariable(term)) {
            if (!(term in this._dictionary)) {
                this._dictionary[term] = new Item(term);
            }
            return this._dictionary[term];
        } else {
            return term;
        }
    }

    addTriple(s: string, p: string, o: string) {
        const subject_item = this.getOrCreateItem(s);
        const predicate_item = this.getOrCreateItem(p);
        const object_item = this.getOrCreateItem(o);
        if (subject_item instanceof Item) {
            subject_item.outgoing.add(p);
        }
        if (object_item instanceof Item) {
            object_item.incoming.add(p);
        }
        if (predicate_item instanceof Item) {
            predicate_item.subjects.add(s);
            predicate_item.objects.add(o);
        }
    }

}

type ResolutionKey = string;

type ResolutionType = 'outgoing' | 'class' | 'value' | 'incoming';
class QueryResolver {
    public term_map: QueryDB;
    public client: DataShapesClient;


    private active_resolutions: Map<ResolutionKey, Promise<Set<IRI> | null>> = new Map();

    public resolution_timeout_ms: number = 1000;

    constructor(term_map?: QueryDB, client?: DataShapesClient) {
        this.term_map = term_map ?? new QueryDB();
        this.client = client ?? new DataShapesClient(dss_url);
    }

    private static encodeResolutionKey(term: IRI, type: ResolutionType): ResolutionKey {
        return JSON.stringify([term, type]);
    }

    private static decodeResolutionKey(key: ResolutionKey): [IRI, ResolutionType] {
        const parsed = JSON.parse(key);
        typia.assert<[IRI, ResolutionType]>(parsed);
        return parsed;
    }




    private async registerResolution(term: IRI, type: ResolutionType, dependencies: Set<ResolutionKey>, abort_signal?: AbortSignal): Promise<Set<IRI> | null> {
        if (dependencies.has(QueryResolver.encodeResolutionKey(term, type))) {
            return null; // Circular dependency detected
        }
        dependencies.add(QueryResolver.encodeResolutionKey(term, type));
        if (this.active_resolutions.has(QueryResolver.encodeResolutionKey(term, type))) {
            return this.active_resolutions.get(QueryResolver.encodeResolutionKey(term, type)) as Promise<Set<IRI> | null>;
        } else {
            // Create a lock to add the active resolution to the promise map before starting the resolution
            // This prevents accidentally starting multiple resolutions for the same term/type pair.
            let lock_release: () => void;
            const lock = new Promise<void>(resolve => {
                lock_release = resolve;
            });
            const promise = (async () => {
                await lock;
                switch (type) {
                    case 'outgoing':
                        return this._resolveOutgoing(term, dependencies, abort_signal);
                    case 'incoming':
                        return this._resolveIncoming(term, dependencies, abort_signal);
                    case 'value':
                        return this._resolveValue(term, dependencies, abort_signal);
                    case 'class':
                        return this._resolveClass(term, dependencies, abort_signal);
                    default:
                        throw new Error(`Unknown resolution type: ${type}`);
                }
            })();
            this.active_resolutions.set(QueryResolver.encodeResolutionKey(term, type), promise);
            lock_release!();
            return promise;
        }
    }


    private async _resolveOutgoing(term: IRI, dependencies: Set<ResolutionKey>, abort_signal?: AbortSignal): Promise<Set<IRI> | null> {
        let result: Set<IRI> | null = null;
        const query_term = this.term_map.getOrCreateItem(term);
        try {
            if (typia.is<Item>(query_term)) {
                const awaitables: Promise<void>[] = [];
                // From incoming properties
                for (const incoming_property_iri of query_term.incoming) {
                    awaitables.push((async () => {
                        const values = await this.registerResolution(incoming_property_iri, 'value', dependencies, abort_signal);
                        if (values === null) return;
                        let subresult: Set<IRI> | null = null;
                        const awaitables_inner: Promise<void>[] = [];
                        for (const value_iri of values) {
                            awaitables_inner.push((async () => {
                                const outgoing_properties = await this.client.getPropertiesFromIncomingProperty(value_iri, abort_signal);
                                const out_properties = outgoing_properties.filter(p => p.mark === "out");
                                const subsubresult = new Set(out_properties.map(p => p.iri));
                                subresult = subresult ?? subsubresult;
                                subresult = subresult.union(subsubresult);
                            })());
                        }
                        await Promise.all(awaitables_inner);
                        if (subresult !== null) {
                            result = result ?? subresult as Set<IRI>;
                            result = result.intersection(subresult);
                        }
                    })());

                }
                // From outgoing properties
                for (const outgoing_property_iri of query_term.outgoing) {
                    awaitables.push((async () => {
                        const values = await this.registerResolution(outgoing_property_iri, 'value', dependencies, abort_signal);
                        if (values === null) return;
                        result = result ?? values;
                        result = result.intersection(values);
                    })());
                }
                // From values
                for (const value_iri of await this.registerResolution(term, 'value', dependencies, abort_signal) ?? new Set()) {
                    awaitables.push((async () => {
                        const outgoing_properties = await this.client.getPropertiesOfIndividual(value_iri, abort_signal);
                        const out_properties = outgoing_properties.filter(p => p.mark === "out");
                        const subresult = new Set(out_properties.map(p => p.iri));
                        result = result ?? subresult;
                        result = result.intersection(subresult);
                    })());
                }
                await Promise.all(awaitables);

            } else if (typia.is<IRI>(query_term)) {
                if (abort_signal?.aborted) return result;
                const properties = await this.client.getPropertiesOfIndividual(query_term, abort_signal);
                const out_properties = properties.filter(p => p.mark === "out");
                out_properties.forEach(property => {
                    result = result ?? new Set<IRI>();
                    result.add(property.iri);
                });
            }
        } catch (error) {
            if (!abort_signal?.aborted) {
                // Rethrow non-abort errors
                console.error(`Error resolving outgoing for term ${term}:`, error);
                throw error;
            }
        }
        return result;

    }


    async resolveOutgoing(term: IRI): Promise<Set<IRI> | null> {
        this.active_resolutions.clear();
        const abort_controller = new AbortController();
        const abort_signal = abort_controller.signal;
        const timeout_handle = this.resolution_timeout_ms > 0 ? setTimeout(() => {
            abort_controller.abort();
        }, this.resolution_timeout_ms) : null;
        const outgoing = await this.registerResolution(term, 'outgoing', new Set(), abort_signal);
        if (timeout_handle) clearTimeout(timeout_handle); // Clear abort timeout if resolution completed in time
        return outgoing;
    }

    private async _resolveIncoming(term: IRI, dependencies: Set<ResolutionKey>, abort_signal?: AbortSignal): Promise<Set<IRI> | null> {
        let result: Set<IRI> | null = null;
        const query_term = this.term_map.getOrCreateItem(term);
        try {
            if (typia.is<Item>(query_term)) {
                const awaitables: Promise<void>[] = [];
                // From incoming properties
                for (const incoming_property_iri of query_term.incoming) {
                    awaitables.push((async () => {
                        const values = await this.registerResolution(incoming_property_iri, 'value', dependencies, abort_signal);
                        if (values === null) return;
                        result = result ?? values;
                        result = result.intersection(values);
                    })());
                }
                // From outgoing properties
                for (const outgoing_property_iri of query_term.outgoing) {
                    awaitables.push((async () => {
                        const values = await this.registerResolution(outgoing_property_iri, 'value', dependencies, abort_signal);
                        if (values === null) return;
                        let subresult: Set<IRI> | null = null;
                        const awaitables_inner: Promise<void>[] = [];
                        for (const value_iri of values) {
                            awaitables_inner.push((async () => {
                                const incoming_properties = await this.client.getPropertiesFromOutgoingProperty(value_iri, abort_signal);
                                const in_properties = incoming_properties.filter(p => p.mark === "in");
                                const subsubresult = new Set(in_properties.map(p => p.iri));
                                subresult = subresult ?? subsubresult;
                                subresult = subresult.union(subsubresult);
                            })());
                        }
                        await Promise.all(awaitables_inner);
                        if (subresult !== null) {
                            result = result ?? subresult as Set<IRI>;
                            result = result.intersection(subresult);
                        }
                    })());
                }
                // From values
                // In case the term is also used as a predicate
                for (const value_iri of await this.registerResolution(term, 'value', dependencies, abort_signal) ?? new Set()) {
                    awaitables.push((async () => {
                        const incoming_properties = await this.client.getPropertiesOfIndividual(value_iri, abort_signal);
                        const in_properties = incoming_properties.filter(p => p.mark === "in");
                        const subresult = new Set(in_properties.map(p => p.iri));
                        result = result ?? subresult;
                        result = result.intersection(subresult);
                    })());
                }
                await Promise.all(awaitables);
            } else if (typia.is<IRI>(query_term)) {
                if (abort_signal?.aborted) return result;
                const properties = await this.client.getPropertiesOfIndividual(query_term, abort_signal);
                const in_properties = properties.filter(p => p.mark === "in");
                in_properties.forEach(property => {
                    result = result ?? new Set<IRI>();
                    result.add(property.iri);
                });
            }
        } catch (error) {
            if (!abort_signal?.aborted) {
                // Rethrow non-abort errors
                console.error(`Error resolving incoming for term ${term}:`, error);
                throw error;
            }
        }
        return result;
    }


    async resolveIncoming(term: IRI): Promise<Set<IRI> | null> {
        this.active_resolutions.clear();
        const abort_controller = new AbortController();
        const abort_signal = abort_controller.signal;
        const timeout_handle = this.resolution_timeout_ms > 0 ? setTimeout(() => {
            abort_controller.abort();
        }, this.resolution_timeout_ms) : null;
        const incoming = await this.registerResolution(term, 'incoming', new Set(), abort_signal);
        if (timeout_handle) clearTimeout(timeout_handle); // Clear abort timeout if resolution completed in time
        return incoming;
    }

    // Value resolution
    private async _resolveValue(term: IRI, dependencies: Set<ResolutionKey>, abort_signal?: AbortSignal): Promise<Set<IRI> | null> {
        // Assume term is a predicate, value checks only assume term is a predicate, and thus checks subjects and objects.
        // It does not make sense to check incoming/outgoing properties for value resolution as too many values could match predicates.
        let result: Set<IRI> | null = null;
        const query_term = this.term_map.getOrCreateItem(term);
        try {
            if (typia.is<Item>(query_term)) {
                const awaitables: Promise<void>[] = [];
                for (const incoming_property_iri of query_term.subjects) {
                    awaitables.push((async () => {
                        const values = await this.registerResolution(incoming_property_iri, 'outgoing', dependencies, abort_signal);
                        if (values === null) return;
                        result = result ?? values;
                        result = result.intersection(values);
                    })());
                }
                for (const outgoing_property_iri of query_term.objects) {
                    awaitables.push((async () => {
                        const values = await this.registerResolution(outgoing_property_iri, 'incoming', dependencies, abort_signal);
                        if (values === null) return;
                        result = result ?? values;
                        result = result.intersection(values);
                    })());
                }
                await Promise.all(awaitables);
            } else if (typia.is<IRI>(query_term)) {
                // Concrete IRI
                result = new Set<IRI>([query_term]);
            }
        } catch (error) {
            if (!abort_signal?.aborted) {
                // Rethrow non-abort errors
                console.error(`Error resolving value for term ${term}:`, error);
                throw error;
            }
        }

        return result;

    }


    // Public facade
    async resolveValue(term: IRI): Promise<Set<IRI> | null> {
        this.active_resolutions.clear();
        const abort_controller = new AbortController();
        const abort_signal = abort_controller.signal;
        const timeout_handle = this.resolution_timeout_ms > 0 ? setTimeout(() => {
            abort_controller.abort();
        }, this.resolution_timeout_ms) : null;
        const values = await this.registerResolution(term, 'value', new Set(), abort_signal);
        if (timeout_handle) clearTimeout(timeout_handle); // Clear abort timeout if resolution completed in time
        return values;
    }

    private async _resolveClass(term: IRI, dependencies: Set<ResolutionKey>, abort_signal?: AbortSignal): Promise<Set<IRI> | null> {
        let result: Set<IRI> | null = null;
        const query_term = this.term_map.getOrCreateItem(term);
        try {
            if (typia.is<Item>(query_term)) {
                const awaitables: Promise<void>[] = [];
                for (const incoming_property_iri of query_term.incoming) {
                    awaitables.push((async () => {
                        const values = await this.registerResolution(incoming_property_iri, 'value', dependencies, abort_signal);
                        if (values === null) return;
                        let subresult: Set<IRI> | null = null;
                        const awaitables_inner: Promise<void>[] = [];
                        for (const value_iri of values) {
                            awaitables_inner.push((async () => {
                                const class_data = await this.client.getClassesByIncoming(value_iri, abort_signal);
                                const class_iris = new Set<IRI>(class_data.map(c => c.iri));
                                subresult = subresult ?? class_iris;
                                subresult = subresult.union(class_iris);
                            })());
                        }
                        await Promise.all(awaitables_inner);
                        if (subresult !== null) {
                            result = result ?? subresult as Set<IRI>;
                            result = result.intersection(subresult);
                        }
                    })());
                }
                for (const outgoing_property_iri of query_term.outgoing) {
                    awaitables.push((async () => {
                        const values = await this.registerResolution(outgoing_property_iri, 'value', dependencies, abort_signal);
                        if (values === null) return;
                        let subresult: Set<IRI> | null = null;
                        const awaitables_inner: Promise<void>[] = [];
                        for (const value_iri of values) {
                            awaitables_inner.push((async () => {
                                const class_data = await this.client.getClassesByOutgoing(value_iri, abort_signal);
                                const class_iris = new Set<IRI>(class_data.map(c => c.iri));
                                subresult = subresult ?? class_iris;
                                subresult = subresult.union(class_iris);
                            })());
                        }
                        await Promise.all(awaitables_inner);
                        if (subresult !== null) {
                            result = result ?? subresult as Set<IRI>;
                            result = result.intersection(subresult);
                        }
                    })());
                }
                await Promise.all(awaitables);
            } else if (typia.is<IRI>(query_term)) {
                if (abort_signal?.aborted) return result;
                const class_data = await this.client.getClassesOfIndividual(query_term, abort_signal);
                result = new Set<IRI>(class_data.map(c => c.iri));
            }
        } catch (error) {
            if (!abort_signal?.aborted) {
                // Rethrow non-abort errors
                console.error(`Error resolving class for term ${term}:`, error);
                throw error;
            }
        }
        return result;

    }

    async resolveClass(term: IRI): Promise<Set<IRI> | null> {
        this.active_resolutions.clear();
        const abort_controller = new AbortController();
        const abort_signal = abort_controller.signal;
        const timeout_handle =
            this.resolution_timeout_ms > 0 ?
                setTimeout(() => {
                    console.log(`Class Timeout for term ${term}`);
                    abort_controller.abort();
                }, this.resolution_timeout_ms) :
                null;


        const classes = await this.registerResolution(term, 'class', new Set(), abort_signal);
        if (timeout_handle) clearTimeout(timeout_handle); // Clear abort timeout if resolution completed in time
        return classes;
    }

}

// A query term can be either a variable or a concrete IRI


// Assume this sparql query
/*

?x a ?y.
?x ?p ?z.
?y ?p2 ?z.

*/

function isVariable(term: string): boolean {
    return term.startsWith("?");
}


const resolver = new QueryResolver();
resolver.client = client;

const triples: [string, string, string][] = [
    ['http://dbpedia.org/resource/Jack_Black', '?p1', '?a2'],      // ?a2 = person
    ['?a2', '?p2', '?a3'],                                        // person -> ?a3 via ?p2
    ['?b2', '?p3', '?a3'],                                        // university -> SAME ?a3 via ?p3
    // ['?b1', 'http://data.nobelprize.org/terms/university', '?a2'], // ?b2 = university
    // ['?v1', 'http://data.nobelprize.org/terms/university', '?v2'],
    // ['?v1', '?q', '?v3']
];


for (const [s, p, o] of triples) {
    resolver.term_map.addTriple(s, p, o);
}

resolver.client.trace_log = true;

// console.log(await resolver.resolveValue('?p3'));
resolver.resolution_timeout_ms = -1;

console.log("Starting resolution...");
const time_start = Date.now();
try {
    const answer = await resolver.resolveClass('?b2');
    const time_end = Date.now();
    console.log("Resolution finished.");
    console.log(`Resolution took ${time_end - time_start} ms`);

    console.log("Answer:");
    console.log(answer);

    // console.log(await (resolver.term_map.getOrCreateItem('?a2') as Item).getOutgoingFromIncoming(client, resolver.term_map));
    // console.log(await (resolver.term_map.getOrCreateItem('?b2') as Item).getOutgoingFromIncoming(client, resolver.term_map));
    // console.log(await (resolver.term_map.getOrCreateItem('?a3') as Item).getOutgoingFromIncoming(client, resolver.term_map));
    fs.writeFileSync('debug_response.json', JSON.stringify(answer?.values()?.toArray() ?? [], null, 4));

} finally {
    console.log(resolver.client.peakOngoingRequests);
    console.log(resolver.client.totalRequestsMade);
}
export { }