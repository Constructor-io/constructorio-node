"use strict";

/* eslint-disable no-param-reassign */
var qs = require('qs');

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
  isNil: function isNil(value) {
    return value == null;
  }
};
module.exports = utils;