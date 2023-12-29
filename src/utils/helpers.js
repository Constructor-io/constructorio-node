/* eslint-disable no-param-reassign */
const PII_REGEX = {
  email: /^[\w\-+\\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  phoneNumber: /^(?:\+\d{11,12}|\+\d{1,3}\s\d{3}\s\d{3}\s\d{3,4}|\(\d{3}\)\d{7}|\(\d{3}\)\s\d{3}\s\d{4}|\(\d{3}\)\d{3}-\d{4}|\(\d{3}\)\s\d{3}-\d{4})$/,
  creditCard: /^(?:4[0-9]{15}|(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/, // Visa, Mastercard, Amex, Discover, JCB and Diners Club, regex source: https://www.regular-expressions.info/creditcard.html
  // Add more PII REGEX
};

const utils = {
  // Replace non-breaking spaces (or any other type of spaces caught by the regex)
  // - with a regular white space
  normalizeSpaces: (string) => string.replace(/\s/g, ' '),

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
  encodeURIComponentRFC3986: (string) => encodeURIComponent(string).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`),

  cleanParams: (paramsObj) => {
    const cleanedParams = {};

    Object.keys(paramsObj).forEach((paramKey) => {
      const excludeTrimList = ['term', 'original_query', 'search_term'];
      const paramValue = paramsObj[paramKey];

      if (typeof paramValue === 'string') {
        cleanedParams[paramKey] = utils.normalizeSpaces(paramValue);

        if (!excludeTrimList.includes(paramKey)) {
          cleanedParams[paramKey] = cleanedParams[paramKey].trim();
        }
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
      snakeCasedObj[newKey] = toRecurse && typeof camelCasedObj[key] === 'object' && !Array.isArray(camelCasedObj[key])
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

  containsPii(query) {
    const piiRegex = Object.values(PII_REGEX);
    const normalizedQuery = query.toLowerCase();

    return piiRegex.some((regex) => regex.test(normalizedQuery));
  },

  requestContainsPii(urlString) {
    try {
      const url = new URL(urlString);
      const paths = decodeURIComponent(url?.pathname)?.split('/');
      const paramValues = decodeURIComponent(url?.search)?.split('&').map((param) => param?.split('=')?.[1]);

      if (paths.some((path) => utils.containsPii(path))) {
        return true;
      }

      if (paramValues.some((value) => utils.containsPii(value))) {
        return true;
      }
    } catch (e) {
      // do nothing
    }

    return false;
  },
};

module.exports = utils;
