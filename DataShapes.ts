// import _ from 'underscore';
// import typia from 'typia';
// // import { createVQ_Element } from './VQ_Element.js'
// // import { getSchemaNameForElement } from './transformations.js'

// // ***********************************************************************************
// // const SCHEMA_SERVER_URL = 'http://localhost:3344/api';
// //let _schemaServerUrl = null;
// // const getSchemaServerUrl = async () => new Promise((resolve, reject) => {
// //     //if (_schemaServerUrl) return _schemaServerUrl; // TODO šī saglabašana nezin kāpēc nestrādāja
// //     Meteor.call('getEnvVariable', 'SCHEMA_SERVER_URL', (error, result) => {
// //         if (error) {
// //             return reject(error);
// //         }
// //         //_schemaServerUrl = result;
// //         return resolve(result);
// //     })
// // });
// function getSchemaServerUrl() {
// 	//return 'http://localhost:3344/api';
// 	return 'https://dss.semtech.lv/api';
// 	//return await Meteor.callAsync('getEnvVariable', 'SCHEMA_SERVER_URL');
// }

// import { MongoClient, ObjectId } from 'mongodb';

// // const mongoUrl = 'mongodb://mongo:27017';
// // const client = new MongoClient(mongoUrl);
// // await client.connect();
// // const database = client.db('meteor');
// // const Projects = database.collection("Projects");


// // ***********************************************************************************
// const MAX_ANSWERS = 30;
// const MAX_IND_ANSWERS = 100;
// const MAX_TREE_ANSWERS = 30;
// const TREE_PLUS = 20;
// const BIG_CLASS_CNT = 500000;
// const DIAGRAM_CLASS_LIMIT = 2000;
// const LONG_ANSWER = 3000;
// const MakeLog = false;
// const ConsoleLog = false;
// const isPublic = false;  // Parametrs testu paslēpšanai
// // ***********************************************************************************
// export const callWithPost = async (funcName: string, data = {}) => {
// 	try {
//     const schemaServerUrl = getSchemaServerUrl();
// 		const response = await fetch(`${schemaServerUrl}/${funcName}`, {
// 			method: 'POST',
// 			mode: 'cors',
// 			cache: 'no-cache',
// 			headers: {
// 				'Content-Type': 'application/json'
// 			},
// 			body: JSON.stringify(data)
// 		});
// 		//console.log(response)
// 		return await response.json();
// 	}
// 	catch(err) {
// 		console.log("-------error-----------")
// 		return {complete: false, data: [], error: err};
//   }
// }

// export const callWithGet = async (funcName: string) => {
// 	try {
// 		const schemaServerUrl = getSchemaServerUrl();
// 		const response = await window.fetch(`${schemaServerUrl}/${funcName}`, {
// 			method: 'GET',
// 			mode: 'cors',
// 			cache: 'no-cache'
// 		});
// 		// console.log(response)
// 		return await response.json();
// 	}
// 	catch(err) {
//     console.error(err)
// 		return {};
//   }
// }


// /** @see {isOntologySchema} ts-auto-guard:type-guard */
// export type OntologySchema = {
// 	class_count: string;
// 	db_schema_name: string;
// 	description?: string | null;
// 	direct_class_role: string;
// 	display_name: string;
// 	endpoint_id: number;
// 	endpoint_type: string;
// 	has_instance_table: boolean;
// 	hide_instances: boolean;
// 	id: number;
// 	indirect_class_role?: string | null;
// 	is_active: boolean;
// 	is_default_for_endpoint: boolean;
// 	named_graph?: string | null;
// 	order_inx: number;
// 	profile_data: {
// 		schema: string;
// 		ns: {
// 			name?: string;
// 			type: string;
// 			caption: string;
// 			checked: boolean;
// 		}[];
// 	};
// 	public_url: null | string;
// 	schema_name: string;
// 	sparql_url: string | null;
// 	tags: string[];
// 	use_pp_rels: null | boolean;
// 	simple_prompt?: boolean | null;
// };

// /** @see {isTag} ts-auto-guard:type-guard */
// export type Tag = {
// 	id: number;
// 	name: string;
// 	display_name: string;
// 	description: string;
// 	is_active: boolean;
// }

// /** @see {isInfo} ts-auto-guard:type-guard */
// export type Info = OntologySchema[];

// /** @see {isNamespace} ts-auto-guard:type-guard */
// export type Namespace = {
// 	name: string;
// 	value: string;
// 	is_local?: boolean;
// }

// /** @see {isNamespaces} ts-auto-guard:type-guard */
// export type Namespaces = Namespace[];

// /** @see {isProjectData} ts-auto-guard:type-guard */
// export type ProjectData = {
//   _id: ObjectId; // MongoDB ObjectId
//   name: string;
//   toolId: string;
//   createdAt: Date;
//   createdBy: string;
//   newPublicProject: boolean;
//   isInitialized: boolean;
//   isVisualizationNeeded: boolean;
//   endpoint: string;
//   schema: string; // schema.display_name
//   uri: string; // schema.named_graph
//   queryEngineType: string; // schema.endpoint_type
//   directClassMembershipRole: string; // schema.direct_class_role
//   indirectClassMembershipRole: string; // schema.indirect_class_role
//   showPrefixesForAllNames: boolean;
//   query?: string;
//   project_link?: string;
// };

// export async function fetchInfo(): Promise<Info> {
// 	try {
// 		const schemaServerUrl = getSchemaServerUrl();
// 		console.log(schemaServerUrl);
// 		const response = await fetch(`${schemaServerUrl}/info/`, {
// 			method: 'GET',
// 			mode: 'cors',
// 			cache: 'no-cache'
// 		});
// 		// console.log(response);
// 		const data = await response.json();
// 		typia.assert<Info>(data);
// 		return data;
// 	}
// 	catch(err) {
// 		// console.error(err);
// 		throw err; // Rethrow the error to be handled by the caller
// 	}
// }

// /** @see {isInfoOntTags} ts-auto-guard:type-guard */
// export type InfoOntTags = {
// 	tags: Tag[];
// 	schemas: OntologySchema[];
// };


// async function fetchInfoOntTags(): Promise<InfoOntTags> {
// 	try {
// 		const schemaServerUrl = getSchemaServerUrl();
// 		const response = await window.fetch(`${schemaServerUrl}/infoOntTags/`, {
// 			method: 'GET',
// 			mode: 'cors',
// 			cache: 'no-cache'
// 		});
// 		const data = await response.json();
// 		typia.assert<InfoOntTags>(data);
// 		return data;
// 	}
// 	catch(err) {
// 		// console.error(err);
// 		throw err; // Rethrow the error to be handled by the caller
// 	}
// }

// async function fetchNamespaces(): Promise<Namespaces> {
// 	try {
// 		const schemaServerUrl = getSchemaServerUrl();
// 		const response = await window.fetch(`${schemaServerUrl}/public_ns/`, {
// 			method: 'GET',
// 			mode: 'cors',
// 			cache: 'no-cache'
// 		});
// 		const data = await response.json();
// 		if (!typia.validate<Namespaces>(data)) {
// 			throw new Error("Invalid data format received from server");
// 		}
// 		return data;
// 	}
// 	catch(err) {
// 		console.error(err);
// 		throw err; // Rethrow the error to be handled by the caller
// 	}
// }

// const callWithGetS = async (pr_info: { name: string; link: string }) => {
// 	//console.log('Izsaucam...', pr_info.name)
// 	let rez = false;
// 	try {
// 		//const response = await window.fetch(`${pr_info.link}`, {
// 		await window.fetch(`${pr_info.link}`, {
// 			method: 'GET',
// 			cache: 'no-cache'
// 		});
// 		rez = true;
// 	}
// 	catch(err) {
// 		console.error(err);
// 		throw err;
// 	}
// 	return rez;
// }
// //'https://www.wikidata.org/w/api.php?action=wbsearchentities&search=Q633795&language=en&limit=50&format=json&origin=*'
// const callWithGetWD = async (filter: string, limit: number) => {
// 	const callText = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${filter}&language=en&limit=${limit}&format=json&origin=*`;
// 	try {
// 		const response = await window.fetch(callText, {
// 			method: 'GET',
// 			// mode: 'no-cors',
// 			cache: 'no-cache'
// 		});
// 		//console.log(response);
// 		if (!response.ok) {
// 			console.log('neveiksmīgs wd izsaukums');
// 			return {};
// 		}
// 		return await response.json();
// 	}
// 	catch(err) {
//         console.error(err)
// 		return {};
//     }
// }
// // ***********************************************************************************
// // string -> int
// // function checks if the text is uri
// // 0 - not URI, 3 - full form, 4 - short form
// function isURI(text:string) {
//   if(text.indexOf("://") != -1)
//     return 3;
//   else
//     if(text.indexOf(":") != -1 || text.indexOf("[") != -1 ) return 4;
//   return 0;
// }

