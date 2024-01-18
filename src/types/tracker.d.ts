import { EventEmitter } from 'events';
import { ConstructorClientOptions, NetworkParameters, ItemTracked } from '.';

export default Tracker;

export interface TrackerUserParameters {
  sessionId: number;
  clientId: string;
  userId?: string;
  segments?: string;
  testCells?: Record<string, any>;
  originReferrer?: string;
  referer?: string;
  userIp?: string;
  userAgent?: string;
  acceptLanguage?: string;
  dateTime?: number;
}

declare class Tracker {
  constructor(options: ConstructorClientOptions);

  private options: ConstructorClientOptions;

  private eventemitter: EventEmitter;

  trackSessionStart(
    userParameters: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackInputFocus(
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackItemDetailLoad(
    parameters: {
      itemName: string;
      itemId: string;
      url: string;
      variationId?: string;
      analyticsTags?: Record<string, string>;
      section?: string;
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackAutocompleteSelect(
    term: string,
    parameters: {
      originalQuery: string;
      section: string;
      tr?: string;
      groupId?: string;
      displayName?: string;
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackSearchSubmit(
    term: string,
    parameters: {
      originalQuery: string;
      groupId?: string;
      displayName?: string;
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackSearchResultsLoaded(
    term: string,
    parameters: {
      numResults: number;
      itemIds: string[];
      section?: string;
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackSearchResultClick(
    term: string,
    parameters: {
      itemName: string;
      itemId: string;
      variationId?: string;
      resultId?: string;
      itemIsConvertible?: string;
      section?: string;
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackConversion(
    term : string | null | undefined,
    parameters: {
      itemId: string;
      revenue?: number;
      itemName?: string;
      variationId?: string;
      type?: string;
      isCustomType?: boolean;
      displayName?: string;
      resultId?: string;
      section?: string;
      analyticsTags?: Record<string, string>;
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackPurchase(
    parameters: {
      items: ItemTracked & {quantity: number}[];
      revenue: number;
      orderId?: string;
      section?: string;
      analyticsTags?: Record<string, string>;
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackRecommendationView(
    parameters: {
      url: string;
      podId: string;
      numResultsViewed: number;
      items?: ItemTracked[];
      resultCount?: number;
      resultPage?: number;
      resultId?: string;
      section?: string;
      analyticsTags?: Record<string, string>;
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackRecommendationClick(
    parameters: {
      podId: string;
      strategyId: string;
      itemId: string;
      itemName: string;
      variationId?: string;
      section?: string;
      resultId?: string;
      resultCount?: number;
      resultPage?: number;
      resultPositionOnPage?: number;
      numResultsPerPage?: number;
      analyticsTags?: Record<string, string>;
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackBrowseResultsLoaded(
    parameters: {
      url: string;
      filterName: string;
      filterValue: string;
      section?: string;
      resultCount?: number;
      resultPage?: number;
      resultId?: string;
      selectedFilters?: object;
      sortOrder?: string;
      sortBy?: string;
      items: ItemTracked[];
      analyticsTags?: Record<string, string>;
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackBrowseResultClick(
    parameters: {
      filterName: string;
      filterValue: string;
      itemId: string;
      section?: string;
      variationId?: string;
      resultId?: string;
      resultCount?: number;
      resultPage?: number;
      resultPositionOnPage?: number;
      numResultsPerPage?: number;
      selectedFilters?: object;
      analyticsTags?: Record<string, string>;
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackGenericResultClick(
    parameters: {
      itemId: string;
      itemName?: string;
      variationId?: string;
      section?: string;
      analyticsTags?: Record<string, string>;
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  on(messageType: string, callback: Function): true | Error;
}
