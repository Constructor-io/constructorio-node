export interface NetworkParameters extends Record<string, any> {
	timeout?: number;
}

export interface ConstructorClientOptions {
	apiKey: string;
	apiToken?: string;
	securityToken?: string;
	version?: string;
	serviceUrl?: string;
	fetch?: () => any;
	networkParameters?: NetworkParameters;
}

export interface UserParameters {
	sessionId?: Number;
	clientId?: Number;
	userId?: string;
	segments?: string;
	testCells?: Record<string, any>;
	userIp?: string;
	userAgent?: string;
}

export interface FmtOptions extends Record<string, any> {
	show_hidden_facets: boolean;
	show_protected_facets: boolean;
}

export interface RequestFeature extends Record<string, any> {
	query_items: boolean;
	auto_generated_refined_query_rules: boolean;
	manual_searchandizing: boolean;
	personalization: boolean;
	filter_items: boolean;
}

export interface RequestFeatureVariant extends Record<string, any> {
	query_items: string;
	auto_generated_refined_query_rules: string;
	manual_searchandizing: string | null;
	personalization: string;
	filter_items: string;
}

export type ErrorData = {
	message: string;
	[key: string]: any;
};

export interface ResultSources extends Record<string, any> {
	token_match: { count: number; [key: string]: any };
	embeddings_match: { count: number; [key: string]: any };
}

export interface SortOption extends Record<string, any> {
	sort_by: string;
	display_name: string;
	sort_order: string;
	status: string;
}

export interface Feature extends Record<string, any> {
	feature_name: string;
	display_name: string;
	enabled: boolean;
	variant: {
		name: string;
		display_name: string;
		[key: string]: any;
	};
}

export interface FmtOption extends Record<string, any> {
	groups_start: string;
	groups_max_depth: number;
}

type Facet = RangeFacet | OptionFacet;

export interface BaseFacet extends Record<string, any> {
	data: Record<string, any>;
	status: Record<string, any>;
	display_name: string;
	name: string;
	hidden: boolean;
}

export interface RangeFacet extends BaseFacet, Record<string, any> {
	max: number;
	min: number;
	type: "range";
}

export interface OptionFacet extends BaseFacet, Record<string, any> {
	options: FacetOption[];
	type: "multiple" | "single" | "hierarchical";
}

export interface FacetOption extends Record<string, any> {
	count: number;
	display_name: string;
	value: string;
	options?: FacetOption[];
	range?: ["-inf" | number, "inf" | number];
	status: string;
}

export interface Group extends BaseGroup, Record<string, any> {
	count: number;
	data: Record<string, any>;
	parents: BaseGroup[];
	children: Group[];
}

export interface Collection extends Record<string, any> {
	collection_id: string;
	display_name: string;
	data: Record<string, any>;
}

export interface BaseGroup extends Record<string, any> {
	display_name: string;
	group_id: string;
}

export interface FmtOptions extends Record<string, any> {}

export type Nullable<T> = T | null;

export interface Item extends Record<string, any> {
	id: string;
	name?: string;
	suggested_score?: number;
	data?: ItemData;
}

export interface Variation extends Record<string, any> {
	id: string;
	item_id: string;
	name?: string;
	suggested_score?: number;
	data?: ItemData;
}

export interface ItemData extends Record<string, any> {
	keywords?: string[];
	url?: string;
	image_url?: string;
	facets?: Record<string, any>;
	group_ids?: string[];
	description?: string;
	active?: boolean;
}

export interface ItemGroup extends Record<string, any> {
	id: string;
	name?: string;
	data?: Record<string, any>;
	children?: ItemGroup[];
}

export interface RedirectRuleMatchObject {
	match_type: string;
	pattern: string;
}

export interface RedirectRuleResponse extends Record<string, any> {
	id: number;
	end_time?: string;
	last_updated?: string;
	start_time?: string;
	metadata?: Record<string, any>;
	url?: string;
	user_segments?: string[];
	matches: {
			id: number;
			match_type: 'EXACT' | 'UNORDERED' | 'PHRASE';
			pattern: string;
			[key: string]: any;
	}[];
}

/* 4 types of facets
    - MultipleFacetConfiguration
    - RangeSlidersFacetConfiguration
    - RangeOptionsStaticFacetConfiguration
    - RangeOptionsDynamicFacetConfiguration
*/

export interface MultipleFacetConfiguration extends BaseFacetConfiguration {
	type: "multiple";
}

export interface RangeSlidersFacetConfiguration
	extends RangeFacetConfiguration {
	range_format: "boundaries";
}

export interface RangeOptionsStaticFacetConfiguration
	extends RangeOptionsFacetConfiguration {
	range_type: "static";
	bucket_size?: number;
	range_limits?: number[];
}

export interface RangeOptionsDynamicFacetConfiguration
	extends RangeOptionsFacetConfiguration {
	range_type: "dynamic";
}

export interface RangeOptionsFacetConfiguration
	extends RangeFacetConfiguration {
	range_format: "options";
}

export interface RangeFacetConfiguration extends BaseFacetConfiguration {
	type: "range";
}

export interface BaseFacetConfiguration {
	name: string;
	display_name?: string;
	sort_order?: "relevance" | "value" | "num_matches";
	sort_descending?: boolean;
	range_inclusive?: string;
	match_type?: "any" | "all" | "none";
	position?: number;
	hidden?: boolean;
	protected?: boolean;
	data?: object;
	section?: string;
	options?: Record<string, any>[];
}

export type FacetConfiguration =
	| MultipleFacetConfiguration
	| RangeSlidersFacetConfiguration
	| RangeOptionsStaticFacetConfiguration
	| RangeOptionsDynamicFacetConfiguration;

export interface FacetOptionConfiguration {
	value: string;
	value_alias?: string;
	display_name?: string;
	position?: number;
	hidden?: boolean;
	data?: Record<string, any>;
}