// function isIndividual(individual: string) {
// 	if (individual !== null && individual !== undefined && isURI(individual) != 0 && !individual.startsWith("?"))
// 		return true;
// }


// const findPropertiesIds = async (direct_class_role: string, indirect_class_role: string | null, prop_list: string[] = []) => {
// 	let id_list:ObjectId[] = [];
// 	async function addProperty(propertyName: string | null) {
// 		if (propertyName != '' && propertyName != undefined && propertyName != null ) {
// 			const prop = await dataShapes.resolvePropertyByName({name: propertyName});
// 			if (prop.data.length > 0)
// 				id_list.push(prop.data[0].id);
// 		}
// 	}

// 	await addProperty(direct_class_role);
// 	await addProperty(indirect_class_role);
// 	for (const element of prop_list) {
// 		await addProperty(element);
// 	}
// 	return id_list;
// }

// const classes = [
// 'All classes',
// 'dbo:Person',
// 'dbo:Place',
// 'dbo:Location',
// 'dbo:Work',
// 'dbo:Settlement',
// 'dbo:Athlete',
// 'dbo:Organisation',
// 'dbo:MusicalWork',
// 'dbo:Species',
// 'dbo:Politician',
// 'dbo:Film',
// 'dbo:Animal',
// 'dbo:Event',
// 'dbo:Agent',
// 'dbo:TimePeriod',
// 'owl:Thing',
// 'foaf:Document',
// 'skos:Concept'
// ];

// type SchemaType = {
// 	isPublic: boolean;
// 	filling: number;
// 	classCount: number;
// 	resolvedClasses: any;
// 	resolvedProperties: any;
// 	resolvedIndividuals: any;
// 	resolvedClassesF: any;
// 	resolvedPropertiesF: any;
// 	resolvedIndividualsF: any;
// 	treeTopsC: any;
// 	treeTopsP: any;
// 	treeTopsI: any;
// 	namespaces: Namespace[];
// 	local_ns: string;
// 	showPrefixes: string;
// 	projectId: ObjectId;
// 	projectId_in_process: ObjectId | string;
// 	limit: number;
// 	use_pp_rels: null | boolean;
// 	simple_prompt: boolean | null;
// 	hide_individuals: boolean;
// 	deferred_properties: string;
// 	log: any[];
// 	fullLog: any[];
// 	tree: {
// 		countC: number;
// 		countP: number;
// 		countI: number;
// 		big_class_cnt: number;
// 		plus: number;
// 		ns: any[];
// 		nsInclude: boolean;
// 		dbo: boolean;
// 		yago: boolean;
// 		local: boolean;
// 		dbp: boolean;
// 		filterC: string;
// 		filterP: string;
// 		filterI: string;
// 		pKind: string;
// 		topClass: number;
// 		classPath: any[];
// 		class: string;
// 		classes: any[];
// 	};
// 	diagram: {
// 		maxCount: number;
// 		mode: number;
// 		classList: any[];
// 		filteredClassList: any[];
// 	};
// 	info?: OntologySchema[];
// 	schemaName?: string;
// 	endpoint?: string;
// 	schema?: string;
// 	schemaType?: string;
// 	simplePrompt?: boolean;
// };

// const getEmptySchema: () => SchemaType = () => {
// 	return {
//     	isPublic:isPublic,
// 		filling: 0,
// 		classCount: 0,
// 		resolvedClasses: {},
// 		resolvedProperties: {},
// 		resolvedIndividuals: {},
// 		resolvedClassesF: {},
// 		resolvedPropertiesF: {},
// 		resolvedIndividualsF: {},
// 		treeTopsC: {},
// 		treeTopsP: {},
// 		treeTopsI: {},
// 		namespaces: [],
// 		local_ns: "",
// 		showPrefixes: "false",
// 		projectId: ObjectId.createFromBase64("AAAAAAAAAAAAAAAA"),
// 		projectId_in_process: ObjectId.createFromBase64("AAAAAAAAAAAAAAAA"),
// 		limit: MAX_ANSWERS,
// 		use_pp_rels: false,
// 		simple_prompt: false,
// 		hide_individuals: false,
// 		deferred_properties: 'false',
// 		log: [],
// 		fullLog: [],
// 		tree: {
// 			countC:MAX_TREE_ANSWERS,
// 			countP:MAX_TREE_ANSWERS,
// 			countI:MAX_IND_ANSWERS,
// 			big_class_cnt: BIG_CLASS_CNT,
// 			plus:TREE_PLUS,
// 			ns: [],
// 			nsInclude: true,
// 			dbo: true,
// 			yago: false,
// 			local: false,
// 			dbp: true,
// 			filterC: '',
// 			filterP: '',
// 			filterI: '',
// 			pKind: 'All properties',
// 			topClass: 0,
// 			classPath: [],
// 			class: '',
// 			classes: [],
// 		},
// 		diagram: {
// 			maxCount: DIAGRAM_CLASS_LIMIT,
// 			mode: 1,
// 			classList: [],
// 			filteredClassList: [],
// 		},
// 	};
// }
// const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// export type DataShapesClientParams = {
// 	main: {
// 		onlyPropsInSchema?: boolean;
// 		filter?: string;
// 		namespaces?: {
// 			in?: string[];
// 			out?: string[];
// 		}
// 	};
// 	element?: {
// 		pList?: {
// 			in?: {name: string; type: string}[];
// 			out?: {name: string; type: string}[];
// 		};
// 	}

// }

// export type OntologiesEndpointRequest = {
//   main: {
//     limit?: number;
//     filter?: string;
//     [key: string]: any; // For additional, endpoint-specific options
//   };
//   [key: string]: any; // For endpoints that accept more root-level keys
// };

// class DataShapesClient {
// 	schema: SchemaType;
// 	constructor() {
// 		this.schema = getEmptySchema();
// 	}

// 	async getClassesFull(params: DataShapesClientParams) {
// 		if ( params.main.filter !== undefined)
// 			params.main.filter = params.main.filter.replaceAll(' ','');

// 		if ( params.main.filter !== undefined && params.main.filter.split(':').length > 1 ) {
// 			const filter_split = params.main.filter.split(':');
// 			const ns = this.schema.namespaces.filter(function(n){ return n.name == filter_split[0];})
// 			if ( ns.length == 1 ) {
// 				params.main.filter = filter_split[1];
// 				params.main.namespaces = { in: [filter_split[0]]};
// 			}
// 			else {
// 				params.main.filter = filter_split[1];
// 			}
// 		}

// 		return await this.callServerFunction("getClasses", params);
// 	}

// 	async getOntologies() {
// 		try {
// 			let rr = await fetchInfo();
// 			rr.filter(function(o){ return o.display_name == ""});
// 			return rr;
// 		} catch(err) {
// 			console.error(err);
// 			throw err; // Rethrow the error to be handled by the caller
// 		}
// 	}
// 	async callServerFunction(funcName: string, params: OntologiesEndpointRequest): Promise<any> {
// 		const startTime = Date.now();
// 		let schema = this.schema.schema;
// 		let new_schema: OntologySchema | null = null;
// 		if ( params.main.schema != undefined) {
// 			new_schema = (await this.getOntologies()).find(function(o) { return o.db_schema_name == params.main.schema}) ?? null;
// 			if ( new_schema != undefined )
// 				schema = params.main.schema;
// 		}

// 		// if (s === "" || s === undefined ) {
// 		// 	await this.changeActiveProject(Session.get("activeProject"));
// 		// 	s = this.schema.schema;
// 		// }

