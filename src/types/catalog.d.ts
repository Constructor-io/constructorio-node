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
  SearchabilityConfiguration,
  SearchabilityConfigurationResponse,
} from '.';

export default Catalog;

export interface CreateOrReplaceItemsParameters {
  items: Item[];
  force?: boolean;
  notificationEmail?: string;
  section?: string;
}

export interface UpdateItemsParameters extends CreateOrReplaceItemsParameters {
  onMissing?: 'IGNORE' | 'CREATE' | 'FAIL';
}

export interface DeleteItemsParameters {
  items: Pick<Item, 'id'>[];
  section?: string;
  notificationEmail?: string;
}

export interface RetrieveItemsParameters {
  ids?: string[];
  section?: string;
  numResultsPerPage?: number;
  page?: number;
}

export interface CreateOrReplaceVariationsParameters {
  variations: Variation[];
  force?: boolean;
  notificationEmail?: string;
  section?: string;
}

export interface UpdateVariationsParameters
  extends CreateOrReplaceVariationsParameters {
    onMissing?: 'IGNORE' | 'CREATE' | 'FAIL';
  }

export interface DeleteVariationsParameters {
  variations: Pick<Variation, 'id'>[];
  force?: boolean;
  notificationEmail?: string;
  section?: string;
}

export interface RetrieveVariationsParameters {
  section?: string;
  ids?: string[];
  itemId?: string;
  numResultsPerPage?: number;
  page?: number;
}

export interface AddItemGroupParameters {
  id: string;
  name: string;
  parentId?: string;
  data?: Record<string, any>;
}

export interface AddItemGroupsParameters {
  itemGroups: ItemGroup[];
}

export interface GetItemGroupParameters {
  id: string;
}

export interface AddOrUpdateItemGroupsParameters
  extends AddItemGroupsParameters {}

export interface AddOneWaySynonymParameters {
  phrase: string;
  childPhrases: string[];
}

export interface ModifyOneWaySynonymParameters
  extends AddOneWaySynonymParameters {}

export interface GetOneWaySynonymParameters {
  phrase: string;
}

export interface GetOneWaySynonymsParameters {
  numResultsPerPage?: number;
  page?: number;
}

export interface RemoveOneWaySynonymParameters {
  phrase: string;
}

export interface AddSynonymGroupParameters {
  synonyms: string[];
}

export interface ModifySynonymGroupParameters {
  synonyms: string[];
}

export interface GetSynonymGroupParameters {
  id: number;
}

export interface GetSynonymGroupsParameters {
  phrase?: string;
  numResultsPerPage?: number;
  page?: number;
}

export interface RemoveSynonymGroupParameters {
  id: number;
}

export interface AddRedirectRuleParameters {
  url: string;
  matches: RedirectRuleMatchObject[];
  startTime?: string;
  endTime?: string;
  userSegments?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateRedirectRuleParameters
  extends AddRedirectRuleParameters {
  id: string;
}

export interface ModifyRedirectRuleParameters
  extends AddRedirectRuleParameters {
  id: string;
}

export interface GetRedirectRuleParameters {
  id: string;
}

export interface GetRedirectRulesParameters {
  numResultsPerPage?: number;
  page?: number;
  query?: string;
  status?: string;
}

export interface RemoveRedirectRuleParameters {
  id: string;
}

export interface ReplaceCatalogParameters {
  section: string;
  notificationEmail?: string;
  force?: boolean;
  items?: File;
  variations?: File;
  itemGroups?: File;
}

export interface UpdateCatalogParameters extends ReplaceCatalogParameters {}

export interface PatchCatalogParameters {
  section: string;
  notificationEmail?: string;
  force?: boolean;
  onMissing?: 'IGNORE' | 'CREATE' | 'FAIL';
  items?: File;
  variations?: File;
  itemGroups?: File;
}

export interface ReplaceCatalogUsingTarArchiveParameters {
  section: string;
  notificationEmail?: string;
  force?: boolean;
  tarArchive?: File;
}

export interface UpdateCatalogUsingTarArchiveParameters
  extends ReplaceCatalogUsingTarArchiveParameters {}

export interface PatchCatalogUsingTarArchiveParameters
  extends ReplaceCatalogUsingTarArchiveParameters {
    onMissing?: 'IGNORE' | 'CREATE' | 'FAIL';
  }

export interface GetFacetConfigurationsParameters {
  page?: number;
  numResultsPerPage?: number;
  section?: string;
}

export interface GetFacetConfigurationParameters {
  name?: string;
  section?: string;
}

export interface ModifyFacetConfigurationsParameters {
  facetConfigurations: FacetConfiguration[];
}

export interface RemoveFacetConfigurationParameters {
  name: string;
  section?: string;
}

export type AddFacetOptionConfigurationParameters = FacetOptionConfiguration & {
  facetGroupName: string;
  section?: string;
};

export interface AddOrModifyFacetOptionConfigurationsParameters {
  facetGroupName: string;
  facetOptionConfigurations: FacetOptionConfiguration[];
  section?: string;
}

export interface GetFacetOptionConfigurationsParameters {
  facetGroupName: string;
  page?: number;
  numResultsPerPage?: number;
  section?: string;
}

export interface GetFacetOptionConfigurationParameters {
  facetGroupName: string;
  value: string;
  section?: string;
}

export type ReplaceFacetOptionConfigurationParameters = {
  facetGroupName: string;
  section?: string;
} & FacetOptionConfiguration;

export type ModifyFacetOptionConfigurationParameters = ReplaceFacetOptionConfigurationParameters

export interface RemoveFacetOptionConfiguration extends GetFacetOptionConfigurationParameters {}

export interface RetrieveSearchabilitiesParameters {
  name?: string;
  page?: number;
  offset?: number;
  numResultsPerPage?: number;
  filters?: Record<string, any>;
  searchable?: boolean;
  sortBy?: string;
  sortOrder?: string;
  section?: string;
}

export interface PatchSearchabilitiesParameters {
  searchabilities: SearchabilityConfiguration[],
  section?: string;
}

declare class Catalog {
  constructor(options: ConstructorClientOptions);

