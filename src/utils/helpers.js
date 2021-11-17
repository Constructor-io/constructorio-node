/* eslint-disable no-param-reassign */
const qs = require('qs');

const utils = {
  ourEncodeURIComponent: (str) => {
    if (str && typeof str === 'string') {
      const cleanedString = str
        .replace(/\[/g, '%5B') // Replace [
        .replace(/\]/g, '%5D') // Replace ]
        .replace(/&/g, '%26'); // Replace &
      const trimmedCleanedString = cleanedString.trim();
      const parsedStrObj = qs.parse(`s=${trimmedCleanedString}`);

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

  isNil: (value) => value == null,

  // Create authorization header to be transmitted with requests
  createAuthHeader: (options) => {
    const { apiToken } = options;

    return { Authorization: `Basic ${Buffer.from(`${apiToken}:`).toString('base64')}` };
  },

  // Abort network request based on supplied timeout interval (in milliseconds)
  // - method call parameter takes precedence over global options parameter
  applyNetworkTimeout: (options = {}, networkParameters = {}, controller = undefined) => {
    const timeout = options.networkParameters.timeout || networkParameters.timeout;

    if (typeof timeout === 'number') {
      setTimeout(() => controller.abort(), timeout);
    }
  },
};

module.exports = utils;