// 		// *** console.log(params)
// 		//let rr = {complete: false, data: [], error: "DSS schema not found"};
// 		if (schema === "" || schema === undefined )
// 		{
// 			throw new Error("DSS schema not found");
// 		}
// 		if ( schema == this.schema.schema) {
// 			params.main.endpointUrl = this.schema.endpoint;
// 			params.main.use_pp_rels = this.schema.use_pp_rels;
// 			params.main.simple_prompt = this.schema.simple_prompt;
// 			params.main.schemaName = this.schema.schemaName;
// 			params.main.schemaType = this.schema.schemaType;
// 			params.main.showPrefixes = this.schema.showPrefixes;
// 		}
// 		else {
// 			params.main.endpointUrl = new_schema?.sparql_url;
// 			if ( new_schema?.named_graph != null	)
// 				params.main.endpointUrl = `${new_schema.sparql_url}?default-graph-uri=${new_schema.named_graph}`;
// 			params.main.use_pp_rels = new_schema?.use_pp_rels;
// 			params.main.simple_prompt = new_schema?.simple_prompt;
// 			params.main.schemaName = new_schema?.display_name;
// 			params.main.schemaType = new_schema?.schema_name;
// 			params.main.showPrefixes = 'true';
// 		}

// 		if ( params.main.limit === undefined )
// 			params.main.limit = this.schema.limit;

// 		const rr = await callWithPost(`ontologies/${schema}/${funcName}`, params);
		
// 		//else
// 		//	Interpreter.showErrorMsg("Project DSS parameter not found !");  // TODO par šo padomāt

// 		const time = Date.now() - startTime;

// 		if ( ConsoleLog &&  funcName != 'resolvePropertyByName' && funcName.substring(0,2) != 'xx') {
// 			if ( rr.data ) {
// 				console.log(rr);
// 				//console.log(rr.data.map(v => v.prefix + ':' + v.display_name))
// 			}
// 			console.log(time);
// 		}
// 		if ( MakeLog ) {
// 			this.schema.fullLog.push(`${funcName};${time}`);
// 			if ( time > LONG_ANSWER )
// 				this.schema.log.push(`${funcName};${time};${params.main.filter};${JSON.stringify(params.element)};${rr.sql};${rr.sql2}`);
// 		}

// 		return rr;
// 	}

// 	// async changeActiveProjectFull (proj: ProjectData) {
// 	// 	//console.log('------changeActiveProjectFull-------')

// 	// 	// let projectId_in_process = this.schema.projectId_in_process;
// 	// 	// if ( proj !== undefined && projectId_in_process == proj._id ) {
// 	// 	// 	while (projectId_in_process == proj._id) {
// 	// 	// 		await delay(5000);
// 	// 	// 		projectId_in_process = this.schema.projectId_in_process;
// 	// 	// 	}
// 	// 	// }
// 	// 	// else 
// 	// 	if (proj !== undefined && ( this.schema.projectId != proj._id || this.schema.filling === 0 )) {
// 	// 		this.schema = getEmptySchema();
// 	// 		if ( proj.schema !== undefined && proj.schema !== "") {
// 	// 			this.schema.projectId = proj._id;
// 	// 			this.schema.projectId_in_process = proj._id;
// 	// 			this.schema.schemaName =  proj.schema;
// 	// 			this.schema.showPrefixes = proj.showPrefixesForAllNames.toString();
// 	// 			//this.schema.empty = false;
// 	// 			this.schema.endpoint =  proj.endpoint;
// 	// 			if ( proj.uri != undefined && proj.uri !== '' )
// 	// 				this.schema.endpoint = `${proj.endpoint}?default-graph-uri=${proj.uri}`;

// 	// 			const info = await fetchInfo();
// 	// 			// if (info.error) {
// 	// 			// 	console.error(info);
// 	// 			// 	this.schema.projectId_in_process = "";
// 	// 			// 	return;
// 	// 			// }
// 	// 			this.schema.info = info;
// 	// 			if (info.filter(function(o){ return o.display_name == proj.schema}).length > 0) {
// 	// 				const schema_info = info.filter(function(o){ return o.display_name == proj.schema})[0];
// 	// 				this.schema.schema = schema_info.db_schema_name;
// 	// 				this.schema.schemaType = schema_info.schema_name;
// 	// 				this.schema.use_pp_rels = schema_info.use_pp_rels;
// 	// 				this.schema.simple_prompt = schema_info.simple_prompt ?? null;
// 	// 				this.schema.hide_individuals = schema_info.hide_instances;
// 	// 				const prop_id_list = await findPropertiesIds(schema_info.direct_class_role, schema_info.indirect_class_role);
// 	// 				if (prop_id_list.length>0)
// 	// 					this.schema.deferred_properties = `id in ( ${prop_id_list})`;

// 	// 				const ns = await this.getNamespaces_0();
// 	// 				this.schema.namespaces = ns;
// 	// 				const local_ns = ns.filter(function(n){ return n.is_local == true});
// 	// 				this.schema.local_ns = local_ns[0].name;
// 	// 				//if ( local_ns.length > 0 )
// 	// 				//	this.schema.localNS = local_ns[0].name;

// 	// 				this.schema.tree.ns = schema_info.profile_data.ns;
// 	// 				_.each(this.schema.tree.ns, function (ns, i) {
// 	// 					ns.index = i;
// 	// 					if ( ns.isLocal == true) {
// 	// 						if ( local_ns.length > 0 )
// 	// 							ns.name = local_ns[0].name;
// 	// 						else
// 	// 							ns.name = '';
// 	// 					}
// 	// 				});
// 	// 				if (schema_info.profile_data.schema === 'dbpedia') {
// 	// 					this.schema.tree.class = 'All classes';
// 	// 					this.schema.tree.classes = classes;
// 	// 					//this.schema.deferred_properties = `display_name LIKE 'wiki%' or prefix = 'rdf' and display_name = 'type' or prefix = 'dct' and display_name = 'subject' or prefix = 'owl' and display_name = 'sameAs' or prefix = 'prov' and display_name = 'wasDerivedFrom'`;
// 	// 					const prop_id_list2 = await findPropertiesIds(schema_info.direct_class_role, schema_info.indirect_class_role, ['owl:sameAs', 'prov:wasDerivedFrom']);
// 	// 					this.schema.deferred_properties = `display_name LIKE 'wiki%' or id in ( ${prop_id_list2})`;
// 	// 				}
// 	// 				else if (this.schema.schemaType === 'wikidata') {
// 	// 					this.schema.tree.class = 'All classes';
// 	// 					this.schema.tree.classes = [];
// 	// 				}
// 	// 				else if (!this.schema.hide_individuals) {
// 	// 					const clFull = await dataShapes.getTreeClasses({main:{treeMode: 'Top', limit: MAX_TREE_ANSWERS}});
// 	// 					const c_list = clFull.data.map(v => `${v.prefix}:${v.display_name}`)
// 	// 					this.schema.tree.class = c_list[0];
// 	// 					this.schema.tree.classes = c_list;
// 	// 				}

// 	// 				if (this.schema.schemaType === 'wikidata')
// 	// 					this.schema.simple_prompt = true;
// 	// 				this.schema.classCount = await this.getClassCount();
// 	// 				this.schema.has_cpc = await this.getCPC_info();
// 	// 				const propInfo = await this.getPropInfo();
// 	// 				this.schema.propCount = propInfo.count;
// 	// 				this.schema.propMax = propInfo.max;
// 	// 				if ( this.schema.classCount < DIAGRAM_CLASS_LIMIT) {
// 	// 					this.schema.diagram.classList = await this.getClassListExt();
//     //         this.schema.diagram.filteredClassList = this.schema.diagram.classList;
// 	// 					this.schema.diagram.properties = await this.getPropListExt();
// 	// 				}
// 	// 				this.schema.filling = 3;

// 	// 			}
// 	// 			else { // Neatrada projekta shēmu DSS serverī
// 	// 				await this.getPublicNamespaces();
// 	// 				if (proj.endpoint !== undefined && proj.endpoint !== "") {
// 	// 					this.schema.endpoint =  proj.endpoint;
// 	// 					if ( proj.uri != undefined && proj.uri !== '' )
// 	// 						this.schema.endpoint = `${proj.endpoint}?default-graph-uri=${proj.uri}`;

