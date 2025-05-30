/* eslint-disable max-len */
/* eslint-disable object-curly-newline, no-underscore-dangle */
const qs = require('qs');
const { AbortController } = require('node-abort-controller');
const helpers = require('../utils/helpers');

// Create URL from supplied query (term) and parameters
// eslint-disable-next-line complexity
function createSearchUrl(query, parameters, userParameters, options, isVoiceSearch = false) {
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
    testCells,
  } = userParameters;
  let queryParams = { c: version };

  queryParams.key = apiKey;
  queryParams.i = clientId;
  queryParams.s = sessionId;

  // Validate query (term) is provided
  if (!query || typeof query !== 'string') {
    throw new Error('query is a required parameter of type string');
  }

  // Pull test cells from options
  if (testCells) {
    Object.keys(testCells).forEach((testCellKey) => {
      queryParams[`ef-${testCellKey}`] = testCells[testCellKey];
    });
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
      page,
      offset,
      resultsPerPage,
      filters,
      sortBy,
      sortOrder,
      section,
      fmtOptions,
      hiddenFields,
      hiddenFacets,
      variationsMap,
      preFilterExpression,
      qsParam,
    } = parameters;

    // Pull page from parameters
    if (!helpers.isNil(page)) {
      queryParams.page = page;
    }

    // Pull offset from parameters
    if (!helpers.isNil(offset)) {
      queryParams.offset = offset;
    }

    // Pull results per page from parameters
    if (!helpers.isNil(resultsPerPage)) {
      queryParams.num_results_per_page = resultsPerPage;
    }

    // Pull filters from parameters
    if (filters) {
      queryParams.filters = filters;
    }

    // Pull sort by from parameters
    if (sortBy) {
      queryParams.sort_by = sortBy;
    }

    // Pull sort order from parameters
    if (sortOrder) {
      queryParams.sort_order = sortOrder;
    }

    // Pull section from parameters
    if (section) {
      queryParams.section = section;
    }

    // Pull format options from parameters
    if (fmtOptions) {
      queryParams.fmt_options = fmtOptions;
    }

    // Pull hidden fields from parameters
    if (hiddenFields) {
      if (queryParams.fmt_options) {
        queryParams.fmt_options.hidden_fields = hiddenFields;
      } else {
        queryParams.fmt_options = { hidden_fields: hiddenFields };
      }
    }

    // Pull hidden facets from parameters
    if (hiddenFacets) {
      if (queryParams.fmt_options) {
        queryParams.fmt_options.hidden_facets = hiddenFacets;
      } else {
        queryParams.fmt_options = { hidden_facets: hiddenFacets };
      }
    }

    // Pull variations map from parameters
    if (variationsMap) {
      queryParams.variations_map = JSON.stringify(variationsMap);
    }

    // Pull filter expression from parameters
    if (preFilterExpression) {
      queryParams.pre_filter_expression = JSON.stringify(preFilterExpression);
    }

    // Pull qs param from parameters
    if (qsParam) {
      queryParams.qs = JSON.stringify(qsParam);
    }
  }

  queryParams._dt = Date.now();
  queryParams = helpers.cleanParams(queryParams);

  const queryString = qs.stringify(queryParams, { indices: false });

  const searchUrl = isVoiceSearch ? 'search/natural_language' : 'search';

  // Note: it is intentional that query is dispatched without being trimmed
  return `${serviceUrl}/${searchUrl}/${helpers.encodeURIComponentRFC3986(query)}?${queryString}`;
}

/**
 * Interface to search related API calls
 *
 * @module search
 * @inner
 * @returns {object}
 */
class Search {
  constructor(options) {
    this.options = options || {};
  }

