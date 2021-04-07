"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable no-unneeded-ternary */
var helpers = require('../utils/helpers');

var EventDispatcher = /*#__PURE__*/function () {
  function EventDispatcher(options) {
    var _this = this;

    _classCallCheck(this, EventDispatcher);

    this.events = [];
    this.enabled = options && options.enabled === false ? false : true; // Defaults to 'true'

    this.waitForBeacon = options && options.waitForBeacon === false ? false : true; // Defaults to 'true'
    // `enabled` is a supplied option
    // - if false, events will never be dispatched
    // `active` is a variable determining if events will be dispatched
    // - if `waitForBeacon` is set to true, `active` will be false until beacon event is received

    this.active = this.enabled; // If `waitForBeacon` option is set, only enable event dispatching once event is received from beacon

    if (this.waitForBeacon) {
      this.active = false; // Check browser environment to determine if beacon has been loaded
      // - Important for the case where the beacon has loaded before client library instantiated

      if (helpers.hasWindow() && (window.ConstructorioAutocomplete || window.ConstructorioBeacon || window.ConstructorioTracker)) {
        if (this.enabled) {
          this.active = true;
          this.dispatchEvents();
        }
      } // Bind listener to beacon loaded event
      // - Important for the case where client library instantiated before beacon has loaded


      helpers.addEventListener('cio.beacon.loaded', function () {
        if (_this.enabled) {
          _this.active = true;

          _this.dispatchEvents();
        }
      });
    }
  } // Push event data to queue


  _createClass(EventDispatcher, [{
    key: "queue",
    value: function queue(name, data) {
      this.events.push({
        name: name,
        data: data
      });

      if (this.active) {
        this.dispatchEvents();
      }
    } // Dispatch all custom events within queue on `window` of supplied name with data

  }, {
    key: "dispatchEvents",
    value: function dispatchEvents() {
      while (this.events.length) {
        var item = this.events.shift();
        var name = item.name,
            data = item.data;
        var eventName = "cio.client.".concat(name);
        helpers.dispatchEvent(helpers.createCustomEvent(eventName, data));
      }
    }
  }]);

  return EventDispatcher;
}();

module.exports = EventDispatcher;