/* eslint-disable camelcase, no-underscore-dangle, no-unneeded-ternary, brace-style */
const qs = require('qs');
const nodeFetch = require('node-fetch').default;
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
  } = userParameters;
  let aggregateParams = Object.assign(parameters);

  // Validate session ID is provided
  if (!sessionId || typeof sessionId !== 'number') {
    throw new Error('sessionId is a required user parameter of type number');
  }

  // Validate client ID is provided
  if (!clientId || typeof clientId !== 'string') {
    throw new Error('clentId is a required user parameter of type string');
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
    aggregateParams.ui = userId;
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
function send(url, userParameters, method = 'GET', body) {
  let request;
  const fetch = (this.options && this.options.fetch) || nodeFetch;
  const headers = {};

  // Append security token as 'x-cnstrc-token' if available
  if (this.options.securityToken && typeof this.options.securityToken === 'string') {
    headers['x-cnstrc-token'] = this.options.securityToken;
  }

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

  if (method === 'GET') {
    request = fetch(url, { headers });
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
   * @param {number} userParameters.clientId - Client ID, utilized to personalize results
   * @param {object} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @returns {(true|Error)}
   */
  trackSessionStart(userParameters) {
    const url = `${this.options.serviceUrl}/behavior?`;
    const queryParams = { action: 'session_start' };
    const requestUrl = `${url}${applyParamsAsString(queryParams, userParameters, this.options)}`;

    send.call(
      this,
      requestUrl,
      userParameters,
    );

    return true;
  }

  /**
   * Send input focus event to API
   *
   * @function trackInputFocus
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {number} userParameters.clientId - Client ID, utilized to personalize results
   * @param {object} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @returns {(true|Error)}
   * @description User focused on search input element
   */
  trackInputFocus(userParameters) {
    const url = `${this.options.serviceUrl}/behavior?`;
    const queryParams = { action: 'focus' };
    const requestUrl = `${url}${applyParamsAsString(queryParams, userParameters, this.options)}`;

    send.call(
      this,
      requestUrl,
      userParameters,
    );

    return true;
  }

  /**
   * Send autocomplete select event to API
   *
   * @function trackAutocompleteSelect
   * @param {string} term - Term of selected autocomplete item
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.original_query - The current autocomplete search query
   * @param {string} parameters.result_id - Customer id of the selected autocomplete item
   * @param {string} parameters.section - Section the selected item resides within
   * @param {string} [parameters.tr] - Trigger used to select the item (click, etc.)
   * @param {string} [parameters.group_id] - Group identifier of selected item
   * @param {string} [parameters.display_name] - Display name of group of selected item
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {number} userParameters.clientId - Client ID, utilized to personalize results
   * @param {object} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @returns {(true|Error)}
   * @description User selected (clicked, or navigated to via keyboard) a result that appeared within autocomplete
   */
  trackAutocompleteSelect(term, parameters, userParameters) {
    // Ensure term is provided (required)
    if (term && typeof term === 'string') {
      // Ensure parameters are provided (required)
      if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
        const url = `${this.options.serviceUrl}/autocomplete/${helpers.ourEncodeURIComponent(term)}/select?`;
        const queryParams = {};
        const {
          original_query,
          result_id,
          section,
          original_section,
          tr,
          group_id,
          display_name,
        } = parameters;

        if (original_query) {
          queryParams.original_query = original_query;
        }

        if (tr) {
          queryParams.tr = tr;
        }

        if (original_section || section) {
          queryParams.section = original_section || section;
        }

        if (group_id) {
          queryParams.group = {
            group_id,
            display_name,
          };
        }

        if (result_id) {
          queryParams.result_id = result_id;
        }

        const requestUrl = `${url}${applyParamsAsString(queryParams, userParameters, this.options)}`;

        send.call(
          this,
          requestUrl,
          userParameters,
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
   * @param {string} parameters.original_query - The current autocomplete search query
   * @param {string} [parameters.group_id] - Group identifier of selected item
   * @param {string} [parameters.display_name] - Display name of group of selected item
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {number} userParameters.clientId - Client ID, utilized to personalize results
   * @param {object} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @returns {(true|Error)}
   * @description User submitted a search (pressing enter within input element, or clicking submit element)
   */
  trackSearchSubmit(term, parameters, userParameters) {
    // Ensure term is provided (required)
    if (term && typeof term === 'string') {
      // Ensure parameters are provided (required)
      if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
        const url = `${this.options.serviceUrl}/autocomplete/${helpers.ourEncodeURIComponent(term)}/search?`;
        const queryParams = {};
        const { original_query, group_id, display_name } = parameters;

        if (original_query) {
          queryParams.original_query = original_query;
        }

        if (group_id) {
          queryParams.group = {
            group_id,
            display_name,
          };
        }

        const requestUrl = `${url}${applyParamsAsString(queryParams, userParameters, this.options)}`;

        send.call(
          this,
          requestUrl,
          userParameters,
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
   * @param {number} parameters.num_results - Number of search results in total
   * @param {array} [parameters.customer_ids] - List of customer item id's returned from search
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {number} userParameters.clientId - Client ID, utilized to personalize results
   * @param {object} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @returns {(true|Error)}
   * @description User loaded a search product listing page
   */
  trackSearchResultsLoaded(term, parameters, userParameters) {
    // Ensure term is provided (required)
    if (term && typeof term === 'string') {
      // Ensure parameters are provided (required)
      if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
        const url = `${this.options.serviceUrl}/behavior?`;
        const queryParams = { action: 'search-results', term };
        const { num_results, customer_ids } = parameters;

        if (!helpers.isNil(num_results)) {
          queryParams.num_results = num_results;
        }

        if (customer_ids && Array.isArray(customer_ids)) {
          queryParams.customer_ids = customer_ids.join(',');
        }

        const requestUrl = `${url}${applyParamsAsString(queryParams, userParameters, this.options)}`;

        send.call(
          this,
          requestUrl,
          userParameters,
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
   * @param {string} parameters.name - Identifier
   * @param {string} parameters.customer_id - Customer id
   * @param {string} [parameters.result_id] - Result id
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {number} userParameters.clientId - Client ID, utilized to personalize results
   * @param {object} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @returns {(true|Error)}
   * @description User clicked a result that appeared within a search product listing page
   */
  trackSearchResultClick(term, parameters, userParameters) {
    // Ensure term is provided (required)
    if (term && typeof term === 'string') {
      // Ensure parameters are provided (required)
      if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
        const url = `${this.options.serviceUrl}/autocomplete/${helpers.ourEncodeURIComponent(term)}/click_through?`;
        const queryParams = {};
        const { name, customer_id, variation_id, result_id } = parameters;

        if (name) {
          queryParams.name = name;
        }

        if (customer_id) {
          queryParams.customer_id = customer_id;
        }

        if (variation_id) {
          queryParams.variation_id = variation_id;
        }

        if (result_id) {
          queryParams.result_id = result_id;
        }

        const requestUrl = `${url}${applyParamsAsString(queryParams, userParameters, this.options)}`;

        send.call(
          this,
          requestUrl,
          userParameters,
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
   * @param {string} term - Search results query term
   * @param {object} parameters - Additional parameters to be sent with request
   * @param {string} parameters.customer_id - Customer id
   * @param {string} parameters.revenue - Revenue
   * @param {string} [parameters.item_name] - Identifier
   * @param {string} [parameters.variation_id] - Variation id
   * @param {string} [parameters.type='add_to_cart'] - Conversion type
   * @param {boolean} [parameters.is_custom_type] - Specify if type is custom conversion type
   * @param {string} [parameters.display_name] - Display name for the custom conversion type
   * @param {string} [parameters.result_id] - Result id
   * @param {string} [parameters.section] - Autocomplete section
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {number} userParameters.clientId - Client ID, utilized to personalize results
   * @param {object} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @returns {(true|Error)}
   * @description User performed an action indicating interest in an item (add to cart, add to wishlist, etc.)
   */
  trackConversion(term, parameters, userParameters) {
    // Ensure parameters are provided (required)
    if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
      const searchTerm = helpers.ourEncodeURIComponent(term) || 'TERM_UNKNOWN';
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/conversion?`;
      const queryParams = {};
      const bodyParams = {};
      const {
        name,
        item_name,
        item_id,
        customer_id,
        variation_id,
        revenue,
        section = 'Products',
        display_name,
        type,
        is_custom_type,
      } = parameters;

      // Only take one of item_id or customer_id
      if (item_id) {
        bodyParams.item_id = item_id;
      } else if (customer_id) {
        bodyParams.item_id = customer_id;
      }

      if (item_name) {
        bodyParams.item_name = item_name;
      } else if (name) {
        bodyParams.item_name = name;
      }

      if (variation_id) {
        bodyParams.variation_id = variation_id;
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

      if (is_custom_type) {
        bodyParams.is_custom_type = is_custom_type;
      }

      if (display_name) {
        bodyParams.display_name = display_name;
      }

      const requestUrl = `${requestPath}${applyParamsAsString(queryParams, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
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
   * @param {array} parameters.items - List of objects of customer items returned from browse
   * @param {number} parameters.revenue - Revenue
   * @param {string} [parameters.order_id] - Customer unique order identifier
   * @param {string} [parameters.section] - Autocomplete section
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {number} userParameters.clientId - Client ID, utilized to personalize results
   * @param {object} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @returns {(true|Error)}
   * @description User completed an order (usually fired on order confirmation page)
   */
  trackPurchase(parameters, userParameters) {
    // Ensure parameters are provided (required)
    if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/purchase?`;
      const queryParams = {};
      const bodyParams = {};
      const { items, revenue, order_id, section } = parameters;

      if (order_id) {
        bodyParams.order_id = order_id;
      }

      if (items && Array.isArray(items)) {
        bodyParams.items = items;
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
   * @param {number} [parameters.result_count] - Number of results displayed
   * @param {number} [parameters.result_page] - Page number of results
   * @param {string} [parameters.result_id] - Result identifier
   * @param {string} [parameters.section="Products"] - Results section
   * @param {string} parameters.url - Current page URL
   * @param {string} parameters.pod_id - Pod identifier
   * @param {number} parameters.num_results_viewed - Number of results viewed
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {number} userParameters.clientId - Client ID, utilized to personalize results
   * @param {object} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @returns {(true|Error)}
   * @description User clicked a result that appeared within a search product listing page
   */
  trackRecommendationView(parameters, userParameters) {
    // Ensure parameters are provided (required)
    if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/recommendation_result_view?`;
      const bodyParams = {};
      const {
        result_count,
        result_page,
        result_id,
        section,
        url,
        pod_id,
        num_results_viewed,
      } = parameters;

      if (!helpers.isNil(result_count)) {
        bodyParams.result_count = result_count;
      }

      if (!helpers.isNil(result_page)) {
        bodyParams.result_page = result_page;
      }

      if (result_id) {
        bodyParams.result_id = result_id;
      }

      if (section) {
        bodyParams.section = section;
      } else {
        bodyParams.section = 'Products';
      }

      if (url) {
        bodyParams.url = url;
      }

      if (pod_id) {
        bodyParams.pod_id = pod_id;
      }

      if (!helpers.isNil(num_results_viewed)) {
        bodyParams.num_results_viewed = num_results_viewed;
      }

      const requestUrl = `${requestPath}${applyParamsAsString({}, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
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
   * @param {string} [parameters.variation_id] - Variation identifier
   * @param {string} [parameters.section="Products"] - Results section
   * @param {string} [parameters.result_id] - Result identifier
   * @param {number} [parameters.result_count] - Number of results displayed
   * @param {number} [parameters.result_page] - Page number of results
   * @param {number} [parameters.result_position_on_page] - Position of result on page
   * @param {number} [parameters.num_results_per_page] - Number of results on page
   * @param {string} parameters.pod_id - Pod identifier
   * @param {string} parameters.strategy_id - Strategy identifier
   * @param {string} parameters.item_id - Identifier of clicked item
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {number} userParameters.clientId - Client ID, utilized to personalize results
   * @param {object} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @returns {(true|Error)}
   * @description User clicked an item that appeared within a list of recommended results
   */
  trackRecommendationClick(parameters, userParameters) {
    // Ensure parameters are provided (required)
    if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/recommendation_result_click?`;
      const bodyParams = {};
      const {
        variation_id,
        section,
        result_id,
        result_count,
        result_page,
        result_position_on_page,
        num_results_per_page,
        pod_id,
        strategy_id,
        item_id,
      } = parameters;

      if (variation_id) {
        bodyParams.variation_id = variation_id;
      }

      if (section) {
        bodyParams.section = section;
      } else {
        bodyParams.section = 'Products';
      }

      if (result_id) {
        bodyParams.result_id = result_id;
      }

      if (!helpers.isNil(result_count)) {
        bodyParams.result_count = result_count;
      }

      if (!helpers.isNil(result_page)) {
        bodyParams.result_page = result_page;
      }

      if (!helpers.isNil(result_position_on_page)) {
        bodyParams.result_position_on_page = result_position_on_page;
      }

      if (!helpers.isNil(num_results_per_page)) {
        bodyParams.num_results_per_page = num_results_per_page;
      }

      if (pod_id) {
        bodyParams.pod_id = pod_id;
      }

      if (strategy_id) {
        bodyParams.strategy_id = strategy_id;
      }

      if (item_id) {
        bodyParams.item_id = item_id;
      }

      const requestUrl = `${requestPath}${applyParamsAsString({}, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
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
   * @param {string} [parameters.section="Products"] - Results section
   * @param {number} [parameters.result_count] - Number of results displayed
   * @param {number} [parameters.result_page] - Page number of results
   * @param {string} [parameters.result_id] - Result identifier
   * @param {string} [parameters.selected_filters] -  Selected filters
   * @param {string} [parameters.sort_order] - Sort order ('ascending' or 'descending')
   * @param {string} [parameters.sort_by] - Sorting method
   * @param {array} [parameters.items] - List of objects of customer items returned from browse
   * @param {string} parameters.url - Current page URL
   * @param {string} parameters.filter_name - Filter name
   * @param {string} parameters.filter_value - Filter value
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {number} userParameters.clientId - Client ID, utilized to personalize results
   * @param {object} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @returns {(true|Error)}
   * @description User loaded a browse product listing page
   */
  trackBrowseResultsLoaded(parameters, userParameters) {
    // Ensure parameters are provided (required)
    if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/browse_result_load?`;
      const bodyParams = {};
      const {
        section,
        result_count,
        result_page,
        result_id,
        selected_filters,
        url,
        sort_order,
        sort_by,
        filter_name,
        filter_value,
        items,
      } = parameters;

      if (section) {
        bodyParams.section = section;
      } else {
        bodyParams.section = 'Products';
      }

      if (!helpers.isNil(result_count)) {
        bodyParams.result_count = result_count;
      }

      if (!helpers.isNil(result_page)) {
        bodyParams.result_page = result_page;
      }

      if (result_id) {
        bodyParams.result_id = result_id;
      }

      if (selected_filters) {
        bodyParams.selected_filters = selected_filters;
      }

      if (url) {
        bodyParams.url = url;
      }

      if (sort_order) {
        bodyParams.sort_order = sort_order;
      }

      if (sort_by) {
        bodyParams.sort_by = sort_by;
      }

      if (filter_name) {
        bodyParams.filter_name = filter_name;
      }

      if (filter_value) {
        bodyParams.filter_value = filter_value;
      }

      if (items && Array.isArray(items)) {
        bodyParams.items = items;
      }

      const requestUrl = `${requestPath}${applyParamsAsString({}, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
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
   * @param {string} [parameters.section="Products"] - Results section
   * @param {string} [parameters.variation_id] - Variation ID of clicked item
   * @param {string} [parameters.result_id] - Result identifier
   * @param {number} [parameters.result_count] - Number of results displayed
   * @param {number} [parameters.result_page] - Page number of results
   * @param {number} [parameters.result_position_on_page] - Position of clicked item
   * @param {number} [parameters.num_results_per_page] - Number of results shown
   * @param {string} [parameters.selected_filters] -  Selected filters
   * @param {string} parameters.filter_name - Filter name
   * @param {string} parameters.filter_value - Filter value
   * @param {string} parameters.item_id - ID of clicked item
   * @param {object} userParameters - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {number} userParameters.clientId - Client ID, utilized to personalize results
   * @param {object} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @returns {(true|Error)}
   * @description User clicked a result that appeared within a browse product listing page
   */
  trackBrowseResultClick(parameters, userParameters) {
    // Ensure parameters are provided (required)
    if (parameters && typeof parameters === 'object' && !Array.isArray(parameters)) {
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/browse_result_click?`;
      const bodyParams = {};
      const {
        section,
        variation_id,
        result_id,
        result_count,
        result_page,
        result_position_on_page,
        num_results_per_page,
        selected_filters,
        filter_name,
        filter_value,
        item_id,
      } = parameters;

      if (section) {
        bodyParams.section = section;
      } else {
        bodyParams.section = 'Products';
      }

      if (variation_id) {
        bodyParams.variation_id = variation_id;
      }

      if (result_id) {
        bodyParams.result_id = result_id;
      }

      if (!helpers.isNil(result_count)) {
        bodyParams.result_count = result_count;
      }

      if (!helpers.isNil(result_page)) {
        bodyParams.result_page = result_page;
      }

      if (!helpers.isNil(result_position_on_page)) {
        bodyParams.result_position_on_page = result_position_on_page;
      }

      if (!helpers.isNil(num_results_per_page)) {
        bodyParams.num_results_per_page = num_results_per_page;
      }

      if (selected_filters) {
        bodyParams.selected_filters = selected_filters;
      }

      if (filter_name) {
        bodyParams.filter_name = filter_name;
      }

      if (filter_value) {
        bodyParams.filter_value = filter_value;
      }

      if (item_id) {
        bodyParams.item_id = item_id;
      }

      const requestUrl = `${requestPath}${applyParamsAsString({}, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
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
   * @param {string} parameters.item_id - ID of clicked item
   * @param {string} [parameters.item_name] - Name of clicked item
   * @param {string} [parameters.variation_id] - Variation ID of clicked item
   * @param {string} [parameters.section="Products"] - Results section
   * @param {object} [userParameters] - Parameters relevant to the user request
   * @param {number} userParameters.sessionId - Session ID, utilized to personalize results
   * @param {number} userParameters.clientId - Client ID, utilized to personalize results
   * @param {object} userParameters.userId - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.referer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Client user IP
   * @param {string} [userParameters.userAgent] - Client user agent
   * @param {string} [userParameters.acceptLanguage] - Client accept language
   * @returns {(true|Error)}
   * @description User clicked a result that appeared within a browse product listing page
   */
  trackGenericResultClick(parameters, userParameters) {
    // Ensure required parameters are provided
    if (typeof parameters === 'object' && parameters && parameters.item_id) {
      const requestPath = `${this.options.serviceUrl}/v2/behavioral_action/result_click?`;
      const bodyParams = {};
      const {
        item_id,
        item_name,
        variation_id,
        section,
      } = parameters;

      bodyParams.section = section || 'Products';
      bodyParams.item_id = item_id;

      if (item_name) {
        bodyParams.item_name = item_name;
      }

      if (variation_id) {
        bodyParams.variation_id = variation_id;
      }

      const requestUrl = `${requestPath}${applyParamsAsString({}, userParameters, this.options)}`;
      const requestMethod = 'POST';
      const requestBody = applyParams(bodyParams, userParameters, { ...this.options, requestMethod });

      send.call(
        this,
        requestUrl,
        userParameters,
        requestMethod,
        requestBody,
      );

      return true;
    }

    return new Error('A parameters object with an "item_id" property is required.');
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
