
import typia from "typia";

export type OntologyInfo = {
    id: number;
    display_name: string;
    db_schema_name: string;
    description: string | null;
    endpoint_id: number;
    is_active: boolean;
    is_default_for_endpoint: boolean;
    order_inx: number;
    tags: string[];
    sparql_url: string | null;
    public_url: string | null;
    named_graph: string | null;
    endpoint_type: string;
    hide_instances: boolean;
    profile_data: {
        ns: unknown[];
        schema: string;
    };
    schema_name: string;
    direct_class_role: string;
    indirect_class_role: string | null;
    use_pp_rels: boolean | null;
    has_instance_table: boolean;
    class_count: string;
}



type DSSParams = {
    main?: {
        propertyKind?: 'All' | 'ObjectExt';
        limit?: number;
        pList?: {
            in?: {
                name: string;
                type: 'in';
            }[];
            out?: {
                name: string;
                type: 'out';
            }[];
        };
        use_pp_rels?: boolean;
        direct_class_role?: string;
        indirect_class_role?: string;
        has_classification_property?: boolean;
        has_classification_adornment?: boolean;
        className?: string;
        show_prefixes?: boolean;
        endpointUrl?: string;
        schemaName?: string;
        schemaType?: string;
        linksWithTargets?: boolean;
        has_followers_ok?: boolean;
        has_outgoing_props_ok?: boolean;
        has_incoming_props_ok?: boolean;
        simple_prompt?: boolean;
        c_1_id?: number;
        c_2_id?: number;
    };
    element?: {

        pList?: {
            in?: {
                name: string;
                type?: 'in';
                id?: number;
            }[];
            out?: {
                name: string;
                type?: 'out';
                id?: number;
            }[];
        };
        uriIndividual?: string;
    }
    // Probably incomplete, add more if needed
};

export type ClassData = {
    id: number;
    iri: string;
    cnt: string | number;
    full_name: string;
    data_cnt?: string | number;
    ns_id?: number | null;
    prefix?: string | null;
    props_in_schema?: boolean;
    local_name?: string;
    display_name?: string;
    classification_property_id?: number;
    classification_property?: string;
    classification_adornment?: null | string;
    is_literal?: boolean;
    datatype_id?: null | number;
    instance_name_pattern?: null;
    indirect_members?: boolean;
    is_unique?: boolean;
    namestring?: string;
    cnt_x?: string;
    is_local?: boolean | null;
    large_superclass_id?: null;
    hide_in_main?: boolean;
    principal_super_class_id?: null | number;
    self_cp_rels?: boolean;
    cp_ask_endpoint?: boolean;
    in_cnt?: string | null;
    principal_class?: number;

}

export type PropertyData = {
    prefix: string | null;
    name?: string;
    cnt: string | number;
    iri: string;
}

export type ClassToClassPropertyData = {
    prefix: string | null;
    display_name: string;
    shortName: string;  // e.g., "dbo:property"
    name: string;       // e.g., "dbo:property (123.4K)"
    cnt: number;        // instance count
}

type Response<DataType> = {
    data: DataType[];
    complete: boolean;
    params: DSSParams;
    ontology: string;
}

type PropertyFetchResponse = Response<PropertyData>;
type ClassFetchResponse = Response<ClassData>;

type RelativePropertyData = PropertyData & {
    mark: 'in' | 'out';
    x_max_cardinality: number | string;
    id: number;
    ns_id: number;
    display_name: string;
    local_name: string;
    is_unique: boolean;
    object_cnt: string | number;
    data_cnt: string | number;
    source_cover_complete: boolean;
    target_cover_complete: boolean;
    namestring: string;
    cnt_x: string;
    object_cnt_x: string;
    data_cnt_x: string;
    is_local: boolean;
    domain_class_id?: null | number;
    range_class_id?: null | number;
    classes_in_schema?: boolean;
    is_classifier?: boolean;
    use_in_class?: boolean | null;
    classif_prefix?: null | string;
    values_have_cp?: boolean | null;
    props_in_schema?: boolean;
    pp_ask_endpoint?: boolean;
    pc_ask_endpoint?: boolean;
    basic_order_level: number;
    max_cardinality: string | number;
    inverse_max_cardinality: string | number;
    has_followers_ok?: boolean;
    has_incoming_props_ok?: boolean;
    has_outgoing_props_ok?: boolean;
    o: string | number;
    full_name: string;
    class_iri?: string | null;
    class_prefix?: string | null;
    class_display_name?: string | null;
    class_local_name?: string | null;
    class_is_unique?: boolean | null;
    class_namestring?: string | null;
    local_priority?: number;
    class_is_local?: boolean | null;
    class_cprop_id?: number | null;
    class_cprop?: string | null;
    class_adornment?: string | null;
    class_is_literal?: boolean | null;
    cname_datatype_id?: number | null;
};

