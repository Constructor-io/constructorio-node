import type fs from 'fs';
import type { Duplex } from 'stream';

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
  FacetConfigurationV2,
  FacetConfigurationV2Response,
  SearchabilityConfigurationV2,
  SearchabilityConfigurationV2Response,
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
  force?: boolean;
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
  items?: File | fs.ReadStream | Duplex
  variations?: File | fs.ReadStream | Duplex;
  itemGroups?: File | fs.ReadStream | Duplex;
}

export interface UpdateCatalogParameters extends ReplaceCatalogParameters {}

export interface PatchCatalogParameters {
  section: string;
  notificationEmail?: string;
  force?: boolean;
  onMissing?: 'IGNORE' | 'CREATE' | 'FAIL';
  items?: File | fs.ReadStream | Duplex
  variations?: File | fs.ReadStream | Duplex;
  itemGroups?: File | fs.ReadStream | Duplex;
}

export interface ReplaceCatalogUsingTarArchiveParameters {
  section: string;
  notificationEmail?: string;
  force?: boolean;
  tarArchive?: File | fs.ReadStream | Duplex;
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
  searchabilities: SearchabilityConfiguration[];
  section?: string;
}

// V2 Facet Configuration Parameters
export interface GetFacetConfigurationsV2Parameters {
  page?: number;
  numResultsPerPage?: number;
  offset?: number;
  section?: string;
}

export interface GetFacetConfigurationV2Parameters {
  name: string;
  section?: string;
}

export interface CreateOrReplaceFacetConfigurationsV2Parameters {
  facetConfigurations: FacetConfigurationV2[];
  section?: string;
}

export interface ModifyFacetConfigurationsV2Parameters {
  facetConfigurations: (Partial<FacetConfigurationV2> & { name: string })[];
  section?: string;
}

export interface RemoveFacetConfigurationV2Parameters {
  name: string;
  section?: string;
}

// V2 Searchabilities Parameters
export interface RetrieveSearchabilitiesV2Parameters {
  name?: string;
  page?: number;
  offset?: number;
  numResultsPerPage?: number;
  fuzzySearchable?: boolean;
  exactSearchable?: boolean;
  displayable?: boolean;
  matchType?: 'and' | 'or';
  sortBy?: 'name';
  sortOrder?: 'ascending' | 'descending';
  section?: string;
}

export interface GetSearchabilityV2Parameters {
  name: string;
  section?: string;
}

export interface PatchSearchabilitiesV2Parameters {
  searchabilities: SearchabilityConfigurationV2[];
  skipRebuild?: boolean;
  section?: string;
}

export interface PatchSearchabilityV2Parameters {
  name: string;
  fuzzySearchable?: boolean;
  exactSearchable?: boolean;
  displayable?: boolean;
  hidden?: boolean;
  skipRebuild?: boolean;
  section?: string;
}

export interface DeleteSearchabilitiesV2Parameters {
  searchabilities: { name: string }[];
  skipRebuild?: boolean;
  section?: string;
}

export interface DeleteSearchabilityV2Parameters {
  name: string;
  skipRebuild?: boolean;
  section?: string;
}

interface CatalogMutationResponse {
  task_id: string;
  task_status_path: string;
  [key: string]: any;
}

declare class Catalog {
  constructor(options: ConstructorClientOptions);

  options: ConstructorClientOptions;

  createOrReplaceItems(
    parameters: CreateOrReplaceItemsParameters,
    networkParameters?: NetworkParameters
  ): Promise<CatalogMutationResponse>;

  updateItems(
    parameters: UpdateItemsParameters,
    networkParameters?: NetworkParameters
  ): Promise<CatalogMutationResponse>;

  deleteItems(
    parameters: DeleteItemsParameters,
    networkParameters?: NetworkParameters
  ): Promise<CatalogMutationResponse>;

  retrieveItems(
    parameters: RetrieveItemsParameters,
    networkParameters?: NetworkParameters
  ): Promise<{ items: Item[]; total_count: number; [key: string]: any }>;

  createOrReplaceVariations(
    parameters: CreateOrReplaceVariationsParameters,
    networkParameters?: NetworkParameters
  ): Promise<CatalogMutationResponse>;

