"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable class-methods-use-this */
var store = require('../utils/store');

var botList = require('./botlist');

var helpers = require('./helpers');

var storageKey = '_constructorio_is_human';
var humanEvents = ['scroll', 'resize', 'touchmove', 'mouseover', 'mousemove', 'keydown', 'keypress', 'keyup', 'focus'];

var HumanityCheck = /*#__PURE__*/function () {
  function HumanityCheck() {
    var _this = this;

    _classCallCheck(this, HumanityCheck);

    this.isHumanBoolean = !!store.session.get(storageKey) || false; // Humanity proved, remove handlers to prove humanity

    var remove = function remove() {
      _this.isHumanBoolean = true;
      store.session.set(storageKey, true);
      humanEvents.forEach(function (eventType) {
        helpers.removeEventListener(eventType, remove, true);
      });
    }; // Add handlers to prove humanity


    if (!this.isHumanBoolean) {
      humanEvents.forEach(function (eventType) {
        helpers.addEventListener(eventType, remove, true);
      });
    }
  } // Return boolean indicating if is human


  _createClass(HumanityCheck, [{
    key: "isHuman",
    value: function isHuman() {
      return this.isHumanBoolean || !!store.session.get(storageKey);
    } // Return boolean indicating if useragent matches botlist

  }, {
    key: "isBot",
    value: function isBot() {
      var _helpers$getNavigator = helpers.getNavigator(),
          userAgent = _helpers$getNavigator.userAgent,
          webdriver = _helpers$getNavigator.webdriver;

      var botRegex = new RegExp("(".concat(botList.join('|'), ")"));
      return Boolean(userAgent.match(botRegex)) || Boolean(webdriver);
    }
  }]);

  return HumanityCheck;
}();

module.exports = HumanityCheck;