  options: ConstructorClientOptions;

  createOrReplaceItems(
    parameters: CreateOrReplaceItemsParameters,
    networkParameters?: NetworkParameters
  ): Promise<void>;

  updateItems(
    parameters: UpdateItemsParameters,
    networkParameters?: NetworkParameters
  ): Promise<void>;

  deleteItems(
    parameters: DeleteItemsParameters,
    networkParameters?: NetworkParameters
  ): Promise<void>;

  retrieveItems(
    parameters: RetrieveItemsParameters,
    networkParameters?: NetworkParameters
  ): Promise<{ items: Item[]; total_count: number; [key: string]: any }>;

  createOrReplaceVariations(
    parameters: CreateOrReplaceVariationsParameters,
    networkParameters?: NetworkParameters
  ): Promise<void>;

  updateVariations(
    parameters: UpdateVariationsParameters,
    networkParameters?: NetworkParameters
  ): Promise<void>;

  deleteVariations(
    parameters: DeleteVariationsParameters,
    networkParameters?: NetworkParameters
  ): Promise<void>;

  retrieveVariations(
    parameters: RetrieveVariationsParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    variations: Variation[];
    total_count: number;
    [key: string]: any;
  }>;

  addItemGroup(
    parameters: AddItemGroupParameters,
    networkParameters?: NetworkParameters
  ): Promise<void>;

  addItemGroups(
    parameters: AddItemGroupsParameters,
    networkParameters?: NetworkParameters
  ): Promise<void>;

  getItemGroup(
    parameters: GetItemGroupParameters,
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
    parameters: AddOrUpdateItemGroupsParameters,
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
    parameters: AddOneWaySynonymParameters,
    networkParameters?: NetworkParameters
  ): Promise<void>;

  modifyOneWaySynonym(
    parameters: ModifyOneWaySynonymParameters,
    networkParameters?: NetworkParameters
  ): Promise<void>;

  getOneWaySynonym(
    parameters: GetOneWaySynonymParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    one_way_synonym_relations: OneWaySynonymRelation[];
  }>;

  getOneWaySynonyms(
    parameters?: GetOneWaySynonymsParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    one_way_synonym_relations: OneWaySynonymRelation[];
    [key: string]: any;
  }>;

  removeOneWaySynonym(
    parameters: RemoveOneWaySynonymParameters,
    networkParameters?: NetworkParameters
  ): Promise<void>;

  removeOneWaySynonyms(networkParameters?: NetworkParameters): Promise<void>;

  addSynonymGroup(
    parameters: AddSynonymGroupParameters,
    networkParameters?: NetworkParameters
  ): Promise<{ group_id: number; [key: string]: any }>;

  modifySynonymGroup(
    parameters: ModifySynonymGroupParameters,
    networkParameters?: NetworkParameters
  ): Promise<void>;

  getSynonymGroup(
    parameters: GetSynonymGroupParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    synonym_groups: SynonymGroup[];
    total_count: number;
    [key: string]: any;
  }>;