  updateVariations(
    parameters: UpdateVariationsParameters,
    networkParameters?: NetworkParameters
  ): Promise<CatalogMutationResponse>;

  deleteVariations(
    parameters: DeleteVariationsParameters,
    networkParameters?: NetworkParameters
  ): Promise<CatalogMutationResponse>;

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
  ): Promise<CatalogMutationResponse>;

  updateCatalog(
    parameters: UpdateCatalogParameters,
    networkParameters?: NetworkParameters
  ): Promise<CatalogMutationResponse>;

  patchCatalog(
    parameters: PatchCatalogParameters,
    networkParameters?: NetworkParameters
  ): Promise<CatalogMutationResponse>;

  replaceCatalogUsingTarArchive(
    parameters: ReplaceCatalogUsingTarArchiveParameters,
    networkParameters?: NetworkParameters
  ): Promise<CatalogMutationResponse>;

  updateCatalogUsingTarArchive(
    parameters: UpdateCatalogUsingTarArchiveParameters,
    networkParameters?: NetworkParameters
  ): Promise<CatalogMutationResponse>;

  patchCatalogUsingTarArchive(
    parameters: PatchCatalogUsingTarArchiveParameters,
    networkParameters?: NetworkParameters
  ): Promise<CatalogMutationResponse>;

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

  // V2 Facet Configuration Methods
  addFacetConfigurationV2(
    parameters: FacetConfigurationV2,
    networkParameters?: NetworkParameters
  ): Promise<FacetConfigurationV2Response>;

  getFacetConfigurationsV2(
    parameters?: GetFacetConfigurationsV2Parameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    facets: FacetConfigurationV2Response[];
    total_count: number;
  }>;

  getFacetConfigurationV2(
    parameters: GetFacetConfigurationV2Parameters,
    networkParameters?: NetworkParameters
  ): Promise<FacetConfigurationV2Response>;

  createOrReplaceFacetConfigurationsV2(
    parameters: CreateOrReplaceFacetConfigurationsV2Parameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    facets: FacetConfigurationV2Response[];
  }>;

  modifyFacetConfigurationsV2(
    parameters: ModifyFacetConfigurationsV2Parameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    facets: FacetConfigurationV2Response[];
  }>;

  replaceFacetConfigurationV2(
    parameters: FacetConfigurationV2,
    networkParameters?: NetworkParameters
  ): Promise<FacetConfigurationV2Response>;

  modifyFacetConfigurationV2(
    parameters: Partial<FacetConfigurationV2> & { name: string },
    networkParameters?: NetworkParameters
  ): Promise<FacetConfigurationV2Response>;

  removeFacetConfigurationV2(
    parameters: RemoveFacetConfigurationV2Parameters,
    networkParameters?: NetworkParameters
  ): Promise<FacetConfigurationV2Response>;

  // V2 Searchabilities Methods
  retrieveSearchabilitiesV2(
    parameters?: RetrieveSearchabilitiesV2Parameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    searchabilities: SearchabilityConfigurationV2Response[];
    total_count: number;
  }>;

  getSearchabilityV2(
    parameters: GetSearchabilityV2Parameters,
    networkParameters?: NetworkParameters
  ): Promise<SearchabilityConfigurationV2Response>;

  patchSearchabilitiesV2(
    parameters: PatchSearchabilitiesV2Parameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    searchabilities: SearchabilityConfigurationV2Response[];
    total_count: number;
  }>;

  patchSearchabilityV2(
    parameters: PatchSearchabilityV2Parameters,
    networkParameters?: NetworkParameters
  ): Promise<SearchabilityConfigurationV2Response>;

  deleteSearchabilitiesV2(
    parameters: DeleteSearchabilitiesV2Parameters,
    networkParameters?: NetworkParameters
  ): Promise<{
    searchabilities: SearchabilityConfigurationV2Response[];
    total_count: number;
  }>;

  deleteSearchabilityV2(
    parameters: DeleteSearchabilityV2Parameters,
    networkParameters?: NetworkParameters
  ): Promise<SearchabilityConfigurationV2Response>;
}
