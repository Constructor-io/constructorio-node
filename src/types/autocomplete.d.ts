import {
  ConstructorClientOptions,
  NetworkParameters,
  RequestFeature,
  RequestFeatureVariant,
  UserParameters,
  VariationsMap,
  FilterExpression
} from '.';

export default Autocomplete;

export interface AutocompleteParameters {
  numResults?: number;
  filters?: Record<string, any>;
  filtersPerSection?: Record<string, Record<string, any>>;
  resultsPerSection?: Record<string, number>;
  pagePerSection?: Record<string, number>;
  resultsPerPagePerSection?: Record<string, number>;
  hiddenFields?: string[];
  variationsMap?: VariationsMap;
  preFilterExpression?: FilterExpression;
}

declare class Autocomplete {
  constructor(options: ConstructorClientOptions);

  options: ConstructorClientOptions;

  getAutocompleteResults(
    query: string,
    parameters?: AutocompleteParameters,
    userParameters?: UserParameters,
    networkParameters?: NetworkParameters
  ): Promise<AutocompleteResponse>;
}

/* Autocomplete results returned from server */
export interface AutocompleteResponse extends Record<string, any> {
  request: Partial<AutocompleteRequestType>;
  sections: Record<string, Section>;
  result_id: string;
}

export interface AutocompleteRequestType extends Record<string, any> {
  num_results: number;
  term: string;
  query: string;
  features: Partial<RequestFeature>;
  feature_variants: Partial<RequestFeatureVariant>;
  searchandized_items: Record<string, any>;
  variations_map?: VariationsMap;
  pre_filter_expression?: FilterExpression;
}

export type Section = Partial<SectionItem>[];

export interface SectionItem extends Record<string, any> {
  data: Record<string, any>;
  is_slotted: boolean;
  labels: Record<string, any>;
  matched_terms: string[];
  value: string;
}