type GetPropertiesResponse = {
    data: RelativePropertyData[];
    complete: boolean;
    params: DSSParams;
    ontology: string;
};

type BaseDSSParams =
    Required<Pick<DSSParams, 'main' | 'element'>>;

export class DataShapesClient {
    private baseUrl: string;

    private ontologiesCache: OntologyInfo[] | null = null;

    /** Maps ontology name to list of properties */
    private propertyMapCache: Map<string, PropertyData[]> = new Map();

    public ontologies: string[] = [];

    public trace_log: boolean = false;

    public simultaneous_requests_limit: number = 1;

    private ongoing_requests: number = 0;

    private peak_ongoing_requests: number = 0;

    private total_requests_made: number = 0;

    private total_request_time_ms: number = 0;

    private request_times: number[] = [];

    private wait_queue: [() => void, () => void][] = [];

    public schema_name_map: Map<string, string> = new Map();

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.ontologiesCache = null;
        this.propertyMapCache = new Map();
    }

    get currentOngoingRequests(): number {
        return this.ongoing_requests;
    }

    get peakOngoingRequests(): number {
        return this.peak_ongoing_requests;
    }

    get totalRequestsMade(): number {
        return this.total_requests_made;
    }

    get averageRequestTimeMs(): number {
        if (this.total_requests_made === 0) {
            return 0;
        }
        return this.total_request_time_ms / this.total_requests_made;
    }

    get medianRequestTimeMs(): number {
        if (this.request_times.length === 0) {
            return 0;
        }
        const sorted = [...this.request_times].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            return (sorted[mid - 1] + sorted[mid]) / 2;
        } else {
            return sorted[mid];
        }
    }

    invalidateCache() {
        this.ontologiesCache = null;
        this.propertyMapCache = new Map();
        this.peak_ongoing_requests = 0;
        this.total_requests_made = 0;
        this.total_request_time_ms = 0;
        this.request_times = [];
        for (const resolver of this.wait_queue) {
            resolver[1](); // call reject
        }
        this.wait_queue = [];
    }

    private async acquireRequestSlot() {
        // while (this.ongoing_requests >= this.simultaneous_requests_limit) {
        //     await new Promise(resolve => setTimeout(resolve, 50));
        // }
        // this.ongoing_requests += 1;
        // if (this.ongoing_requests > this.peak_ongoing_requests) {
        //     this.peak_ongoing_requests = this.ongoing_requests;
        // }
        // this.total_requests_made += 1;
        // return {
        //     acquired_timestamp: Date.now(),
        // }
        if (this.ongoing_requests < this.simultaneous_requests_limit) {
            this.ongoing_requests += 1;
            if (this.peak_ongoing_requests < this.ongoing_requests) {
                this.peak_ongoing_requests = this.ongoing_requests;
            }
            this.total_requests_made += 1;
            return {
                acquired_timestamp: Date.now(),

            };
        }
        return await new Promise<{ acquired_timestamp: number }>((resolve, reject) => {
            this.wait_queue.push([
                () => {
                    this.ongoing_requests += 1;
                    if (this.peak_ongoing_requests < this.ongoing_requests) {
                        this.peak_ongoing_requests = this.ongoing_requests;
                    }
                    this.total_requests_made += 1;
                    resolve({ acquired_timestamp: Date.now() });
                },
                () => {
                    reject(new Error("Request slot acquisition aborted"));
                }
            ]);
        });
    }

    private releaseRequestSlot(lock_data: { acquired_timestamp: number }) {
        // console.log(`Request completed in ${Date.now() - lock_data.acquired_timestamp} ms`);
        // this.ongoing_requests -= 1;
        const request_time = Date.now() - lock_data.acquired_timestamp;
        if (this.trace_log) {
            console.log(`Request completed in ${request_time} ms`);
        }
        this.total_request_time_ms += request_time;
        this.request_times.push(request_time);
        this.ongoing_requests -= 1;
        if (this.wait_queue.length > 0) {
            const next = this.wait_queue.shift()!;
            next[0](); // call resolve
        }
    }

    async fetchOntologies(abort_signal?: AbortSignal): Promise<OntologyInfo[]> {
        if (this.ontologiesCache !== null) {
            return this.ontologiesCache;
        }

        if (this.trace_log) {
            console.log(`Fetching ontologies from ${this.baseUrl}/info`);
        }
        while (this.ongoing_requests >= this.simultaneous_requests_limit) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        const lock_data = await this.acquireRequestSlot();
        try {
            // Will throw on abort
            const api_info = await fetch(`${this.baseUrl}/info`, { signal: abort_signal });
            const api_info_data = await api_info.json();
            if (this.trace_log) {
                console.log(`Fetched ontologies: ${JSON.stringify(api_info_data, null, 2)}`);
            }

            // typia.assertEquals<OntologyInfo[]>(api_info_data);
            this.ontologiesCache = api_info_data;
            return api_info_data;
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching ontologies: ${msg}`);
        } finally {
            // Release slot even on any errors
            this.releaseRequestSlot(lock_data);
        }

    }

    async getProperties(params: BaseDSSParams, abort_signal?: AbortSignal): Promise<[string, 'in' | 'out'][]> {

        if (!(params.main.limit)) {
            params.main.limit = 500;
        }
        const limit = params.main.limit;

        const ontRequests: Promise<GetPropertiesResponse | null>[] = [];
        for (const ont of this.ontologies) {
            ontRequests.push((async () => {
                params.main.schemaName = this.schema_name_map.get(ont) ?? ont;
                const lock_data = await this.acquireRequestSlot();
                try {
                    const resp = await fetch(`${this.baseUrl}/ontologies/${ont}/getProperties`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(params),
                        signal: abort_signal,
                    });
                    const byte_data = await resp.text();
                    const data = JSON.parse(byte_data.toString());
                    const props = typia.assertEquals<GetPropertiesResponse>(data);
                    if (!props.complete) {
                        if (this.trace_log) {
                            console.warn(`Warning: fetched properties for ontology ${ont} not complete (limit ${limit} reached) Ignoring results.`);
                        }
                        return null;
                    }
                    return props;
                }
                catch (error) {
                    const msg = error instanceof Error ? error.message : String(error);
                    console.error(`Error fetching properties for ontology ${ont}: ${msg}`);
                }
                finally {
                    this.releaseRequestSlot(lock_data);
                }
                return null;
            })());
        }
        const results: GetPropertiesResponse[] = (await Promise.all(ontRequests)).filter(x => x !== null);
        return results.flatMap(r => r.data.map(p => [p.iri, p.mark] as [string, 'in' | 'out']));
    }

    async getClasses(params: BaseDSSParams, abort_signal?: AbortSignal): Promise<string[]> {

        if (!(params.main.limit)) {
            params.main.limit = 500;
        }
        const limit = params.main.limit;

        const results: Promise<ClassFetchResponse | null>[] = [];
        for (const ont of this.ontologies) {
            results.push((async () => {
                params.main.schemaName = this.schema_name_map.get(ont) ?? ont;
                const lock_data = await this.acquireRequestSlot();
                try {
                    const resp = await fetch(`${this.baseUrl}/ontologies/${ont}/getClasses`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(params),
                        signal: abort_signal,
                    });
                    const byte_data = await resp.text();
                    const data = JSON.parse(byte_data.toString());
                    const classes = typia.assertEquals<ClassFetchResponse>(data);
                    if (!classes.complete) {
                        if (this.trace_log) {
                            console.warn(`Warning: fetched classes for ontology ${ont} not complete (limit ${limit} reached) Ignoring results.`);
                        }
                        return null;
                    }
                    return classes;

                }
                catch (error) {
                    const msg = error instanceof Error ? error.message : String(error);
                    console.error(`Error fetching classes for ontology ${ont}: ${msg}`);
                }
                finally {
                    this.releaseRequestSlot(lock_data);
                }
                return null;
            })());
        }
        const results_resolved: ClassFetchResponse[] = (await Promise.all(results)).filter(x => x !== null) as ClassFetchResponse[];
        return results_resolved.flatMap(r => r.data.map(c => c.iri));
    }
}


export class QueryBuilder {

    public incomingProperties: string[] | null = null;
    public outgoingProperties: string[] | null = null;
    public className: string | null = null;
    public instanceIRI: string | null = null;
    public ontology: string | null = null;
    public limit: number = 500;
    public usePPRels: boolean | null = null;
    public propertyKind: 'All' | 'ObjectExt' | null = null;
    public linksWithTargets: boolean | null = true;

    public buildDSSParams(): BaseDSSParams {
        let params: BaseDSSParams = {
            main: {},
            element: {}
        };
        if (this.instanceIRI !== null) {
            params.element.uriIndividual = this.instanceIRI;
        }
        if (this.incomingProperties !== null) {
            params.element.pList = params.element.pList ?? {};
            params.element.pList.in = this.incomingProperties.map(v => ({ name: v, type: 'in' }));
        }
        if (this.outgoingProperties !== null) {
            params.element.pList = params.element.pList ?? {};
            params.element.pList.out = this.outgoingProperties.map(v => ({ name: v, type: 'out' }));
        }
        if (this.className !== null) {
            params.main.className = this.className;
        }
        params.main.limit = this.limit;
        if (this.ontology !== null) {
            params.main.schemaName = this.ontology;
        }
        if (this.usePPRels !== null) {
            params.main.use_pp_rels = this.usePPRels;
        }
        if (this.propertyKind !== null) {
            params.main.propertyKind = this.propertyKind;
        }
        if (this.linksWithTargets !== null) {
            params.main.linksWithTargets = this.linksWithTargets;
        }
        return params;
    }

}