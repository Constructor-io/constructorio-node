/* eslint-disable object-curly-newline, no-underscore-dangle */
const qs = require('qs');
const { AbortController } = require('node-abort-controller');
const helpers = require('../utils/helpers');

// Create URL from supplied query (term) and parameters
function createAutocompleteUrl(query, parameters, userParameters, options) {
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
      numResults,
      resultsPerSection,
      filters,
      filtersPerSection,
      hiddenFields,
      variationsMap,
      preFilterExpression,
      resultsPerPagePerSection,
      pagePerSection,
    } = parameters;

    // Pull results number from parameters
    if (numResults) {
      queryParams.num_results = numResults;
    }

    // Pull page per section from parameters
    if (pagePerSection) {
      queryParams.page_per_section = pagePerSection;
    }

    // Pull results number per page per section from parameters
    if (resultsPerPagePerSection) {
      queryParams.num_section_results_per_page = resultsPerPagePerSection;
    }

    // Pull results number per section from parameters
    if (resultsPerSection) {
      Object.keys(resultsPerSection).forEach((section) => {
        queryParams[`num_results_${section}`] = resultsPerSection[section];
      });
    }

    // Pull filters from parameters
    if (filters) {
      queryParams.filters = filters;
    }

    // Pull filtersPerSection from parameters
    if (filtersPerSection) {
      Object.keys(filtersPerSection).forEach((section) => {
        queryParams[`filters[${section}]`] = filtersPerSection[section];
      });
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

    // Pull filter expression from parameters
    if (preFilterExpression) {
      queryParams.pre_filter_expression = JSON.stringify(preFilterExpression);
    }
  }

  queryParams._dt = Date.now();
  queryParams = helpers.cleanParams(queryParams);

  const queryString = qs.stringify(queryParams, { indices: false });
  const cleanedQuery = query.replace(/^\//, '|'); // For compatibility with backend API

  // Note: it is intentional that query is dispatched without being trimmed
  return `${serviceUrl}/autocomplete/${helpers.encodeURIComponentRFC3986(cleanedQuery)}?${queryString}`;
}

/**
 * Interface to autocomplete related API calls.
 *
 * @module autocomplete
 * @inner
 * @returns {object}
 */
class Autocomplete {
  constructor(options) {
    this.options = options || {};
  }

  /**
   * Retrieve autocomplete results from API
   *
   * @function getAutocompleteResults
   * @param {string} query - Term to use to perform an autocomplete search
   * @param {object} [parameters] - Additional parameters to refine result set
   * @param {number} [parameters.numResults] - The total number of results to return
   * @param {object} [parameters.pagePerSection] - The page number of the results per section
   * @param {object} [parameters.resultsPerPagePerSection] - The number of results per page to return per section
   * @param {object} [parameters.filters] - Filters used to refine search
   * @param {object} [parameters.filtersPerSection] - Filters used to refine search per section
   * @param {object} [parameters.resultsPerSection] - Number of results to return (value) per section (key)
   * @param {string[]} [parameters.hiddenFields] - Hidden metadata fields to return
   * @param {object} [parameters.variationsMap] - The variations map object to aggregate variations. Please refer to https://docs.constructor.com/reference/shared-variations-mapping for details
   * @param {object} [parameters.preFilterExpression] - Faceting expression to scope autocomplete results. Please refer to https://docs.constructor.com/reference/configuration-collections for details
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
   * @see https://docs.constructor.com/reference/autocomplete-autocomplete-results
   * @example
   * constructorio.autocomplete.getAutocompleteResults('t-shirt', {
   *     resultsPerSection: {
   *         Products: 5,
   *         'Search Suggestions': 10,
   *     },
   *     filters: {
   *         size: 'medium'
   *     },
   * });
   */
  getAutocompleteResults(query, parameters = {}, userParameters = {}, networkParameters = {}) {
    let requestUrl;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = {};

    try {
      requestUrl = createAutocompleteUrl(query, parameters, userParameters, this.options);
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
      if (json.sections) {
        if (json.result_id) {
          const sectionKeys = Object.keys(json.sections);

          sectionKeys.forEach((section) => {
            const sectionItems = json.sections[section];

            if (sectionItems.length) {
              // Append `result_id` to each section item
              sectionItems.forEach((item) => {
                // eslint-disable-next-line no-param-reassign
                item.result_id = json.result_id;
              });
            }
          });
        }

        return json;
      }

      throw new Error('getAutocompleteResults response data is malformed');
    });

    promise.requestUrl = requestUrl;

    return promise;
  }
}

module.exports = Autocomplete;
