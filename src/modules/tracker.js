/* eslint-disable max-len */
/* eslint-disable camelcase, no-underscore-dangle, no-unneeded-ternary, brace-style */
const qs = require('qs');
const { AbortController } = require('node-abort-controller');
const EventEmitter = require('events');
const helpers = require('../utils/helpers');

// Maps provided userParameters and options to the fields required by the API
// These are sent in query parameters on every event, and additionally within the body on POST events
// Fields are added onto the passed parameters object, mutating it in place
// A cleaned copy is what gets returned, so the returned object is not the one that was passed in
function applyParams(parameters, userParameters, options) {
  const {
    apiKey,
    version,
  } = options;
  const {
    sessionId,
    clientId,
    userId,
    segments,
    testCells,
    originReferrer,
    documentReferrer,
    canonicalUrl,
    dateTime,
  } = userParameters || {};
  let aggregateParams = Object.assign(parameters);

  // Validate session ID is provided
  if (!sessionId || typeof sessionId !== 'number') {
    throw new Error('sessionId is a required user parameter of type number');
  }

  // Validate client ID is provided
  if (!clientId || typeof clientId !== 'string') {
    throw new Error('clientId is a required user parameter of type string');
  }

  if (version) {
    aggregateParams.c = version;
  }

  if (clientId) {
    aggregateParams.i = clientId;
  }

  if (sessionId) {
    aggregateParams.s = sessionId;
  }

  if (userId) {
    aggregateParams.ui = String(userId);
  }

  if (segments && segments.length) {
    aggregateParams.us = segments;
  }

  if (apiKey) {
    aggregateParams.key = apiKey;
  }

  if (testCells) {
    Object.keys(testCells).forEach((testCellKey) => {
      aggregateParams[`ef-${testCellKey}`] = testCells[testCellKey];
    });
  }

  if (originReferrer) {
    aggregateParams.origin_referrer = originReferrer;
  }

  if (documentReferrer) {
    aggregateParams.document_referrer = documentReferrer;
  }

  if (canonicalUrl) {
    aggregateParams.canonical_url = canonicalUrl;
  }

  aggregateParams._dt = dateTime || Date.now();
  aggregateParams.beacon = true;
  aggregateParams = helpers.cleanParams(aggregateParams);

  return aggregateParams;
}

// Append common parameters to supplied parameters object and return as string
function applyParamsAsString(parameters, userParameters, options) {
  return qs.stringify(applyParams(parameters, userParameters, options), { indices: false });
}

// Send request to server
function send(url, userParameters, networkParameters, method = 'GET', body = {}) { // eslint-disable-line max-params
  let request;
  const { fetch } = this.options;
  const controller = new AbortController();
  const { signal } = controller;
  const headers = {};

  // PII Detection
  if (helpers.requestContainsPii(url)) return;

  Object.assign(headers, helpers.combineCustomHeaders(this.options, networkParameters));

  // Append security token as 'x-cnstrc-token' if available
  if (this.options.securityToken && typeof this.options.securityToken === 'string') {
    headers['x-cnstrc-token'] = this.options.securityToken;
  }

  if (userParameters) {
    // Append user IP as 'X-Forwarded-For' if available
    if (userParameters.userIp && typeof userParameters.userIp === 'string') {
      headers['X-Forwarded-For'] = userParameters.userIp;
    }

    // Append user agent as 'User-Agent' if available
    if (userParameters.userAgent && typeof userParameters.userAgent === 'string') {
      headers['User-Agent'] = userParameters.userAgent;
    }

    // Append language as 'Accept-Language' if available
    if (userParameters.acceptLanguage && typeof userParameters.acceptLanguage === 'string') {
      headers['Accept-Language'] = userParameters.acceptLanguage;
    }

    // Append referrer as 'Referer' if available
    if (userParameters.referer && typeof userParameters.referer === 'string') {
      headers.Referer = userParameters.referer;
    }
  }

  // Handle network timeout if specified
  helpers.applyNetworkTimeout(this.options, networkParameters, controller);

  if (method === 'GET') {
    request = fetch(url, { headers, signal });
  }

  if (method === 'POST') {
    request = fetch(url, {
      method,
      body: JSON.stringify(body),
      mode: 'cors',
      headers: {
        ...headers,
        'Content-Type': 'text/plain',
      },
      signal,
    });
  }

  if (request) {
    const instance = this;
    const emitError = helpers.getEmitError(instance, { url, method });

    request.then((response) => {
      // Request was successful, and returned a 2XX status code
      if (response.ok) {
        instance.eventemitter.emit('success', {
          url,
          method,
          message: 'ok',
        });
      }

      // Request was successful, but returned a non-2XX status code
      else {
        const contentType = response.headers.get('Content-Type') || '';

        if (contentType.includes('application/json')) {
          response.json().then((json) => {
            emitError(json && json.message);
          }).catch((error) => {
            emitError(error.type);
          });
        } else {
          // If not JSON, fallback to text
          response.text().then((text) => {
            emitError(text || 'Unknown error message');
          }).catch((error) => {
            emitError(`Error reading text: ${error.message}`);
          });
        }
      }
    }).catch((error) => {
      emitError(error.toString());
    });
  }
}

/**
 * Interface to tracking related API calls
 *
 * @module tracker
 * @inner
 * @returns {object}
 */
class Tracker {
  constructor(options) {
    this.options = options || {};
    this.eventemitter = new EventEmitter();
  }

  /**
   * Send session start event to API
   *
   * @function trackSessionStart
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @example
   * constructorio.tracker.trackSessionStart({
   *  sessionId: 1,
   *  clientId: '6c73138f-c27b-49f0-872d-63b00ed0e395',
   *  testCells: { testName: 'cellName' },
   * });
   */
  trackSessionStart(userParameters, networkParameters = {}) {
    const url = `${this.options.serviceUrl}/behavior?`;
    const queryParams = { action: 'session_start' };
    const requestUrl = `${url}${applyParamsAsString(queryParams, userParameters, this.options)}`;

    send.call(
      this,
      requestUrl,
      userParameters,
      networkParameters,
    );

    return true;
  }

  /**
   * Send input focus event to API
   *
   * @function trackInputFocus
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User focused on search input element
   * @example
   * constructorio.tracker.trackInputFocus({
   *     sessionId: 1,
   *     clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *     testCells: { testName: 'cellName' },
   * });
   */
  trackInputFocus(userParameters, networkParameters = {}) {
    const url = `${this.options.serviceUrl}/behavior?`;
    const queryParams = { action: 'focus' };
    const requestUrl = `${url}${applyParamsAsString(queryParams, userParameters, this.options)}`;

    send.call(
      this,
      requestUrl,
      userParameters,
      networkParameters,
    );

    return true;
  }

  /**
   * Send item detail load event to API
   *
   * @function trackItemDetailLoad
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.itemName - Product item name
   * @param {string} parameters.itemId - Product item unique identifier
   * @param {string} parameters.url - Current page URL
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {string} [parameters.section] - Index section
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User loaded an item detail page
   * @example
   * constructorio.tracker.trackItemDetailLoad(
   *     {
   *         itemName: 'Red T-Shirt',
   *         itemId: 'KMH876',
   *         url: 'https://constructor.io/product/KMH876',
   *     },
   * );
   */
  trackItemDetailLoad(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/item_detail_load?`;
      const bodyParams = {};
      const {
        item_name,
        name,
        item_id,
        customer_id,
        customerId = customer_id,
        variation_id,
        itemName = item_name || name,
        itemId = item_id || customerId,
        variationId = variation_id,
        url,
        analyticsTags,
        section,
      } = parameters;

      // Ensure support for both item_name and name as parameters
      if (itemName) {
        bodyParams.item_name = itemName;
      }

      // Ensure support for both item_id and customer_id as parameters
      if (itemId) {
        bodyParams.item_id = itemId;
      }

      if (variationId) {
        bodyParams.variation_id = variationId;
      }

      if (url) {
        bodyParams.url = url;
      }

      if (analyticsTags) {
        bodyParams.analytics_tags = analyticsTags;
      }

      if (section) {
        bodyParams.section = section;
      }

      const requestUrl = `${requestPath}${applyParamsAsString({}, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
        networkParameters,
        requestMethod,
        requestBody,
      );

      return true;
    }

    return new Error('parameters are required of type object');
  }