// 	// 					this.schema.filling = 2;
// 	// 				}
// 	// 				else {
// 	// 					this.schema.filling = 1;
// 	// 				}
// 	// 			}
// 	// 			this.schema.projectId_in_process = "";
// 	// 		}
// 	// 		else {
// 	// 			await this.getPublicNamespaces();
// 	// 			if (proj.endpoint !== undefined && proj.endpoint !== "") {
// 	// 				this.schema.endpoint =  proj.endpoint;
// 	// 				if ( proj.uri != undefined && proj.uri !== '' )
// 	// 					this.schema.endpoint = `${proj.endpoint}?default-graph-uri=${proj.uri}`;

// 	// 				this.schema.filling = 2;
// 	// 			}
// 	// 			else {
// 	// 				this.schema.filling = 1;
// 	// 			}
// 	// 			this.schema.projectId_in_process = "";
// 	// 		}
// 	// 	}
// 	// }
	
	
// 	getCPName(localName:string, type:string) {
// 		//dataShapes.getCPName('http://dbpedia.org/ontology/Year', 'C')
// 		if (localName.indexOf('//') == -1 && localName.indexOf(':' ) == -1) {
// 			let ns = '';
// 			if (this.schema.schemaType === 'wikidata' && type == 'P')
// 				ns = 'wdt';
// 			else
// 				ns = this.schema.local_ns;
// 			localName = `${ns}:${localName}`;
// 		}
// 		const name = this.getIndividualName(localName);
// 		return name;
// 	}

	
// 	getIndividualName(localName:string, gen = false) {
// 		//dataShapes.getIndividualName('wd:[Luigi Pirandello (Q1403)]')
// 		let rez = '';
// 		let prefix = '';
// 		if (localName.startsWith("="))
// 			localName = localName.substring(1,localName.length);
// 		if (localName.startsWith("["))
// 			localName = `${this.schema.local_ns}:${localName}`;

// 		function getLastB(name:string){
// 			let r = -1;
// 			const searchStrLen = 1;
// 			let startIndex = 0;
// 			let index;
// 			while ((index = name.indexOf('(', startIndex)) > -1) {
// 				r = index;
// 				startIndex = index + searchStrLen;
// 			}
// 			return r;
// 		}
// 		if ( localName.indexOf(')]') != -1){
// 			prefix = localName.substring(0,localName.indexOf(':'));
// 			//const name = localName.substring(localName.indexOf('(')+1,localName.length-2);
// 			const name = localName.substring(getLastB(localName)+1,localName.length-2);
// 			rez = `${prefix}:${name}`;
// 		}
// 		else if (localName.indexOf(']') != -1) {
// 			prefix = localName.substring(0,localName.indexOf(':'));
// 			const name = localName.substring(localName.indexOf(':')+2,localName.length-1);
// 			rez = `${prefix}:${name}`;
// 		}
// 		else if (localName.indexOf('//') != -1) {
// 			let name = '';
// 			_.each(this.schema.namespaces, function(ns) {
// 				if (localName.indexOf(ns.value) == 0 && localName.length > ns.value.length) {
// 					name = `${ns.name}:${localName.replace(ns.value,'')}`;
// 					prefix = ns.name;
// 				}
// 			});

// 			if (name != '')
// 				rez = name;
// 			else
// 				rez = localName;
// 		}
// 		else
// 			rez = localName;

// 		if ( prefix == '')
// 			prefix = rez.substring(0,localName.indexOf(':'));

// 		if ( gen && rez.indexOf('/') != -1) {
// 			_.each(this.schema.namespaces, function(ns) {
// 				if ( prefix == ns.name )
// 					rez = `<${ns.value}${rez.replace(ns.name,'').replace(':','')}>`;
// 			});
// 		}
// 		return rez;
// 	}

	
// 	async resolvePropertyByName(params:{name?: string} = {}) {
// 		// *** console.log("------------resolvePropertyByName---"+ params.name +"---------------")
// 		//dataShapes.resolvePropertyByName({schema:'europeana', name: ':componentColor'})
// 		//dataShapes.resolvePropertyByName({name: 'dbo:president'})
// 		//dataShapes.resolvePropertyByName({name: 'http://dbpedia.org/ontology/years'})
// 		let rr: {complete: boolean; name?: string; data: unknown[]};
// 		if ( typeof params.name !== "string" ) return { complete:false, name: '', data: []};

// 		if (this.schema.resolvedProperties[params.name] !== undefined || this.schema.resolvedPropertiesF[params.name] !== undefined  && params.schema == undefined) {
// 			if (this.schema.resolvedProperties[params.name] !== undefined)
// 				rr = { complete:true, data: [this.schema.resolvedProperties[params.name]]};
// 			if (this.schema.resolvedPropertiesF[params.name] !== undefined)
// 				rr = { complete:false, data: []};
// 			// *** console.log(rr)
// 		}
// 		else {
// 			rr = await this.callServerFunction("resolvePropertyByName", {main: params});
// 			if ( params.schema == undefined ) {
// 				if ( rr.complete )
// 					this.schema.resolvedProperties[params.name] = rr.data[0];
// 				else
// 					this.schema.resolvedPropertiesF[params.name] = 1;
// 			}
// 		}

// 		if (rr.complete == true)
// 			rr.name = rr.data[0].full_name; //`${rr.data[0].prefix}:${rr.data[0].local_name}`;
// 		else
// 			rr.name = this.getCPName(params.name, 'P');
// 		return rr;
// 	}
// }

// export const dataShapes = new DataShapesClient();

// // ***********************************************************************************
// // class DataShapes {
// // 	schema: SchemaType;
// // 	constructor() {
// // 		this.schema = getEmptySchema();
// // 	}
	
// // 	clearSchema() {
// // 		this.schema = getEmptySchema();
// // 	}

// // 	async getOntologies() {
// // 		try {
// // 			let rr = await fetchInfo();
// // 			rr.filter(function(o){ return o.display_name == ""});
// // 			return rr;
// // 		} catch(err) {
// // 			console.error(err);
// // 			throw err; // Rethrow the error to be handled by the caller
// // 		}
// // 	}

// // 	async getOntologiesAndTags() {
// // 		let rr = await fetchInfoOntTags();
// // 		return rr;
// // 	}

// // 	getOntologiesSync() {
// // 		return this.schema.info;
// // 	}

// // 	async getPublicNamespaces(): Promise<Namespace[]> {
// // 		let rr = await fetchNamespaces();
// // 		if (_.isEmpty(rr)) {
// // 			throw new Error("No namespaces found");
// // 		}
// // 		this.schema.namespaces = rr;
// // 		return await rr;
// // 	}
// // 	async changeActiveProject(proj_id: ObjectId) {
// // 		//console.log('------changeActiveProject-------')
// // 		//const proj = Projects.findOne({_id: proj_id});
// // 		const proj = await Projects.findOne<ProjectData>({_id: proj_id});
// // 		if (Guards.isProjectData(proj)) {
			
// // 			//this.schema = getEmptySchema();
// // 			if (proj !== undefined) {
// // 				await this.changeActiveProjectFull(proj);
// // 			}
// // 		} else {
// // 			throw new Error("Project not found or invalid project data");
// // 		}
// // 	}
// // 	async changeActiveProjectFull (proj: ProjectData) {
// // 		//console.log('------changeActiveProjectFull-------')
// // 		let projectId_in_process = this.schema.projectId_in_process;
// // 		if ( proj !== undefined && projectId_in_process == proj._id ) {
// // 			while (projectId_in_process == proj._id) {
// // 				await delay(5000);
// // 				projectId_in_process = this.schema.projectId_in_process;
// // 			}
// // 		}
// // 		else if (proj !== undefined && ( this.schema.projectId != proj._id || this.schema.filling === 0 )) {
// // 			this.schema = getEmptySchema();
// // 			if ( proj.schema !== undefined && proj.schema !== "") {
// // 				this.schema.projectId = proj._id;
// // 				this.schema.projectId_in_process = proj._id;
// // 				this.schema.schemaName =  proj.schema;
// // 				this.schema.showPrefixes = proj.showPrefixesForAllNames.toString();
// // 				//this.schema.empty = false;
// // 				this.schema.endpoint =  proj.endpoint;
// // 				if ( proj.uri != undefined && proj.uri !== '' )
// // 					this.schema.endpoint = `${proj.endpoint}?default-graph-uri=${proj.uri}`;

