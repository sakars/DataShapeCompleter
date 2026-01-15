

import typia, { is } from "typia";
import { ClassData, DataShapesClient, PropertyData, QueryBuilder } from "./queries.js";
import fs from "fs";
import { Dictionary } from "underscore";

const dss_url = 'https://dss.semtech.lv/api';
const client = new DataShapesClient(dss_url);
console.log("Fetching ontologies...");
const ontologies = await client.fetchOntologies();


client.ontologies = ['nobel_prizes_orig'];
client.schema_name_map = new Map<string, string>(client.ontologies.map(ont => [ont, ontologies.find(o => o.db_schema_name === ont)?.schema_name ?? ont]));

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
    private _triples: Array<[string, string, string]>;

    constructor() {
        this._dictionary = {};
        this._triples = [];
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
        this._triples.push([s, p, o]);
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

    classesOfVariable(variable: string): string[] {
        return this._triples.filter(([s, p, o]) => s === variable && p === 'a').map(([s, p, o]) => o);
    }
}

class QueryResolver {
    public term_map: QueryDB;
    public client: DataShapesClient;
    public resolution_timeout_ms: number = 1000;

    constructor(term_map?: QueryDB, client?: DataShapesClient) {
        this.term_map = term_map ?? new QueryDB();
        this.client = client ?? new DataShapesClient(dss_url);
    }


    async suggestIncomingProperties(term: string, limit: number = 500): Promise<string[]> {
        const abort_controller = new AbortController();
        const abort_signal = abort_controller.signal;
        const item = this.term_map.getOrCreateItem(term);
        if (!typia.is<Item>(item)) {
            console.warn(`Term ${term} is not a variable in the query map.`);
            return [];
        }
        // layer 1 data
        const known_classes = this.term_map.classesOfVariable(term);
        // filter so only known properties remain
        const known_outgoing = Array.from(item.outgoing).filter(p => typia.is<IRI>(this.term_map.getOrCreateItem(p)));
        const known_incoming = Array.from(item.incoming).filter(p => typia.is<IRI>(this.term_map.getOrCreateItem(p)));

        const suggestions: Promise<[string, 'in' | 'out'][]>[] = [];
        if (known_classes.length === 0) {
            for (const incoming_property of known_incoming) {
                const builder = new QueryBuilder();
                builder.incomingProperties = [incoming_property];
                builder.outgoingProperties = [];
                builder.usePPRels = true;
                builder.propertyKind = 'ObjectExt';
                builder.limit = limit;
                const params = builder.buildDSSParams();
                suggestions.push(this.client.getProperties(params, abort_signal));
            }
            for (const outgoing_property of known_outgoing) {
                const builder = new QueryBuilder();
                builder.incomingProperties = [];
                builder.outgoingProperties = [outgoing_property];
                builder.usePPRels = true;
                builder.propertyKind = 'ObjectExt';
                builder.limit = limit;
                const params = builder.buildDSSParams();
                suggestions.push(this.client.getProperties(params, abort_signal));
            }
        } else {
            for (const class_iri of known_classes) {
                const builder = new QueryBuilder();
                builder.className = class_iri;
                // builder.incomingProperties = known_incoming;
                // builder.outgoingProperties = known_outgoing;
                builder.usePPRels = true;
                builder.propertyKind = 'ObjectExt';
                builder.limit = limit;
                const params = builder.buildDSSParams();
                suggestions.push(this.client.getProperties(params, abort_signal));
            }
            for (const incoming_property of known_incoming) {
                const builder = new QueryBuilder();
                // builder.className = class_iri;
                builder.incomingProperties = [incoming_property];
                builder.outgoingProperties = [];
                builder.usePPRels = true;
                builder.propertyKind = 'ObjectExt';
                builder.limit = limit;
                const params = builder.buildDSSParams();
                suggestions.push(this.client.getProperties(params, abort_signal));
            }
            for (const outgoing_property of known_outgoing) {
                const builder = new QueryBuilder();
                // builder.className = class_iri;
                builder.incomingProperties = [];
                builder.outgoingProperties = [outgoing_property];
                builder.usePPRels = true;
                builder.propertyKind = 'ObjectExt';
                builder.limit = limit;
                const params = builder.buildDSSParams();
                suggestions.push(this.client.getProperties(params, abort_signal));
            }
        }
        const suggestion_results = await Promise.all(suggestions);
        const suggestion_sets = suggestion_results.map(res => new Set(res.filter(p => p[1] === 'in').map(p => p[0])));
        const final_suggestions = suggestion_sets.reduce((acc, set) => {
            if (acc === null) return set;
            return acc.intersection(set);
        }, null as Set<string> | null);
        return Array.from(final_suggestions ?? []).slice(0, limit);
    }

