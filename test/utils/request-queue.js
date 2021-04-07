"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable brace-style, no-unneeded-ternary */
var fetchPonyfill = require('fetch-ponyfill');

var Promise = require('es6-promise');

var store = require('../utils/store');

var HumanityCheck = require('../utils/humanity-check');

var helpers = require('../utils/helpers');

var storageKey = '_constructorio_requests';

var RequestQueue = /*#__PURE__*/function () {
  function RequestQueue(options, eventemitter) {
    var _this = this;

    _classCallCheck(this, RequestQueue);

    this.options = options;
    this.eventemitter = eventemitter;
    this.humanity = new HumanityCheck();
    this.requestPending = false;
    this.pageUnloading = false;
    this.sendTrackingEvents = options && options.sendTrackingEvents === true ? true : false; // Defaults to 'false'
    // Mark if page environment is unloading

    helpers.addEventListener('beforeunload', function () {
      _this.pageUnloading = true;
    });

    if (this.sendTrackingEvents) {
      this.send();
    }
  } // Add request to queue to be dispatched


  _createClass(RequestQueue, [{
    key: "queue",
    value: function queue(url) {
      var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'GET';
      var body = arguments.length > 2 ? arguments[2] : undefined;

      if (this.sendTrackingEvents && !this.humanity.isBot()) {
        var queue = RequestQueue.get();
        queue.push({
          url: url,
          method: method,
          body: body
        });
        RequestQueue.set(queue);
      }
    } // Read from queue and send requests to server

  }, {
    key: "send",
    value: function send() {
      var _this2 = this;

      if (this.sendTrackingEvents) {
        // Defer sending of events to give beforeunload time to register (avoids race condition)
        setTimeout(function () {
          var fetch = _this2.options && _this2.options.fetch || fetchPonyfill({
            Promise: Promise
          }).fetch;
          var queue = RequestQueue.get();

          if (_this2.humanity.isHuman() && !_this2.requestPending && !_this2.pageUnloading && queue.length) {
            var request;
            var nextInQueue = queue.shift();
            RequestQueue.set(queue); // Backwards compatibility with versions <= 2.0.0, can be removed in future
            // - Request queue entries used to be strings with 'GET' method assumed

            if (typeof nextInQueue === 'string') {
              nextInQueue = {
                url: nextInQueue,
                method: 'GET'
              };
            }

            if (nextInQueue.method === 'GET') {
              request = fetch(nextInQueue.url);
            }

            if (nextInQueue.method === 'POST') {
              request = fetch(nextInQueue.url, {
                method: nextInQueue.method,
                body: JSON.stringify(nextInQueue.body),
                mode: 'cors',
                headers: {
                  'Content-Type': 'text/plain'
                }
              });
            }

            if (request) {
              _this2.requestPending = true;
              var instance = _this2;
              request.then(function (response) {
                // Request was successful, and returned a 2XX status code
                if (response.ok) {
                  instance.eventemitter.emit('success', {
                    url: nextInQueue.url,
                    method: nextInQueue.method,
                    message: 'ok'
                  });
                } // Request was successful, but returned a non-2XX status code
                else {
                    response.json().then(function (json) {
                      instance.eventemitter.emit('error', {
                        url: nextInQueue.url,
                        method: nextInQueue.method,
                        message: json && json.message
                      });
                    })["catch"](function (error) {
                      instance.eventemitter.emit('error', {
                        url: nextInQueue.url,
                        method: nextInQueue.method,
                        message: error.type
                      });
                    });
                  }
              })["catch"](function (error) {
                instance.eventemitter.emit('error', {
                  url: nextInQueue.url,
                  method: nextInQueue.method,
                  message: error.toString()
                });
              })["finally"](function () {
                _this2.requestPending = false;

                _this2.send();
              });
            }
          }
        }, this.options && this.options.trackingSendDelay || 25);
      }
    } // Return current request queue

  }], [{
    key: "get",
    value: function get() {
      return store.local.get(storageKey) || [];
    } // Update current request queue

  }, {
    key: "set",
    value: function set(queue) {
      store.local.set(storageKey, queue);
    }
  }]);

  return RequestQueue;
}();

module.exports = RequestQueue;