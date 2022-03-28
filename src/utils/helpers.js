/* eslint-disable no-param-reassign */
const utils = {
  ourEncodeURIComponent: (str) => {
    let newStr;
    const encodingMap = {
      '*': '%2A',
      '!': '%21',
      "'": '%27',
      '(': '%28',
      ')': '%29',
    };

    if (str && typeof str === 'string') {
      // Trim trailing space and replace non-breaking spaces with a regular white space
      newStr = str.trim().replace(/(\s)/g, ' ');

      // Run through URI encoder
      newStr = encodeURIComponent(newStr);

      // Encode rest of special characters not handled by `encodeURIComponent`
      Object.keys(encodingMap).forEach((encoding) => {
        newStr = newStr.replace(new RegExp(`\\${encoding}`, 'g'), encodingMap[encoding]);
      });

      return newStr;
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
    const optionsTimeout = options && options.networkParameters && options.networkParameters.timeout;
    const networkParametersTimeout = networkParameters && networkParameters.timeout;
    const timeout = optionsTimeout || networkParametersTimeout;

    if (typeof timeout === 'number') {
      setTimeout(() => controller.abort(), timeout);
    }
  },
};

module.exports = utils;