    async suggestOutgoingProperties(term: string, limit: number = 10): Promise<string[]> {
        const abort_controller = new AbortController();
        const abort_signal = abort_controller.signal;
        const item = this.term_map.getOrCreateItem(term);
        if (!typia.is<Item>(item)) {
            console.warn(`Term ${term} is not a variable in the query map.`);
            return [];
        }
        // layer 1 data
        const known_classes = this.term_map.classesOfVariable(term);
        const known_outgoing = Array.from(item.outgoing).filter(p => typia.is<IRI>(this.term_map.getOrCreateItem(p)));
        const known_incoming = Array.from(item.incoming).filter(p => typia.is<IRI>(this.term_map.getOrCreateItem(p)));
        const suggestions: Promise<[string, 'in' | 'out'][]>[] = [];
        if (known_classes.length === 0) {
            for (const incoming_property of known_incoming) {
                const builder = new QueryBuilder();
                builder.incomingProperties = [incoming_property];
                builder.outgoingProperties = [];
                builder.usePPRels = true;
                builder.propertyKind = 'ObjectExt';
                builder.limit = limit;
                const params = builder.buildDSSParams();
                suggestions.push(this.client.getProperties(params, abort_signal));
            }
            for (const outgoing_property of known_outgoing) {
                const builder = new QueryBuilder();
                builder.incomingProperties = [];
                builder.outgoingProperties = [outgoing_property];
                builder.usePPRels = true;
                builder.propertyKind = 'ObjectExt';
                builder.limit = limit;
                const params = builder.buildDSSParams();
                suggestions.push(this.client.getProperties(params, abort_signal));
            }
        } else {
            for (const class_iri of known_classes) {
                const builder = new QueryBuilder();
                builder.className = class_iri;
                // builder.incomingProperties = known_incoming;
                // builder.outgoingProperties = known_outgoing;
                builder.usePPRels = true;
                builder.propertyKind = 'ObjectExt';
                builder.limit = limit;
                const params = builder.buildDSSParams();
                suggestions.push(this.client.getProperties(params, abort_signal));
            }
            for (const incoming_property of known_incoming) {
                const builder = new QueryBuilder();
                // builder.className = class_iri;
                builder.incomingProperties = [incoming_property];
                builder.outgoingProperties = [];
                builder.usePPRels = true;
                builder.propertyKind = 'ObjectExt';
                builder.limit = limit;
                const params = builder.buildDSSParams();
                suggestions.push(this.client.getProperties(params, abort_signal));
            }
            for (const outgoing_property of known_outgoing) {
                const builder = new QueryBuilder();
                // builder.className = class_iri;
                builder.incomingProperties = [];
                builder.outgoingProperties = [outgoing_property];
                builder.usePPRels = true;
                builder.propertyKind = 'ObjectExt';
                builder.limit = limit;
                const params = builder.buildDSSParams();
                suggestions.push(this.client.getProperties(params, abort_signal));
            }
        }
        const suggestion_results = await Promise.all(suggestions);
        const suggestion_sets = suggestion_results.map(res => new Set(res.filter(p => p[1] === 'out').map(p => p[0])));
        const final_suggestions = suggestion_sets.reduce((acc, set) => {
            if (acc === null) return set;
            return acc.intersection(set);
        }, null as Set<string> | null);
        return Array.from(final_suggestions ?? []).slice(0, limit);
    }

