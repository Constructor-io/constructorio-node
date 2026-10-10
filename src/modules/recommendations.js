/* eslint-disable object-curly-newline, no-param-reassign, max-len */
const qs = require('qs');
const { AbortController } = require('node-abort-controller');
const helpers = require('../utils/helpers');

// Parameters that a page request accepts per pod in `podOverrides`
const PAGE_OVERRIDABLE_PARAMETERS = [
  'numResults',
  'filters',
  'filterMatchTypes',
  'preFilterExpression',
  'fmtOptions',
  'hiddenFields',
  'variationsMap',
];

// Create base query parameters shared by pod and page requests
function createBaseQueryParams(userParameters, options) {
  const {
    apiKey,
    version,
  } = options;
  const {
    sessionId,
    clientId,
    userId,
    segments,
    originReferrer,
  } = userParameters;
  const queryParams = { c: version };

  queryParams.key = apiKey;
  queryParams.i = clientId;
  queryParams.s = sessionId;

  // Pull user segments from options
  if (segments && segments.length) {
    queryParams.us = segments;
  }

  // Pull user id from options and ensure string
  if (userId) {
    queryParams.ui = String(userId);
  }

  // Pull origin referrer from userParameters
  if (originReferrer && typeof originReferrer === 'string') {
    queryParams.origin_referrer = originReferrer;
  }

  return queryParams;
}

// Create request headers shared by pod and page requests
function createRequestHeaders(userParameters, networkParameters, options) {
  const headers = {};

  Object.assign(headers, helpers.combineCustomHeaders(options, networkParameters));

  // Append security token as 'x-cnstrc-token' if available
  if (options.securityToken && typeof options.securityToken === 'string') {
    headers['x-cnstrc-token'] = options.securityToken;
  }

  // Append user IP as 'X-Forwarded-For' if available
  if (userParameters.userIp && typeof userParameters.userIp === 'string') {
    headers['X-Forwarded-For'] = userParameters.userIp;
  }

  // Append user agent as 'User-Agent' if available
  if (userParameters.userAgent && typeof userParameters.userAgent === 'string') {
    headers['User-Agent'] = userParameters.userAgent;
  }

  return headers;
}

// Create URL from supplied parameters
function createRecommendationsUrl(podId, parameters, userParameters, options) {
  const { serviceUrl } = options;

  // Validate pod identifier is provided
  if (!podId || typeof podId !== 'string') {
    throw new Error('podId is a required parameter of type string');
  }

  let queryParams = createBaseQueryParams(userParameters, options);

  if (parameters) {
    const {
      numResults,
      itemIds,
      variationId,
      section,
      term,
      filters,
      variationsMap,
      hiddenFields,
      preFilterExpression,
    } = parameters;

    // Pull num results number from parameters
    if (!helpers.isNil(numResults)) {
      queryParams.num_results = numResults;
    }

    // Pull item ids from parameters
    if (itemIds) {
      queryParams.item_id = itemIds;
    }

    if (variationId) {
      if (!itemIds) {
        throw new Error('itemIds is a required parameter for variationId');
      }

      if (Array.isArray(itemIds) && !itemIds.length) {
        throw new Error('At least one itemId is a required parameter for variationId');
      }

      queryParams.variation_id = variationId;
    }

    // Pull section from parameters
    if (section) {
      queryParams.section = section;
    }

    // Pull term from parameters
    if (term) {
      queryParams.term = term;
    }

    // Pull filters from parameters
    if (filters) {
      queryParams.filters = filters;
    }

    // Pull hidden fields from parameters
    if (hiddenFields) {
      if (queryParams.fmt_options) {
        queryParams.fmt_options.hidden_fields = hiddenFields;
      } else {
        queryParams.fmt_options = { hidden_fields: hiddenFields };
      }
    }

    // Pull variations map from parameters
    if (variationsMap) {
      queryParams.variations_map = JSON.stringify(variationsMap);
    }

    // Pull pre_filter_expression from parameters
    if (preFilterExpression) {
      queryParams.pre_filter_expression = JSON.stringify(preFilterExpression);
    }
  }

  // eslint-disable-next-line no-underscore-dangle
  queryParams._dt = Date.now();
  queryParams = helpers.cleanParams(queryParams);

  const queryString = qs.stringify(queryParams, { indices: false });

  return `${serviceUrl}/recommendations/v1/pods/${helpers.encodeURIComponentRFC3986(helpers.normalizeSpaces(podId).trim())}?${queryString}`;
}

