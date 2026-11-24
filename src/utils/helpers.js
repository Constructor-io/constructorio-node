/* eslint-disable no-param-reassign */
const PII_REGEX = {
  email: /^[\w\-+\\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  phoneNumber: /^(?:\+\d{11,12}|\+\d{1,3}\s\d{3}\s\d{3}\s\d{3,4}|\(\d{3}\)\d{7}|\(\d{3}\)\s\d{3}\s\d{4}|\(\d{3}\)\d{3}-\d{4}|\(\d{3}\)\s\d{3}-\d{4})$/,
  creditCard: /^(?:4[0-9]{15}|(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})$/, // Visa, Mastercard, Amex, Discover, JCB and Diners Club, regex source: https://www.regular-expressions.info/creditcard.html
  // Add more PII REGEX
};

// The email pattern without its anchors, to find an email inside longer text like the JS SDK does.
// The lookbehind makes a match start only at the edge of a word, so long text is scanned in linear time.
const EMAIL_WITHIN_TEXT_REGEX = new RegExp(`(?<![\\w\\-+\\\\.])${PII_REGEX.email.source.slice(1, -1)}`, 'g');

// Splits a url into origin, path, query and hash without changing any of it
const URL_PARTS_REGEX = /^([a-z][a-z\d+.-]*:\/\/[^/?#]*)([^?#]*)(\?[^#]*)?(#[\s\S]*)?$/i;

// How many links inside links get parsed as urls, for example a login page's return_to link
const MAX_NESTED_URL_DEPTH = 3;

// Same placeholders as constructorio-client-javascript, keyed like PII_REGEX
const PII_PLACEHOLDERS = {
  email: '<email_omitted>',
  phoneNumber: '<phone_omitted>',
  creditCard: '<credit_omitted>',
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
    return !!utils.getPiiPlaceholder(query);
  },

  getPiiPlaceholder(value) {
    const normalizedValue = value.toLowerCase();
    const piiType = Object.keys(PII_REGEX).find((type) => PII_REGEX[type].test(normalizedValue));

    return piiType ? PII_PLACEHOLDERS[piiType] : null;
  },

  // Mask PII in a plain text value. An email is also masked when it sits inside longer text.
  maskPiiInText(text) {
    return utils.getPiiPlaceholder(text) || text.replace(EMAIL_WITHIN_TEXT_REGEX, PII_PLACEHOLDERS.email);
  },

  // Decode one raw url part with decodeURIComponent, which keeps a raw '+' like requestContainsPii does.
  // Mask it (as a url when it is one), and re-encode it only when it changed, so parts without PII
  // keep their exact encoding. A part that cannot be decoded is still masked as raw text.
  maskPiiInUrlPart(rawPart, depth) {
    let decodedPart;

    try {
      decodedPart = decodeURIComponent(rawPart);
    } catch (e) {
      const maskedRawPart = utils.maskPiiInText(rawPart);

      return maskedRawPart === rawPart ? rawPart : maskedRawPart.replace(/[<>]/g, encodeURIComponent);
    }

    const maskedPart = utils.maskPiiInUrl(decodedPart, depth + 1);

    return maskedPart === decodedPart ? rawPart : encodeURIComponent(maskedPart);
  },

  // Replace PII in each path segment and query value of a url with a placeholder.
  // Works on the raw string, so everything else in the url stays exactly as it was.
  // Links nested deeper than MAX_NESTED_URL_DEPTH are masked as plain text, so a crafted
  // referrer cannot overflow the stack.
  maskPiiInUrl(urlString, depth = 0) {
    const urlParts = depth <= MAX_NESTED_URL_DEPTH && urlString.match(URL_PARTS_REGEX);

    if (!urlParts) {
      return utils.maskPiiInText(urlString);
    }

    const [, origin, path, query = '', hash = ''] = urlParts;
    const maskedPath = path.replace(/[^/]+/g, (segment) => utils.maskPiiInUrlPart(segment, depth));
    const maskedQuery = query.replace(/=([^&]*)/g, (match, value) => `=${utils.maskPiiInUrlPart(value, depth)}`);

    return `${origin}${maskedPath}${maskedQuery}${hash}`;
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
  addHTTPSToString(url) {
    if (typeof url !== 'string') {
      return null;
    }

    const doesUrlIncludeHTTPS = url.startsWith('https://');
    const doesUrlStartWithHTTP = url.startsWith('http://');

    if (!doesUrlIncludeHTTPS && doesUrlStartWithHTTP) {
      return url.replace('http', 'https');
    }

    if (!doesUrlStartWithHTTP && !doesUrlIncludeHTTPS) {
      const urlWithHttps = `https://${url}`;

      return urlWithHttps;
    }

    return url;
  },

  getEmitError(instance, { url, method }) {
    return function emitError(message) {
      instance.eventemitter.emit('error', { url, method, message });
    };
  },
};

module.exports = utils;
