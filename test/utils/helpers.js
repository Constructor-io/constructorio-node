"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* eslint-disable no-param-reassign */
var qs = require('qs');

var CRC32 = require('crc-32');

var store = require('./store');

var purchaseEventStorageKey = '_constructorio_purchase_order_ids';
var utils = {
  ourEncodeURIComponent: function ourEncodeURIComponent(str) {
    if (str) {
      var parsedStrObj = qs.parse("s=".concat(str.replace(/&/g, '%26')));
      parsedStrObj.s = parsedStrObj.s.replace(/\s/g, ' ');
      return qs.stringify(parsedStrObj).split('=')[1];
    }

    return null;
  },
  cleanParams: function cleanParams(paramsObj) {
    var cleanedParams = {};
    Object.keys(paramsObj).forEach(function (paramKey) {
      var paramValue = paramsObj[paramKey];

      if (typeof paramValue === 'string') {
        // Replace non-breaking spaces (or any other type of spaces caught by the regex)
        // - with a regular white space
        cleanedParams[paramKey] = decodeURIComponent(utils.ourEncodeURIComponent(paramValue));
      } else {
        cleanedParams[paramKey] = paramValue;
      }
    });
    return cleanedParams;
  },
  throwHttpErrorFromResponse: function throwHttpErrorFromResponse(error, response) {
    return response.json().then(function (json) {
      error.message = json.message;
      error.status = response.status;
      error.statusText = response.statusText;
      error.url = response.url;
      error.headers = response.headers;
      throw error;
    });
  },
  hasWindow: function hasWindow() {
    return typeof window !== 'undefined';
  },
  addEventListener: function addEventListener(eventType, callback, useCapture) {
    if (utils.hasWindow()) {
      window.addEventListener(eventType, callback, useCapture);
    }
  },
  removeEventListener: function removeEventListener(eventType, callback, useCapture) {
    if (utils.hasWindow()) {
      window.removeEventListener(eventType, callback, useCapture);
    }
  },
  getNavigator: function getNavigator() {
    if (utils.hasWindow()) {
      return window.navigator;
    }

    return {
      userAgent: '',
      webdriver: false
    };
  },
  isNil: function isNil(value) {
    return value == null;
  },
  getWindowLocation: function getWindowLocation() {
    if (utils.hasWindow()) {
      return window.location;
    }

    return {};
  },
  dispatchEvent: function dispatchEvent(event) {
    if (utils.hasWindow()) {
      window.dispatchEvent(event);
    }
  },
  createCustomEvent: function createCustomEvent(eventName, detail) {
    if (utils.hasWindow()) {
      try {
        return new window.CustomEvent(eventName, {
          detail: detail
        });
      } catch (e) {
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(eventName, false, false, detail);
        return evt;
      }
    }

    return null;
  },
  hasOrderIdRecord: function hasOrderIdRecord(orderId) {
    var purchaseEventStorage = JSON.parse(store.session.get(purchaseEventStorageKey));
    var orderIdHash = CRC32.str(orderId.toString());

    if (purchaseEventStorage && purchaseEventStorage[orderIdHash]) {
      return true;
    }

    return null;
  },
  addOrderIdRecord: function addOrderIdRecord(orderId) {
    var purchaseEventStorage = JSON.parse(store.session.get(purchaseEventStorageKey));
    var orderIdHash = CRC32.str(orderId.toString());

    if (purchaseEventStorage) {
      // If the order already exists, do nothing
      if (purchaseEventStorage[orderIdHash]) {
        return;
      }

      purchaseEventStorage[orderIdHash] = true;
    } else {
      // Create a new object map for the order ids
      purchaseEventStorage = _defineProperty({}, orderIdHash, true);
    } // Push the order id map into session storage


    store.session.set(purchaseEventStorageKey, JSON.stringify(purchaseEventStorage));
  }
};
module.exports = utils;