// // 				const info = await fetchInfo();
// // 				// if (info.error) {
// // 				// 	console.error(info);
// // 				// 	this.schema.projectId_in_process = "";
// // 				// 	return;
// // 				// }
// // 				this.schema.info = info;
// // 				if (info.filter(function(o){ return o.display_name == proj.schema}).length > 0) {
// // 					const schema_info = info.filter(function(o){ return o.display_name == proj.schema})[0];
// // 					this.schema.schema = schema_info.db_schema_name;
// // 					this.schema.schemaType = schema_info.schema_name;
// // 					this.schema.use_pp_rels = schema_info.use_pp_rels;
// // 					this.schema.simple_prompt = schema_info.simple_prompt;
// // 					this.schema.hide_individuals = schema_info.hide_instances;
// // 					const prop_id_list = await findPropertiesIds(schema_info.direct_class_role, schema_info.indirect_class_role);
// // 					if (prop_id_list.length>0)
// // 						this.schema.deferred_properties = `id in ( ${prop_id_list})`;

// // 					const ns = await this.getNamespaces_0();
// // 					this.schema.namespaces = ns;
// // 					const local_ns = ns.filter(function(n){ return n.is_local == true});
// // 					this.schema.local_ns = local_ns[0].name;
// // 					//if ( local_ns.length > 0 )
// // 					//	this.schema.localNS = local_ns[0].name;

// // 					this.schema.tree.ns = schema_info.profile_data.ns;
// // 					_.each(this.schema.tree.ns, function (ns, i) {
// // 						ns.index = i;
// // 						if ( ns.isLocal == true) {
// // 							if ( local_ns.length > 0 )
// // 								ns.name = local_ns[0].name;
// // 							else
// // 								ns.name = '';
// // 						}
// // 					});
// // 					if (schema_info.profile_data.schema === 'dbpedia') {
// // 						this.schema.tree.class = 'All classes';
// // 						this.schema.tree.classes = classes;
// // 						//this.schema.deferred_properties = `display_name LIKE 'wiki%' or prefix = 'rdf' and display_name = 'type' or prefix = 'dct' and display_name = 'subject' or prefix = 'owl' and display_name = 'sameAs' or prefix = 'prov' and display_name = 'wasDerivedFrom'`;
// // 						const prop_id_list2 = await findPropertiesIds(schema_info.direct_class_role, schema_info.indirect_class_role, ['owl:sameAs', 'prov:wasDerivedFrom']);
// // 						this.schema.deferred_properties = `display_name LIKE 'wiki%' or id in ( ${prop_id_list2})`;
// // 					}
// // 					else if (this.schema.schemaType === 'wikidata') {
// // 						this.schema.tree.class = 'All classes';
// // 						this.schema.tree.classes = [];
// // 					}
// // 					else if (!this.schema.hide_individuals) {
// // 						const clFull = await dataShapes.getTreeClasses({main:{treeMode: 'Top', limit: MAX_TREE_ANSWERS}});
// // 						const c_list = clFull.data.map(v => `${v.prefix}:${v.display_name}`)
// // 						this.schema.tree.class = c_list[0];
// // 						this.schema.tree.classes = c_list;
// // 					}

// // 					if (this.schema.schemaType === 'wikidata')
// // 						this.schema.simple_prompt = true;
// // 					this.schema.classCount = await this.getClassCount();
// // 					this.schema.has_cpc = await this.getCPC_info();
// // 					const propInfo = await this.getPropInfo();
// // 					this.schema.propCount = propInfo.count;
// // 					this.schema.propMax = propInfo.max;
// // 					if ( this.schema.classCount < DIAGRAM_CLASS_LIMIT) {
// // 						this.schema.diagram.classList = await this.getClassListExt();
// //             this.schema.diagram.filteredClassList = this.schema.diagram.classList;
// // 						this.schema.diagram.properties = await this.getPropListExt();
// // 					}
// // 					this.schema.filling = 3;

// // 				}
// // 				else { // Neatrada projekta shēmu DSS serverī
// // 					await this.getPublicNamespaces();
// // 					if (proj.endpoint !== undefined && proj.endpoint !== "") {
// // 						this.schema.endpoint =  proj.endpoint;
// // 						if ( proj.uri != undefined && proj.uri !== '' )
// // 							this.schema.endpoint = `${proj.endpoint}?default-graph-uri=${proj.uri}`;

// // 						this.schema.filling = 2;
// // 					}
// // 					else {
// // 						this.schema.filling = 1;
// // 					}
// // 				}
// // 				this.schema.projectId_in_process = "";
// // 			}
// // 			else {
// // 				await this.getPublicNamespaces();
// // 				if (proj.endpoint !== undefined && proj.endpoint !== "") {
// // 					this.schema.endpoint =  proj.endpoint;
// // 					if ( proj.uri != undefined && proj.uri !== '' )
// // 						this.schema.endpoint = `${proj.endpoint}?default-graph-uri=${proj.uri}`;

// // 					this.schema.filling = 2;
// // 				}
// // 				else {
// // 					this.schema.filling = 1;
// // 				}
// // 				this.schema.projectId_in_process = "";
// // 			}
// // 		}
// // 	}

// // 	async checkServices(services) {
// // 		for (const s of services) {
// // 			for (const pr of s.projects) {
// // 				//console.log('********************')
// // 				const rr = await callWithGetS(pr);
// // 				//console.log('**** rezultāts  ', rr)
// // 				pr.ok = rr;
// // 			}
// // 		}

// // 		return services;
// // 	}

// // 	async getNamespaces(params = {}): Promise<Namespace[]> {
// // 		// *** console.log("------------getNamespaces ------------------")
// // 		//dataShapes.getNamespaces({schema:'europeana'})
// // 		//dataShapes.getNamespaces()
// // 		if ( params.schema == undefined ) {
// // 			if ( this.schema.namespaces.length > 0 )
// // 				return this.schema.namespaces;
// // 			else {
// // 				let rr = await this.callServerFunction("getNamespaces", {main:params});
// // 				if(!Guards.isNamespaces(rr)) {
// // 					throw new Error("Invalid data format received from server");
// // 				}
// // 				this.schema.namespaces = rr;
// // 				return rr;
// // 			}
// // 		}
// // 		else {
// // 			let rr = await this.callServerFunction("getNamespaces", {main:params});
// // 			if(!Guards.isNamespaces(rr)) {
// // 				throw new Error("Invalid data format received from server");
// // 			}
// // 			return rr;
// // 		}
// // 	}
// // 	async getNamespaces_0(params = {}): Promise<Namespace[]> {
// // 		let rr = await this.callServerFunction("getNamespaces", {main:params});
// // 		if(!Guards.isNamespaces(rr)) {
// // 			throw new Error("Invalid data format received from server");
// // 		}
// // 		this.schema.namespaces = rr;
// // 		return rr;
// // 	}

// // 	async callServerFunction(funcName: string, params: any): Promise<any> {
// // 		const startTime = Date.now();
// // 		let s = this.schema.schema;
// // 		let new_schema;
// // 		if ( params.main.schema != undefined) {
// // 			new_schema = this.getOntologiesSync().find(function(o) { return o.db_schema_name == params.main.schema});
// // 			if ( new_schema != undefined )
// // 				s = params.main.schema;
// // 		}

// // 		// if (s === "" || s === undefined ) {
// // 		// 	await this.changeActiveProject(Session.get("activeProject"));
// // 		// 	s = this.schema.schema;
// // 		// }

// // 		// *** console.log(params)
// // 		let rr = {complete: false, data: [], error: "DSS schema not found"};
// // 		if (s !== "" && s !== undefined )
// // 		{
// // 			if ( s == this.schema.schema) {
// // 				params.main.endpointUrl = this.schema.endpoint;
// // 				params.main.use_pp_rels = this.schema.use_pp_rels;
// // 				params.main.simple_prompt = this.schema.simple_prompt;
// // 				params.main.schemaName = this.schema.schemaName;
// // 				params.main.schemaType = this.schema.schemaType;
// // 				params.main.showPrefixes = this.schema.showPrefixes;
// // 			}
// // 			else {
// // 				params.main.endpointUrl = new_schema.sparql_url;
// // 				if ( new_schema.named_graph != null	)
// // 					params.main.endpointUrl = `${new_schema.sparql_url}?default-graph-uri=${new_schema.named_graph}`;
// // 				params.main.use_pp_rels = new_schema.use_pp_rels;
// // 				params.main.simple_prompt = new_schema.simple_prompt;
// // 				params.main.schemaName = new_schema.display_name;
// // 				params.main.schemaType = new_schema.schema_name;
// // 				params.main.showPrefixes = 'true';
// // 			}

