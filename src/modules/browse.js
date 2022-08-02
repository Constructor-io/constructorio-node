/* eslint-disable max-len */
/* eslint-disable object-curly-newline, no-underscore-dangle, max-params */
const qs = require('qs');
const nodeFetch = require('node-fetch').default;
const { AbortController } = require('node-abort-controller');
const helpers = require('../utils/helpers');

// Create query params from parameters and options
function createQueryParams(parameters, userParameters, options) {
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
  } = userParameters;
  let queryParams = { c: version };

  queryParams.key = apiKey;
  queryParams.i = clientId;
  queryParams.s = sessionId;

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

  // Pull user id from options
  if (userId) {
    queryParams.ui = userId;
  }

  queryParams._dt = Date.now();
  queryParams = helpers.cleanParams(queryParams);

  return queryParams;
}

// Create URL from supplied filter name, value and parameters
function createBrowseUrlFromFilter(filterName, filterValue, parameters, userParameters, options) {
  const { serviceUrl } = options;

  // Validate filter name is provided
  if (!filterName || typeof filterName !== 'string') {
    throw new Error('filterName is a required parameter of type string');
  }

  // Validate filter value is provided
  if (!filterValue || typeof filterValue !== 'string') {
    throw new Error('filterValue is a required parameter of type string');
  }

  const queryParams = createQueryParams(parameters, userParameters, options);
  const queryString = qs.stringify(queryParams, { indices: false });

  return `${serviceUrl}/browse/${helpers.encodeURIComponentRFC3986(helpers.trimNonBreakingSpaces(filterName))}/${helpers.encodeURIComponentRFC3986(helpers.trimNonBreakingSpaces(filterValue))}?${queryString}`;
}

// Create URL from supplied IDs and parameters
function createBrowseUrlFromIDs(itemIds, parameters, userParameters, options) {
  const { serviceUrl } = options;

  // Validate item IDs are provided
  if (!itemIds || !(itemIds instanceof Array) || !itemIds.length) {
    throw new Error('itemIds is a required parameter of type array');
  }

  const queryParams = { ...createQueryParams(parameters, userParameters, options), ids: itemIds };
  const queryString = qs.stringify(queryParams, { indices: false });

  return `${serviceUrl}/browse/items?${queryString}`;
}

// Create URL from supplied parameters
function createBrowseUrlForFacets(parameters, userParameters, options) {
  const { serviceUrl } = options;
  const queryParams = { ...createQueryParams(parameters, userParameters, options) };

  delete queryParams._dt;

  const queryString = qs.stringify(queryParams, { indices: false });

  return `${serviceUrl}/browse/facets?${queryString}`;
}

// Create URL from supplied facet name and parameters
function createBrowseUrlForFacetOptions(facetName, parameters, userParameters, options) {
  const { serviceUrl } = options;

  // Validate facet name is provided
  if (!facetName || typeof facetName !== 'string') {
    throw new Error('facetName is a required parameter of type string');
  }

  const queryParams = { ...createQueryParams(parameters, userParameters, options) };

  queryParams.facet_name = facetName;

  delete queryParams._dt;

  const queryString = qs.stringify(queryParams, { indices: false });

  return `${serviceUrl}/browse/facet_options?${queryString}`;
}

