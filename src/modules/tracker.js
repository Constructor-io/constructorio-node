/* eslint-disable camelcase, no-underscore-dangle, no-unneeded-ternary, brace-style */
const qs = require('qs');
const { AbortController } = require('node-abort-controller');
const EventEmitter = require('events');
const helpers = require('../utils/helpers');

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

  aggregateParams._dt = Date.now();
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
        response.json().then((json) => {
          instance.eventemitter.emit('error', {
            url,
            method,
            message: json && json.message,
          });
        }).catch((error) => {
          instance.eventemitter.emit('error', {
            url,
            method,
            message: error.type,
          });
        });
      }
    }).catch((error) => {
      instance.eventemitter.emit('error', {
        url,
        method,
        message: error.toString(),
      });
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
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
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
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
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
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
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
   * @param {string} term - Term of selected autocomplete item
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.originalQuery - The current autocomplete search query
   * @param {string} parameters.section - Section the selected item resides within
   * @param {string} [parameters.tr] - Trigger used to select the item (click, etc.)
   * @param {string} [parameters.groupId] - Group identifier of selected item
   * @param {string} [parameters.displayName] - Display name of group of selected item
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User selected (clicked, or navigated to via keyboard) a result that appeared within autocomplete
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
        const url = `${this.options.serviceUrl}/autocomplete/${helpers.encodeURIComponentRFC3986(helpers.trimNonBreakingSpaces(term))}/select?`;
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
   * @param {string} [parameters.groupId] - Group identifier of selected item
   * @param {string} [parameters.displayName] - Display name of group of selected item
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
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
        const url = `${this.options.serviceUrl}/autocomplete/${helpers.encodeURIComponentRFC3986(helpers.trimNonBreakingSpaces(term))}/search?`;
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
   * @param {number} parameters.numResults - Total number of results
   * @param {string[]} parameters.itemIds - List of product item unique identifiers in search results listing
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User loaded a search product listing page
   * @example
   * constructorio.tracker.trackSearchResultsLoaded(
   *     'T-Shirt',
   *     {
   *         numResults: 167,
   *         itemIds: ['KMH876', 'KMH140', 'KMH437'],
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
        const url = `${this.options.serviceUrl}/behavior?`;
        const queryParams = { action: 'search-results', term };
        const {
          num_results,
          numResults = num_results,
          customer_ids,
          customerIds = customer_ids,
          item_ids,
          itemIds = item_ids,
        } = parameters;
        let customerIDs;

        if (!helpers.isNil(numResults)) {
          queryParams.num_results = numResults;
        }

        // Ensure support for both item_ids and customer_ids as parameters
        if (itemIds && Array.isArray(itemIds)) {
          customerIDs = itemIds;
        } else if (customerIds && Array.isArray(customerIds)) {
          customerIDs = customerIds;
        }

        if (customerIDs && Array.isArray(customerIDs) && customerIDs.length) {
          queryParams.customer_ids = customerIDs.slice(0, 100).join(',');
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
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
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
        const url = `${this.options.serviceUrl}/autocomplete/${helpers.encodeURIComponentRFC3986(helpers.trimNonBreakingSpaces(term))}/click_through?`;
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
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User performed an action indicating interest in an item (add to cart, add to wishlist, etc.)
   * @see https://docs.constructor.io/rest_api/behavioral_logging/conversions
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
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
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
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User clicked a result that appeared within a search product listing page
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
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
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
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
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
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
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
   * @param {object} [userParameters] - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {string} userParameters.clientId - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {(true|Error)}
   * @description User clicked a result that appeared within a browse product listing page
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
      } = parameters;

      bodyParams.section = section || 'Products';
      bodyParams.item_id = itemId;

      if (itemName) {
        bodyParams.item_name = itemName;
      }

      if (variationId) {
        bodyParams.variation_id = variationId;
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