  getSynonymGroups(
    parameters?: GetSynonymGroupsParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    synonym_groups: SynonymGroup[];
    total_count: number;
    [key: string]: any;
  }>;

  removeSynonymGroup(
    parameters:RemoveSynonymGroupParameters,
    networkParameters?: NetworkParameters
  ): Promise<void>;

  removeSynonymGroups(networkParameters?: NetworkParameters): Promise<void>;

  addRedirectRule(
    parameters: AddRedirectRuleParameters,
    networkParameters?: NetworkParameters
  ): Promise<RedirectRuleResponse>;

  updateRedirectRule(
    parameters: UpdateRedirectRuleParameters,
    networkParameters?: NetworkParameters
  ): Promise<RedirectRuleResponse>;

  modifyRedirectRule(
    parameters: ModifyRedirectRuleParameters,
    networkParameters?: NetworkParameters
  ): Promise<RedirectRuleResponse>;

  getRedirectRule(
    parameters: GetRedirectRuleParameters,
    networkParameters?: NetworkParameters
  ): Promise<RedirectRuleResponse>;

  getRedirectRules(
    parameters?: GetRedirectRulesParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    redirect_rules: RedirectRuleResponse[];
    total_count: number;
    [key: string]: any;
  }>;

  removeRedirectRule(
    parameters: RemoveRedirectRuleParameters,
    networkParameters?: NetworkParameters
  ): Promise<RedirectRuleResponse>;

  replaceCatalog(
    parameters: ReplaceCatalogParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    task_id: string;
    task_status_path: string;
    [key: string]: any;
  }>;

  updateCatalog(
    parameters: UpdateCatalogParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    task_id: string;
    task_status_path: string;
    [key: string]: any;
  }>;

  patchCatalog(
    parameters: PatchCatalogParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    task_id: string;
    task_status_path: string;
    [key: string]: any;
  }>;

  replaceCatalogUsingTarArchive(
    parameters: ReplaceCatalogUsingTarArchiveParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    task_id: string;
    task_status_path: string;
    [key: string]: any;
  }>;

  updateCatalogUsingTarArchive(
    parameters: UpdateCatalogUsingTarArchiveParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    task_id: string;
    task_status_path: string;
    [key: string]: any;
  }>;

  patchCatalogUsingTarArchive(
    parameters: PatchCatalogUsingTarArchiveParameters,
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
    parameters: GetFacetConfigurationsParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    facets: FacetConfiguration[];
    total_count: number;
    [key: string]: any;
  }>;

  getFacetConfiguration(
    parameters: GetFacetConfigurationParameters,
    networkParameters?: NetworkParameters
  ): Promise<FacetConfiguration>;

  modifyFacetConfigurations(
    parameters?: ModifyFacetConfigurationsParameters,
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
    parameters?: RemoveFacetConfigurationParameters,
    networkParameters?: NetworkParameters
  ): Promise<FacetConfiguration>;

  addFacetOptionConfiguration(
    parameters: AddFacetOptionConfigurationParameters,
    networkParameters?: NetworkParameters
  ): Promise<FacetOptionConfiguration>;

  addOrModifyFacetOptionConfigurations(
    parameters: AddOrModifyFacetOptionConfigurationsParameters,
    networkParameters?: NetworkParameters
  ): Promise<FacetOptionConfiguration[]>;

  getFacetOptionConfigurations(
    parameters: GetFacetOptionConfigurationsParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    facet_options: FacetOptionConfiguration[];
    total_count: number;
    [key: string]: any;
  }>;

  getFacetOptionConfiguration(
    parameters: GetFacetOptionConfigurationParameters,
    networkParameters?: NetworkParameters
  ): Promise<FacetOptionConfiguration>;

  replaceFacetOptionConfiguration(
    parameters: ReplaceFacetOptionConfigurationParameters,
    networkParameters?: NetworkParameters
  ): Promise<FacetOptionConfiguration>;

  modifyFacetOptionConfiguration(
    parameters?: ModifyFacetOptionConfigurationParameters,
    networkParameters?: NetworkParameters
  ): Promise<FacetOptionConfiguration>;

  removeFacetOptionConfiguration(
    parameters: RemoveFacetOptionConfiguration,
    networkParameters?: NetworkParameters
  ): Promise<FacetOptionConfiguration>;

  retrieveSearchabilities(
    parameters?: RetrieveSearchabilitiesParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    searchabilities: SearchabilityConfigurationResponse[];
    total_count: number;
  }>;

  patchSearchabilities(
    parameters: PatchSearchabilitiesParameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    searchabilities: SearchabilityConfigurationResponse[];
  }>;
}
