/* eslint-disable no-param-reassign */
const qs = require('qs');

const utils = {
  ourEncodeURIComponent: (str) => {
    if (str) {
      const parsedStrObj = qs.parse(`s=${str.replace(/&/g, '%26')}`);

      parsedStrObj.s = parsedStrObj.s.replace(/\s/g, ' ');

      return qs.stringify(parsedStrObj).split('=')[1];
    }

    return null;
  },

  cleanParams: (paramsObj) => {
    const cleanedParams = {};

    Object.keys(paramsObj).forEach((paramKey) => {
      const paramValue = paramsObj[paramKey];

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

  throwHttpErrorFromResponse: (error, response) => response.json().then((json) => {
    error.message = json.message;
    error.status = response.status;
    error.statusText = response.statusText;
    error.url = response.url;
    error.headers = response.headers;

    throw error;
  }),

  isNil: value => value == null,

  // Create authorization header to be transmitted with requests
  createAuthHeader: (options) => {
    const { apiToken } = options;

    return { Authorization: `Basic ${Buffer.from(`${apiToken}:`).toString('base64')}` };
  },
};

module.exports = utils;
