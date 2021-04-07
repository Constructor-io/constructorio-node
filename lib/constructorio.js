"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable camelcase, no-unneeded-ternary */
var ConstructorioID = require('@constructor-io/constructorio-id'); // Modules


var Search = require('./modules/search');

var Browse = require('./modules/browse');

var Autocomplete = require('./modules/autocomplete');

var Recommendations = require('./modules/recommendations');

var Tracker = require('./modules/tracker');

var EventDispatcher = require('./utils/event-dispatcher');

var helpers = require('./utils/helpers');

var _require = require('../package.json'),
    packageVersion = _require.version;
/**
 * Class to instantiate the ConstructorIO client.
 */


var ConstructorIO = /*#__PURE__*/function () {
  /**
   * @param {string} apiKey - Constructor.io API key
   * @param {string} [serviceUrl='https://ac.cnstrc.com'] - API URL endpoint
   * @param {array} [segments] - User segments
   * @param {object} [testCells] - User test cells
   * @param {string} [clientId] - Client ID, defaults to value supplied by 'constructorio-id' module
   * @param {string} [sessionId] - Session id, defaults to value supplied by 'constructorio-id' module
   * @param {string} [userId] - User ID
   * @param {function} [fetch] - If supplied, will be utilized for requests rather than default Fetch API
   * @param {number} [trackingSendDelay=25] - Amount of time to wait before sending tracking events (in ms)
   * @param {boolean} [sendReferrerWithTrackingEvents=true] - Indicates if the referrer is sent with tracking events
   * @param {boolean} [sendTrackingEvents=false] - Indicates if tracking events should be dispatched
   * @param {object} [idOptions] - Options object to be supplied to 'constructorio-id' module
   * @param {object} [eventDispatcher] - Options related to 'EventDispatcher' class
   * @param {boolean} [eventDispatcher.enabled=true] - Determine if events should be dispatched
   * @param {boolean} [eventDispatcher.waitForBeacon=true] - Wait for beacon before dispatching events
   * @property {object} [search] - Interface to {@link module:search}
   * @property {object} [browse] - Interface to {@link module:browse}
   * @property {object} [autocomplete] - Interface to {@link module:autocomplete}
   * @property {object} [recommendations] - Interface to {@link module:recommendations}
   * @property {object} [tracker] - Interface to {@link module:tracker}
   * @returns {class}
   */
  function ConstructorIO() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ConstructorIO);

    var apiKey = options.apiKey,
        version = options.version,
        serviceUrl = options.serviceUrl,
        segments = options.segments,
        testCells = options.testCells,
        clientId = options.clientId,
        sessionId = options.sessionId,
        userId = options.userId,
        fetch = options.fetch,
        trackingSendDelay = options.trackingSendDelay,
        sendReferrerWithTrackingEvents = options.sendReferrerWithTrackingEvents,
        sendTrackingEvents = options.sendTrackingEvents,
        eventDispatcher = options.eventDispatcher,
        idOptions = options.idOptions,
        beaconMode = options.beaconMode;

    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('API key is a required parameter of type string');
    }

    var session_id;
    var client_id; // Initialize ID session (if within browser context)

    if (helpers.hasWindow()) {
      var _ConstructorioID = new ConstructorioID(idOptions || {});

      session_id = _ConstructorioID.session_id;
      client_id = _ConstructorioID.client_id;
    }

    this.options = {
      apiKey: apiKey,
      version: version || global.CLIENT_VERSION || "ciojs-client-".concat(packageVersion),
      serviceUrl: serviceUrl || 'https://ac.cnstrc.com',
      sessionId: sessionId || session_id,
      clientId: clientId || client_id,
      userId: userId,
      segments: segments,
      testCells: testCells,
      fetch: fetch,
      trackingSendDelay: trackingSendDelay,
      sendTrackingEvents: sendTrackingEvents,
      sendReferrerWithTrackingEvents: sendReferrerWithTrackingEvents,
      eventDispatcher: eventDispatcher,
      beaconMode: beaconMode === false ? false : true // Defaults to 'true',

    }; // Disable event dispatcher and tracking events if `window` not available

    if (!helpers.hasWindow()) {
      this.options.sendTrackingEvents = false;

      if (!this.options.eventDispatcher) {
        this.options.eventDispatcher = {};
      }

      this.options.eventDispatcher.enabled = false;
    } // Expose global modules


    this.search = new Search(this.options);
    this.browse = new Browse(this.options);
    this.autocomplete = new Autocomplete(this.options);
    this.recommendations = new Recommendations(this.options);
    this.tracker = new Tracker(this.options); // Dispatch initialization event

    new EventDispatcher(options.eventDispatcher).queue('instantiated', this.options);
  }
  /**
   * Sets the client options
   *
   * @param {string} apiKey - Constructor.io API key
   * @param {array} [segments] - User segments
   * @param {object} [testCells] - User test cells
   * @param {string} [userId] - User ID
   */


  _createClass(ConstructorIO, [{
    key: "setClientOptions",
    value: function setClientOptions(options) {
      if (Object.keys(options).length) {
        var apiKey = options.apiKey,
            segments = options.segments,
            testCells = options.testCells,
            userId = options.userId;

        if (apiKey) {
          this.options.apiKey = apiKey;
        }

        if (segments) {
          this.options.segments = segments;
        }

        if (testCells) {
          this.options.testCells = testCells;
        }

        if (userId) {
          this.options.userId = userId;
        }
      }
    }
  }]);

  return ConstructorIO;
}();

module.exports = ConstructorIO;