// Create request headers using supplied options and user parameters
function createHeaders(options, userParameters) {
  const headers = {};

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

/**
 * Interface to browse related API calls
 *
 * @module browse
 * @inner
 * @returns {object}
 */
class Browse {
  constructor(options) {
    this.options = options || {};
  }

  /**
   * Retrieve browse results from API
   *
   * @function getBrowseResults
   * @param {string} filterName - Filter name to display results from
   * @param {string} filterValue - Filter value to display results from
   * @param {object} [parameters] - Additional parameters to refine result set
   * @param {number} [parameters.page] - The page number of the results. Can't be used together with 'offset'
   * @param {number} [parameters.offset] - The number of results to skip from the beginning. Can't be used together with 'page'
   * @param {number} [parameters.resultsPerPage] - The number of results per page to return
   * @param {object} [parameters.filters] - Filters used to refine results
   * @param {string} [parameters.sortBy='relevance'] - The sort method for results
   * @param {string} [parameters.sortOrder='descending'] - The sort order for results
   * @param {string} [parameters.section='Products'] - The section name for results
   * @param {object} [parameters.fmtOptions] - The format options used to refine result groups
   * @param {string[]} [parameters.hiddenFields] - Hidden metadata fields to return
   * @param {string[]} [parameters.hiddenFacets] - Hidden facet fields to return
   * @param {object} [parameters.variationsMap] - The variations map object to aggregate variations. Please refer to https://docs.constructor.io/rest_api/variations_mapping for details
   * @param {object} [userParameters] - Parameters relevant to the user request
   * @param {number} [userParameters.sessionId] - Session ID, utilized to personalize results
   * @param {number} [userParameters.clientId] - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.userIp] - Origin user IP, from client
   * @param {string} [userParameters.userAgent] - Origin user agent, from client
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/browse/results
   * @example
   * constructorio.browse.getBrowseResults('group_id', 't-shirts', {
   *     resultsPerPage: 40,
   *     filters: {
   *         size: 'medium'
   *     },
   * }, {
   *     testCells: {
   *         testName: 'cellName',
   *    },
   * });
   */
  getBrowseResults(filterName, filterValue, parameters = {}, userParameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = createHeaders(this.options, userParameters);

    try {
      requestUrl = createBrowseUrlFromFilter(filterName, filterValue, parameters, userParameters, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, { headers, signal }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => {
      // Browse results
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

      throw new Error('getBrowseResults response data is malformed');
    });
  }

  /**
   * Retrieve browse results from API using item IDs
   *
   * @function getBrowseResultsForItemIds
   * @param {string[]} itemIds - Item IDs of results to fetch
   * @param {object} [parameters] - Additional parameters to refine result set
   * @param {number} [parameters.page] - The page number of the results. Can't be used together with 'offset'
   * @param {number} [parameters.offset] - The number of results to skip from the beginning. Can't be used together with 'page'
   * @param {number} [parameters.resultsPerPage] - The number of results per page to return
   * @param {object} [parameters.filters] - Filters used to refine results
   * @param {string} [parameters.sortBy='relevance'] - The sort method for results
   * @param {string} [parameters.sortOrder='descending'] - The sort order for results
   * @param {string} [parameters.section='Products'] - The section name for results
   * @param {object} [parameters.fmtOptions] - The format options used to refine result groups
   * @param {string[]} [parameters.hiddenFields] - Hidden metadata fields to return
   * @param {string[]} [parameters.hiddenFacets] - Hidden facet fields to return
   * @param {object} [parameters.variationsMap] - The variations map object to aggregate variations. Please refer to https://docs.constructor.io/rest_api/variations_mapping for details
   * @param {object} [userParameters] - Parameters relevant to the user request
   * @param {number} [userParameters.sessionId] - Session ID, utilized to personalize results
   * @param {number} [userParameters.clientId] - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.userIp] - Origin user IP, from client
   * @param {string} [userParameters.userAgent] - Origin user agent, from client
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/browse/items/
   * @example
   * constructorio.browse.getBrowseResultsForItemIds(['shirt-123', 'shirt-456', 'shirt-789'], {
   *     filters: {
   *         size: 'medium'
   *     },
   * }, {
   *     testCells: {
   *         'testName': 'cellName',
   *    },
   * });
   */
  getBrowseResultsForItemIds(itemIds, parameters = {}, userParameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = createHeaders(this.options, userParameters);

    try {
      requestUrl = createBrowseUrlFromIDs(itemIds, parameters, userParameters, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, { headers, signal })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return helpers.throwHttpErrorFromResponse(new Error(), response);
      })
      .then((json) => {
        if (json.response && json.response.results) {
          if (json.result_id) {
            // Append `result_id` to each result item
            json.response.results.forEach((result) => {
              // eslint-disable-next-line no-param-reassign
              result.result_id = json.result_id;
            });
          }
          return json;
        }
        throw new Error('getBrowseResultsForItemIds response data is malformed');
      });
  }

  /**
   * Retrieve browse groups from API
   *
   * @function getBrowseGroups
   * @param {object} [parameters.filters] - Filters used to refine results
   * @param {string} [parameters.section='Products'] - The section name for results
   * @param {object} [parameters.fmtOptions] - The format options used to refine result groups
   * @param {object} [userParameters] - Parameters relevant to the user request
   * @param {number} [userParameters.sessionId] - Session ID, utilized to personalize results
   * @param {number} [userParameters.clientId] - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.userIp] - Origin user IP, from client
   * @param {string} [userParameters.userAgent] - Origin user agent, from client
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/browse/groups
   * @example
   * constructorio.browse.getBrowseGroups({
   *     filters: {
   *         group_id: 'drill_collection'
   *     },
   *     fmtOptions: {
   *         groups_max_depth: 2
   *     }
   * }, {
   *     testCells: {
   *         'testName': 'cellName',
   *    },
   * });
   */
  getBrowseGroups(parameters = {}, userParameters = {}, networkParameters = {}) {
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = createHeaders(this.options, userParameters);
    const { serviceUrl } = this.options;
    const queryParams = createQueryParams(parameters, userParameters, this.options);

    delete queryParams._dt;

    const queryString = qs.stringify(queryParams, { indices: false });
    const requestUrl = `${serviceUrl}/browse/groups?${queryString}`;

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, { headers, signal }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Retrieve facets from API
   *
   * @function getBrowseFacets
   * @param {object} [parameters] - Additional parameters to refine result set
   * @param {number} [parameters.page] - The page number of the results. Can't be used together with 'offset'
   * @param {number} [parameters.offset] - The number of results to skip from the beginning. Can't be used together with 'page'
   * @param {string} [parameters.section='Products'] - The section name for results
   * @param {number} [parameters.resultsPerPage] - The number of results per page to return
   * @param {object} [parameters.fmtOptions] - The format options used to refine result groups
   * @param {boolean} [parameters.fmtOptions.show_hidden_facets] - Include facets configured as hidden
   * @param {boolean} [parameters.fmtOptions.show_protected_facets] - Include facets configured as protected
   * @param {object} [userParameters] - Parameters relevant to the user request
   * @param {number} [userParameters.sessionId] - Session ID, utilized to personalize results
   * @param {number} [userParameters.clientId] - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.userIp] - Origin user IP, from client
   * @param {string} [userParameters.userAgent] - Origin user agent, from client
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/browse/facets
   * @example
   * constructorio.browse.getBrowseFacets({
   *     page: 1,
   *     resultsPerPage: 10,
   * }, {
   *     testCells: {
   *         'testName': 'cellName',
   *    },
   * });
   */
  getBrowseFacets(parameters = {}, userParameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createBrowseUrlForFacets(parameters, userParameters, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      headers: helpers.createAuthHeader(this.options),
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Retrieve facet options from API
   *
   * @function getBrowseFacetOptions
   * @param {string} facetName - Name of the facet whose options to return
   * @param {object} [parameters] - Additional parameters to refine result set
   * @param {string} [parameters.section='Products'] - The section name for results
   * @param {object} [parameters.fmtOptions] - The format options used to refine result groups
   * @param {boolean} [parameters.fmtOptions.show_hidden_facets] - Include facets configured as hidden
   * @param {boolean} [parameters.fmtOptions.show_protected_facets] - Include facets configured as protected
   * @param {object} [userParameters] - Parameters relevant to the user request
   * @param {number} [userParameters.sessionId] - Session ID, utilized to personalize results
   * @param {number} [userParameters.clientId] - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {string} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.userIp] - Origin user IP, from client
   * @param {string} [userParameters.userAgent] - Origin user agent, from client
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/browse/facet_options
   * @example
   * constructorio.browse.getBrowseFacetOptions('price', {
   *     fmtOptions: { ... },
   * });
   */
  getBrowseFacetOptions(facetName, parameters = {}, userParameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createBrowseUrlForFacetOptions(facetName, parameters, userParameters, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      headers: helpers.createAuthHeader(this.options),
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }
}

module.exports = Browse;