// Map parameters that can be set per pod on a page request to their query parameter form
// - uses the same wire format as `createRecommendationsUrl`
function createPageOverridableParams(parameters) {
  const {
    numResults,
    filters,
    filterMatchTypes,
    preFilterExpression,
    fmtOptions,
    hiddenFields,
    variationsMap,
  } = parameters;
  const params = {};

  if (!helpers.isNil(numResults)) {
    params.num_results = numResults;
  }

  if (filters) {
    params.filters = filters;
  }

  if (filterMatchTypes) {
    params.filter_match_types = filterMatchTypes;
  }

  if (fmtOptions) {
    params.fmt_options = { ...fmtOptions };
  }

  if (hiddenFields) {
    params.fmt_options = { ...params.fmt_options, hidden_fields: hiddenFields };
  }

  if (variationsMap) {
    params.variations_map = JSON.stringify(variationsMap);
  }

  if (preFilterExpression) {
    params.pre_filter_expression = JSON.stringify(preFilterExpression);
  }

  return params;
}

// Create page URL from supplied parameters
function createRecommendationPageUrl(pageId, parameters, userParameters, options) {
  const { serviceUrl } = options;

  // Validate page identifier is provided
  if (!pageId || typeof pageId !== 'string') {
    throw new Error('pageId is a required parameter of type string');
  }

  let queryParams = createBaseQueryParams(userParameters, options);
  const { itemIds, variationId, section, term, podOverrides } = parameters;

  // Pull item ids from parameters
  if (itemIds) {
    queryParams.item_id = itemIds;
  }

  if (variationId) {
    if (!itemIds) {
      throw new Error('itemIds is a required parameter for variationId');
    }

    if (Array.isArray(itemIds) && !itemIds.length) {
      throw new Error('At least one itemId is a required parameter for variationId');
    }

    queryParams.variation_id = variationId;
  }

  // Pull section from parameters
  if (section) {
    queryParams.section = section;
  }

  // Pull term from parameters
  if (term) {
    queryParams.term = term;
  }

  queryParams = { ...queryParams, ...createPageOverridableParams(parameters) };

  // Pull per-pod overrides from parameters
  if (podOverrides) {
    if (typeof podOverrides !== 'object' || Array.isArray(podOverrides)) {
      throw new Error('podOverrides must be an object keyed by pod id');
    }

    const podOverrideParams = {};

    Object.keys(podOverrides).forEach((podId) => {
      const override = podOverrides[podId] || {};
      const unsupported = Object.keys(override).filter((name) => !PAGE_OVERRIDABLE_PARAMETERS.includes(name));

      if (unsupported.length) {
        throw new Error(`podOverrides.${podId} contains parameters that cannot be overridden per pod: ${unsupported.join(', ')}. Supported: ${PAGE_OVERRIDABLE_PARAMETERS.join(', ')}`);
      }

      podOverrideParams[podId] = createPageOverridableParams(override);
    });

    queryParams.pod_overrides = podOverrideParams;
  }

  // eslint-disable-next-line no-underscore-dangle
  queryParams._dt = Date.now();
  queryParams = helpers.cleanParams(queryParams);

  const queryString = qs.stringify(queryParams, { indices: false });

  return `${serviceUrl}/recommendations/v1/pages/${helpers.encodeURIComponentRFC3986(helpers.normalizeSpaces(pageId).trim())}?${queryString}`;
}

/**
 * Interface to recommendations related API calls
 *
 * @module recommendations
 * @inner
 * @returns {object}
 */
