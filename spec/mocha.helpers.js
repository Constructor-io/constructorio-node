/* eslint-disable import/no-unresolved */
const fs = require('fs');
const path = require('path');
const qs = require('qs');

// Read a vendored catalog fixture as a buffer
const readCatalogFixture = (name) => fs.readFileSync(path.join(__dirname, 'fixtures', name));

// Extract query parameters as object from url
const extractUrlParamsFromFetch = (fetch) => {
  const lastCallArguments = fetch && fetch.args && fetch.args[fetch.args.length - 1];
  const url = lastCallArguments && lastCallArguments[0];
  const urlSplit = url && url.split('?');

  if (urlSplit && urlSplit[1]) {
    return qs.parse(urlSplit[1]);
  }

  return null;
};

// Extract body parameters as object from request
const extractBodyParamsFromFetch = (fetch) => {
  const lastCallArguments = fetch && fetch.args && fetch.args[fetch.args.length - 1];
  const requestData = lastCallArguments[1];
  const { body } = requestData;

  if (body) {
    return JSON.parse(body);
  }

  return null;
};

// Extract headers as object from request
const extractHeadersFromFetch = (fetch) => {
  const lastCallArguments = fetch && fetch.args && fetch.args[fetch.args.length - 1];
  const requestData = lastCallArguments[1];
  const { headers } = requestData || {};

  if (headers) {
    return headers;
  }

  return null;
};

// Extract request URL as string from request
const extractUrlFromFetch = (fetch) => {
  const lastCallArguments = fetch && fetch.args && fetch.args[fetch.args.length - 1];
  const requestUrl = lastCallArguments[0];

  if (requestUrl) {
    return requestUrl;
  }

  return null;
};

module.exports = {
  readCatalogFixture,
  extractUrlParamsFromFetch,
  extractBodyParamsFromFetch,
  extractHeadersFromFetch,
  extractUrlFromFetch,
};
