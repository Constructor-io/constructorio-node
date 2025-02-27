/* eslint-disable object-curly-newline, no-underscore-dangle, max-len */
const qs = require('qs');
const { AbortController } = require('node-abort-controller');
const helpers = require('../utils/helpers');

// Create URL from supplied path and options
function createTaskUrl(path, options, additionalQueryParams = {}, apiVersion = 'v1') {
  const {
    apiKey,
    serviceUrl,
  } = options;
  let queryParams = {
    ...additionalQueryParams,
  };

  // Validate path is provided
  if (!path || typeof path !== 'string') {
    throw new Error('path is a required parameter of type string');
  }

  queryParams.key = apiKey;
  queryParams = helpers.cleanParams(queryParams);

  const queryString = qs.stringify(queryParams, { indices: false });

  return `${serviceUrl}/${encodeURIComponent(apiVersion)}/${encodeURIComponent(path)}?${queryString}`;
}

/**
 * Interface to task related API calls
 *
 * @module tasks
 * @inner
 * @returns {object}
 */
class Tasks {
  constructor(options) {
    this.options = options || {};
  }

  /**
   * Retrieve all tasks from index
   *
   * @function getAllTasks
   * @param {object} parameters - Additional parameters for task details
   * @param {number} [parameters.numResultsPerPage = 20] - The number of tasks to return - maximum value 100
   * @param {number} [parameters.page = 1] - The page of results to return
   * @param {string} [parameters.startDate] - The start date of results to return - YYYY-MM-DD
   * @param {string} [parameters.endDate] - The end date of results to return - YYYY-MM-DD
   * @param {string} [parameters.status] - The status of tasks to return - 'QUEUED', 'IN_PROGRESS', 'DONE', 'FAILED', 'CANCELED'
   * @param {string} [parameters.type] - The type of tasks to return - 'ingestion', 'user_data_request'
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.com/reference/catalog-tasks
   */
  getAllTasks(parameters = {}, networkParameters = {}) {
    const queryParams = {};
    let requestUrl;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (parameters) {
      const { num_results_per_page: numResultsPerPageOld, numResultsPerPage, page, startDate, endDate, status, type } = parameters;

      // Pull number of results per page from parameters
      if (numResultsPerPageOld || numResultsPerPage) {
        queryParams.num_results_per_page = numResultsPerPageOld || numResultsPerPage;
      }

      // Pull page from parameters
      if (page) {
        queryParams.page = page;
      }

      if (startDate) {
        queryParams.start_date = startDate;
      }

      if (endDate) {
        queryParams.end_date = endDate;
      }

      if (status) {
        queryParams.status = status;
      }

      if (type) {
        queryParams.type = type;
      }
    }

    try {
      requestUrl = createTaskUrl('tasks', this.options, queryParams);
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
   * Retrieve task given a specific id
   *
   * @function getTask
   * @param {object} parameters - Additional parameters for task details
   * @param {string} parameters.id - The ID of the task to be retrieved
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.com/reference/catalog-tasks
   */
  getTask(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;
    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      requestUrl = createTaskUrl(`tasks/${parameters.id}`, this.options);
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
}

module.exports = Tasks;
