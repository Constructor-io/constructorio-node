"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable object-curly-newline, no-underscore-dangle, camelcase, no-unneeded-ternary */
var qs = require('qs');

var EventEmitter = require('events');

var helpers = require('../utils/helpers');

var RequestQueue = require('../utils/request-queue');

function applyParams(parameters, options) {
  var apiKey = options.apiKey,
      version = options.version,
      sessionId = options.sessionId,
      clientId = options.clientId,
      userId = options.userId,
      segments = options.segments,
      testCells = options.testCells,
      requestMethod = options.requestMethod,
      beaconMode = options.beaconMode;

  var _helpers$getWindowLoc = helpers.getWindowLocation(),
      host = _helpers$getWindowLoc.host,
      pathname = _helpers$getWindowLoc.pathname;

  var sendReferrerWithTrackingEvents = options.sendReferrerWithTrackingEvents === false ? false : true; // Defaults to 'true'

  var aggregateParams = Object.assign(parameters);

  if (version) {
    aggregateParams.c = version;
  }

  if (clientId) {
    aggregateParams.i = clientId;
  }

  if (sessionId) {
    aggregateParams.s = sessionId;
  }

  if (userId) {
    aggregateParams.ui = userId;
  }

  if (segments && segments.length) {
    aggregateParams.us = segments;
  }

  if (apiKey) {
    aggregateParams.key = apiKey;
  }

  if (testCells) {
    Object.keys(testCells).forEach(function (testCellKey) {
      aggregateParams["ef-".concat(testCellKey)] = testCells[testCellKey];
    });
  }

  if (beaconMode && requestMethod && requestMethod.match(/POST/i)) {
    aggregateParams.beacon = true;
  }

  if (sendReferrerWithTrackingEvents && host) {
    aggregateParams.origin_referrer = host;

    if (pathname) {
      aggregateParams.origin_referrer += pathname;
    }
  }

  aggregateParams._dt = Date.now();
  aggregateParams = helpers.cleanParams(aggregateParams);
  return aggregateParams;
} // Append common parameters to supplied parameters object and return as string


function applyParamsAsString(parameters, options) {
  return qs.stringify(applyParams(parameters, options), {
    indices: false
  });
}
/**
 * Interface to tracking related API calls
 *
 * @module tracker
 * @inner
 * @returns {object}
 */