  /**
   * Send autocomplete select event to API
   *
   * @function trackAutocompleteSelect
   * @param {string} term - Term of selected autocomplete item (Search Suggestion or Product name)
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.originalQuery - The current autocomplete search query
   * @param {string} parameters.section - Section the selected item resides within
   * @param {string} [parameters.tr] - Trigger used to select the item (click, etc.)
   * @param {string} [parameters.groupId] - Group identifier of the group to search within. Only required if searching within a group, i.e. "Pumpkin in Canned Goods"
   * @param {string} [parameters.displayName] - Display name of the group to search within. Only required if searching within a group, i.e. "Pumpkin in Canned Goods"
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User selected (clicked, or navigated to via keyboard) a result that appeared
   * within autocomplete (Search Suggestions, Products, or a custom section eg. Brands, Categories)
   * @example
   * constructorio.tracker.trackAutocompleteSelect(
   *     'T-Shirt',
   *     {
   *         originalQuery: 'Shirt',
   *         section: 'Products',
   *         tr: 'click',
   *         groupId: '88JU230',
   *         displayName: 'apparel',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackAutocompleteSelect(term, parameters, userParameters, networkParameters = {}) {
    // Ensure term is provided (required)
    if (term && typeof term === 'string') {
      // Ensure parameters are provided (required)
      if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
        const url = `${this.options.serviceUrl}/autocomplete/${helpers.encodeURIComponentRFC3986(helpers.normalizeSpaces(term))}/select?`;
        const queryParams = {};
        const {
          original_query,
          originalQuery = original_query,
          section,
          original_section,
          originalSection = original_section,
          tr,
          group_id,
          groupId = group_id,
          display_name,
          displayName = display_name,
        } = parameters;

        if (originalQuery) {
          queryParams.original_query = originalQuery;
        }

        if (tr) {
          queryParams.tr = tr;
        }

        if (originalSection || section) {
          queryParams.section = originalSection || section;
        }

        if (groupId) {
          queryParams.group = {
            group_id: groupId,
            display_name: displayName,
          };
        }

        const requestUrl = `${url}${applyParamsAsString(queryParams, userParameters, this.options)}`;

        send.call(
          this,
          requestUrl,
          userParameters,
          networkParameters,
        );

        return true;
      }

      return new Error('parameters are required of type object');
    }

    return new Error('term is a required parameter of type string');
  }

  /**
   * Send autocomplete search event to API
   *
   * @function trackSearchSubmit
   * @param {string} term - Term of submitted autocomplete event
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.originalQuery - The current autocomplete search query
   * @param {string} [parameters.groupId] - Group identifier of the group to search within. Only required if searching within a group, i.e. "Pumpkin in Canned Goods"
   * @param {string} [parameters.displayName] - Display name of the group to search within. Only required if searching within a group, i.e. "Pumpkin in Canned Goods"
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User submitted a search (pressing enter within input element, or clicking submit element)
   * @example
   * constructorio.tracker.trackSearchSubmit(
   *     'T-Shirt',
   *     {
   *         originalQuery: 'Shirt',
   *         groupId: '88JU230',
   *         displayName: 'apparel',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackSearchSubmit(term, parameters, userParameters, networkParameters = {}) {
    // Ensure term is provided (required)
    if (term && typeof term === 'string') {
      // Ensure parameters are provided (required)
      if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
        const url = `${this.options.serviceUrl}/autocomplete/${helpers.encodeURIComponentRFC3986(helpers.normalizeSpaces(term))}/search?`;
        const queryParams = {};
        const {
          original_query,
          originalQuery = original_query,
          group_id,
          groupId = group_id,
          display_name,
          displayName = display_name,
        } = parameters;

        if (originalQuery) {
          queryParams.original_query = originalQuery;
        }

        if (groupId) {
          queryParams.group = {
            group_id: groupId,
            display_name: displayName,
          };
        }

        const requestUrl = `${url}${applyParamsAsString(queryParams, userParameters, this.options)}`;

        send.call(
          this,
          requestUrl,
          userParameters,
          networkParameters,
        );

        return true;
      }

      return new Error('parameters are required of type object');
    }

    return new Error('term is a required parameter of type string');
  }

  /**
   * Send search results event to API
   *
   * @function trackSearchResultsLoaded
   * @param {string} term - Search results query term
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {object[]} parameters.items - List of product item unique identifiers in search results listing
   * @param {string} [parameters.url] - URL of the search results page
   * @param {number} [parameters.resultCount] - Total number of results
   * @param {number} [parameters.resultPage] - Current page of search results
   * @param {string} [parameters.resultId] - Browse result identifier (returned in response from Constructor)
   * @param {object} [parameters.selectedFilters] - Selected filters
   * @param {string} [parameters.sortOrder] - Sort order ('ascending' or 'descending')
   * @param {string} [parameters.sortBy] - Sorting method
   * @param {string} [parameters.section] - The section name for the item Ex. "Products"
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User loaded a search product listing page
   * @example
   * constructorio.tracker.trackSearchResultsLoaded(
   *     'T-Shirt',
   *     {
   *         resultCount: 167,
   *         items: [{ itemId: 'KMH876' }, { itemId: 'KMH140' }],
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackSearchResultsLoaded(term, parameters, userParameters, networkParameters = {}) {
    // Ensure term is provided (required)
    if (term && typeof term === 'string') {
      // Ensure parameters are provided (required)
      if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
        const baseUrl = `${this.options.serviceUrl}/v2/behavioral_action/search_result_load?`;
        const {
          num_results,
          numResults = num_results,
          result_count,
          customerIds,
          customer_ids = customerIds,
          itemIds,
          item_ids = itemIds,
          items = customer_ids || item_ids,
          result_page,
          resultPage = result_page,
          result_id,
          resultId = result_id,
          sort_order,
          sortOrder = sort_order,
          sort_by,
          sortBy = sort_by,
          selected_filters,
          selectedFilters = selected_filters,
          url = 'N/A',
          section,
          analyticsTags,
          resultCount = numResults || result_count || items?.length || 0,
        } = parameters;
        const queryParams = {};
        let transformedItems;

        if (items && Array.isArray(items) && items.length !== 0) {
          const trimmedItems = items.slice(0, 100);

          if (typeof items[0] === 'string' || typeof items[0] === 'number') {
            transformedItems = trimmedItems.map((itemId) => ({ item_id: String(itemId) }));
          } else {
            transformedItems = trimmedItems.map((item) => helpers.toSnakeCaseKeys(item, false));
          }
        }

        if (section) {
          queryParams.section = section;
        }

        const bodyParams = {
          search_term: term,
          result_count: resultCount,
          items: transformedItems,
          result_page: resultPage,
          result_id: resultId,
          sort_order: sortOrder,
          sort_by: sortBy,
          selected_filters: selectedFilters,
          analytics_tags: analyticsTags,
          url,
          section,
        };

        const requestUrl = `${baseUrl}${applyParamsAsString({}, userParameters, this.options)}`;
        const requestMethod = 'POST';
        const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

        send.call(
          this,
          requestUrl,
          userParameters,
          networkParameters,
          requestMethod,
          requestBody,
        );

        return true;
      }

      return new Error('parameters are required of type object');
    }

    return new Error('term is a required parameter of type string');
  }

  /**
   * Send click through event to API
   *
   * @function trackSearchResultClick
   * @param {string} term - Search results query term
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.itemName - Product item name
   * @param {string} parameters.itemId - Product item unique identifier
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {string} [parameters.resultId] - Search result identifier (returned in response from Constructor)
   * @param {string} [parameters.itemIsConvertible] - Whether or not an item is available for a conversion
   * @param {string} [parameters.section] - The section name for the item Ex. "Products"
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User clicked a result that appeared within a search product listing page
   * @example
   * constructorio.tracker.trackSearchResultClick(
   *     'T-Shirt',
   *     {
   *         itemName: 'Red T-Shirt',
   *         itemId: 'KMH876',
   *         resultId: '019927c2-f955-4020-8b8d-6b21b93cb5a2',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackSearchResultClick(term, parameters, userParameters, networkParameters = {}) {
    // Ensure term is provided (required)
    if (term && typeof term === 'string') {
      // Ensure parameters are provided (required)
      if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
        const url = `${this.options.serviceUrl}/autocomplete/${helpers.encodeURIComponentRFC3986(helpers.normalizeSpaces(term))}/click_through?`;
        const queryParams = {};
        const {
          item_name,
          name,
          itemName = item_name || name,
          item_id,
          itemId = item_id,
          customer_id,
          customerId = customer_id || itemId,
          variation_id,
          variationId = variation_id,
          result_id,
          resultId = result_id,
          item_is_convertible,
          itemIsConvertible = item_is_convertible,
          section,
        } = parameters;

        // Ensure support for both item_name and name as parameters
        if (itemName) {
          queryParams.name = itemName;
        }

        // Ensure support for both item_id and customer_id as parameters
        if (customerId) {
          queryParams.customer_id = customerId;
        }

        if (variationId) {
          queryParams.variation_id = variationId;
        }

        if (resultId) {
          queryParams.result_id = resultId;
        }

        if (typeof itemIsConvertible === 'boolean') {
          queryParams.item_is_convertible = itemIsConvertible;
        }

        if (section) {
          queryParams.section = section;
        }

        const requestUrl = `${url}${applyParamsAsString(queryParams, userParameters, this.options)}`;

        send.call(
          this,
          requestUrl,
          userParameters,
          networkParameters,
        );

        return true;
      }

      return new Error('parameters are required of type object');
    }

    return new Error('term is a required parameter of type string');
  }

  /**
   * Send conversion event to API
   *
   * @function trackConversion
   * @param {string} [term] - Search results query term that led to conversion event
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.itemId - Product item unique identifier
   * @param {number} [parameters.revenue] - Sale price if available, otherwise the regular (retail) price of item
   * @param {string} [parameters.itemName] - Product item name
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {string} [parameters.type='add_to_cart'] - Conversion type
   * @param {boolean} [parameters.isCustomType] - Specify if type is custom conversion type
   * @param {string} [parameters.displayName] - Display name for the custom conversion type
   * @param {string} [parameters.section] - Index section
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User performed an action indicating interest in an item (add to cart, add to wishlist, etc.)
   * @see https://docs.constructor.com/docs/integrating-with-constructor-behavioral-tracking-data-driven-event-tracking
   * @example
   * constructorio.tracker.trackConversion(
   *     'T-Shirt',
   *     {
   *         itemId: 'KMH876',
   *         revenue: 12.00,
   *         itemName: 'Red T-Shirt',
   *         variationId: 'KMH879-7632',
   *         type: 'like',
   *         section: 'Products',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackConversion(term, parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
      const searchTerm = term || 'TERM_UNKNOWN';
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/conversion?`;
      const queryParams = {};
      const bodyParams = {};
      const {
        name,
        item_name,
        itemName = item_name || name,
        item_id,
        customer_id,
        itemId = item_id || customer_id,
        variation_id,
        variationId = variation_id,
        revenue,
        section = 'Products',
        display_name,
        displayName = display_name,
        type,
        is_custom_type,
        isCustomType = is_custom_type,
        analyticsTags,
      } = parameters;

      // Ensure support for both item_id and customer_id as parameters
      if (itemId) {
        bodyParams.item_id = itemId;
      }

      // Ensure support for both item_name and name as parameters
      if (itemName) {
        bodyParams.item_name = itemName;
      }

      if (variationId) {
        bodyParams.variation_id = variationId;
      }

      if (revenue) {
        bodyParams.revenue = revenue.toString();
      }

      if (section) {
        queryParams.section = section;
        bodyParams.section = section;
      }

      if (searchTerm) {
        bodyParams.search_term = searchTerm;
      }

      if (type) {
        bodyParams.type = type;
      }

      if (isCustomType) {
        bodyParams.is_custom_type = isCustomType;
      }

      if (displayName) {
        bodyParams.display_name = displayName;
      }

      if (analyticsTags) {
        bodyParams.analytics_tags = analyticsTags;
      }

      const requestUrl = `${requestPath}${applyParamsAsString(queryParams, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
        networkParameters,
        requestMethod,
        requestBody,
      );

      return true;
    }

    return new Error('parameters are required of type object');
  }

  /**
   * Send purchase event to API
   *
   * @function trackPurchase
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {object[]} parameters.items - List of product item objects
   * @param {number} parameters.revenue - The subtotal (excluding taxes, shipping, etc.) of the entire order
   * @param {string} [parameters.orderId] - Unique order identifier
   * @param {string} [parameters.section] - Index section
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User completed an order (usually fired on order confirmation page)
   * @example
   * constructorio.tracker.trackPurchase(
   *     {
   *         items: [{ itemId: 'KMH876' }, { itemId: 'KMH140' }],
   *         revenue: 12.00,
   *         orderId: 'OUNXBG2HMA',
   *         section: 'Products',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackPurchase(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/purchase?`;
      const queryParams = {};
      const bodyParams = {};
      const {
        items,
        revenue,
        order_id,
        orderId = order_id,
        section,
        analyticsTags,
      } = parameters;

      if (orderId) {
        bodyParams.order_id = orderId;
      }

      if (items && Array.isArray(items)) {
        bodyParams.items = items.slice(0, 100).map((item) => helpers.toSnakeCaseKeys(item, false));
      }

      if (revenue) {
        bodyParams.revenue = revenue;
      }

      if (analyticsTags) {
        bodyParams.analytics_tags = analyticsTags;
      }

      if (section) {
        queryParams.section = section;
      } else {
        queryParams.section = 'Products';
      }

      const requestUrl = `${requestPath}${applyParamsAsString(queryParams, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
        networkParameters,
        requestMethod,
        requestBody,
      );

      return true;
    }

    return new Error('parameters are required of type object');
  }

  /**
   * Send recommendation view event to API
   *
   * @function trackRecommendationView
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.url - Current page URL
   * @param {string} parameters.podId - Pod identifier
   * @param {number} parameters.numResultsViewed - Number of results viewed
   * @param {object[]} [parameters.items] - List of Product Item objects
   * @param {number} [parameters.resultCount] - Total number of results
   * @param {number} [parameters.resultPage] - Page number of results
   * @param {string} [parameters.resultId] - Recommendation result identifier (returned in response from Constructor)
   * @param {string} [parameters.section="Products"] - Results section
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {string[]|string|number} [parameters.seedItemIds] - Item ID(s) used to generate recommendations
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User viewed a set of recommendations
   * @example
   * constructorio.tracker.trackRecommendationView(
   *     {
   *         items: [{ itemId: 'KMH876' }, { itemId: 'KMH140' }],
   *         resultCount: 22,
   *         resultPage: 2,
   *         resultId: '019927c2-f955-4020-8b8d-6b21b93cb5a2',
   *         url: 'https://demo.constructor.io/sandbox/farmstand',
   *         podId: '019927c2-f955-4020',
   *         numResultsViewed: 3,
   *         seedItemIds: ['UIH976']
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackRecommendationView(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/recommendation_result_view?`;
      const bodyParams = {};
      const {
        result_count,
        resultCount = result_count,
        result_page,
        resultPage = result_page,
        result_id,
        resultId = result_id,
        section,
        url,
        pod_id,
        podId = pod_id,
        num_results_viewed,
        numResultsViewed = num_results_viewed,
        items,
        analyticsTags,
        seed_item_ids,
        seedItemIds = seed_item_ids,
      } = parameters;

      if (!helpers.isNil(resultCount)) {
        bodyParams.result_count = resultCount;
      }

      if (!helpers.isNil(resultPage)) {
        bodyParams.result_page = resultPage;
      }

      if (resultId) {
        bodyParams.result_id = resultId;
      }

      if (section) {
        bodyParams.section = section;
      } else {
        bodyParams.section = 'Products';
      }

      if (url) {
        bodyParams.url = url;
      }

      if (podId) {
        bodyParams.pod_id = podId;
      }

      if (!helpers.isNil(numResultsViewed)) {
        bodyParams.num_results_viewed = numResultsViewed;
      }

      if (items && Array.isArray(items)) {
        bodyParams.items = items.slice(0, 100).map((item) => helpers.toSnakeCaseKeys(item, false));
      }

      if (analyticsTags) {
        bodyParams.analytics_tags = analyticsTags;
      }

      if ((typeof seedItemIds === 'string' || typeof seedItemIds === 'number') && String(seedItemIds).length) {
        bodyParams.seed_item_ids = [String(seedItemIds)];
      } else if (Array.isArray(seedItemIds) && seedItemIds.length) {
        bodyParams.seed_item_ids = seedItemIds.map(String);
      }

      const requestUrl = `${requestPath}${applyParamsAsString({}, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
        networkParameters,
        requestMethod,
        requestBody,
      );

      return true;
    }

    return new Error('parameters are required of type object');
  }

  /**
   * Send recommendation click event to API
   *
   * @function trackRecommendationClick
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.podId - Pod identifier
   * @param {string} parameters.strategyId - Strategy identifier
   * @param {string} parameters.itemId - Product item unique identifier
   * @param {string} parameters.itemName - Product item name
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {string} [parameters.section="Products"] - Index section
   * @param {string} [parameters.resultId] - Recommendation result identifier (returned in response from Constructor)
   * @param {number} [parameters.resultCount] - Total number of results
   * @param {number} [parameters.resultPage] - Page number of results
   * @param {number} [parameters.resultPositionOnPage] - Position of result on page
   * @param {number} [parameters.numResultsPerPage] - Number of results on page
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {string[]|string|number} [parameters.seedItemIds] - Item ID(s) used to generate recommendations
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User clicked an item that appeared within a list of recommended results
   * @example
   * constructorio.tracker.trackRecommendationClick(
   *     {
   *         variationId: 'KMH879-7632',
   *         resultId: '019927c2-f955-4020-8b8d-6b21b93cb5a2',
   *         resultCount: 22,
   *         resultPage: 2,
   *         resultPositionOnPage: 2,
   *         numResultsPerPage: 12,
   *         podId: '019927c2-f955-4020',
   *         strategyId: 'complimentary',
   *         itemId: 'KMH876',
   *         seedItemIds: ['UIH976']
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackRecommendationClick(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/recommendation_result_click?`;
      const bodyParams = {};
      const {
        variation_id,
        variationId = variation_id,
        section,
        result_id,
        resultId = result_id,
        result_count,
        resultCount = result_count,
        result_page,
        resultPage = result_page,
        result_position_on_page,
        resultPositionOnPage = result_position_on_page,
        num_results_per_page,
        numResultsPerPage = num_results_per_page,
        pod_id,
        podId = pod_id,
        strategy_id,
        strategyId = strategy_id,
        item_id,
        itemId = item_id,
        item_name,
        itemName = item_name,
        analyticsTags,
        seed_item_ids,
        seedItemIds = seed_item_ids,
      } = parameters;

      if (variationId) {
        bodyParams.variation_id = variationId;
      }

      if (section) {
        bodyParams.section = section;
      } else {
        bodyParams.section = 'Products';
      }

      if (resultId) {
        bodyParams.result_id = resultId;
      }

      if (!helpers.isNil(resultCount)) {
        bodyParams.result_count = resultCount;
      }

      if (!helpers.isNil(resultPage)) {
        bodyParams.result_page = resultPage;
      }

      if (!helpers.isNil(resultPositionOnPage)) {
        bodyParams.result_position_on_page = resultPositionOnPage;
      }

      if (!helpers.isNil(numResultsPerPage)) {
        bodyParams.num_results_per_page = numResultsPerPage;
      }

      if (podId) {
        bodyParams.pod_id = podId;
      }

      if (strategyId) {
        bodyParams.strategy_id = strategyId;
      }

      if (itemId) {
        bodyParams.item_id = itemId;
      }

      if (itemName) {
        bodyParams.item_name = itemName;
      }

      if (analyticsTags) {
        bodyParams.analytics_tags = analyticsTags;
      }

      if ((typeof seedItemIds === 'string' || typeof seedItemIds === 'number') && String(seedItemIds).length) {
        bodyParams.seed_item_ids = [String(seedItemIds)];
      } else if (Array.isArray(seedItemIds) && seedItemIds.length) {
        bodyParams.seed_item_ids = seedItemIds.map(String);
      }

      const requestUrl = `${requestPath}${applyParamsAsString({}, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
        networkParameters,
        requestMethod,
        requestBody,
      );

      return true;
    }

    return new Error('parameters are required of type object');
  }

  /**
   * Send browse results loaded event to API
   *
   * @function trackBrowseResultsLoaded
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.url - Current page URL
   * @param {string} parameters.filterName - Filter name
   * @param {string} parameters.filterValue - Filter value
   * @param {object[]} parameters.items - List of product item objects
   * @param {string} [parameters.section="Products"] - Index section
   * @param {number} [parameters.resultCount] - Total number of results
   * @param {number} [parameters.resultPage] - Page number of results
   * @param {string} [parameters.resultId] - Browse result identifier (returned in response from Constructor)
   * @param {object} [parameters.selectedFilters] - Selected filters
   * @param {string} [parameters.sortOrder] - Sort order ('ascending' or 'descending')
   * @param {string} [parameters.sortBy] - Sorting method
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User loaded a browse product listing page
   * @example
   * constructorio.tracker.trackBrowseResultsLoaded(
   *     {
   *         resultCount: 22,
   *         resultPage: 2,
   *         resultId: '019927c2-f955-4020-8b8d-6b21b93cb5a2',
   *         selectedFilters: { brand: ['foo'], color: ['black'] },
   *         sortOrder: 'ascending',
   *         sortBy: 'price',
   *         items: [{ itemId: 'KMH876' }, { itemId: 'KMH140' }],
   *         url: 'https://demo.constructor.io/sandbox/farmstand',
   *         filterName: 'brand',
   *         filterValue: 'XYZ',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackBrowseResultsLoaded(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/browse_result_load?`;
      const bodyParams = {};
      const {
        section,
        result_count,
        resultCount = result_count,
        result_page,
        resultPage = result_page,
        result_id,
        resultId = result_id,
        selected_filters,
        selectedFilters = selected_filters,
        url,
        sort_order,
        sortOrder = sort_order,
        sort_by,
        sortBy = sort_by,
        filter_name,
        filterName = filter_name,
        filter_value,
        filterValue = filter_value,
        items,
        analyticsTags,
      } = parameters;

      if (section) {
        bodyParams.section = section;
      } else {
        bodyParams.section = 'Products';
      }

      if (!helpers.isNil(resultCount)) {
        bodyParams.result_count = resultCount;
      }

      if (!helpers.isNil(resultPage)) {
        bodyParams.result_page = resultPage;
      }

      if (resultId) {
        bodyParams.result_id = resultId;
      }

      if (selectedFilters) {
        bodyParams.selected_filters = selectedFilters;
      }

      if (url) {
        bodyParams.url = url;
      }

      if (sortOrder) {
        bodyParams.sort_order = sortOrder;
      }

      if (sortBy) {
        bodyParams.sort_by = sortBy;
      }

      if (filterName) {
        bodyParams.filter_name = filterName;
      }

      if (filterValue) {
        bodyParams.filter_value = filterValue;
      }

      if (items && Array.isArray(items)) {
        bodyParams.items = items.slice(0, 100).map((item) => helpers.toSnakeCaseKeys(item, false));
      }

      if (analyticsTags) {
        bodyParams.analytics_tags = analyticsTags;
      }

      const requestUrl = `${requestPath}${applyParamsAsString({}, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
        networkParameters,
        requestMethod,
        requestBody,
      );

      return true;
    }

    return new Error('parameters are required of type object');
  }

  /**
   * Send browse result click event to API
   *
   * @function trackBrowseResultClick
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.filterName - Filter name
   * @param {string} parameters.filterValue - Filter value
   * @param {string} parameters.itemId - Product item unique identifier
   * @param {string} [parameters.section="Products"] - Index section
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {string} [parameters.resultId] - Browse result identifier (returned in response from Constructor)
   * @param {number} [parameters.resultCount] - Total number of results
   * @param {number} [parameters.resultPage] - Page number of results
   * @param {number} [parameters.resultPositionOnPage] - Position of clicked item
   * @param {number} [parameters.numResultsPerPage] - Number of results shown
   * @param {object} [parameters.selectedFilters] -  Selected filters
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User clicked a result that appeared within a browse product listing page
   * @example
   * constructorio.tracker.trackBrowseResultClick(
   *     {
   *         variationId: 'KMH879-7632',
   *         resultId: '019927c2-f955-4020-8b8d-6b21b93cb5a2',
   *         resultCount: 22,
   *         resultPage: 2,
   *         resultPositionOnPage: 2,
   *         numResultsPerPage: 12,
   *         selectedFilters: { brand: ['foo'], color: ['black'] },
   *         filterName: 'brand',
   *         filterValue: 'XYZ',
   *         itemId: 'KMH876',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackBrowseResultClick(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/browse_result_click?`;
      const bodyParams = {};
      const {
        section,
        variation_id,
        variationId = variation_id,
        result_id,
        resultId = result_id,
        result_count,
        resultCount = result_count,
        result_page,
        resultPage = result_page,
        result_position_on_page,
        resultPositionOnPage = result_position_on_page,
        num_results_per_page,
        numResultsPerPage = num_results_per_page,
        selected_filters,
        selectedFilters = selected_filters,
        filter_name,
        filterName = filter_name,
        filter_value,
        filterValue = filter_value,
        item_id,
        itemId = item_id,
        analyticsTags,
      } = parameters;

      if (section) {
        bodyParams.section = section;
      } else {
        bodyParams.section = 'Products';
      }

      if (variationId) {
        bodyParams.variation_id = variationId;
      }

      if (resultId) {
        bodyParams.result_id = resultId;
      }

      if (!helpers.isNil(resultCount)) {
        bodyParams.result_count = resultCount;
      }

      if (!helpers.isNil(resultPage)) {
        bodyParams.result_page = resultPage;
      }

      if (!helpers.isNil(resultPositionOnPage)) {
        bodyParams.result_position_on_page = resultPositionOnPage;
      }

      if (!helpers.isNil(numResultsPerPage)) {
        bodyParams.num_results_per_page = numResultsPerPage;
      }

      if (selectedFilters) {
        bodyParams.selected_filters = selectedFilters;
      }

      if (filterName) {
        bodyParams.filter_name = filterName;
      }

      if (filterValue) {
        bodyParams.filter_value = filterValue;
      }

      if (itemId) {
        bodyParams.item_id = itemId;
      }

      if (analyticsTags) {
        bodyParams.analytics_tags = analyticsTags;
      }

      const requestUrl = `${requestPath}${applyParamsAsString({}, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
        networkParameters,
        requestMethod,
        requestBody,
      );

      return true;
    }

    return new Error('parameters are required of type object');
  }

  /**
   * Send generic result click event to API
   *
   * @function trackGenericResultClick
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.itemId - Product item unique identifier
   * @param {string} [parameters.itemName] - Product item name
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {string} [parameters.section="Products"] - Index section
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {object} [userParameters] - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User clicked a result that appeared outside of the scope of search / browse / recommendations
   * @example
   * constructorio.tracker.trackGenericResultClick(
   *     {
   *         itemId: 'KMH876',
   *         itemName: 'Red T-Shirt',
   *         variationId: 'KMH879-7632',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackGenericResultClick(parameters, userParameters, networkParameters = {}) {
    // Ensure required parameters are provided
    if (typeof parameters === 'object' && parameters && (parameters.item_id || parameters.itemId)) {
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/result_click?`;
      const bodyParams = {};
      const {
        item_id,
        itemId = item_id,
        item_name,
        itemName = item_name,
        variation_id,
        variationId = variation_id,
        section,
        analyticsTags,
      } = parameters;

      bodyParams.section = section || 'Products';
      bodyParams.item_id = itemId;

      if (itemName) {
        bodyParams.item_name = itemName;
      }

      if (variationId) {
        bodyParams.variation_id = variationId;
      }

      if (analyticsTags) {
        bodyParams.analytics_tags = analyticsTags;
      }

      const requestUrl = `${requestPath}${applyParamsAsString({}, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
        networkParameters,
        requestMethod,
        requestBody,
      );

      return true;
    }

    return new Error('A parameters object with an "itemId" property is required.');
  }

  /**
   * Send product insights agent answer feedback event to API
   *
   * @function trackProductInsightsAgentAnswerFeedback
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.feedbackLabel - Feedback value: either "thumbs_up" or "thumbs_down"
   * @param {string} [parameters.itemId] - Product item unique identifier
   * @param {string} [parameters.itemName] - Product item name
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {object} [parameters.features] - Dictionary of feature flags
   * @param {object} [parameters.featureVariants] - Dictionary of feature variants
   * @param {string} [parameters.qnaResultId] - Questions and answers result identifier
   * @param {string} [parameters.threadId] - Thread identifier for grouping events within a conversation
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {string} [parameters.section] - Index section
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User provided feedback on the usefulness of a product insights agent answer
   * @example
   * constructorio.tracker.trackProductInsightsAgentAnswerFeedback(
   *     {
   *         feedbackLabel: 'thumbs_up',
   *         itemId: 'KMH876',
   *         itemName: 'Red T-Shirt',
   *         variationId: 'KMH879-7632',
   *         qnaResultId: '019927c2-f955-4020-8b8d-6b21b93cb5a2',
   *         threadId: '0daf0015-fc29-4727-9140-8d5313a1902c',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackProductInsightsAgentAnswerFeedback(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
      return new Error('parameters are required of type object');
    }

    const {
      // accept snake_case aliases alongside camelCase
      feedback_label,
      feedbackLabel = feedback_label,
      item_id,
      itemId = item_id,
      item_name,
      itemName = item_name,
      variation_id,
      variationId = variation_id,
      features,
      feature_variants,
      featureVariants = feature_variants,
      qna_result_id,
      qnaResultId = qna_result_id,
      thread_id,
      threadId = thread_id,
      analytics_tags,
      analyticsTags = analytics_tags,
      section,
    } = parameters;

    if (!feedbackLabel) {
      return new Error('A parameters object with a "feedbackLabel" property is required.');
    }

    const bodyParams = {
      item_id: itemId,
      item_name: itemName,
      variation_id: variationId,
      features,
      feature_variants: featureVariants,
      analytics_tags: analyticsTags,
      qna_result_id: qnaResultId,
      thread_id: threadId,
      feedback_label: feedbackLabel,
    };

    // query params that are not assigned in the applyParams()
    const queryParams = {
      section,
    };

    const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/product_insights_agent_answer_feedback?`;
    const requestUrl = `${requestPath}${applyParamsAsString(queryParams, userParameters, this.options)}`;
    const requestMethod = 'POST';
    // POST events must include common parameters (key, i, s, c, ui, _dt, origin_referrer, canonical_url, document_referrer) both in body and query string
    const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

    send.call(
      this,
      requestUrl,
      userParameters,
      networkParameters,
      requestMethod,
      requestBody,
    );

    return true;
  }

  /**
   * Send product insights agent answer view event to API
   *
   * @function trackProductInsightsAgentAnswerView
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.question - Question that was asked
   * @param {string} parameters.answerText - The answer to the given question
   * @param {string} [parameters.itemId] - Product item unique identifier
   * @param {string} [parameters.itemName] - Product item name
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {object} [parameters.features] - Dictionary of feature flags
   * @param {object} [parameters.featureVariants] - Dictionary of feature variants
   * @param {string} [parameters.questionTopic] - Topic category of the question, as assigned during generation
   * @param {string} [parameters.qnaResultId] - Questions and answers result identifier
   * @param {string} [parameters.threadId] - Thread identifier for grouping events within a conversation
   * @param {object[]} [parameters.items] - List of recommended product items displayed alongside the answer (maximum 100)
   * @param {object[]} [parameters.followUpQuestions] - List of follow-up questions displayed alongside the answer, each in the shape of { value } (maximum 100)
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {string} [parameters.section] - Index section
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User viewed a product insights agent answer
   * @example
   * constructorio.tracker.trackProductInsightsAgentAnswerView(
   *     {
   *         question: 'Is this t-shirt machine washable?',
   *         answerText: 'Yes, it can be machine washed at 30 degrees.',
   *         itemId: 'KMH876',
   *         itemName: 'Red T-Shirt',
   *         qnaResultId: '019927c2-f955-4020-8b8d-6b21b93cb5a2',
   *         threadId: '0daf0015-fc29-4727-9140-8d5313a1902c',
   *         items: [{ itemId: 'KMH877', itemName: 'Blue T-Shirt' }],
   *         followUpQuestions: [{ value: 'What sizes are available?' }],
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackProductInsightsAgentAnswerView(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
      return new Error('parameters are required of type object');
    }

    const {
      // accept snake_case aliases alongside camelCase
      question,
      answer_text,
      answerText = answer_text,
      item_id,
      itemId = item_id,
      item_name,
      itemName = item_name,
      variation_id,
      variationId = variation_id,
      features,
      feature_variants,
      featureVariants = feature_variants,
      question_topic,
      questionTopic = question_topic,
      qna_result_id,
      qnaResultId = qna_result_id,
      thread_id,
      threadId = thread_id,
      items,
      follow_up_questions,
      followUpQuestions = follow_up_questions,
      analytics_tags,
      analyticsTags = analytics_tags,
      section,
    } = parameters;

    if (!question) {
      return new Error('A parameters object with a "question" property is required.');
    }

    // answer_text may be an empty string, so only the type is validated
    if (typeof answerText !== 'string') {
      return new Error('A parameters object with an "answerText" property of type string is required.');
    }

    const bodyParams = {
      item_id: itemId,
      item_name: itemName,
      variation_id: variationId,
      features,
      feature_variants: featureVariants,
      analytics_tags: analyticsTags,
      question,
      question_topic: questionTopic,
      qna_result_id: qnaResultId,
      thread_id: threadId,
      answer_text: answerText,
    };

    if (items && Array.isArray(items)) {
      bodyParams.items = items.slice(0, 100).map((item) => helpers.toSnakeCaseKeys(item, false));
    }

    if (followUpQuestions && Array.isArray(followUpQuestions)) {
      bodyParams.follow_up_questions = followUpQuestions.slice(0, 100);
    }

    // query params that are not assigned in the applyParams()
    const queryParams = {
      section,
    };

    const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/product_insights_agent_answer_view?`;
    const requestUrl = `${requestPath}${applyParamsAsString(queryParams, userParameters, this.options)}`;
    const requestMethod = 'POST';
    // POST events must include common parameters (key, i, s, c, ui, _dt, origin_referrer, canonical_url, document_referrer) both in body and query string
    const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

    send.call(
      this,
      requestUrl,
      userParameters,
      networkParameters,
      requestMethod,
      requestBody,
    );

    return true;
  }

  /**
   * Send product insights agent out of view event to API
   *
   * @function trackProductInsightsAgentOutOfView
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} [parameters.itemId] - Product item unique identifier
   * @param {string} [parameters.itemName] - Product item name
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {object} [parameters.features] - Dictionary of feature flags
   * @param {object} [parameters.featureVariants] - Dictionary of feature variants
   * @param {string} [parameters.threadId] - Thread identifier for grouping events within a conversation
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {string} [parameters.section] - Index section
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description The product insights agent was scrolled out of view
   * @example
   * constructorio.tracker.trackProductInsightsAgentOutOfView(
   *     {
   *         itemId: 'KMH876',
   *         itemName: 'Red T-Shirt',
   *         variationId: 'KMH879-7632',
   *         threadId: '0daf0015-fc29-4727-9140-8d5313a1902c',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackProductInsightsAgentOutOfView(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
      return new Error('parameters are required of type object');
    }

    const {
      // accept snake_case aliases alongside camelCase
      item_id,
      itemId = item_id,
      item_name,
      itemName = item_name,
      variation_id,
      variationId = variation_id,
      features,
      feature_variants,
      featureVariants = feature_variants,
      thread_id,
      threadId = thread_id,
      analytics_tags,
      analyticsTags = analytics_tags,
      section,
    } = parameters;

    const bodyParams = {
      item_id: itemId,
      item_name: itemName,
      variation_id: variationId,
      features,
      feature_variants: featureVariants,
      analytics_tags: analyticsTags,
      thread_id: threadId,
    };

    // query params that are not assigned in the applyParams()
    const queryParams = {
      section,
    };

    const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/product_insights_agent_out_of_view?`;
    const requestUrl = `${requestPath}${applyParamsAsString(queryParams, userParameters, this.options)}`;
    const requestMethod = 'POST';
    // POST events must include common parameters (key, i, s, c, ui, _dt, origin_referrer, canonical_url, document_referrer) both in body and query string
    const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

    send.call(
      this,
      requestUrl,
      userParameters,
      networkParameters,
      requestMethod,
      requestBody,
    );

    return true;
  }

  /**
   * Send product insights agent focus event to API
   *
   * @function trackProductInsightsAgentFocus
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} [parameters.itemId] - Product item unique identifier
   * @param {string} [parameters.itemName] - Product item name
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {object} [parameters.features] - Dictionary of feature flags
   * @param {object} [parameters.featureVariants] - Dictionary of feature variants
   * @param {string} [parameters.threadId] - Thread identifier for grouping events within a conversation
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {string} [parameters.section] - Index section
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User focused on the product insights agent
   * @example
   * constructorio.tracker.trackProductInsightsAgentFocus(
   *     {
   *         itemId: 'KMH876',
   *         itemName: 'Red T-Shirt',
   *         variationId: 'KMH879-7632',
   *         threadId: '0daf0015-fc29-4727-9140-8d5313a1902c',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackProductInsightsAgentFocus(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
      return new Error('parameters are required of type object');
    }

    const {
      // accept snake_case aliases alongside camelCase
      item_id,
      itemId = item_id,
      item_name,
      itemName = item_name,
      variation_id,
      variationId = variation_id,
      features,
      feature_variants,
      featureVariants = feature_variants,
      thread_id,
      threadId = thread_id,
      analytics_tags,
      analyticsTags = analytics_tags,
      section,
    } = parameters;

    const bodyParams = {
      item_id: itemId,
      item_name: itemName,
      variation_id: variationId,
      features,
      feature_variants: featureVariants,
      analytics_tags: analyticsTags,
      thread_id: threadId,
    };

    // query params that are not assigned in the applyParams()
    const queryParams = {
      section,
    };

    const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/product_insights_agent_focus?`;
    const requestUrl = `${requestPath}${applyParamsAsString(queryParams, userParameters, this.options)}`;
    const requestMethod = 'POST';
    // POST events must include common parameters (key, i, s, c, ui, _dt, origin_referrer, canonical_url, document_referrer) both in body and query string
    const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

    send.call(
      this,
      requestUrl,
      userParameters,
      networkParameters,
      requestMethod,
      requestBody,
    );

    return true;
  }

  /**
   * Send product insights agent question click event to API
   *
   * @function trackProductInsightsAgentQuestionClick
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.question - Question submitted by the user
   * @param {string} [parameters.itemId] - Product item unique identifier
   * @param {string} [parameters.itemName] - Product item name
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {object} [parameters.features] - Dictionary of feature flags
   * @param {object} [parameters.featureVariants] - Dictionary of feature variants
   * @param {string} [parameters.questionTopic] - Topic category of the question, as assigned during generation
   * @param {string} [parameters.threadId] - Thread identifier for grouping events within a conversation
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {string} [parameters.section] - Index section
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User clicked on a question in the product insights agent
   * @example
   * constructorio.tracker.trackProductInsightsAgentQuestionClick(
   *     {
   *         question: 'Is this t-shirt machine washable?',
   *         itemId: 'KMH876',
   *         itemName: 'Red T-Shirt',
   *         variationId: 'KMH879-7632',
   *         threadId: '0daf0015-fc29-4727-9140-8d5313a1902c',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackProductInsightsAgentQuestionClick(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
      return new Error('parameters are required of type object');
    }

    const {
      // accept snake_case aliases alongside camelCase
      question,
      item_id,
      itemId = item_id,
      item_name,
      itemName = item_name,
      variation_id,
      variationId = variation_id,
      features,
      feature_variants,
      featureVariants = feature_variants,
      question_topic,
      questionTopic = question_topic,
      thread_id,
      threadId = thread_id,
      analytics_tags,
      analyticsTags = analytics_tags,
      section,
    } = parameters;

    if (!question) {
      return new Error('A parameters object with a "question" property is required.');
    }

    const bodyParams = {
      item_id: itemId,
      item_name: itemName,
      variation_id: variationId,
      features,
      feature_variants: featureVariants,
      analytics_tags: analyticsTags,
      question,
      question_topic: questionTopic,
      thread_id: threadId,
    };

    // query params that are not assigned in the applyParams()
    const queryParams = {
      section,
    };

    const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/product_insights_agent_question_click?`;
    const requestUrl = `${requestPath}${applyParamsAsString(queryParams, userParameters, this.options)}`;
    const requestMethod = 'POST';
    // POST events must include common parameters (key, i, s, c, ui, _dt, origin_referrer, canonical_url, document_referrer) both in body and query string
    const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

    send.call(
      this,
      requestUrl,
      userParameters,
      networkParameters,
      requestMethod,
      requestBody,
    );

    return true;
  }

  /**
   * Send product insights agent question submit event to API
   *
   * @function trackProductInsightsAgentQuestionSubmit
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.question - Question submitted by the user
   * @param {string} [parameters.itemId] - Product item unique identifier
   * @param {string} [parameters.itemName] - Product item name
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {object} [parameters.features] - Dictionary of feature flags
   * @param {object} [parameters.featureVariants] - Dictionary of feature variants
   * @param {string} [parameters.questionTopic] - Topic category of the question, as assigned during generation
   * @param {string} [parameters.threadId] - Thread identifier for grouping events within a conversation
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {string} [parameters.section] - Index section
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User submitted a question to the product insights agent
   * @example
   * constructorio.tracker.trackProductInsightsAgentQuestionSubmit(
   *     {
   *         question: 'Is this t-shirt machine washable?',
   *         itemId: 'KMH876',
   *         itemName: 'Red T-Shirt',
   *         variationId: 'KMH879-7632',
   *         threadId: '0daf0015-fc29-4727-9140-8d5313a1902c',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackProductInsightsAgentQuestionSubmit(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
      return new Error('parameters are required of type object');
    }

    const {
      // accept snake_case aliases alongside camelCase
      question,
      item_id,
      itemId = item_id,
      item_name,
      itemName = item_name,
      variation_id,
      variationId = variation_id,
      features,
      feature_variants,
      featureVariants = feature_variants,
      question_topic,
      questionTopic = question_topic,
      thread_id,
      threadId = thread_id,
      analytics_tags,
      analyticsTags = analytics_tags,
      section,
    } = parameters;

    if (!question) {
      return new Error('A parameters object with a "question" property is required.');
    }

    const bodyParams = {
      item_id: itemId,
      item_name: itemName,
      variation_id: variationId,
      features,
      feature_variants: featureVariants,
      analytics_tags: analyticsTags,
      question,
      question_topic: questionTopic,
      thread_id: threadId,
    };

    // query params that are not assigned in the applyParams()
    const queryParams = {
      section,
    };

    const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/product_insights_agent_question_submit?`;
    const requestUrl = `${requestPath}${applyParamsAsString(queryParams, userParameters, this.options)}`;
    const requestMethod = 'POST';
    // POST events must include common parameters (key, i, s, c, ui, _dt, origin_referrer, canonical_url, document_referrer) both in body and query string
    const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

    send.call(
      this,
      requestUrl,
      userParameters,
      networkParameters,
      requestMethod,
      requestBody,
    );

    return true;
  }

  /**
   * Send product insights agent result click event to API
   *
   * @function trackProductInsightsAgentResultClick
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.question - Question that produced the answer containing this recommendation
   * @param {string} parameters.seedItemId - Product id of the page the product insights agent widget is on
   * @param {string} [parameters.seedItemName] - Product name of the page the product insights agent widget is on
   * @param {string} [parameters.seedVariationId] - Variation id of the page the product insights agent widget is on
   * @param {string} [parameters.itemId] - Clicked product item unique identifier
   * @param {string} [parameters.itemName] - Clicked product item name
   * @param {string} [parameters.variationId] - Clicked product item variation unique identifier
   * @param {number} [parameters.position] - Position of the clicked item in the recommendations list
   * @param {object} [parameters.features] - Dictionary of feature flags
   * @param {object} [parameters.featureVariants] - Dictionary of feature variants
   * @param {string} [parameters.qnaResultId] - Questions and answers result identifier
   * @param {string} [parameters.threadId] - Thread identifier for grouping events within a conversation
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {string} [parameters.section] - Index section
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User clicked on a recommended item within a product insights agent answer
   * @example
   * constructorio.tracker.trackProductInsightsAgentResultClick(
   *     {
   *         question: 'Is there a similar t-shirt in blue?',
   *         seedItemId: 'KMH876',
   *         seedItemName: 'Red T-Shirt',
   *         itemId: 'KMH877',
   *         itemName: 'Blue T-Shirt',
   *         position: 0,
   *         qnaResultId: '019927c2-f955-4020-8b8d-6b21b93cb5a2',
   *         threadId: '0daf0015-fc29-4727-9140-8d5313a1902c',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackProductInsightsAgentResultClick(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
      return new Error('parameters are required of type object');
    }

    const {
      // accept snake_case aliases alongside camelCase
      question,
      seed_item_id,
      seedItemId = seed_item_id,
      seed_item_name,
      seedItemName = seed_item_name,
      seed_variation_id,
      seedVariationId = seed_variation_id,
      item_id,
      itemId = item_id,
      item_name,
      itemName = item_name,
      variation_id,
      variationId = variation_id,
      position,
      features,
      feature_variants,
      featureVariants = feature_variants,
      qna_result_id,
      qnaResultId = qna_result_id,
      thread_id,
      threadId = thread_id,
      analytics_tags,
      analyticsTags = analytics_tags,
      section,
    } = parameters;

    if (!question) {
      return new Error('A parameters object with a "question" property is required.');
    }

    if (!seedItemId) {
      return new Error('A parameters object with a "seedItemId" property is required.');
    }

    const bodyParams = {
      item_id: itemId,
      item_name: itemName,
      variation_id: variationId,
      features,
      feature_variants: featureVariants,
      analytics_tags: analyticsTags,
      qna_result_id: qnaResultId,
      thread_id: threadId,
      position,
      question,
      seed_item_id: seedItemId,
      seed_item_name: seedItemName,
      seed_variation_id: seedVariationId,
    };

    // query params that are not assigned in the applyParams()
    const queryParams = {
      section,
    };

    const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/product_insights_agent_result_click?`;
    const requestUrl = `${requestPath}${applyParamsAsString(queryParams, userParameters, this.options)}`;
    const requestMethod = 'POST';
    // POST events must include common parameters (key, i, s, c, ui, _dt, origin_referrer, canonical_url, document_referrer) both in body and query string
    const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

    send.call(
      this,
      requestUrl,
      userParameters,
      networkParameters,
      requestMethod,
      requestBody,
    );

    return true;
  }

  /**
   * Send product insights agent view event to API
   *
   * @function trackProductInsightsAgentView
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {object[]} parameters.questions - List of pre-generated questions shown to the user, each in the shape of { question, questionTopic }
   * @param {string} [parameters.itemId] - Product item unique identifier
   * @param {string} [parameters.itemName] - Product item name
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {object} [parameters.features] - Dictionary of feature flags
   * @param {object} [parameters.featureVariants] - Dictionary of feature variants
   * @param {string} [parameters.threadId] - Thread identifier for grouping events within a conversation
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {string} [parameters.section] - Index section
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description The product insights agent, with its pre-generated questions, was shown to the user
   * @example
   * constructorio.tracker.trackProductInsightsAgentView(
   *     {
   *         questions: [
   *             { question: 'Is this t-shirt machine washable?', questionTopic: 'care' },
   *             { question: 'What sizes are available?' },
   *         ],
   *         itemId: 'KMH876',
   *         itemName: 'Red T-Shirt',
   *         variationId: 'KMH879-7632',
   *         threadId: '0daf0015-fc29-4727-9140-8d5313a1902c',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackProductInsightsAgentView(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
      return new Error('parameters are required of type object');
    }

    const {
      // accept snake_case aliases alongside camelCase
      questions,
      item_id,
      itemId = item_id,
      item_name,
      itemName = item_name,
      variation_id,
      variationId = variation_id,
      features,
      feature_variants,
      featureVariants = feature_variants,
      thread_id,
      threadId = thread_id,
      analytics_tags,
      analyticsTags = analytics_tags,
      section,
    } = parameters;

    if (!questions || !Array.isArray(questions)) {
      return new Error('A parameters object with a "questions" property of type array is required.');
    }

    const bodyParams = {
      item_id: itemId,
      item_name: itemName,
      variation_id: variationId,
      features,
      feature_variants: featureVariants,
      analytics_tags: analyticsTags,
      thread_id: threadId,
      questions: questions.map((question) => helpers.toSnakeCaseKeys(question, false)),
    };

    // query params that are not assigned in the applyParams()
    const queryParams = {
      section,
    };

    const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/product_insights_agent_view?`;
    const requestUrl = `${requestPath}${applyParamsAsString(queryParams, userParameters, this.options)}`;
    const requestMethod = 'POST';
    // POST events must include common parameters (key, i, s, c, ui, _dt, origin_referrer, canonical_url, document_referrer) both in body and query string
    const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

    send.call(
      this,
      requestUrl,
      userParameters,
      networkParameters,
      requestMethod,
      requestBody,
    );

    return true;
  }

  /**
   * Send product insights agent views event to API
   *
   * @function trackProductInsightsAgentViews
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {object[]} parameters.questions - List of pre-generated questions shown to the user, each in the shape of { question, questionTopic }
   * @param {object[]} parameters.viewTimespans - List of timespans the product insights agent was in the visible part of the screen, each in the shape of { start, end } with ISO 8601 timestamps including a timezone
   * @param {string} [parameters.itemId] - Product item unique identifier
   * @param {string} [parameters.itemName] - Product item name
   * @param {string} [parameters.variationId] - Product item variation unique identifier
   * @param {object} [parameters.features] - Dictionary of feature flags
   * @param {object} [parameters.featureVariants] - Dictionary of feature variants
   * @param {string} [parameters.threadId] - Thread identifier for grouping events within a conversation
   * @param {object} [parameters.analyticsTags] - Pass additional analytics data
   * @param {string} [parameters.section] - Index section
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.documentReferrer] - Client page URL the event originated from
   * @param {string} [userParameters.canonicalUrl] - Canonical URL of the client page
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {string} [userParameters.dateTime] - Time since epoch in milliseconds
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description The product insights agent was in the visible part of the screen for the given timespans
   * @example
   * constructorio.tracker.trackProductInsightsAgentViews(
   *     {
   *         questions: [
   *             { question: 'Is this t-shirt machine washable?', questionTopic: 'care' },
   *         ],
   *         viewTimespans: [
   *             { start: '2026-10-05T10:00:00.000Z', end: '2026-10-05T10:00:05.000Z' },
   *             { start: '2026-10-05T10:01:00.000Z', end: '2026-10-05T10:01:10.000Z' },
   *         ],
   *         itemId: 'KMH876',
   *         itemName: 'Red T-Shirt',
   *         threadId: '0daf0015-fc29-4727-9140-8d5313a1902c',
   *     },
   *     {
   *         sessionId: 1,
   *         clientId: '7a43138f-c87b-29c0-872d-65b00ed0e392',
   *         testCells: {
   *             testName: 'cellName',
   *         },
   *     },
   * );
   */
  trackProductInsightsAgentViews(parameters, userParameters, networkParameters = {}) {
    // Ensure parameters are provided (required)
    if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
      return new Error('parameters are required of type object');
    }

