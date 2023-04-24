import { ConstructorClientOptions, NetworkParameters, UserParameters, SortOption, ResultSources, Group, Facet, Feature } from '.';

export default Quizzes;

export interface QuizzesParameters {
  section?: string;
  answers?: any[];
  quizVersionId?: string;
  quizSessionId?: string;
}

declare class Quizzes {
  constructor(options: ConstructorClientOptions);

  options: ConstructorClientOptions;

  getQuizNextQuestion(
    id: string,
    parameters?: QuizzesParameters,
    userParameters?: UserParameters,
    networkParameters?: NetworkParameters
  ): Promise<NextQuestionResponse>;

  getQuizResults(
    id: string,
    parameters?: QuizzesParameters,
    userParameters?: UserParameters,
    networkParameters?: NetworkParameters
  ): Promise<QuizResultsResponse>;
}

/* quizzes results returned from server */
export interface NextQuestionResponse extends Record<string, any> {
  next_question: Partial<NextQuestion>;
  is_last_question?: boolean;
  quiz_version_id: string;
  quiz_session_id: string;
  quiz_id: string;
}

export interface QuizResultsRequestType extends Record<string, any> {
  collection_filter_expression: Record<string, any>;
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

export interface QuizResultsResponseData extends Record<string, any> {
  result_sources: Partial<ResultSources>;
  facets: Partial<Facet>[];
  groups: Partial<Group>[];
  results: Partial<QuizResultData>[];
  sort_options: Partial<SortOption>[];
  total_num_results: number;
  features: Partial<Feature>[];
}

export interface QuizResultsResponse extends Record<string, any> {
  request: Partial<QuizResultsRequestType>;
  response: Partial<QuizResultsResponseData>;
  quiz_version_id: string;
  quiz_session_id: string;
  quiz_id: string;
}

export interface QuizResultData extends Record<string, any> {
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

export interface NextQuestion extends Record<string, any> {
  id: number;
  title: string;
  description: string;
  type: 'single' | 'multiple' | 'open' | 'cover';
  cta_text: string;
  images: Partial<QuestionImages>;
  options: Partial<QuestionOption>[];
  input_placeholder: string;
}

export interface QuestionOption extends Record<string, any> {
  id: number;
  value: string;
  attribute: {
    name: string;
    value: string;
  };
  images: Partial<QuestionImages>;
}

export interface QuestionImages extends Record<string, any> {
  primary_url: string;
  primary_alt: string;
  secondary_url: string;
  secondary_alt: string;
}
