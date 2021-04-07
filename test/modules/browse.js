"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable object-curly-newline, no-underscore-dangle */
var qs = require('qs');

var fetchPonyfill = require('fetch-ponyfill');

var Promise = require('es6-promise');

var EventDispatcher = require('../utils/event-dispatcher');

var helpers = require('../utils/helpers'); // Create URL from supplied filter name, value and parameters


function createBrowseUrl(filterName, filterValue, parameters, options) {
  var apiKey = options.apiKey,
      version = options.version,
      serviceUrl = options.serviceUrl,
      sessionId = options.sessionId,
      clientId = options.clientId,
      userId = options.userId,
      segments = options.segments,
      testCells = options.testCells;
  var queryParams = {
    c: version
  };
  queryParams.key = apiKey;
  queryParams.i = clientId;
  queryParams.s = sessionId; // Validate filter name is provided

  if (!filterName || typeof filterName !== 'string') {
    throw new Error('filterName is a required parameter of type string');
  } // Validate filter value is provided


  if (!filterValue || typeof filterValue !== 'string') {
    throw new Error('filterValue is a required parameter of type string');
  } // Pull test cells from options


  if (testCells) {
    Object.keys(testCells).forEach(function (testCellKey) {
      queryParams["ef-".concat(testCellKey)] = testCells[testCellKey];
    });
  } // Pull user segments from options


  if (segments && segments.length) {
    queryParams.us = segments;
  } // Pull user id from options


  if (userId) {
    queryParams.ui = userId;
  }

  if (parameters) {
    var page = parameters.page,
        resultsPerPage = parameters.resultsPerPage,
        filters = parameters.filters,
        sortBy = parameters.sortBy,
        sortOrder = parameters.sortOrder,
        section = parameters.section,
        fmtOptions = parameters.fmtOptions; // Pull page from parameters

    if (!helpers.isNil(page)) {
      queryParams.page = page;
    } // Pull results per page from parameters


    if (!helpers.isNil(resultsPerPage)) {
      queryParams.num_results_per_page = resultsPerPage;
    }

    if (filters) {
      queryParams.filters = filters;
    } // Pull sort by from parameters


    if (sortBy) {
      queryParams.sort_by = sortBy;
    } // Pull sort order from parameters


    if (sortOrder) {
      queryParams.sort_order = sortOrder;
    } // Pull section from parameters


    if (section) {
      queryParams.section = section;
    } // Pull format options from parameters


    if (fmtOptions) {
      queryParams.fmt_options = fmtOptions;
    }
  }

  queryParams._dt = Date.now();
  queryParams = helpers.cleanParams(queryParams);
  var queryString = qs.stringify(queryParams, {
    indices: false
  });
  return "".concat(serviceUrl, "/browse/").concat(encodeURIComponent(filterName), "/").concat(encodeURIComponent(filterValue), "?").concat(queryString);
}
/**
 * Interface to browse related API calls
 *
 * @module browse
 * @inner
 * @returns {object}
 */


var Browse = /*#__PURE__*/function () {
  function Browse(options) {
    _classCallCheck(this, Browse);

    this.options = options || {};
    this.eventDispatcher = new EventDispatcher(options.eventDispatcher);
  }
  /**
   * Retrieve browse results from API
   *
   * @function getBrowseResults
   * @param {string} filterName - Filter name to display results from
   * @param {string} filterValue - Filter value to display results from
   * @param {object} [parameters] - Additional parameters to refine result set
   * @param {number} [parameters.page] - The page number of the results
   * @param {number} [parameters.resultsPerPage] - The number of results per page to return
   * @param {object} [parameters.filters] - Filters used to refine results
   * @param {string} [parameters.sortBy='relevance'] - The sort method for results
   * @param {string} [parameters.sortOrder='descending'] - The sort order for results
   * @param {object} [parameters.fmtOptions] - The format options used to refine result groups
   * @returns {Promise}
   * @see https://docs.constructor.io
   */


  _createClass(Browse, [{
    key: "getBrowseResults",
    value: function getBrowseResults(filterName, filterValue, parameters) {
      var _this = this;

      var requestUrl;
      var fetch = this.options && this.options.fetch || fetchPonyfill({
        Promise: Promise
      }).fetch;

      try {
        requestUrl = createBrowseUrl(filterName, filterValue, parameters, this.options);
      } catch (e) {
        return Promise.reject(e);
      }

      return fetch(requestUrl).then(function (response) {
        if (response.ok) {
          return response.json();
        }

        return helpers.throwHttpErrorFromResponse(new Error(), response);
      }).then(function (json) {
        if (json.response && json.response.results) {
          if (json.result_id) {
            // Append `result_id` to each result item
            json.response.results.forEach(function (result) {
              // eslint-disable-next-line no-param-reassign
              result.result_id = json.result_id;
            });
          }

          _this.eventDispatcher.queue('browse.getBrowseResults.completed', json);

          return json;
        }

        throw new Error('getBrowseResults response data is malformed');
      });
    }
  }]);

  return Browse;
}();

module.exports = Browse;