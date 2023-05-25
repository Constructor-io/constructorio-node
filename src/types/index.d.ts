export * from './autocomplete';
export * from './browse';
export * from './catalog';
export * from './quizzes';
export * from './recommendations';
export * from './search';
export * from './tasks';
export * from './tracker';

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
  sessionId?: number;
  clientId?: string;
  userId?: string;
  segments?: string;
  testCells?: Record<string, any>;
  userIp?: string;
  userAgent?: string;
}

export interface FmtOptions extends Record<string, any> {
  groups_max_depth?: number;
  groups_start?: 'current' | 'top';
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
  } | null;
}

export type Facet = RangeFacet | OptionFacet;

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
  type: 'range';
}

export interface OptionFacet extends BaseFacet, Record<string, any> {
  options: FacetOption[];
  type: 'multiple' | 'single' | 'hierarchical';
}

export interface FacetOption extends Record<string, any> {
  count: number;
  display_name: string;
  value: string;
  options?: FacetOption[];
  range?: ['-inf' | number, 'inf' | number];
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
  deactivated?: boolean;
}

export interface ItemGroup extends Record<string, any> {
  id: string;
  name?: string;
  data?: Nullable<Record<string, any>>;
  children?: ItemGroup[];
}

export interface RedirectRuleMatchObject {
  match_type: string;
  pattern: string;
}

export interface RedirectRuleResponse extends Record<string, any> {
  id: number;
  end_time?: Nullable<string>;
  last_updated?: Nullable<string>;
  start_time?: Nullable<string>;
  metadata?: Nullable<Record<string, any>>;
  url?: string;
  user_segments?: Nullable<string[]>;
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
  type: 'multiple';
}

export interface RangeSlidersFacetConfiguration
  extends RangeFacetConfiguration {
  range_format: 'boundaries';
}

export interface RangeOptionsStaticFacetConfiguration
  extends RangeOptionsFacetConfiguration {
  range_type: 'static';
  bucket_size?: number;
  range_limits?: number[];
}

export interface RangeOptionsDynamicFacetConfiguration
  extends RangeOptionsFacetConfiguration {
  range_type: 'dynamic';
}

export interface RangeOptionsFacetConfiguration
  extends RangeFacetConfiguration {
  range_format: 'options';
}

export interface RangeFacetConfiguration extends BaseFacetConfiguration {
  type: 'range';
}

export interface BaseFacetConfiguration {
  name: string;
  display_name?: string;
  sort_order?: 'relevance' | 'value' | 'num_matches';
  sort_descending?: boolean;
  range_inclusive?: Nullable<string>;
  match_type?: 'any' | 'all' | 'none';
  position?: Nullable<number>;
  hidden?: boolean;
  protected?: boolean;
  data?: object;
  section?: string;
  options?: Record<string, any>[];
  range_format: 'options' | 'boundaries' | null;
  range_type: 'static' | 'dynamic' | null;
  bucket_size?: number | null;
  range_limits?: number[] | null;
}

export type FacetConfiguration =
  | MultipleFacetConfiguration
  | RangeSlidersFacetConfiguration
  | RangeOptionsStaticFacetConfiguration
  | RangeOptionsDynamicFacetConfiguration;

export interface FacetOptionConfiguration {
  value: string;
  value_alias?: Nullable<string>;
  display_name?: string;
  position?: Nullable<number>;
  hidden?: boolean;
  data?: Nullable<Record<string, any>>;
}

export interface OneWaySynonymRelation extends Record<string, any> {
  parent_phrase: string;
  child_phrases: {
    automatically_generated: boolean;
    phrase: string;
    created_at: string;
    updated_at: string;
    [key: string]: any;
  }[];
}

export interface SynonymGroup extends Record<string, any> {
  synonym_group_id: number;
  synonyms: string[];
}

export type FilterExpression =
  | FilterExpressionGroup
  | FilterExpressionNot
  | FilterExpressionValue
  | FilterExpressionRange;

export type FilterExpressionGroup =
  | FilterExpressionGroupOr
  | FilterExpressionGroupAnd;

export type FilterExpressionGroupOr = { or: FilterExpression[] };
export type FilterExpressionGroupAnd = { and: FilterExpression[] };
export type FilterExpressionCondition = 'or' | 'and';

export type FilterExpressionNot = { not: FilterExpression };

export type FilterExpressionValue = {
  name: string;
  value: string;
};

export type FilterExpressionRange = {
  name: string;
  range: FilterExpressionRangeValue;
};

export type FilterExpressionRangeValue = ['-inf' | number, 'inf' | number];

export interface SearchabilityConfigurationResponse {
  name: string;
  fuzzy_searchable: boolean,
  exact_searchable: boolean,
  type: string,
  displayable: boolean,
  hidden: boolean,
  created_at: string,
  updated_at: string
}

export interface SearchabilityConfiguration {
  name: string;
  fuzzySearchable: boolean,
  exactSearchable: boolean,
  type: string,
  displayable: boolean,
  hidden: boolean,
}