// // 			if ( params.main.limit === undefined )
// // 				params.main.limit = this.schema.limit;

// // 			rr = await callWithPost(`ontologies/${s}/${funcName}`, params);
// // 		}
// // 		//else
// // 		//	Interpreter.showErrorMsg("Project DSS parameter not found !");  // TODO par šo padomāt

// // 		const time = Date.now() - startTime

// // 		if ( ConsoleLog &&  funcName != 'resolvePropertyByName' && funcName.substring(0,2) != 'xx') {
// // 			if ( rr.data ) {
// // 				console.log(rr)
// // 				//console.log(rr.data.map(v => v.prefix + ':' + v.display_name))
// // 			}
// // 			console.log(time)
// // 		}
// // 		if ( MakeLog ) {
// // 			this.schema.fullLog.push(`${funcName};${time}`);
// // 			if ( time > LONG_ANSWER )
// // 				this.schema.log.push(`${funcName};${time};${params.main.filter};${JSON.stringify(params.element)};${rr.sql};${rr.sql2}`);
// // 		}

// // 		return rr;
// // 	}
	
// // 	async getClasses(params = {}, vq_obj = null) {
// // 		// *** console.log("------------GetClasses------------------")
// // 		// dataShapes.getClasses({schema:'europeana'})
// // 		// dataShapes.getClasses()
// // 		// dataShapes.getClasses({limit: 30})
// // 		// dataShapes.getClasses({filter:'aa'})
// // 		// dataShapes.getClasses({namespaces: { in: ['dbo','foaf'], notIn: ['yago']}})
// // 		// dataShapes.getClasses({}, new VQ_Element(Session.get("activeElement")))
// // 		if ( params.filter !== undefined)
// // 			params.filter = params.filter.replaceAll(' ','');
// // 		if ( params.filter !== undefined && params.filter.split(':').length > 1 ) {
// // 			const filter_split = params.filter.split(':');
// // 			const ns = this.schema.namespaces.filter(function(n){ return n.name == filter_split[0];})
// // 			if ( ns.length == 1 ) {
// // 				params.filter = filter_split[1];
// // 				params.namespaces = { in: [filter_split[0]]};
// // 			}
// // 			else {
// // 				params.filter = filter_split[1];
// // 			}
// // 		}
// // 		let allParams = {main: params};
// // 		if ( vq_obj !== null && vq_obj !== undefined ) {
// // 			allParams.element = await findElementDataForClass(vq_obj);
// // 			//allParams.main.orderByPrefix = `case when v.is_local = true then 0 else 1 end,`;
// // 		}

// // 		return await this.callServerFunction("getClasses", allParams);
// // 	}

// // 	async getClassesFull(params = {}) {
// // 		// *** console.log("------------GetClasses------------------")
// // 		// ***  dataShapes.getClassesFull({main:{schema:'europeana'}, element: {uriIndividual: 'http://www.bildindex.de/bilder/m/fm239485'}})
// // 		// ***  dataShapes.getClassesFull({main:{}, element: {uriIndividual: 'http://dbpedia.org/resource/Tivoli_Friheden'}})
// // 		// ***  dataShapes.getClassesFull({{main:{},element: {uriIndividual: 'http://dbpedia.org/resource/Tivoli_Friheden'} })  -- visas ir yago klases
// // 		// ***  dataShapes.getClassesFull({{main:{},element: { pList: { out: [{name: 'educationalAuthority', type: 'out'}]}}})
// // 		// ***  dataShapes.getClassesFull({main:{ onlyPropsInSchema: true}, element: { pList: {in: [{name: 'super', type: 'in'}]}}})  23
// // 		// ***  dataShapes.getClassesFull({main:{ onlyPropsInSchema: true}, element:{ pList: {in: [{name: 'super', type: 'in'}, {name: 'dbo:president', type: 'in'}], out: [{name: 'dbo:birthDate', type: 'out'}]}}}) 20
// // 		// ***  dataShapes.getClassesFull({main: {onlyPropsInSchema: true}, element:{pList: {in: [{name: 'formerCallsigns', type: 'in'}], out: [{name: 'dbo:birthDate', type: 'out'}]}}}) 58
// // 		if ( params.main.filter !== undefined)
// // 			params.main.filter = params.main.filter.replaceAll(' ','');

// // 		if ( params.main.filter !== undefined && params.main.filter.split(':').length > 1 ) {
// // 			const filter_split = params.main.filter.split(':');
// // 			const ns = this.schema.namespaces.filter(function(n){ return n.name == filter_split[0];})
// // 			if ( ns.length == 1 ) {
// // 				params.main.filter = filter_split[1];
// // 				params.main.namespaces = { in: [filter_split[0]]};
// // 			}
// // 			else {
// // 				params.main.filter = filter_split[1];
// // 			}
// // 		}

// // 		return await this.callServerFunction("getClasses", params);
// // 	}

// // 	async getTreeClasses(params) {
// // 		function makeTreeName(params) {
// // 			let nList = [];
// // 			if ( params.main.namespaces !== undefined) {
// // 				if ( params.main.namespaces.in !== undefined )
// // 					nList.push(params.main.namespaces.in.join('_'));
// // 				if ( params.main.namespaces.notIn !== undefined )
// // 					nList.push(params.main.namespaces.notIn.join('_'));
// // 			}
// // 			nList.push(params.main.limit);
// // 			return nList.join('_');
// // 		}
// // 		let rr;
// // 		if ( params.main.treeMode === 'Top' && ( params.main.filter === undefined || params.main.filter === '' )) {
// // 			const nsString = makeTreeName(params);
// // 			//console.log(`in_${params.namespaces.in.join('_')}_notIn_${params.namespaces.notIn.join('_')}`)
// // 			if (this.schema.treeTopsC[nsString] !== undefined && this.schema.treeTopsC[nsString].error != undefined) {
// // 				rr = this.schema.treeTopsC[nsString];
// // 			}
// // 			else {
// // 				rr =  await this.callServerFunction("getTreeClasses", params);
// // 				this.schema.treeTopsC[nsString] = rr;
// // 			}
// // 		}
// // 		else {
// // 			if ( params.main.filter !== undefined && params.main.filter.split(':').length > 1 ) {
// // 				const filter_split = params.main.filter.split(':');
// // 				const ns = this.schema.namespaces.filter(function(n){ return n.name == filter_split[0];})
// // 				if ( ns.length == 1 ) {
// // 					params.main.filter = filter_split[1];
// // 					params.main.namespaces = { in: [filter_split[0]]};
// // 				}
// // 				else {
// // 					params.main.filter = filter_split[1];
// // 				}
// // 			}
// // 			rr =  await this.callServerFunction("getTreeClasses", params);
// // 		}

// // 		return rr;
// // 	}

// // 	async getPropertiesF(params) {
// // 		if ( params.main.limit === undefined )
// // 			params.main.limit = this.schema.limit;

