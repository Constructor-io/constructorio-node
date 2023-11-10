import { ConstructorClientOptions, NetworkParameters, UserParameters, VariationsMap } from '.';

export default Recommendations;

export interface RecommendationsParameters {
  itemIds?: string | string[];
  numResults?: number;
  section?: string;
  term?: string;
  filters?: Record<string, any>;
  variationsMap?: VariationsMap;
  hiddenFields?: string[];
}

declare class Recommendations {
  constructor(options: ConstructorClientOptions);

  options: ConstructorClientOptions;

  getRecommendations(
    podId: string,
    parameters?: RecommendationsParameters,
    userParameters?: UserParameters,
    networkParameters?: NetworkParameters
  ): Promise<RecommendationsResponse>;

  getRecommendationPods(
    networkParameters?: NetworkParameters
  ): Promise<RecommendationPodsResponse>;
}

/* Recommendations results returned from server */
export interface RecommendationsResponse extends Record<string, any> {
  request: Partial<RecommendationsRequestType>;
  response: Partial<RecommendationsResponseType>;
  result_id: string;
}

export interface RecommendationsRequestType extends Record<string, any> {
  num_results: number;
  item_id: string;
  filters: {
    group_id: string;
    [key: string]: any;
  };
  pod_id: string;
}

export interface RecommendationsResponseType extends Record<string, any> {
  results: Partial<RecommendationsResultType>[];
  total_num_results: number;
  pod: {
    id: string;
    display_name: string;
    [key: string]: any;
  };
}

export interface RecommendationsResultType extends Record<string, any> {
  matched_terms: string[];
  data: Record<string, any>;
  value: string;
  is_slotted: boolean;
  labels: Record<string, any>;
  strategy: {
    id: string;
    [key: string]: any;
  };
}

export interface RecommendationPodsResponse extends Record<string, any> {
  pods: RecommendationPod[];
  total_count: number;
}

export interface PodStrategy extends Record<string, any> {
  id: string;
  display_name: string;
}
export interface RecommendationPod extends Record<string, any> {
  strategy: PodStrategy;
  id: string;
  display_name: string;
  name: string;
  created_at: string;
  updated_at: string;
  metadata_json: Record<string, any>;
}
