"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable object-curly-newline, no-underscore-dangle */
var qs = require('qs');

var fetchPonyfill = require('fetch-ponyfill');

var Promise = require('es6-promise');

var EventDispatcher = require('../utils/event-dispatcher');

var helpers = require('../utils/helpers'); // Create URL from supplied query (term) and parameters


function createSearchUrl(query, parameters, options) {
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
  queryParams.s = sessionId; // Validate query (term) is provided

  if (!query || typeof query !== 'string') {
    throw new Error('query is a required parameter of type string');
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
        collectionId = parameters.collectionId,
        fmtOptions = parameters.fmtOptions; // Pull page from parameters

    if (!helpers.isNil(page)) {
      queryParams.page = page;
    } // Pull results per page from parameters


    if (!helpers.isNil(resultsPerPage)) {
      queryParams.num_results_per_page = resultsPerPage;
    } // Pull filters from parameters


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
    } // Pull collection id from parameters


    if (collectionId) {
      queryParams.collection_id = collectionId;
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
  return "".concat(serviceUrl, "/search/").concat(encodeURIComponent(query), "?").concat(queryString);
}
/**
 * Interface to search related API calls
 *
 * @module search
 * @inner
 * @returns {object}
 */


var Search = /*#__PURE__*/function () {
  function Search(options) {
    _classCallCheck(this, Search);

    this.options = options || {};
    this.eventDispatcher = new EventDispatcher(options.eventDispatcher);
  }
  /**
   * Retrieve search results from API
   *
   * @function getSearchResults
   * @param {string} query - Term to use to perform a search
   * @param {object} [parameters] - Additional parameters to refine result set
   * @param {number} [parameters.page] - The page number of the results
   * @param {number} [parameters.resultsPerPage] - The number of results per page to return
   * @param {object} [parameters.filters] - Filters used to refine search
   * @param {string} [parameters.sortBy='relevance'] - The sort method for results
   * @param {string} [parameters.sortOrder='descending'] - The sort order for results
   * @param {object} [parameters.fmtOptions] - The format options used to refine result groups
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#search
   */


  _createClass(Search, [{
    key: "getSearchResults",
    value: function getSearchResults(query, parameters) {
      var _this = this;

      var requestUrl;
      var fetch = this.options && this.options.fetch || fetchPonyfill({
        Promise: Promise
      }).fetch;

      try {
        requestUrl = createSearchUrl(query, parameters, this.options);
      } catch (e) {
        return Promise.reject(e);
      }

      return fetch(requestUrl).then(function (response) {
        if (response.ok) {
          return response.json();
        }

        return helpers.throwHttpErrorFromResponse(new Error(), response);
      }).then(function (json) {
        // Search results
        if (json.response && json.response.results) {
          if (json.result_id) {
            json.response.results.forEach(function (result) {
              // eslint-disable-next-line no-param-reassign
              result.result_id = json.result_id;
            });
          }

          _this.eventDispatcher.queue('search.getSearchResults.completed', json);

          return json;
        } // Redirect rules


        if (json.response && json.response.redirect) {
          _this.eventDispatcher.queue('search.getSearchResults.completed', json);

          return json;
        }

        throw new Error('getSearchResults response data is malformed');
      });
    }
  }]);

  return Search;
}();

module.exports = Search;