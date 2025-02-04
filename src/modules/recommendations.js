/* eslint-disable object-curly-newline, no-param-reassign, max-len */
const qs = require('qs');
const { AbortController } = require('node-abort-controller');
const helpers = require('../utils/helpers');

// Create URL from supplied parameters
function createRecommendationsUrl(podId, parameters, userParameters, options) {
  const {
    apiKey,
    version,
    serviceUrl,
  } = options;
  const {
    sessionId,
    clientId,
    userId,
    segments,
  } = userParameters;
  let queryParams = { c: version };

  queryParams.key = apiKey;
  queryParams.i = clientId;
  queryParams.s = sessionId;

  // Validate pod identifier is provided
  if (!podId || typeof podId !== 'string') {
    throw new Error('podId is a required parameter of type string');
  }

  // Pull user segments from options
  if (segments && segments.length) {
    queryParams.us = segments;
  }

  // Pull user id from options and ensure string
  if (userId) {
    queryParams.ui = String(userId);
  }

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

  queryParams = helpers.cleanParams(queryParams);

  const queryString = qs.stringify(queryParams, { indices: false });

  return `${serviceUrl}/recommendations/v1/pods/${helpers.encodeURIComponentRFC3986(helpers.normalizeSpaces(podId).trim())}?${queryString}`;
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
    const headers = {};

    parameters = parameters || {};

    try {
      requestUrl = createRecommendationsUrl(podId, parameters, userParameters, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    Object.assign(headers, helpers.combineCustomHeaders(this.options, networkParameters));

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

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, { headers, signal }).then((response) => {
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
