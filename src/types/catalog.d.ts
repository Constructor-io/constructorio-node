import {
  ConstructorClientOptions,
  Item,
  ItemGroup,
  RedirectRuleMatchObject,
  Variation,
  FacetConfiguration,
  NetworkParameters,
  FacetOptionConfiguration,
  RedirectRuleResponse,
  OneWaySynonymRelation,
  SynonymGroup,
} from '.';

export default Catalog;

declare class Catalog {
  constructor(options: ConstructorClientOptions);

  options: ConstructorClientOptions;

  createOrReplaceItems(
    parameters: {
      items: Item[];
      force?: boolean;
      notificationEmail?: string;
      section?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<void>;

  updateItems(
    parameters: {
      items: Item[];
      force?: boolean;
      notificationEmail?: string;
      section?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<void>;

  deleteItems(
    parameters: {
      items: Pick<Item, 'id'>[];
      section?: string;
      notificationEmail?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<void>;

  retrieveItems(
    parameters: {
      ids?: string[];
      section?: string;
      numResultsPerPage?: number;
      page?: number;
    },
    networkParameters?: NetworkParameters
  ): Promise<{ items: Item[]; total_count: number; [key: string]: any }>;

  createOrReplaceVariations(
    parameters: {
      variations: Variation[];
      force?: boolean;
      notificationEmail?: string;
      section?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<void>;

  updateVariations(
    parameters: {
      variations: Variation[];
      force?: boolean;
      notificationEmail?: string;
      section?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<void>;

  deleteVariations(
    parameters: {
      variations: Pick<Variation, 'id'>[];
      force?: boolean;
      notificationEmail?: string;
      section?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<void>;

  retrieveVariations(
    parameters: {
      section?: string;
      ids?: string[];
      itemId?: string;
      numResultsPerPage?: number;
      page?: number;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    variations: Variation[];
    total_count: number;
    [key: string]: any;
  }>;

  addItemGroup(
    parameters: {
      id: string;
      name: string;
      parent_id?: string;
      data?: Record<string, any>;
    },
    networkParameters?: NetworkParameters
  ): Promise<void>;

  addItemGroups(
    parameters: {
      item_groups: ItemGroup[];
    },
    networkParameters?: NetworkParameters
  ): Promise<void>;

  getItemGroup(
    parameters: {
      id: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    item_groups: ItemGroup[];
    total_count: number;
    [key: string]: any;
  }>;

  getItemGroups(networkParameters?: NetworkParameters): Promise<{
    item_groups: ItemGroup[];
    total_count: number;
    [key: string]: any;
  }>;

  addOrUpdateItemGroups(
    parameters: {
      item_groups: ItemGroup[];
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    item_groups: {
      deleted: number;
      inserted: number;
      processed: number;
      updated: number;
    };
  }>;

  modifyItemGroup(
    parameters: ItemGroup,
    networkParameters?: NetworkParameters
  ): Promise<{
    id: string;
    path?: string;
    path_list?: string[];
    name?: string;
    parent_id?: string;
    data?: Record<string, any>;
    [key: string]: any;
  }>;

  removeItemGroups(
    networkParameters?: NetworkParameters
  ): Promise<{ message: string }>;

  addOneWaySynonym(
    parameters: {
      phrase: string;
      child_phrases: string[];
    },
    networkParameters?: NetworkParameters
  ): Promise<void>;

  modifyOneWaySynonym(
    parameters: {
      phrase: string;
      child_phrases: string[];
    },
    networkParameters?: NetworkParameters
  ): Promise<void>;

  getOneWaySynonym(
    parameters: {
      phrase: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    one_way_synonym_relations: OneWaySynonymRelation[];
  }>;

  getOneWaySynonyms(
    parameters?: {
      num_results_per_page?: number;
      page?: number;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    one_way_synonym_relations: OneWaySynonymRelation[];
    [key: string]: any;
  }>;

  removeOneWaySynonym(
    parameters: {
      phrase: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<void>;

  removeOneWaySynonyms(networkParameters?: NetworkParameters): Promise<void>;

  addSynonymGroup(
    parameters: {
      synonyms: string[];
    },
    networkParameters?: NetworkParameters
  ): Promise<{ group_id: number; [key: string]: any }>;

  modifySynonymGroup(
    parameters: {
      id: number;
      synonyms: string[];
    },
    networkParameters?: NetworkParameters
  ): Promise<void>;

  getSynonymGroup(
    parameters: {
      id: number;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    synonym_groups: SynonymGroup[];
    total_count: number;
    [key: string]: any;
  }>;

  getSynonymGroups(
    parameters?: {
      phrase?: string;
      num_results_per_page?: number;
      page?: number;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    synonym_groups: SynonymGroup[];
    total_count: number;
    [key: string]: any;
  }>;

  removeSynonymGroup(
    parameters: {
      id: number;
    },
    networkParameters?: NetworkParameters
  ): Promise<void>;

  removeSynonymGroups(networkParameters?: NetworkParameters): Promise<void>;

  addRedirectRule(
    parameters: {
      url: string;
      matches: RedirectRuleMatchObject[];
      start_time?: string;
      end_time?: string;
      user_segments?: string[];
      metadata?: Record<string, any>;
    },
    networkParameters?: NetworkParameters
  ): Promise<RedirectRuleResponse>;

  updateRedirectRule(
    parameters: {
      id: string;
      url: string;
      matches: RedirectRuleMatchObject[];
      start_time?: string;
      end_time?: string;
      user_segments?: string[];
      metadata?: Record<string, any>;
    },
    networkParameters?: NetworkParameters
  ): Promise<RedirectRuleResponse>;

  modifyRedirectRule(
    parameters: {
      id: string;
      url: string;
      matches: RedirectRuleMatchObject[];
      start_time?: string;
      end_time?: string;
      user_segments?: string[];
      metadata?: Record<string, any>;
    },
    networkParameters?: NetworkParameters
  ): Promise<RedirectRuleResponse>;

  getRedirectRule(
    parameters: {
      id: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<RedirectRuleResponse>;

  getRedirectRules(
    parameters?: {
      num_results_per_page?: number;
      page?: number;
      query?: string;
      status?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    redirect_rules: RedirectRuleResponse[];
    total_count: number;
    [key: string]: any;
  }>;

  removeRedirectRule(
    parameters: {
      id: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<RedirectRuleResponse>;

  replaceCatalog(
    parameters: {
      section: string;
      notification_email?: string;
      force?: boolean;
      items?: File;
      variations?: File;
      item_groups?: File;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    task_id: string;
    task_status_path: string;
    [key: string]: any;
  }>;

  updateCatalog(
    parameters: {
      section: string;
      notification_email?: string;
      force?: boolean;
      items?: File;
      variations?: File;
      item_groups?: File;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    task_id: string;
    task_status_path: string;
    [key: string]: any;
  }>;

  patchCatalog(
    parameters: {
      section: string;
      notification_email?: string;
      force?: boolean;
      onMissing?: 'IGNORE' | 'CREATE' | 'FAIL';
      items?: File;
      variations?: File;
      item_groups?: File;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    task_id: string;
    task_status_path: string;
    [key: string]: any;
  }>;

  replaceCatalogUsingTarArchive(
    parameters: {
      section: string;
      notification_email?: string;
      force?: boolean;
      tarArchive?: File;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    task_id: string;
    task_status_path: string;
    [key: string]: any;
  }>;

  updateCatalogUsingTarArchive(
    parameters: {
      section: string;
      notification_email?: string;
      force?: boolean;
      tarArchive?: File;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    task_id: string;
    task_status_path: string;
    [key: string]: any;
  }>;

  patchCatalogUsingTarArchive(
    parameters: {
      section: string;
      notification_email?: string;
      force?: boolean;
      tarArchive?: File;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    task_id: string;
    task_status_path: string;
    [key: string]: any;
  }>;

  addFacetConfiguration(
    parameters: FacetConfiguration,
    networkParameters?: NetworkParameters
  ): Promise<FacetConfiguration>;

  getFacetConfigurations(
    parameters: {
      page?: number;
      num_results_per_page?: number;
      section?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    facets: FacetConfiguration[];
    total_count: number;
    [key: string]: any;
  }>;

  getFacetConfiguration(
    parameters: {
      name?: string;
      section?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<FacetConfiguration>;

  modifyFacetConfigurations(
    parameters?: {
      facetConfigurations: FacetConfiguration[];
    },
    networkParameters?: NetworkParameters
  ): Promise<FacetConfiguration[]>;

  replaceFacetConfiguration(
    parameters: FacetConfiguration,
    networkParameters?: NetworkParameters
  ): Promise<FacetConfiguration>;

  modifyFacetConfiguration(
    parameters: FacetConfiguration,
    networkParameters?: NetworkParameters
  ): Promise<FacetConfiguration>;

  removeFacetConfiguration(
    parameters?: {
      name: string;
      section?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<FacetConfiguration>;

  addFacetOptionConfiguration(
    parameters: FacetOptionConfiguration & {
      facetGroupName: string;
      section?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<FacetOptionConfiguration>;

  addOrModifyFacetOptionConfigurations(
    parameters: {
      facetGroupName: string;
      facetOptionConfigurations: FacetOptionConfiguration[];
      section?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<FacetOptionConfiguration[]>;

  getFacetOptionConfigurations(
    parameters: {
      facetGroupName: string;
      page?: number;
      num_results_per_page?: number;
      section?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<{
    facet_options: FacetOptionConfiguration[];
    total_count: number;
    [key: string]: any;
  }>;

  getFacetOptionConfiguration(
    parameters: {
      facetGroupName: string;
      value: string;
      section?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<FacetOptionConfiguration>;

  replaceFacetOptionConfiguration(
    parameters: {
      facetGroupName: string;
      section?: string;
    } & FacetOptionConfiguration,
    networkParameters?: NetworkParameters
  ): Promise<FacetOptionConfiguration>;

  modifyFacetOptionConfiguration(
    parameters?: {
      facetGroupName: string;
      section?: string;
    } & FacetOptionConfiguration,
    networkParameters?: NetworkParameters
  ): Promise<FacetOptionConfiguration>;

  removeFacetOptionConfiguration(
    parameters: {
      facetGroupName: string;
      value: string;
      section?: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<FacetOptionConfiguration>;
}