class Recommendations {
  constructor(options) {
    this.options = options || {};
  }

  /**
   * Get recommendations for supplied pod identifier
   *
   * @function getRecommendations
   * @param {string} podId - Pod identifier
   * @param {object} [parameters] - Additional parameters to refine results
   * @param {string|array} [parameters.itemIds] - Item ID(s) to retrieve recommendations for (strategy specific). Required for variationId
   * @param {string} [parameters.variationId] - Variation ID to retrieve recommendations for (strategy specific)
   * @param {number} [parameters.numResults] - The number of results to return
   * @param {string} [parameters.section] - The section to return results from
   * @param {string} [parameters.term] - The term to use to refine results (strategy specific)
   * @param {object} [parameters.filters] - Key / value mapping of filters used to refine results
   * @param {object} [parameters.variationsMap] - The variations map object to aggregate variations. Please refer to https://docs.constructor.com/reference/shared-variations-mapping for details
   * @param {object} [parameters.preFilterExpression] - Faceting expression to scope search results. Please refer to https://docs.constructor.com/reference/configuration-collections
   * @param {string[]} [parameters.hiddenFields] - Hidden metadata fields to return
   * @param {object} [userParameters] - Parameters relevant to the user request
   * @param {number} [userParameters.sessionId] - Session ID, utilized to personalize results
   * @param {string} [userParameters.clientId] - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Origin user IP, from client
   * @param {string} [userParameters.userAgent] - Origin user agent, from client
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.com/reference/recommendations-recommendation-results
   * @example
   * constructorio.recommendations.getRecommendations('t-shirt-best-sellers', {
   *     numResults: 5,
   *     filters: {
   *         size: 'medium'
   *     },
   * });
   */
  getRecommendations(podId, parameters = {}, userParameters = {}, networkParameters = {}) {
    let requestUrl;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;

    parameters = parameters || {};

    try {
      requestUrl = createRecommendationsUrl(podId, parameters, userParameters, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    const headers = createRequestHeaders(userParameters, networkParameters, this.options);

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    const promise = fetch(requestUrl, { headers, signal }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => {
      // Recommendations results
      if (json.response && json.response.results) {
        if (json.result_id) {
          json.response.results.forEach((result) => {
            // eslint-disable-next-line no-param-reassign
            result.result_id = json.result_id;
          });
        }

        return json;
      }

      // Redirect rules
      if (json.response && json.response.redirect) {
        return json;
      }

      throw new Error('getRecommendations response data is malformed');
    });

    promise.requestUrl = requestUrl;

    return promise;
  }

  /**
   * Get recommendations for every pod configured on a page
   *
   * @function getRecommendationPage
   * @description Each pod's `result_id` is appended to that pod's results. The top-level `result_id`
   * identifies the page request; send each pod's own `result_id` with that pod's tracking events.
   * @param {string} pageId - Page identifier
   * @param {object} [parameters] - Additional parameters to refine results, applied to every pod
   * @param {string|array} [parameters.itemIds] - Item ID(s) to retrieve recommendations for (strategy specific). Required for variationId
   * @param {string} [parameters.variationId] - Variation ID to retrieve recommendations for (strategy specific)
   * @param {number} [parameters.numResults] - The number of results to return per pod
   * @param {string} [parameters.section] - The section to return results from
   * @param {string} [parameters.term] - The term to use to refine results (strategy specific)
   * @param {object} [parameters.filters] - Key / value mapping of filters used to refine results
   * @param {object} [parameters.filterMatchTypes] - Whether results must match `all`, `any` or `none` of each filter's values
   * @param {object} [parameters.variationsMap] - The variations map object to aggregate variations. Please refer to https://docs.constructor.com/reference/shared-variations-mapping for details
   * @param {object} [parameters.preFilterExpression] - Faceting expression to scope search results. Please refer to https://docs.constructor.com/reference/configuration-collections
   * @param {object} [parameters.fmtOptions] - An object containing options to format different aspects of the response
   * @param {string[]} [parameters.hiddenFields] - Hidden metadata fields to return
   * @param {object} [parameters.podOverrides] - Per-pod values keyed by pod id. Each value may contain `numResults`, `filters`, `filterMatchTypes`, `preFilterExpression`, `fmtOptions`, `hiddenFields` and `variationsMap`, and replaces (does not merge with) the page-wide value for that pod. `hiddenFields` is sent inside `fmt_options`, so an override with either `fmtOptions` or `hiddenFields` replaces all page-wide `fmtOptions` and `hiddenFields` for that pod
   * @param {object} [userParameters] - Parameters relevant to the user request
   * @param {number} [userParameters.sessionId] - Session ID, utilized to personalize results
   * @param {string} [userParameters.clientId] - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string[]} [userParameters.segments] - User segments
   * @param {string} [userParameters.originReferrer] - Client page URL (including path)
   * @param {string} [userParameters.userIp] - Origin user IP, from client
   * @param {string} [userParameters.userAgent] - Origin user agent, from client
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.com/reference/v1-recommendations-get-page-results
   * @example
   * constructorio.recommendations.getRecommendationPage('pdp_b2c', {
   *     itemIds: 'product-123',
   *     numResults: 10,
   *     podOverrides: {
   *         complete_the_look: { numResults: 8, filters: { category: 'Apparel' } },
   *     },
   * });
   */
  getRecommendationPage(pageId, parameters = {}, userParameters = {}, networkParameters = {}) {
    let requestUrl;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;

    parameters = parameters || {};
    userParameters = userParameters || {};

    try {
      requestUrl = createRecommendationPageUrl(pageId, parameters, userParameters, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    const headers = createRequestHeaders(userParameters, networkParameters, this.options);

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    const promise = fetch(requestUrl, { headers, signal }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => {
      if (json.response && Array.isArray(json.response.pods)) {
        json.response.pods.forEach((pod) => {
          // Append the pod's own `result_id` (not the page's) to each of its results
          if (pod && pod.result_id && pod.response && Array.isArray(pod.response.results)) {
            pod.response.results.forEach((result) => {
              result.result_id = pod.result_id;
            });
          }
        });

        return json;
      }

      throw new Error('getRecommendationPage response data is malformed');
    });

    promise.requestUrl = requestUrl;

    return promise;
  }

  /**
   * Get all recommendation pods
   *
   * @function getRecommendationPods
   * @param {object} [parameters] - Parameters relevant to the network request
   * @param {string} [parameters.section] - Recommendations section
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @example
   * constructorio.recommendations.getRecommendationPods();
   */
  getRecommendationPods(parameters = {}, networkParameters = {}) {
    const {
      apiKey,
      serviceUrl,
    } = this.options;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = {};
    const url = `${serviceUrl}/v1/recommendation_pods`;

    // For backwards compatibility we allow only "networkParameters" to be passed, meaning "parameters" should be
    // copied to networkParameters. If both parameters and networkParameters are passed we leave them as is
    let parsedNetworkParameters = networkParameters;
    if (parameters.timeout || parameters.headers) {
      parsedNetworkParameters = parameters;
    }

    const { section } = parameters;

    let queryParams = {
      key: apiKey,
    };

    if (section) {
      queryParams.section = section;
    }

    Object.assign(headers, helpers.combineCustomHeaders(this.options, parsedNetworkParameters));

    // Append security token as 'x-cnstrc-token' if available
    if (this.options.securityToken && typeof this.options.securityToken === 'string') {
      headers['x-cnstrc-token'] = this.options.securityToken;
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, parsedNetworkParameters, controller);

    queryParams = helpers.cleanParams(queryParams);
    const queryString = qs.stringify(queryParams, { indices: false });
    const requestUrl = `${url}?${queryString}`;

    return fetch(requestUrl, { headers: { ...headers, ...helpers.createAuthHeader(this.options) }, signal })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return helpers.throwHttpErrorFromResponse(new Error(), response);
      });
  }
}

module.exports = Recommendations;