    async suggestClasses(term: string, limit: number = 10): Promise<string[]> {
        const abort_controller = new AbortController();
        const abort_signal = abort_controller.signal;
        const item = this.term_map.getOrCreateItem(term);
        if (!typia.is<Item>(item)) {
            console.warn(`Term ${term} is not a variable in the query map.`);
            return [];
        }

        // layer 1 data
        const known_classes = this.term_map.classesOfVariable(term);
        const known_outgoing = Array.from(item.outgoing).filter(p => !isVariable(p));
        const known_incoming = Array.from(item.incoming).filter(p => !isVariable(p));
        const suggestions: Promise<string[]>[] = [];
        if (known_classes.length === 0) {
            const builder = new QueryBuilder();
            builder.incomingProperties = known_incoming;
            builder.outgoingProperties = known_outgoing;
            // builder.usePPRels = true;
            builder.propertyKind = 'ObjectExt';
            builder.limit = limit;
            const params = builder.buildDSSParams();
            suggestions.push(this.client.getClasses(params, abort_signal));
        } else {
            for (const class_iri of known_classes) {
                const builder = new QueryBuilder();
                builder.className = class_iri;
                builder.incomingProperties = known_incoming;
                builder.outgoingProperties = known_outgoing;
                // builder.usePPRels = true;
                builder.propertyKind = 'ObjectExt';
                builder.limit = limit;
                const params = builder.buildDSSParams();
                suggestions.push(this.client.getClasses(params, abort_signal));
            }
        }
        const suggestion_results = await Promise.all(suggestions);
        const suggestion_sets = suggestion_results.map(res => new Set(res));
        const final_suggestions = suggestion_sets.reduce((acc, set) => {
            if (acc === null) return set;
            return acc.intersection(set);
        }, null as Set<string> | null);
        return Array.from(final_suggestions ?? []).slice(0, limit);
    }
}

// A query term can be either a variable or a concrete IRI



function isVariable(term: string): boolean {
    return term.startsWith("?");
}


const resolver = new QueryResolver();
resolver.client = client;

const triples: [string, string, string][] = [
    ['?v1', 'rdf:label', '?v2'],
    ['?v1', 'foaf:gender', '?v3'],
    ['?v1', 'nobel:nobelPrize', '?v4'],
    ['?v4', 'nobel:category', 'http://data.nobelprize.org/terms/Physics']
];


for (const [s, p, o] of triples) {
    resolver.term_map.addTriple(s, p, o);
}

resolver.client.trace_log = false;

// console.log(await resolver.resolveValue('?p3'));
resolver.resolution_timeout_ms = -1;
resolver.client.simultaneous_requests_limit = 10;
resolver.client.invalidateCache();
{
    let total_time = 0;
    const time_start = Date.now();
    console.log("Starting resolution...");
    const answer = await resolver.suggestClasses('?v1', 300);
    const time_end = Date.now();
    // console.log("Resolution finished.");
    // console.log(`Resolution took ${time_end - time_start} ms`);
    total_time += time_end - time_start;
    console.log(`Total resolution time: ${total_time} ms`);
    console.log("Classes:");
    console.log(answer);

}

{
    let total_time = 0;
    const time_start = Date.now();
    console.log("Starting resolution...");
    const answer = await resolver.suggestIncomingProperties('?v1', 300);
    const time_end = Date.now();
    // console.log("Resolution finished.");
    // console.log(`Resolution took ${time_end - time_start} ms`);
    total_time += time_end - time_start;
    console.log(`Total resolution time: ${total_time} ms`);
    console.log("Incoming Properties:");
    console.log(answer);

}
{
    let total_time = 0;
    const time_start = Date.now();
    console.log("Starting resolution...");
    const answer = await resolver.suggestOutgoingProperties('?v1', 300);
    const time_end = Date.now();
    // console.log("Resolution finished.");
    // console.log(`Resolution took ${time_end - time_start} ms`);
    total_time += time_end - time_start;
    console.log(`Total resolution time: ${total_time} ms`);
    console.log("Outgoing Properties:");
    console.log(answer);

}



// console.log(`Average request time: ${total_time / 10}`);
export { }