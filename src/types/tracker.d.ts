import { EventEmitter } from 'events';
import { ConstructorClientOptions, NetworkParameters } from '.';

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
      itemIds?: string[];
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
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackPurchase(
    parameters: {
      items: object[];
      revenue: number;
      orderId?: string;
      section?: string;
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  trackRecommendationView(
    parameters: {
      url: string;
      podId: string;
      numResultsViewed: number;
      items?: object[];
      resultCount?: number;
      resultPage?: number;
      resultId?: string;
      section?: string;
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
      items?: object[];
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
    },
    userParameters?: TrackerUserParameters,
    networkParameters?: NetworkParameters
  ): true | Error;

  on(messageType: string, callback: Function): true | Error;
}
