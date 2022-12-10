/* eslint-disable no-param-reassign */
const utils = {
  trimNonBreakingSpaces: (string) => string.replace(/\s/g, ' ').trim(),

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  encodeURIComponentRFC3986: (string) => encodeURIComponent(string).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`),

  cleanParams: (paramsObj) => {
    const cleanedParams = {};

    Object.keys(paramsObj).forEach((paramKey) => {
      const paramValue = paramsObj[paramKey];

      if (typeof paramValue === 'string') {
        // Replace non-breaking spaces (or any other type of spaces caught by the regex)
        // - with a regular white space
        cleanedParams[paramKey] = utils.trimNonBreakingSpaces(paramValue);
      } else {
        cleanedParams[paramKey] = paramValue;
      }
    });

    return cleanedParams;
  },

  toSnakeCase: (camelCasedStr) => camelCasedStr.replace(/[A-Z]/g, (prefix) => `_${prefix.toLowerCase()}`),

  toSnakeCaseKeys: (camelCasedObj, toRecurse = false) => {
    const snakeCasedObj = {};
    Object.keys(camelCasedObj).forEach((key) => {
      const newKey = utils.toSnakeCase(key);
      snakeCasedObj[newKey] = toRecurse && typeof camelCasedObj[key] === 'object'
        ? utils.toSnakeCaseKeys(camelCasedObj[key], toRecurse)
        : camelCasedObj[key];
    });
    return snakeCasedObj;
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
  // - Method call parameter takes precedence over global options parameter
  applyNetworkTimeout: (options = {}, networkParameters = {}, controller = undefined) => {
    const optionsTimeout = options && options.networkParameters && options.networkParameters.timeout;
    const networkParametersTimeout = networkParameters && networkParameters.timeout;
    const timeout = networkParametersTimeout || optionsTimeout;

    if (typeof timeout === 'number') {
      setTimeout(() => controller.abort(), timeout);
    }
  },

  // Combine headers from options and networkParameters
  // - Method call parameter takes precedence over global options parameter
  combineCustomHeaders: (options = {}, networkParameters = {}) => {
    const optionsHeaders = options && options.networkParameters && options.networkParameters.headers;
    const networkParametersHeaders = networkParameters && networkParameters.headers;

    return { ...optionsHeaders, ...networkParametersHeaders };
  },
};

module.exports = utils;