var Tracker = /*#__PURE__*/function () {
  function Tracker(options) {
    _classCallCheck(this, Tracker);

    this.options = options || {};
    this.eventemitter = new EventEmitter();
    this.requests = new RequestQueue(options, this.eventemitter);
  }
  /**
   * Send session start event to API
   *
   * @function trackSessionStart
   * @returns {(true|Error)}
   */


  _createClass(Tracker, [{
    key: "trackSessionStart",
    value: function trackSessionStart() {
      var url = "".concat(this.options.serviceUrl, "/behavior?");
      var queryParams = {
        action: 'session_start'
      };
      this.requests.queue("".concat(url).concat(applyParamsAsString(queryParams, this.options)));
      this.requests.send();
      return true;
    }
    /**
     * Send input focus event to API
     *
     * @function trackInputFocus
     * @returns {(true|Error)}
     */

  }, {
    key: "trackInputFocus",
    value: function trackInputFocus() {
      var url = "".concat(this.options.serviceUrl, "/behavior?");
      var queryParams = {
        action: 'focus'
      };
      this.requests.queue("".concat(url).concat(applyParamsAsString(queryParams, this.options)));
      this.requests.send();
      return true;
    }
    /**
     * Send autocomplete select event to API
     *
     * @function trackAutocompleteSelect
     * @param {string} term - Term of selected autocomplete item
     * @param {object} parameters - Additional parameters to be sent with request
     * @param {string} parameters.original_query - The current autocomplete search query
     * @param {string} parameters.result_id - Customer id of the selected autocomplete item
     * @param {string} parameters.section - Section the selected item resides within
     * @param {string} [parameters.tr] - Trigger used to select the item (click, etc.)
     * @param {string} [parameters.group_id] - Group identifier of selected item
     * @param {string} [parameters.display_name] - Display name of group of selected item
     * @returns {(true|Error)}
     */

  }, {
    key: "trackAutocompleteSelect",
    value: function trackAutocompleteSelect(term, parameters) {
      // Ensure term is provided (required)
      if (term && typeof term === 'string') {
        // Ensure parameters are provided (required)
        if (parameters && _typeof(parameters) === 'object' && !Array.isArray(parameters)) {
          var url = "".concat(this.options.serviceUrl, "/autocomplete/").concat(helpers.ourEncodeURIComponent(term), "/select?");
          var queryParams = {};
          var original_query = parameters.original_query,
              result_id = parameters.result_id,
              section = parameters.section,
              original_section = parameters.original_section,
              tr = parameters.tr,
              group_id = parameters.group_id,
              display_name = parameters.display_name;

          if (original_query) {
            queryParams.original_query = original_query;
          }

          if (tr) {
            queryParams.tr = tr;
          }

          if (original_section || section) {
            queryParams.section = original_section || section;
          }

          if (group_id) {
            queryParams.group = {
              group_id: group_id,
              display_name: display_name
            };
          }

          if (result_id) {
            queryParams.result_id = result_id;
          }

          this.requests.queue("".concat(url).concat(applyParamsAsString(queryParams, this.options)));
          this.requests.send();
          return true;
        }

        this.requests.send();
        return new Error('parameters are required of type object');
      }

      this.requests.send();
      return new Error('term is a required parameter of type string');
    }
    /**
     * Send autocomplete search event to API
     *
     * @function trackSearchSubmit
     * @param {string} term - Term of submitted autocomplete event
     * @param {object} parameters - Additional parameters to be sent with request
     * @param {string} parameters.original_query - The current autocomplete search query
     * @param {string} parameters.result_id - Customer ID of the selected autocomplete item
     * @param {string} [parameters.group_id] - Group identifier of selected item
     * @param {string} [parameters.display_name] - Display name of group of selected item
     * @returns {(true|Error)}
     */

  }, {
    key: "trackSearchSubmit",
    value: function trackSearchSubmit(term, parameters) {
      // Ensure term is provided (required)
      if (term && typeof term === 'string') {
        // Ensure parameters are provided (required)
        if (parameters && _typeof(parameters) === 'object' && !Array.isArray(parameters)) {
          var url = "".concat(this.options.serviceUrl, "/autocomplete/").concat(helpers.ourEncodeURIComponent(term), "/search?");
          var queryParams = {};
          var original_query = parameters.original_query,
              result_id = parameters.result_id,
              group_id = parameters.group_id,
              display_name = parameters.display_name;

          if (original_query) {
            queryParams.original_query = original_query;
          }

          if (group_id) {
            queryParams.group = {
              group_id: group_id,
              display_name: display_name
            };
          }

          if (result_id) {
            queryParams.result_id = result_id;
          }

          this.requests.queue("".concat(url).concat(applyParamsAsString(queryParams, this.options)));
          this.requests.send();
          return true;
        }

        this.requests.send();
        return new Error('parameters are required of type object');
      }

      this.requests.send();
      return new Error('term is a required parameter of type string');
    }
    /**
     * Send search results event to API
     *
     * @function trackSearchResultsLoaded
     * @param {string} term - Search results query term
     * @param {object} parameters - Additional parameters to be sent with request
     * @param {number} parameters.num_results - Number of search results in total
     * @param {array} [parameters.customer_ids] - List of customer item id's returned from search
     * @returns {(true|Error)}
     */

  }, {
    key: "trackSearchResultsLoaded",
    value: function trackSearchResultsLoaded(term, parameters) {
      // Ensure term is provided (required)
      if (term && typeof term === 'string') {
        // Ensure parameters are provided (required)
        if (parameters && _typeof(parameters) === 'object' && !Array.isArray(parameters)) {
          var url = "".concat(this.options.serviceUrl, "/behavior?");
          var queryParams = {
            action: 'search-results',
            term: term
          };
          var num_results = parameters.num_results,
              customer_ids = parameters.customer_ids;

          if (!helpers.isNil(num_results)) {
            queryParams.num_results = num_results;
          }

          if (customer_ids && Array.isArray(customer_ids)) {
            queryParams.customer_ids = customer_ids.join(',');
          }

          this.requests.queue("".concat(url).concat(applyParamsAsString(queryParams, this.options)));
          this.requests.send();
          return true;
        }

        this.requests.send();
        return new Error('parameters are required of type object');
      }

      this.requests.send();
      return new Error('term is a required parameter of type string');
    }
    /**
     * Send click through event to API
     *
     * @function trackSearchResultClick
     * @param {string} term - Search results query term
     * @param {object} parameters - Additional parameters to be sent with request
     * @param {string} parameters.name - Identifier
     * @param {string} parameters.customer_id - Customer id
     * @param {string} [parameters.result_id] - Result id
     * @returns {(true|Error)}
     */

  }, {
    key: "trackSearchResultClick",
    value: function trackSearchResultClick(term, parameters) {
      // Ensure term is provided (required)
      if (term && typeof term === 'string') {
        // Ensure parameters are provided (required)
        if (parameters && _typeof(parameters) === 'object' && !Array.isArray(parameters)) {
          var url = "".concat(this.options.serviceUrl, "/autocomplete/").concat(helpers.ourEncodeURIComponent(term), "/click_through?");
          var queryParams = {};
          var name = parameters.name,
              customer_id = parameters.customer_id,
              variation_id = parameters.variation_id,
              result_id = parameters.result_id;

          if (name) {
            queryParams.name = name;
          }

          if (customer_id) {
            queryParams.customer_id = customer_id;
          }

          if (variation_id) {
            queryParams.variation_id = variation_id;
          }

          if (result_id) {
            queryParams.result_id = result_id;
          }

          this.requests.queue("".concat(url).concat(applyParamsAsString(queryParams, this.options)));
          this.requests.send();
          return true;
        }

        this.requests.send();
        return new Error('parameters are required of type object');
      }

      this.requests.send();
      return new Error('term is a required parameter of type string');
    }
    /**
     * Send conversion event to API
     *
     * @function trackConversion
     * @param {string} term - Search results query term
     * @param {object} parameters - Additional parameters to be sent with request
     * @param {string} parameters.name - Identifier
     * @param {string} parameters.customer_id - Customer id
     * @param {string} parameters.revenue - Revenue
     * @param {string} [parameters.variation_id] - Variation id
     * @param {string} [parameters.section] - Autocomplete section
     * @param {string} [parameters.result_id] - Result id
     * @returns {(true|Error)}
     */

  }, {
    key: "trackConversion",
    value: function trackConversion(term, parameters) {
      // Ensure parameters are provided (required)
      if (parameters && _typeof(parameters) === 'object' && !Array.isArray(parameters)) {
        var searchTerm = helpers.ourEncodeURIComponent(term) || 'TERM_UNKNOWN';
        var url = "".concat(this.options.serviceUrl, "/autocomplete/").concat(searchTerm, "/conversion?");
        var queryParams = {};
        var name = parameters.name,
            customer_id = parameters.customer_id,
            variation_id = parameters.variation_id,
            result_id = parameters.result_id,
            revenue = parameters.revenue,
            section = parameters.section;

        if (name) {
          queryParams.name = name;
        }

        if (customer_id) {
          queryParams.customer_id = customer_id;
        }

        if (variation_id) {
          queryParams.variation_id = variation_id;
        }

        if (result_id) {
          queryParams.result_id = result_id;
        }

        if (revenue) {
          queryParams.revenue = revenue;
        }

        if (section) {
          queryParams.section = section;
        } else {
          queryParams.section = 'Products';
        }

        this.requests.queue("".concat(url).concat(applyParamsAsString(queryParams, this.options)));
        this.requests.send();
        return true;
      }

      this.requests.send();
      return new Error('parameters are required of type object');
    }
    /**
     * Send purchase event to API
     *
     * @function trackPurchase
     * @param {object} parameters - Additional parameters to be sent with request
     * @param {array} parameters.items - List of objects of customer items returned from browse
     * @param {number} parameters.revenue - Revenue
     * @param {string} [parameters.order_id] - Customer unique order identifier
     * @param {string} [parameters.section] - Autocomplete section
     * @returns {(true|Error)}
     */

  }, {
    key: "trackPurchase",
    value: function trackPurchase(parameters) {
      // Ensure parameters are provided (required)
      if (parameters && _typeof(parameters) === 'object' && !Array.isArray(parameters)) {
        var requestPath = "".concat(this.options.serviceUrl, "/v2/behavioral_action/purchase?");
        var queryParams = {};
        var bodyParams = {};
        var items = parameters.items,
            revenue = parameters.revenue,
            order_id = parameters.order_id,
            section = parameters.section;

        if (order_id) {
          // Don't send another purchase event if we have already tracked the order
          if (helpers.hasOrderIdRecord(order_id)) {
            return false;
          }

          helpers.addOrderIdRecord(order_id); // Add order_id to the tracking params

          bodyParams.order_id = order_id;
        }

        if (items && Array.isArray(items)) {
          bodyParams.items = items;
        }

        if (revenue) {
          bodyParams.revenue = revenue;
        }

        if (section) {
          queryParams.section = section;
        } else {
          queryParams.section = 'Products';
        }

        var requestURL = "".concat(requestPath).concat(applyParamsAsString(queryParams, this.options));
        var requestMethod = 'POST';
        var requestBody = applyParams(bodyParams, _objectSpread(_objectSpread({}, this.options), {}, {
          requestMethod: requestMethod
        }));
        this.requests.queue(requestURL, requestMethod, requestBody);
        this.requests.send();
        return true;
      }

      this.requests.send();
      return new Error('parameters are required of type object');
    }
    /**
     * Send recommendation view event to API
     *
     * @function trackRecommendationView
     * @param {object} parameters - Additional parameters to be sent with request
     * @param {number} [parameters.result_count] - Number of results displayed
     * @param {number} [parameters.result_page] - Page number of results
     * @param {string} [parameters.result_id] - Result identifier
     * @param {string} [parameters.section="Products"] - Results section
     * @param {string} parameters.url - Current page URL
     * @param {string} parameters.pod_id - Pod identifier
     * @param {number} parameters.num_results_viewed - Number of results viewed
     * @returns {(true|Error)}
     */

  }, {
    key: "trackRecommendationView",
    value: function trackRecommendationView(parameters) {
      // Ensure parameters are provided (required)
      if (parameters && _typeof(parameters) === 'object' && !Array.isArray(parameters)) {
        var requestPath = "".concat(this.options.serviceUrl, "/v2/behavioral_action/recommendation_result_view?");
        var bodyParams = {};
        var result_count = parameters.result_count,
            result_page = parameters.result_page,
            result_id = parameters.result_id,
            section = parameters.section,
            url = parameters.url,
            pod_id = parameters.pod_id,
            num_results_viewed = parameters.num_results_viewed;

        if (!helpers.isNil(result_count)) {
          bodyParams.result_count = result_count;
        }

        if (!helpers.isNil(result_page)) {
          bodyParams.result_page = result_page;
        }

        if (result_id) {
          bodyParams.result_id = result_id;
        }

        if (section) {
          bodyParams.section = section;
        } else {
          bodyParams.section = 'Products';
        }

        if (url) {
          bodyParams.url = url;
        }

        if (pod_id) {
          bodyParams.pod_id = pod_id;
        }

        if (!helpers.isNil(num_results_viewed)) {
          bodyParams.num_results_viewed = num_results_viewed;
        }

        var requestURL = "".concat(requestPath).concat(applyParamsAsString({}, this.options));
        var requestMethod = 'POST';
        var requestBody = applyParams(bodyParams, _objectSpread(_objectSpread({}, this.options), {}, {
          requestMethod: requestMethod
        }));
        this.requests.queue(requestURL, requestMethod, requestBody);
        this.requests.send();
        return true;
      }

      this.requests.send();
      return new Error('parameters are required of type object');
    }
    /**
     * Send recommendation click event to API
     *
     * @function trackRecommendationClick
     * @param {object} parameters - Additional parameters to be sent with request
     * @param {string} [parameters.variation_id] - Variation identifier
     * @param {string} [parameters.section="Products"] - Results section
     * @param {string} [parameters.result_id] - Result identifier
     * @param {number} [parameters.result_count] - Number of results displayed
     * @param {number} [parameters.result_page] - Page number of results
     * @param {number} [parameters.result_position_on_page] - Position of result on page
     * @param {number} [parameters.num_results_per_page] - Number of results on page
     * @param {string} parameters.pod_id - Pod identifier
     * @param {string} parameters.strategy_id - Strategy identifier
     * @param {string} parameters.item_id - Identifier of clicked item
     * @returns {(true|Error)}
     */

  }, {
    key: "trackRecommendationClick",
    value: function trackRecommendationClick(parameters) {
      // Ensure parameters are provided (required)
      if (parameters && _typeof(parameters) === 'object' && !Array.isArray(parameters)) {
        var requestPath = "".concat(this.options.serviceUrl, "/v2/behavioral_action/recommendation_result_click?");
        var bodyParams = {};
        var variation_id = parameters.variation_id,
            section = parameters.section,
            result_id = parameters.result_id,
            result_count = parameters.result_count,
            result_page = parameters.result_page,
            result_position_on_page = parameters.result_position_on_page,
            num_results_per_page = parameters.num_results_per_page,
            pod_id = parameters.pod_id,
            strategy_id = parameters.strategy_id,
            item_id = parameters.item_id;

        if (variation_id) {
          bodyParams.variation_id = variation_id;
        }

        if (section) {
          bodyParams.section = section;
        } else {
          bodyParams.section = 'Products';
        }

        if (result_id) {
          bodyParams.result_id = result_id;
        }

        if (!helpers.isNil(result_count)) {
          bodyParams.result_count = result_count;
        }

        if (!helpers.isNil(result_page)) {
          bodyParams.result_page = result_page;
        }

        if (!helpers.isNil(result_position_on_page)) {
          bodyParams.result_position_on_page = result_position_on_page;
        }

        if (!helpers.isNil(num_results_per_page)) {
          bodyParams.num_results_per_page = num_results_per_page;
        }

        if (pod_id) {
          bodyParams.pod_id = pod_id;
        }

        if (strategy_id) {
          bodyParams.strategy_id = strategy_id;
        }

        if (item_id) {
          bodyParams.item_id = item_id;
        }

        var requestURL = "".concat(requestPath).concat(applyParamsAsString({}, this.options));
        var requestMethod = 'POST';
        var requestBody = applyParams(bodyParams, _objectSpread(_objectSpread({}, this.options), {}, {
          requestMethod: requestMethod
        }));
        this.requests.queue(requestURL, requestMethod, requestBody);
        this.requests.send();
        return true;
      }

      this.requests.send();
      return new Error('parameters are required of type object');
    }
    /**
     * Send browse results loaded event to API
     *
     * @function trackBrowseResultsLoaded
     * @param {object} parameters - Additional parameters to be sent with request
     * @param {string} [parameters.section="Products"] - Results section
     * @param {number} [parameters.result_count] - Number of results displayed
     * @param {number} [parameters.result_page] - Page number of results
     * @param {string} [parameters.result_id] - Result identifier
     * @param {string} [parameters.selected_filters] -  Selected filters
     * @param {string} [parameters.sort_order] - Sort order ('ascending' or 'descending')
     * @param {string} [parameters.sort_by] - Sorting method
     * @param {array} [parameters.items] - List of objects of customer items returned from browse
     * @param {string} parameters.url - Current page URL
     * @param {string} parameters.filter_name - Filter name
     * @param {string} parameters.filter_value - Filter value
     * @returns {(true|Error)}
     */

  }, {
    key: "trackBrowseResultsLoaded",
    value: function trackBrowseResultsLoaded(parameters) {
      // Ensure parameters are provided (required)
      if (parameters && _typeof(parameters) === 'object' && !Array.isArray(parameters)) {
        var requestPath = "".concat(this.options.serviceUrl, "/v2/behavioral_action/browse_result_load?");
        var bodyParams = {};
        var section = parameters.section,
            result_count = parameters.result_count,
            result_page = parameters.result_page,
            result_id = parameters.result_id,
            selected_filters = parameters.selected_filters,
            url = parameters.url,
            sort_order = parameters.sort_order,
            sort_by = parameters.sort_by,
            filter_name = parameters.filter_name,
            filter_value = parameters.filter_value,
            items = parameters.items;

        if (section) {
          bodyParams.section = section;
        } else {
          bodyParams.section = 'Products';
        }

        if (!helpers.isNil(result_count)) {
          bodyParams.result_count = result_count;
        }

        if (!helpers.isNil(result_page)) {
          bodyParams.result_page = result_page;
        }

        if (result_id) {
          bodyParams.result_id = result_id;
        }

        if (selected_filters) {
          bodyParams.selected_filters = selected_filters;
        }

        if (url) {
          bodyParams.url = url;
        }

        if (sort_order) {
          bodyParams.sort_order = sort_order;
        }

        if (sort_by) {
          bodyParams.sort_by = sort_by;
        }

        if (filter_name) {
          bodyParams.filter_name = filter_name;
        }

        if (filter_value) {
          bodyParams.filter_value = filter_value;
        }

        if (items && Array.isArray(items)) {
          bodyParams.items = items;
        }

        var requestURL = "".concat(requestPath).concat(applyParamsAsString({}, this.options));
        var requestMethod = 'POST';
        var requestBody = applyParams(bodyParams, _objectSpread(_objectSpread({}, this.options), {}, {
          requestMethod: requestMethod
        }));
        this.requests.queue(requestURL, requestMethod, requestBody);
        this.requests.send();
        return true;
      }

      this.requests.send();
      return new Error('parameters are required of type object');
    }
    /**
     * Send browse result click event to API
     *
     * @function trackBrowseResultClick
     * @param {object} parameters - Additional parameters to be sent with request
     * @param {string} [parameters.section="Products"] - Results section
     * @param {string} [parameters.variation_id] - Variation ID of clicked item
     * @param {string} [parameters.result_id] - Result identifier
     * @param {number} [parameters.result_count] - Number of results displayed
     * @param {number} [parameters.result_page] - Page number of results
     * @param {number} [parameters.result_position_on_page] - Position of clicked item
     * @param {number} [parameters.num_results_per_page] - Number of results shown
     * @param {string} [parameters.selected_filters] -  Selected filters
     * @param {string} parameters.filter_name - Filter name
     * @param {string} parameters.filter_value - Filter value
     * @param {string} parameters.item_id - ID of clicked item
     * @returns {(true|Error)}
     */

  }, {
    key: "trackBrowseResultClick",
    value: function trackBrowseResultClick(parameters) {
      // Ensure parameters are provided (required)
      if (parameters && _typeof(parameters) === 'object' && !Array.isArray(parameters)) {
        var requestPath = "".concat(this.options.serviceUrl, "/v2/behavioral_action/browse_result_click?");
        var bodyParams = {};
        var section = parameters.section,
            variation_id = parameters.variation_id,
            result_id = parameters.result_id,
            result_count = parameters.result_count,
            result_page = parameters.result_page,
            result_position_on_page = parameters.result_position_on_page,
            num_results_per_page = parameters.num_results_per_page,
            selected_filters = parameters.selected_filters,
            filter_name = parameters.filter_name,
            filter_value = parameters.filter_value,
            item_id = parameters.item_id;

        if (section) {
          bodyParams.section = section;
        } else {
          bodyParams.section = 'Products';
        }

        if (variation_id) {
          bodyParams.variation_id = variation_id;
        }

        if (result_id) {
          bodyParams.result_id = result_id;
        }

        if (!helpers.isNil(result_count)) {
          bodyParams.result_count = result_count;
        }

        if (!helpers.isNil(result_page)) {
          bodyParams.result_page = result_page;
        }

        if (!helpers.isNil(result_position_on_page)) {
          bodyParams.result_position_on_page = result_position_on_page;
        }

        if (!helpers.isNil(num_results_per_page)) {
          bodyParams.num_results_per_page = num_results_per_page;
        }

        if (selected_filters) {
          bodyParams.selected_filters = selected_filters;
        }

        if (filter_name) {
          bodyParams.filter_name = filter_name;
        }

        if (filter_value) {
          bodyParams.filter_value = filter_value;
        }

        if (item_id) {
          bodyParams.item_id = item_id;
        }

        var requestURL = "".concat(requestPath).concat(applyParamsAsString({}, this.options));
        var requestMethod = 'POST';
        var requestBody = applyParams(bodyParams, _objectSpread(_objectSpread({}, this.options), {}, {
          requestMethod: requestMethod
        }));
        this.requests.queue(requestURL, requestMethod, requestBody);
        this.requests.send();
        return true;
      }

      this.requests.send();
      return new Error('parameters are required of type object');
    }
    /**
     * Subscribe to success or error messages emitted by tracking requests
     *
     * @function on
     * @param {string} messageType - Type of message to listen for ('success' or 'error')
     * @param {function} callback - Callback to be invoked when message received
     * @returns {(true|Error)}
     */

  }, {
    key: "on",
    value: function on(messageType, callback) {
      if (messageType !== 'success' && messageType !== 'error') {
        return new Error('messageType must be a string of value "success" or "error"');
      }

      if (!callback || typeof callback !== 'function') {
        return new Error('callback is required and must be a function');
      }

      this.eventemitter.on(messageType, callback);
      return true;
    }
  }]);

  return Tracker;
}();

module.exports = Tracker;