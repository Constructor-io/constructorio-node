import {
  NetworkParameters,
  UserParameters,
  Collection,
  ConstructorClientOptions,
  Facet,
  Feature,
  Group,
  RequestFeature,
  RequestFeatureVariant,
  ResultSources,
  SortOption,
  FmtOptions,
  FilterExpression,
  VariationsMap,
} from '.';

export default Browse;

export interface BrowseParameters {
  page?: number;
  offset?: number;
  resultsPerPage?: number;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: string;
  section?: string;
  fmtOptions?: FmtOptions;
  preFilterExpression?: FilterExpression;
  hiddenFields?: string[];
  hiddenFacets?: string[];
  variationsMap?: VariationsMap;
  qsParam?: Record<string, any>;
}

declare class Browse {
  constructor(options: ConstructorClientOptions);

  options: ConstructorClientOptions;

  getBrowseResults(
    filterName: string,
    filterValue: string,
    parameters?: BrowseParameters,
    userParameters?: UserParameters,
    networkParameters?: NetworkParameters
  ): Promise<GetBrowseResultsResponse>;

  getBrowseResultsForItemIds(
    itemIds: string[],
    parameters?: Omit<BrowseParameters, 'preFilterExpression' | 'qsParam'>,
    userParameters?: UserParameters,
    networkParameters?: NetworkParameters
  ): Promise<GetBrowseResultsForItemIdsResponse>;

  getBrowseGroups(
    parameters?: Pick<BrowseParameters, 'filters' | 'section' | 'fmtOptions'>,
    userParameters?: UserParameters,
    networkParameters?: NetworkParameters
  ): Promise<GetBrowseGroupsResponse>;

  getBrowseFacets(
    parameters?: Pick<
      BrowseParameters,
      'page' | 'offset' | 'section' | 'fmtOptions' | 'resultsPerPage'
    >,
    userParameters?: UserParameters,
    networkParameters?: NetworkParameters
  ): Promise<GetBrowseFacetsResponse>;

  getBrowseFacetOptions(
    facetName: string,
    parameters?: Pick<BrowseParameters, 'section' | 'fmtOptions'>,
    userParameters?: UserParameters,
    networkParameters?: NetworkParameters
  ): Promise<GetBrowseFacetOptionsResponse>;
}

/* Browse results returned from server */
interface BrowseResponse<ResponseType> extends Record<string, any> {
  request?: Partial<BrowseRequestType>;
  response?: Partial<ResponseType>;
  result_id?: string;
  ad_based?: boolean;
}

export type GetBrowseResultsResponse =
  BrowseResponse<GetBrowseResultsResponseData>;
export type GetBrowseResultsForItemIdsResponse =
  BrowseResponse<GetBrowseResultsResponseData>;
export type GetBrowseGroupsResponse = BrowseResponse<
  Pick<
    GetBrowseResultsResponseData,
    'result_sources' | 'groups' | 'refined_content'
  >
>;
export type GetBrowseFacetsResponse = BrowseResponse<
  Pick<GetBrowseResultsResponseData, 'facets' | 'total_num_results'>
>;
export type GetBrowseFacetOptionsResponse = BrowseResponse<
  Pick<GetBrowseResultsResponseData, 'facets'>
>;

export interface GetBrowseResultsResponseData extends Record<string, any> {
  result_sources: Partial<ResultSources>;
  facets: Partial<Facet>[];
  groups: Partial<Group>[];
  results: Partial<BrowseResultData>[];
  sort_options: Partial<SortOption>[];
  refined_content: Record<string, any>[];
  total_num_results: number;
  features: Partial<Feature>[];
  collection: Partial<Collection>;
}

export interface BrowseResultData extends Record<string, any> {
  matched_terms: string[];
  data: {
    id: string;
    [key: string]: any;
  };
  value: string;
  is_slotted: false;
  labels: Record<string, any>;
  variations: Record<string, any>[];
}

export interface BrowseRequestType extends Record<string, any> {
  browse_filter_name: string;
  browse_filter_value: string;
  filter_match_types: Record<string, any>;
  filters: Record<string, any>;
  fmt_options: Record<string, any>;
  num_results_per_page: number;
  page: number;
  section: string;
  sort_by: string;
  sort_order: string;
  term: string;
  query: string;
  features: Partial<RequestFeature>;
  feature_variants: Partial<RequestFeatureVariant>;
  searchandized_items: Record<string, any>;
}