  /**
   * Retrieve search results from API
   *
   * @function getSearchResults
   * @param {string} query - Term to use to perform a search
   * @param {object} [parameters] - Additional parameters to refine result set
   * @param {number} [parameters.page] - The page number of the results. Can't be used together with 'offset'
   * @param {number} [parameters.offset] - The number of results to skip from the beginning. Can't be used together with 'page'
   * @param {number} [parameters.resultsPerPage] - The number of results per page to return
   * @param {object} [parameters.filters] - Filters used to refine search
   * @param {string} [parameters.sortBy='relevance'] - The sort method for results
   * @param {string} [parameters.sortOrder='descending'] - The sort order for results
   * @param {string} [parameters.section='Products'] - The section name for results
   * @param {object} [parameters.fmtOptions] - The format options used to refine result groups
   * @param {string[]} [parameters.hiddenFields] - Hidden metadata fields to return
   * @param {string[]} [parameters.hiddenFacets] - Hidden facet fields to return
   * @param {object} [parameters.variationsMap] - The variations map object to aggregate variations. Please refer to https://docs.constructor.com/reference/shared-variations-mapping for details
   * @param {object} [parameters.preFilterExpression] - Faceting expression to scope search results. Please refer to https://docs.constructor.com/reference/configuration-collections for details
   * @param {object} [parameters.qsParam] - Parameters listed above can be serialized into a JSON object and parsed through this parameter. Please refer to https://docs.constructor.com/reference/search-search-resultsqueries for details
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
   * @see https://docs.constructor.com/reference/search-search-results
   * @example
   * constructorio.search.getSearchResults('t-shirt', {
   *     resultsPerPage: 40,
   *     filters: {
   *         size: 'medium'
   *     },
   * });
   */

  getSearchResults(query, parameters = {}, userParameters = {}, networkParameters = {}) {
    let requestUrl;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = {};

    try {
      requestUrl = createSearchUrl(query, parameters, userParameters, this.options);
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

    const promise = fetch(requestUrl, { headers, signal }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => {
      // Search results
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

      throw new Error('getSearchResults response data is malformed');
    });

    promise.requestUrl = requestUrl;

    return promise;
  }

  /**
   * Retrieve voice search results from API
   *
   * @function getVoiceSearchResults
   * @param {string} query - Term to use to perform a voice search
   * @param {object} [parameters] - Additional parameters to refine result set
   * @param {number} [parameters.page] - The page number of the results. Can't be used together with 'offset'
   * @param {number} [parameters.offset] - The number of results to skip from the beginning. Can't be used together with 'page'
   * @param {number} [parameters.resultsPerPage] - The number of results per page to return
   * @param {string} [parameters.section='Products'] - The section name for results
   * @param {object} [parameters.fmtOptions] - The format options used to refine result groups
   * @param {string[]} [parameters.hiddenFields] - Hidden metadata fields to return
   * @param {string[]} [parameters.hiddenFacets] - Hidden facet fields to return
   * @param {object} [parameters.variationsMap] - The variations map object to aggregate variations. Please refer to https://docs.constructor.com/reference/shared-variations-mapping for details
   * @param {object} [parameters.preFilterExpression] - Faceting expression to scope search results. Please refer to https://docs.constructor.com/reference/configuration-collections for details
   * @param {object} [parameters.qsParam] - Parameters listed above can be serialized into a JSON object and parsed through this parameter. Please refer to https://docs.constructor.com/reference/search-search-resultsqueries for details
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
   * @see https://docs.constructor.com/reference/search-search-resultsnatural_language_search/
   * @example
   * constructorio.search.getVoiceSearchResults('show me lipstick', {
   *     resultsPerPage: 40,
   * }, {
   *     testCells: {
   *         testName: 'cellName',
   *    },
   * });
   */

  getVoiceSearchResults(query, parameters = {}, userParameters = {}, networkParameters = {}) {
    let requestUrl;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = {};

    try {
      const isVoiceSearch = true;
      requestUrl = createSearchUrl(query, parameters, userParameters, this.options, isVoiceSearch);
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

    const promise = fetch(requestUrl, { headers, signal }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => {
      // Search results
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

      throw new Error('getVoiceSearchResults response data is malformed');
    });

    promise.requestUrl = requestUrl;

    return promise;
  }
}

module.exports = Search;