    const {
      // accept snake_case aliases alongside camelCase
      questions,
      view_timespans,
      viewTimespans = view_timespans,
      item_id,
      itemId = item_id,
      item_name,
      itemName = item_name,
      variation_id,
      variationId = variation_id,
      features,
      feature_variants,
      featureVariants = feature_variants,
      thread_id,
      threadId = thread_id,
      analytics_tags,
      analyticsTags = analytics_tags,
      section,
    } = parameters;

    if (!questions || !Array.isArray(questions)) {
      return new Error('A parameters object with a "questions" property of type array is required.');
    }

    if (!viewTimespans || !Array.isArray(viewTimespans)) {
      return new Error('A parameters object with a "viewTimespans" property of type array is required.');
    }

    const bodyParams = {
      item_id: itemId,
      item_name: itemName,
      variation_id: variationId,
      features,
      feature_variants: featureVariants,
      analytics_tags: analyticsTags,
      thread_id: threadId,
      questions: questions.map((question) => helpers.toSnakeCaseKeys(question, false)),
      view_timespans: viewTimespans,
    };

    // query params that are not assigned in the applyParams()
    const queryParams = {
      section,
    };

    const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/product_insights_agent_views?`;
    const requestUrl = `${requestPath}${applyParamsAsString(queryParams, userParameters, this.options)}`;
    const requestMethod = 'POST';
    // POST events must include common parameters (key, i, s, c, ui, _dt, origin_referrer, canonical_url, document_referrer) both in body and query string
    const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

    send.call(
      this,
      requestUrl,
      userParameters,
      networkParameters,
      requestMethod,
      requestBody,
    );

    return true;
  }

  /**
   * Subscribe to success or error messages emitted by tracking requests
   *
   * @function on
   * @param {string} messageType - Type of message to listen for ('success' or 'error')
   * @param {function} callback - Callback to be invoked when message received
   * @returns {(true|Error)}
   * @description
   * If an error event is emitted and does not have at least one listener registered for the
   * 'error' event, the error is thrown, a stack trace is printed, and the Node.js process
   * exits - it is best practice to always bind a `.on('error')` handler
   * @see https://nodejs.org/api/events.html#events_error_events
   * @example
   * constructorio.tracker.on('error', (data) => {
   *     // Handle tracking error
   * });
   */
  on(messageType, callback) {
    if (messageType !== 'success' && messageType !== 'error') {
      return new Error('messageType must be a string of value "success" or "error"');
    }

    if (!callback || typeof callback !== 'function') {
      return new Error('callback is required and must be a function');
    }

    this.eventemitter.on(messageType, callback);

    return true;
  }
}

module.exports = Tracker;
