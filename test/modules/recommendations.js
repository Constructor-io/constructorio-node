"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable object-curly-newline, no-param-reassign */
var qs = require('qs');

var fetchPonyfill = require('fetch-ponyfill');

var Promise = require('es6-promise');

var EventDispatcher = require('../utils/event-dispatcher');

var helpers = require('../utils/helpers'); // Create URL from supplied parameters


function createRecommendationsUrl(podId, parameters, options) {
  var apiKey = options.apiKey,
      version = options.version,
      serviceUrl = options.serviceUrl,
      sessionId = options.sessionId,
      userId = options.userId,
      clientId = options.clientId,
      segments = options.segments;
  var queryParams = {
    c: version
  };
  queryParams.key = apiKey;
  queryParams.i = clientId;
  queryParams.s = sessionId; // Validate pod identifier is provided

  if (!podId || typeof podId !== 'string') {
    throw new Error('podId is a required parameter of type string');
  } // Pull user segments from options


  if (segments && segments.length) {
    queryParams.us = segments;
  } // Pull user id from options


  if (userId) {
    queryParams.ui = userId;
  }

  if (parameters) {
    var numResults = parameters.numResults,
        itemIds = parameters.itemIds,
        section = parameters.section,
        term = parameters.term,
        filters = parameters.filters; // Pull num results number from parameters

    if (!helpers.isNil(numResults)) {
      queryParams.num_results = numResults;
    } // Pull item ids from parameters


    if (itemIds) {
      queryParams.item_id = itemIds;
    } // Pull section from parameters


    if (section) {
      queryParams.section = section;
    } // Pull term from parameters


    if (term) {
      queryParams.term = term;
    } // Pull filters from parameters


    if (filters) {
      queryParams.filters = filters;
    }
  }

  queryParams = helpers.cleanParams(queryParams);
  var queryString = qs.stringify(queryParams, {
    indices: false
  });
  return "".concat(serviceUrl, "/recommendations/v1/pods/").concat(podId, "?").concat(queryString);
}
/**
 * Interface to recommendations related API calls
 *
 * @module recommendations
 * @inner
 * @returns {object}
 */


var Recommendations = /*#__PURE__*/function () {
  function Recommendations(options) {
    _classCallCheck(this, Recommendations);

    this.options = options || {};
    this.eventDispatcher = new EventDispatcher(options.eventDispatcher);
  }
  /**
   * Get recommendations for supplied pod identifier
   *
   * @function getRecommendations
   * @param {string} podId - Pod identifier
   * @param {object} [parameters] - Additional parameters to refine results
   * @param {string|array} [parameters.itemIds] - Item ID(s) to retrieve recommendations for (strategy specific)
   * @param {number} [parameters.numResults] - The number of results to return
   * @param {string} [parameters.section] - The section to return results from
   * @param {string} [parameters.term] - The term to use to refine results (strategy specific)
   * @param {object} [parameters.filters] - Filters used to refine results (strategy specific)
   * @returns {Promise}
   * @see https://docs.constructor.io
   */


  _createClass(Recommendations, [{
    key: "getRecommendations",
    value: function getRecommendations(podId, parameters) {
      var _this = this;

      var requestUrl;
      var fetch = this.options && this.options.fetch || fetchPonyfill({
        Promise: Promise
      }).fetch;
      parameters = parameters || {};

      try {
        requestUrl = createRecommendationsUrl(podId, parameters, this.options);
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
              result.result_id = json.result_id;
            });
          }

          _this.eventDispatcher.queue('recommendations.getRecommendations.completed', json);

          return json;
        }

        throw new Error('getRecommendations response data is malformed');
      });
    }
  }]);

  return Recommendations;
}();

module.exports = Recommendations;