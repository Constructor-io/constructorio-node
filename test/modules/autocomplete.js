"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable object-curly-newline, no-underscore-dangle */
var qs = require('qs');

var fetchPonyfill = require('fetch-ponyfill');

var Promise = require('es6-promise');

var EventDispatcher = require('../utils/event-dispatcher');

var _require = require('../utils/helpers'),
    throwHttpErrorFromResponse = _require.throwHttpErrorFromResponse,
    cleanParams = _require.cleanParams; // Create URL from supplied query (term) and parameters


function createAutocompleteUrl(query, parameters, options) {
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
    var numResults = parameters.numResults,
        resultsPerSection = parameters.resultsPerSection,
        filters = parameters.filters; // Pull results number from parameters

    if (numResults) {
      queryParams.num_results = numResults;
    } // Pull results number per section from parameters


    if (resultsPerSection) {
      Object.keys(resultsPerSection).forEach(function (section) {
        queryParams["num_results_".concat(section)] = resultsPerSection[section];
      });
    } // Pull filters from parameters


    if (filters) {
      queryParams.filters = filters;
    }
  }

  queryParams._dt = Date.now();
  queryParams = cleanParams(queryParams);
  var queryString = qs.stringify(queryParams, {
    indices: false
  });
  return "".concat(serviceUrl, "/autocomplete/").concat(encodeURIComponent(query), "?").concat(queryString);
}
/**
 * Interface to autocomplete related API calls.
 *
 * @module autocomplete
 * @inner
 * @returns {object}
 */


var Autocomplete = /*#__PURE__*/function () {
  function Autocomplete(options) {
    _classCallCheck(this, Autocomplete);

    this.options = options || {};
    this.eventDispatcher = new EventDispatcher(options.eventDispatcher);
  }
  /**
   * Retrieve autocomplete results from API
   *
   * @function getAutocompleteResults
   * @param {object} [parameters] - Additional parameters to refine result set
   * @param {number} [parameters.numResults] - The total number of results to return
   * @param {object} [parameters.filters] - Filters used to refine search
   * @param {object} [parameters.resultsPerSection] - Number of results to return (value) per section (key)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#autocomplete
   */


  _createClass(Autocomplete, [{
    key: "getAutocompleteResults",
    value: function getAutocompleteResults(query, parameters) {
      var _this = this;

      var requestUrl;
      var fetch = this.options && this.options.fetch || fetchPonyfill({
        Promise: Promise
      }).fetch;

      try {
        requestUrl = createAutocompleteUrl(query, parameters, this.options);
      } catch (e) {
        return Promise.reject(e);
      }

      return fetch(requestUrl).then(function (response) {
        if (response.ok) {
          return response.json();
        }

        return throwHttpErrorFromResponse(new Error(), response);
      }).then(function (json) {
        if (json.sections) {
          if (json.result_id) {
            var sectionKeys = Object.keys(json.sections);
            sectionKeys.forEach(function (section) {
              var sectionItems = json.sections[section];

              if (sectionItems.length) {
                // Append `result_id` to each section item
                sectionItems.forEach(function (item) {
                  // eslint-disable-next-line no-param-reassign
                  item.result_id = json.result_id;
                });
              }
            });
          }

          _this.eventDispatcher.queue('autocomplete.getAutocompleteResults.completed', json);

          return json;
        }

        throw new Error('getAutocompleteResults response data is malformed');
      });
    }
  }]);

  return Autocomplete;
}();

module.exports = Autocomplete;