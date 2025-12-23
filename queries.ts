
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
        propertyKind?: 'All';
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
    domain_class_id: null | number;
    range_class_id: null | number;
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
};

type GetPropertiesResponse = {
    data: RelativePropertyData[];
    complete: boolean;
    params: DSSParams;
    ontology: string;
};


export class DataShapesClient {
    private baseUrl: string;

    private ontologiesCache: OntologyInfo[] | null = null;

    /** Maps ontology name to list of properties */
    private propertyMapCache: Map<string, PropertyData[]> = new Map();

    public ontologies: string[] = [];

    public trace_log: boolean = false;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.ontologiesCache = null;
        this.propertyMapCache = new Map();
    }

    invalidateCache() {
        this.ontologiesCache = null;
        this.propertyMapCache = new Map();
    }

    async fetchOntologies(abort_signal?: AbortSignal): Promise<OntologyInfo[]> {
        if (this.ontologiesCache !== null) {
            return this.ontologiesCache;
        }

        if (this.trace_log) {
            console.log(`Fetching ontologies from ${this.baseUrl}/info`);
        }
        // Will throw on abort
        const api_info = await fetch(`${this.baseUrl}/info`, { signal: abort_signal });


        const api_info_data = await api_info.json();
        if (this.trace_log) {
            console.log(`Fetched ontologies: ${JSON.stringify(api_info_data, null, 2)}`);
        }

        typia.assertEquals<OntologyInfo[]>(api_info_data);
        this.ontologiesCache = api_info_data;
        return api_info_data;
    }

    async getPropertiesFromIncomingProperty(property_name: string, abort_signal?: AbortSignal): Promise<RelativePropertyData[]> {

        const results: RelativePropertyData[] = [];

        if (this.trace_log) {
            console.log(`Fetching properties from incoming property ${property_name}`);
        }

        for (const ont of this.ontologies) {
            const config: DSSParams = {
                main: {
                    use_pp_rels: true,
                    propertyKind: 'All',
                    limit: 50,
                    schemaName: ont
                },
                element: {
                    pList: {
                        in: [{ name: property_name }]
                    }
                }
            };

            try {

                const resp = await fetch(`${this.baseUrl}/ontologies/${ont}/getProperties`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(config),
                    signal: abort_signal,
                });
                const byte_data = await resp.text();

                const data = JSON.parse(byte_data.toString());

                const props = typia.assertEquals<GetPropertiesResponse>(data);
                results.push(...props.data);
            } catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                console.error(`Error fetching properties from ontology ${ont} for incoming property ${property_name}: ${msg}`);
            }
        }
        if (this.trace_log) {
            console.log(`Fetched total ${results.length} properties from incoming property ${property_name}`);
        }
        return results;
    }

    async getPropertiesFromOutgoingProperty(property_name: string, abort_signal?: AbortSignal): Promise<RelativePropertyData[]> {

        const results: RelativePropertyData[] = [];
        for (const ont of this.ontologies) {
            const config: DSSParams = {
                main: {
                    use_pp_rels: true,
                    propertyKind: 'All',
                    limit: 50,
                    schemaName: ont
                },
                element: {
                    pList: {
                        out: [{ name: property_name }]
                    }
                }
            };
            if (this.trace_log) {
                console.log(`Fetching properties from ontology ${ont} for outgoing property ${property_name}`);
            }
            const resp = await fetch(`${this.baseUrl}/ontologies/${ont}/getProperties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
                signal: abort_signal,
            });
            const byte_data = await resp.text();

            const data = JSON.parse(byte_data.toString());
            if (this.trace_log) {
                console.log(`Fetched data: ${JSON.stringify(data, null, 2)}`);
            }
            const props = typia.assertEquals<GetPropertiesResponse>(data);
            results.push(...props.data);
        }
        return results;
    }

    async getPropertiesOfIndividual(instance_uri: string, abort_signal?: AbortSignal): Promise<RelativePropertyData[]> {
        const baseConfig: DSSParams = {
            main: {
                limit: 500
            },
            element: {
                uriIndividual: instance_uri
            }
        };

        const results: RelativePropertyData[] = [];
        if (this.trace_log) {
            console.log(`Getting properties of individual ${instance_uri}`);
        }
        // Ensure ontology metadata is available to map db_schema_name -> display_name
        const ontInfo = await this.fetchOntologies(abort_signal).catch(() => null);

        for (const ont of this.ontologies) {
            // Try to find display_name for this ontology (server expects display_name in schemaName)
            const meta = ontInfo?.find(o => o.db_schema_name === ont);
            const schemaName = meta?.display_name ?? ont; // fallback to ont if lookup fails

            const config: DSSParams = {
                ...baseConfig,
                main: {
                    ...baseConfig.main,
                    schemaName,
                    // Optionally provide endpointUrl if display_name lookup failed
                    ...(meta ? {} : { endpointUrl: undefined }),
                },
            };
            const resp = await fetch(`${this.baseUrl}/ontologies/${ont}/getProperties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
                signal: abort_signal,
            });
            if (resp.status != 200) {
                console.error(`Error fetching properties for ontology ${ont} and individual ${instance_uri}: HTTP ${resp.status}`);
                continue;
            }
            const byte_data = await resp.text();
            const data = (() => {
                try {
                    return JSON.parse(byte_data.toString());
                } catch (error) {
                    console.error(`Error parsing JSON for ontology ${ont} and individual ${instance_uri}: ${byte_data}`);
                    throw error;
                }
            })();
            const props = typia.assertEquals<GetPropertiesResponse>(data);

            results.push(...props.data);

        }
        if (this.trace_log) {
            console.log(`Fetched total ${results.length} properties for individual ${instance_uri}`);
        }
        return results;
    }

    async getClassesOfIndividual(instance_uri: string, abort_signal?: AbortSignal): Promise<ClassData[]> {

        const results: ClassData[] = [];

        if (this.trace_log) {
            console.log(`Getting classes of individual ${instance_uri}`);
        }
        // Ensure ontology metadata is available to map db_schema_name -> display_name
        const ontInfo = await this.fetchOntologies(abort_signal).catch(() => null);

        for (const ont of this.ontologies) {
            // Try to find display_name for this ontology (server expects display_name in schemaName)
            const meta = ontInfo?.find(o => o.db_schema_name === ont);
            const schemaName = meta?.display_name ?? ont; // fallback to ont if lookup fails
            const config: DSSParams = {
                main: {
                    limit: 500,
                    schemaName,
                    // Optionally provide endpointUrl if display_name lookup failed
                    ...(meta ? {} : { endpointUrl: undefined }),
                },
                element: {
                    uriIndividual: instance_uri
                }
            };
            const resp = await fetch(`${this.baseUrl}/ontologies/${ont}/getClasses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
                signal: abort_signal,
            });
            const byte_data = await resp.text();
            if (resp.status != 200) {
                console.error(`Error fetching classes for ontology ${ont} and individual ${instance_uri}: HTTP ${resp.status}`);
                continue;
            }
            const data = (() => {
                try {
                    return JSON.parse(byte_data.toString());
                } catch (error) {
                    console.error(`Error parsing JSON for ontology ${ont} and individual ${instance_uri}: ${byte_data}`);
                    throw error;
                }
            })();
            const classes = typia.assertEquals<Response<ClassData>>(data);
            results.push(...classes.data);
        }

        if (this.trace_log) {
            console.log(`Fetched total ${results.length} classes for individual ${instance_uri}`);
        }

        return results;
    }

    async getClassesByIncoming(instance_uri: string, abort_signal?: AbortSignal): Promise<ClassData[]> {
        const config: DSSParams = {
            main: {
                limit: 500
            },
            element: {
                pList: {
                    in: [{ name: instance_uri }]
                }
            }
        };
        const results: ClassData[] = [];
        if (this.trace_log) {
            console.log(`Getting classes by incoming property ${instance_uri}`);
        }

        for (const ont of this.ontologies) {
            const resp = await fetch(`${this.baseUrl}/ontologies/${ont}/getClasses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
                signal: abort_signal,
            });
            const byte_data = await resp.text();

            const data = JSON.parse(byte_data.toString());
            try {
                const classes = typia.assertEquals<Response<ClassData>>(data);
                results.push(...classes.data);
            } catch (error) {
                // console.error(`data: ${JSON.stringify(data, null, 2)}`);
                throw error;
            }
        }

        if (this.trace_log) {
            console.log(`Fetched total ${results.length} classes by incoming property ${instance_uri}`);
        }

        return results;
    }

    async getClassesByOutgoing(instance_uri: string, abort_signal?: AbortSignal): Promise<ClassData[]> {
        const config: DSSParams = {
            main: {
                limit: 500
            },
            element: {
                pList: {
                    out: [{ name: instance_uri }]
                }
            }
        };
        const results: ClassData[] = [];

        if (this.trace_log) {
            console.log(`Getting classes by outgoing property ${instance_uri}`);
        }

        for (const ont of this.ontologies) {
            const resp = await fetch(`${this.baseUrl}/ontologies/${ont}/getClasses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
                signal: abort_signal,
            });
            const byte_data = await resp.text();

            const data = JSON.parse(byte_data.toString());
            const classes = typia.assertEquals<Response<ClassData>>(data);
            results.push(...classes.data);
        }

        if (this.trace_log) {
            console.log(`Fetched total ${results.length} classes by outgoing property ${instance_uri}`);
        }

        return results;
    }

    async getClassToClassProperties(class1_id: number, class2_id: number, abort_signal?: AbortSignal): Promise<ClassToClassPropertyData[]> {
        const config: DSSParams = {
            main: {
                c_1_id: class1_id,
                c_2_id: class2_id,
                limit: 500
            }
        };

        const results: ClassToClassPropertyData[] = [];

        if (this.trace_log) {
            console.log(`Getting properties connecting classes ${class1_id} and ${class2_id}`);
        }

        // Fetch ontology info to map schema name
        const ontInfo = await this.fetchOntologies(abort_signal).catch(() => null);

        for (const ont of this.ontologies) {
            const meta = ontInfo?.find(o => o.db_schema_name === ont);
            const schemaName = meta?.display_name ?? ont;

            const config_with_schema: DSSParams = {
                ...config,
                main: {
                    ...config.main!,
                    schemaName,
                },
            };

            try {
                const resp = await fetch(`${this.baseUrl}/ontologies/${ont}/xx_getClasstoClassProperties`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(config_with_schema),
                    signal: abort_signal,
                });

                if (resp.status % 100 !== 2) {
                    console.error(`Error fetching class-to-class properties for ontology ${ont}: HTTP ${resp.status}`);
                    continue;
                }

                const byte_data = await resp.text();
                const data = JSON.parse(byte_data.toString());
                const props = typia.assertEquals<Response<ClassToClassPropertyData>>(data);
                results.push(...props.data);
            } catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                console.error(`Error fetching class-to-class properties for ontology ${ont}: ${msg}`);
            }
        }

        if (this.trace_log) {
            console.log(`Fetched total ${results.length} properties connecting classes ${class1_id} and ${class2_id}`);
        }

        return results;
    }
}

export class QueryBuilder {

    createDSSParams(): DSSParams {
        return {};
    }
}