// // 		params.main.limit = params.main.limit + 1;
// // 		let rr = await this.callServerFunction("getProperties", params);
// // 		if ( rr.data.length == params.main.limit ) {
// // 			rr.data.pop();
// // 			rr.complete = false;
// // 		}
// // 		return rr;
// // 	}
// // 	async getProperties(params = {}, vq_obj = null, vq_obj_2 = null) {
// // 		// *** console.log("*** ---------GetProperties---------------***", vq_obj)
// // 		//dataShapes.getProperties({schema:'europeana', propertyKind:'Data'})
// // 		//dataShapes.getProperties({propertyKind:'Data'})  -- Data, Object, All (Data + Object), ObjectExt (in/out object properties), Connect
// // 		//dataShapes.getProperties({propertyKind:'Object'})
// // 		//dataShapes.getProperties({propertyKind:'Object', namespaces: { notIn: ['dbp']}})
// // 		//dataShapes.getProperties({propertyKind:'Object', filter: 'aa'})
// // 		//dataShapes.getProperties({propertyKind:'Object', namespaces: { notIn: ['dbp']}})
// // 		//dataShapes.getProperties({propertyKind:'Object', namespaces: { notIn: ['dbp']}}, new VQ_Element(Session.get("activeElement")))
// // 		params.deferred_properties = this.schema.deferred_properties;
// // 		if ( params.filter !== undefined && params.filter.split(':').length > 1 ) {
// // 			const filter_split = params.filter.split(':');
// // 			const ns = this.schema.namespaces.filter(function(n){ return n.name == filter_split[0];})
// // 			if ( ns.length == 1 ) {
// // 				params.filter = filter_split[1];
// // 				params.namespaces = { in: [filter_split[0]]};
// // 			}
// // 			else {
// // 				params.filter = filter_split[1];
// // 			}
// // 		}
// // 		let allParams = {main: params};
// // 		if ( vq_obj !== null && vq_obj !== undefined )
// // 			allParams.element = await findElementDataForProperty(vq_obj);
// // 		if ( vq_obj_2 !== null && vq_obj_2 !== undefined )
// // 			allParams.elementOE = await findElementDataForProperty(vq_obj_2);
// // 		return await this.getPropertiesF(allParams); //this.callServerFunction("getProperties", allParams);
// // 	}

	
// // 	async getPropertiesFull(params = {}) {
// // 		// *** console.log("------------GetProperties------------------")
// // 		// *** dataShapes.getPropertiesFull({main:{schema:'europeana', propertyKind:'Data'}})
// // 		// *** dataShapes.getProperties({main: {propertyKind:'Object'}, element:{className: 'umbel-rc:Park'}})
// // 		// *** dataShapes.getProperties({main: {propertyKind:'Data'}, element: {className: 'umbel-rc:Park'}})
// // 		// *** dataShapes.getProperties({main: {propertyKind:'Connect'}, element: {className: 'umbel-rc:Park'}, elementOE: {className: 'umbel-rc:Philosopher'}})
// // 		// *** dataShapes.getProperties({main:{propertyKind:'All'}, element:{className: 'umbel-rc:Philosopher'}})
// // 		// *** dataShapes.getProperties({main:{propertyKind:'Object'}, element:{className: 'dbo:Tenure'}})
// // 		// *** dataShapes.getProperties({main:{propertyKind:'ObjectExt'}, element: { className:'umbel-rc:Crater'}})
// // 		// *** dataShapes.getProperties({main:{propertyKind:'Connect'}, element:{className: 'CareerStation'}, elementOE:{otherEndClassName:'umbel-rc:Crater'}})
// // 		// *** dataShapes.getProperties({main:{propertyKind:'All', orderByPrefix: 'case when ns_id = 2 then 0 else 1 end desc,'}, element:{className: 'CareerStation'}})
// // 		params.main.deferred_properties = this.schema.deferred_properties;
// // 		if ( params.main.filter !== undefined && params.main.filter.split(':').length > 1 ) {
// // 			const filter_split = params.main.filter.split(':');
// // 			const ns = this.schema.namespaces.filter(function(n){ return n.name == filter_split[0];})
// // 			if ( ns.length == 1 ) {
// // 				params.main.filter = filter_split[1];
// // 				params.main.namespaces = { in: [filter_split[0]]};
// // 			}
// // 			else {
// // 				params.main.filter = filter_split[1];
// // 			}
// // 		}
// // 		return await this.getPropertiesF(params); //this.callServerFunction("getProperties", params);
// // 	}
// // 	async getClassifiers(params = {}) {
// // 		// TODO droši vien ar standarta limitu būs gana
// // 		//dataShapes.getClassifiers({schema:'nobel_prizes_x'})
// // 		return await this.callServerFunction("getClassifiers", {main: params});
// // 	}
// // 	async checkProperty(params = {}) {
// // 		// *** console.log("------------checkProperty-----------------")
// // 		// *** dataShapes.checkProperty ({name:'onyx:EmotionSet', propertyName: 'onyx:hasEmotion'})
// // 		// *** dataShapes.checkProperty ({name:'http://dbpedia.org/ontology/Country', propertyName: 'http://dbpedia.org/ontology/abstract'})
// // 		// *** dataShapes.checkProperty ({name:'http://dbpedia.org/ontology/Country', propertyName: 'http://dbpedia.org/ontology/birthPlace'})
// // 		return await this.callServerFunction("checkProperty", {main:params});
// // 	}
// // 	async getTreeProperties(params) {
// // 		function makeTreeName(params) {
// // 			let nList = [];
// // 			nList.push(params.propertyKind);
// // 			if ( params.basicOrder !== undefined && params.basicOrder )
// // 				nList.push('Basic');
// // 			else
// // 				nList.push('Full');
// // 			nList.push(params.limit);
// // 			return nList.join('_');
// // 		}
// // 		let rr;
// // 		if ( params.filter === undefined || params.filter === '' ) {
// // 			const tName = makeTreeName(params);
// // 			if (this.schema.treeTopsP[tName] !== undefined && this.schema.treeTopsP[tName].error != undefined ) {
// // 				rr = this.schema.treeTopsP[tName];
// // 			}
// // 			else {
// // 				rr =  await this.getProperties(params);
// // 				this.schema.treeTopsP[tName] = rr;
// // 			}
// // 		}
// // 		else
// // 			rr =  await this.getProperties(params);

// // 		return rr;
// // 	}
// // 	async getClassIndividuals(params, className) {
// // 		// *** console.log("------------getClassIndividuals ------------------")
// // 		// *** dataShapes.getClassIndividuals({limit:10}, 'UnitJoining')
// // 		// *** dataShapes.getClassIndividuals({limit:10, schema:'europeana'}, ':WebResource')

// // 		let rr;

// // 		//if (this.schema.schemaType == 'wikidata' && params.filter != undefined )
// // 		//	return await this.getIndividualsWD(params.filter);

// // 		let allParams = {main: params, element: {className:className}};
// // 		rr = await this.callServerFunction("getIndividuals", allParams);

// // 		if (rr.error != undefined)
// // 			rr = []

// // 		return rr;
// // 	}
// // 	async getIndividualsWD(filter) {
// // 		const rr = await callWithGetWD(filter, MAX_IND_ANSWERS);
// // 		if (rr.success == 1) {
// // 			const rez = _.map(rr.search, function(p) {
// // 				const localName = `wd:[${p.label} (${p.id})]`;
// // 				return localName;
// // 			});
// // 			return rez;
// // 		}
// // 		else
// // 			return [];

// // 	}
// // 	async getTreeIndividuals(params = {}, className) {
// // 		// *** console.log("------------getTreeIndividuals ------------------")
// // 		let rr = [];
// // 		let allParams = {main: params, element:{className: className}};

// // 		if (this.schema.treeTopsI[className] !== undefined && params.filter === '' ) {
// // 			rr = this.schema.treeTopsI[className];
// // 		}
// // 		else {
// // 			rr = await this.callServerFunction("getTreeIndividuals", allParams);
// // 			if ( className !== '' && params.filter === '' && rr.error === undefined) {
// // 				this.schema.treeTopsI[className] = rr;
// // 			}
// // 		}

// // 		if (rr.error != undefined)
// // 			rr = [];

// // 		return rr;
// // 	}
// // 	async getTreeIndividualsWD(filter) {
// // 		let rr = await callWithGetWD(filter, MAX_IND_ANSWERS);
// // 		if (rr.success == 1) {
// // 			const rez = _.map(rr.search, function(p) {
// // 				// TODO jāpaskatās, kāds īsti ir ns
// // 				const localName = `wd:[${p.label} (${p.id})]`;
// // 				return {localName:localName , description: p.description, iri:p.concepturi, label:p.label};
// // 			});
// // 			return rez;
// // 		}
// // 		else
// // 			return [];
// // 	}
// // 	async resolveClassByName(params = {}) {
// // 		// *** console.log("------------resolveClassByName---"+ params.name +"---------------")
// // 			//dataShapes.resolveClassByName({schema:'europeana', name: ':WebResource'})
// // 		//dataShapes.resolveClassByName({name: 'umbel-rc:Park'})
// // 		//dataShapes.resolveClassByName({name: 'http://dbpedia.org/ontology/Year'})
// // 		//dataShapes.resolveClassByName({name: 'foaf:Document'})

