/* eslint-disable max-len */
/* eslint-disable camelcase, no-underscore-dangle, no-unneeded-ternary, brace-style */
const qs = require('qs');
const { AbortController } = require('node-abort-controller');
const helpers = require('../utils/helpers');

// Create URL from supplied path and options
function createCampaignsUrl(path, options, additionalQueryParams = {}, apiVersion = 'v1') {
  const {
    apiKey,
    serviceUrl,
    version,
  } = options;
  let queryParams = {
    c: version,
    ...additionalQueryParams,
  };

  // Validate path is provided
  if (!path || typeof path !== 'string') {
    throw new Error('path is a required parameter of type string');
  }

  queryParams.key = apiKey;
  queryParams = helpers.cleanParams(queryParams);

  const queryString = qs.stringify(queryParams, { indices: false });

  const encodedPath = path.split('/').map(encodeURIComponent).join('/');

  return `${serviceUrl}/${encodeURIComponent(apiVersion)}/${encodedPath}?${queryString}`;
}

/**
 * Interface to searchandizing campaign related API calls
 *
 * @module campaigns
 * @inner
 * @returns {object}
 */
class Campaigns {
  constructor(options) {
    this.options = options || {};
  }

  /**
   * Retrieve campaigns
   *
   * @function retrieveCampaigns
   * @param {object} [parameters] - Additional parameters for retrieving campaigns
   * @param {string} [parameters.section='Products'] - The section of the index to use
   * @param {number|number[]} [parameters.id] - The ID(s) of campaigns to filter by
   * @param {object} [parameters.refinedFilters] - An object of refined filters to filter by
   * @param {number} [parameters.numResultsPerPage=20] - The number of campaigns to return - maximum value 100
   * @param {number} [parameters.page] - The page of results to return
   * @param {number} [parameters.offset] - The number of results to skip from the beginning - cannot be used together with `page`
   * @param {object} [parameters.refinedRecommendationContexts] - A filter for refined recommendation contexts
   * @param {string[]} [parameters.refinedQueries] - A list of refined queries to filter by
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.com/reference/v1-searchandising-retrieve-campaigns
   * @example
   * constructorio.campaigns.retrieveCampaigns({
   *     section: 'Products',
   *     numResultsPerPage: 50,
   *     page: 1,
   * });
   */
  retrieveCampaigns(parameters = {}, networkParameters = {}) {
    const queryParams = {};
    let requestUrl;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (parameters) {
      const {
        section,
        id,
        refined_filters,
        refinedFilters = refined_filters,
        num_results_per_page,
        numResultsPerPage = num_results_per_page,
        page,
        offset,
        refined_recommendation_contexts,
        refinedRecommendationContexts = refined_recommendation_contexts,
        refined_queries,
        refinedQueries = refined_queries,
      } = parameters;

      // Pull section from parameters
      if (section) {
        queryParams.section = section;
      }

      // Pull id from parameters
      if (id) {
        queryParams.id = id;
      }

      // Pull refined filters from parameters
      if (refinedFilters) {
        queryParams.refined_filters = refinedFilters;
      }

      // Pull number of results per page from parameters
      if (numResultsPerPage) {
        queryParams.num_results_per_page = numResultsPerPage;
      }

      // Pull page from parameters
      if (page) {
        queryParams.page = page;
      }

      // Pull offset from parameters
      if (offset) {
        queryParams.offset = offset;
      }

      // Pull refined recommendation contexts from parameters
      if (refinedRecommendationContexts) {
        queryParams.refined_recommendation_contexts = refinedRecommendationContexts;
      }

      // Pull refined queries from parameters
      if (refinedQueries) {
        queryParams.refined_queries = refinedQueries;
      }
    }

    try {
      requestUrl = createCampaignsUrl('campaigns', this.options, queryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    Object.assign(headers, helpers.combineCustomHeaders(this.options, networkParameters));

    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        ...headers,
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Retrieve a campaign given a specific id
   *
   * @function retrieveCampaign
   * @param {object} parameters - Additional parameters for retrieving a campaign
   * @param {number} parameters.id - The ID of the campaign to be retrieved
   * @param {string} [parameters.section='Products'] - The section of the index to use
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.com/reference/v1-searchandising-retrieve-campaign
   * @example
   * constructorio.campaigns.retrieveCampaign({
   *     id: 42,
   *     section: 'Products',
   * });
   */
  retrieveCampaign(parameters = {}, networkParameters = {}) {
    const queryParams = {};
    let requestUrl;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = {
      'Content-Type': 'application/json',
    };
    const { id, section } = parameters;

    // Pull section from parameters
    if (section) {
      queryParams.section = section;
    }

    try {
      requestUrl = createCampaignsUrl(`campaigns/${id}`, this.options, queryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    Object.assign(headers, helpers.combineCustomHeaders(this.options, networkParameters));

    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        ...headers,
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Create a campaign
   *
   * @function createCampaign
   * @param {object} parameters - Additional parameters for the campaign to be created
   * @param {string} parameters.name - The name of the campaign
   * @param {string} [parameters.section='Products'] - The section of the index to use
   * @param {string} [parameters.description] - The description of the campaign
   * @param {string} [parameters.requestTagName] - Request tag name used to activate this campaign for, used only with `request_tag_value`
   * @param {string} [parameters.requestTagValue] - Request tag value used to activate this campaign for, used only with `request_tag_name`
   * @param {string} [parameters.startTime] - The start time of the campaign (ISO 8601 date-time)
   * @param {string} [parameters.endTime] - The end time of the campaign (ISO 8601 date-time)
   * @param {object[]} [parameters.refinedQueries] - A list of refined queries
   * @param {object[]} [parameters.refinedFilters] - A list of refined filters
   * @param {object[]} [parameters.refinedRecommendationContexts] - A list of refined recommendation contexts
   * @param {object[]} [parameters.boostRules] - A list of boost rules
   * @param {object[]} [parameters.blacklistRules] - A list of blacklist rules
   * @param {object[]} [parameters.slotRules] - A list of slot rules
   * @param {object[]} [parameters.contentRules] - A list of content rules
   * @param {object[]} [parameters.filtersSlotRules] - A list of filters slot rules
   * @param {object} [parameters.whitelistRule] - A whitelist rule
   * @param {object} [parameters.variationSlicingRule] - A variation slicing rule
   * @param {object} [parameters.metadataJson] - Metadata related to the campaign
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.com/reference/v1-searchandising-create-campaign
   * @example
   * constructorio.campaigns.createCampaign({
   *     name: 'Spring Sale',
   *     section: 'Products',
   *     description: 'Seasonal promotion campaign',
   *     boostRules: [
   *         { rule_type: 'boost', rule: { boost: 5, filters: { brand: ['Nike'] } } },
   *     ],
   * });
   */
  createCampaign(parameters = {}, networkParameters = {}) {
    const queryParams = {};
    let requestUrl;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = {
      'Content-Type': 'application/json',
    };
    const { section, ...body } = parameters;

    // Pull section from parameters
    if (section) {
      queryParams.section = section;
    }

    try {
      requestUrl = createCampaignsUrl('campaigns', this.options, queryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    Object.assign(headers, helpers.combineCustomHeaders(this.options, networkParameters));

    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(helpers.toSnakeCaseKeys(body, false)),
      headers: {
        ...headers,
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Update a campaign - only the fields present in the request will be updated
   *
   * @function updateCampaign
   * @param {object} parameters - Additional parameters for the campaign to be updated
   * @param {number} parameters.id - The ID of the campaign to be updated
   * @param {string} [parameters.section='Products'] - The section of the index to use
   * @param {string} [parameters.name] - The name of the campaign
   * @param {string} [parameters.description] - The description of the campaign
   * @param {string} [parameters.requestTagName] - Request tag name used to activate this campaign for, used only with `request_tag_value`
   * @param {string} [parameters.requestTagValue] - Request tag value used to activate this campaign for, used only with `request_tag_name`
   * @param {string} [parameters.startTime] - The start time of the campaign (ISO 8601 date-time)
   * @param {string} [parameters.endTime] - The end time of the campaign (ISO 8601 date-time)
   * @param {object[]} [parameters.refinedQueries] - A list of refined queries
   * @param {object[]} [parameters.refinedFilters] - A list of refined filters
   * @param {object[]} [parameters.refinedRecommendationContexts] - A list of refined recommendation contexts
   * @param {object[]} [parameters.boostRules] - A list of boost rules
   * @param {object[]} [parameters.blacklistRules] - A list of blacklist rules
   * @param {object[]} [parameters.slotRules] - A list of slot rules
   * @param {object[]} [parameters.contentRules] - A list of content rules
   * @param {object[]} [parameters.filtersSlotRules] - A list of filters slot rules
   * @param {object} [parameters.whitelistRule] - A whitelist rule
   * @param {object} [parameters.variationSlicingRule] - A variation slicing rule
   * @param {object} [parameters.metadataJson] - Metadata related to the campaign
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.com/reference/v1-searchandising-update-campaign
   * @example
   * constructorio.campaigns.updateCampaign({
   *     id: 42,
   *     name: 'Spring Sale - Updated',
   *     description: 'Updated seasonal promotion campaign',
   * });
   */
  updateCampaign(parameters = {}, networkParameters = {}) {
    const queryParams = {};
    let requestUrl;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = {
      'Content-Type': 'application/json',
    };
    const { id, section, ...body } = parameters;

    // Pull section from parameters
    if (section) {
      queryParams.section = section;
    }

    try {
      requestUrl = createCampaignsUrl(`campaigns/${id}`, this.options, queryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    Object.assign(headers, helpers.combineCustomHeaders(this.options, networkParameters));

    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PATCH',
      body: JSON.stringify(helpers.toSnakeCaseKeys(body, false)),
      headers: {
        ...headers,
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Delete a campaign given a specific id
   *
   * @function deleteCampaign
   * @param {object} parameters - Additional parameters for the campaign to be deleted
   * @param {number} parameters.id - The ID of the campaign to be deleted
   * @param {string} [parameters.section='Products'] - The section of the index to use
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.com/reference/v1-searchandising-delete-campaign
   * @example
   * constructorio.campaigns.deleteCampaign({
   *     id: 42,
   *     section: 'Products',
   * });
   */
  deleteCampaign(parameters = {}, networkParameters = {}) {
    const queryParams = {};
    let requestUrl;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = {
      'Content-Type': 'application/json',
    };
    const { id, section } = parameters;

    // Pull section from parameters
    if (section) {
      queryParams.section = section;
    }

    try {
      requestUrl = createCampaignsUrl(`campaigns/${id}`, this.options, queryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    Object.assign(headers, helpers.combineCustomHeaders(this.options, networkParameters));

    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'DELETE',
      headers: {
        ...headers,
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }
}

module.exports = Campaigns;