// // 		let rr;
// // 		if (this.schema.resolvedClasses[params.name] !== undefined || this.schema.resolvedClassesF[params.name] !== undefined && params.schema == undefined) {
// // 			if (this.schema.resolvedClasses[params.name] !== undefined)
// // 				rr = { complete:true, data: [this.schema.resolvedClasses[params.name]]};
// // 			if (this.schema.resolvedClassesF[params.name] !== undefined)
// // 				rr = { complete:false, data: []};
// // 			// *** console.log(rr)
// // 		}
// // 		else {
// // 			rr = await this.callServerFunction("resolveClassByName", {main: params});
// // 			if ( params.schema == undefined ) {
// // 				if ( rr.complete )
// // 					this.schema.resolvedClasses[params.name] = rr.data[0];
// // 				else
// // 					this.schema.resolvedClassesF[params.name] = 1;
// // 			}
// // 			else {
// // 				const new_schema = this.getOntologiesSync().find(function(o) { return o.db_schema_name == params.schema});
// // 				if ( rr.complete ) {
// // 					rr.data[0].direct_class_role = new_schema.direct_class_role;
// // 					rr.data[0].indirect_class_role = new_schema.indirect_class_role;
// // 				}
// // 			}
// // 		}

// // 		if (rr.complete == true)
// // 			rr.name = rr.data[0].full_name; //`${rr.data[0].prefix}:${rr.data[0].local_name}`;
// // 		else
// // 			rr.name = this.getCPName(params.name, 'C');
// // 		return rr;
// // 	}
// // 	async resolveIndividualByName(params = {}) {
// // 		//dataShapes.resolveIndividualByName({schema:'europeana', name:'http://www.bildindex.de/bilder/m/fm239485'}) TODO - wikidata
// // 		//dataShapes.resolveIndividualByName({name: 'http://www.wikidata.org/entity/Q34770'})
// // 		//dataShapes.resolveIndividualByName({name: 'wd:Q633795'})
// // 		//dataShapes.resolveIndividualByName({name: 'dbr:Aaron_Cox'}) // dbpedia
// // 		//dataShapes.resolveIndividualByName({name: "wd:[first (Q19269277)]"})

// // 		if (params.name.indexOf('<') != -1)
// // 			params.name = params.name.substring(1, params.name.length-1);

// // 		params.name = this.getIndividualName(params.name);
// // 		let rr;

// // 		if (this.schema.resolvedIndividuals[params.name] !== undefined || this.schema.resolvedIndividualsF[params.name] !== undefined  && params.schema == undefined) {
// // 			if (this.schema.resolvedIndividuals[params.name] !== undefined)
// // 				rr = { complete:true, data: [this.schema.resolvedIndividuals[params.name]]};
// // 			if (this.schema.resolvedIndividualsF[params.name] !== undefined)
// // 				rr = { complete:false, data: []};
// // 		}
// // 		else {
// // 			if (this.schema.schemaType === 'wikidata' &&  params.name.indexOf('//') == -1) {
// // 				const prefix = params.name.substring(0, params.name.indexOf(':')+1);
// // 				let iri = '';
// // 				_.each(this.schema.namespaces, function(n) {
// // 					if (params.name.indexOf(n.name) == 0 && prefix.length == n.name.length + 1)
// // 						iri = params.name.replace(':','').replace(n.name,n.value);
// // 				});
// // 				const name= params.name.substring(params.name.indexOf(':')+1, params.name.length);
// // 				const individuals = await this.getTreeIndividualsWD(name);

// // 				if (individuals.length > 0) {
// // 					let rez = {};
// // 					_.each(individuals, function(i) {
// // 						if (i.iri == iri)
// // 							rez = {name: params.name, localName: i.localName, label: i.label};
// // 					});
// // 					if ( rez.name != undefined)
// // 						rr = {complete: true, data:[rez]};
// // 					else
// // 						rr = await this.callServerFunction("resolveIndividualByName", {main: params});  // TODO - vai tā darīt
// // 				}
// // 				else {
// // 					rr = await this.callServerFunction("resolveIndividualByName", {main: params});
// // 				}
// // 			}
// // 			else {
// // 				rr = await this.callServerFunction("resolveIndividualByName", {main: params});
// // 			}
// // 		}

// // 		if ( params.schema == undefined ) {
// // 			if ( rr.complete )
// // 				this.schema.resolvedIndividuals[params.name] = rr.data[0];
// // 			else if ( !rr.complete )
// // 				this.schema.resolvedIndividualsF[params.name] = 1;
// // 		}
// // 		return rr;

// // 	}
// // 	async generateClassUpdate(label_name) {
// // 		let rr = await this.callServerFunction("generateClassUpdate", {main: {label_name: label_name}});
// // 		//console.log(rr);
// // 		if (rr.data.length > 0) {
// // 			let link = document.createElement("a");
// // 			link.setAttribute("download", "Update.sql");
// // 			link.href = URL.createObjectURL(new Blob([rr.data.join("\r\n")], {type: "application/json;charset=utf-8;"}));
// // 			document.body.appendChild(link);
// // 			link.click();
// // 		}
// // 	}
// // 	async test() {
// // 		//await this.callServerFunction("xxx_test", {main: {}});
// // 		const pp = 'wdt:P31/wdt:P279*'
// // 		console.log('**************************')
// // 		const ll = pp.split('/');
// // 		let rez:string[][] = [];
// // 		ll.forEach(l => { rez.push(l.split('*')); })
// // 		console.log(rez)
// // 		//console.log(pp.split('*'))
// // 		//console.log(pp.split('/'))

// // 	}
// // 	printLog() {
// // 		if ( this.schema.log.length > 0 ) {
// // 			let link = document.createElement("a");
// // 			link.setAttribute("download", "LOG.txt");
// // 			link.href = URL.createObjectURL(new Blob([this.schema.log.join("\r\n")], {type: "application/json;charset=utf-8;"}));
// // 			document.body.appendChild(link);
// // 			link.click();
// // 		}
// // 		if ( this.schema.fullLog.length > 0 ) {
// // 			let link2 = document.createElement("a");
// // 			link2.setAttribute("download", "FULL_LOG.txt");
// // 			link2.href = URL.createObjectURL(new Blob([this.schema.fullLog.join("\r\n")], {type: "application/json;charset=utf-8;"}));
// // 			document.body.appendChild(link2);
// // 			link2.click();
// // 			}
// // 		this.clearLog();
// // 	}
// // 	clearLog() {
// // 		this.schema.log = [];
// // 		this.schema.fullLog = [];
// // 	}
// // 	async getClassListExt() {
// // 		const rr = await this.callServerFunction("xx_getClassListExt", {main: {limit:DIAGRAM_CLASS_LIMIT}});
// // 		//console.log(rr)
// // 		return rr.data;
// // 	}
// // 	async getPropListExt() {
// // 		const rr = await this.callServerFunction("xx_getPropList3", {main: {}});
// // 		//console.log(rr)
// // 		return rr.data;
// // 	}

// // 	async getClassList(par) {
// // 	// console.log(dataShapes.getClassList({}))
// //     // Šī funkcija liekas netiek vairs izsaukta
// // 		//par = {class_count_limit:30, class_ind:1, only_local:false, not_in:['owl','rdf','rdfs']};
// // 		//console.log(par)
// // 		let rr = [];
// // 		let allParams = {main: { limit: par.class_count_limit, class_ind:par.class_ind, isLocal: par.only_local, not_in:par.not_in }};
// // 		allParams.main.not_in = allParams.main.not_in.map(v => this.schema.namespaces.filter(function(n){ return n.name == v})[0].id); // TODO būs jāpapildina
// // 		rr = await this.callServerFunction("xx_getClassList", allParams);
// // 		//console.log(rr)
// // 		return rr.data;

// // 		//const c_list = rr.data.map(v => v.id);
// // 		//return c_list;
// // 	}
// // 	async getClassCount() {
// // 		let rr = await this.callServerFunction("xx_getClassCount", {main:{}});
// // 		return rr;
// // 	}
// // 	async getCPC_info() {
// // 		let rr = await this.callServerFunction("xx_getCPC_info", {main:{}});
// // 		return rr;
// // 	}
// // 	async getPropInfo() {
// // 		let rr = await this.callServerFunction("xx_getPropertyInfo", {main:{}});
// // 		return rr;
// // 	}
// // }


// // export const dataShapes = new DataShapes();

// // ***********************************************************************************

// // export {
// //   dataShapes,
// // }
