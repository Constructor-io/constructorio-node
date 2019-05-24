

const request = require('request');
const url = require('url');

const Client = function (config) {
  this.config = config;
  this.baseUrl = url.format({ protocol: config.protocol, host: config.host, pathname: config.basePath });
};

Client.prototype = {
  get(path, qs_params, callback) {
    request({
      method: 'GET',
      qs: qs_params,
      url: this._makeUrl(path),
      auth: this._makeAuthParams(),
    }, (error, response, body) => {
      if (error) return callback(error);
      if (!(response.statusCode.toString().match(/2[\d]{2}/))) return callback(JSON.parse(response.body));
      return callback(null, JSON.parse(response.body));
    });
  },

  post(path, qs_params, json_params, callback) {
    request({
      method: 'POST',
      qs: qs_params,
      json: json_params,
      url: this._makeUrl(path),
      auth: this._makeAuthParams(),
    }, (error, response, body) => {
      if (error) return callback(error);
      if (!(response.statusCode.toString().match(/2[\d]{2}/))) return callback(response.body);
      return callback(null, response.body);
    });
  },

  put(path, qs_params, json_params, callback) {
    request({
      method: 'PUT',
      qs: qs_params,
      json: json_params,
      url: this._makeUrl(path),
      auth: this._makeAuthParams(),
    }, (error, response, body) => {
      if (error) return callback(error);
      if (!(response.statusCode.toString().match(/2[\d]{2}/))) return callback(response.body);
      return callback(null, response.body);
    });
  },

  delete(path, qs_params, json_params, callback) {
    request({
      method: 'DELETE',
      qs: qs_params,
      json: json_params,
      url: this._makeUrl(path),
      auth: this._makeAuthParams(),
    }, (error, response, body) => {
      if (error) return callback(error);
      if (!(response.statusCode.toString().match(/2[\d]{2}/))) return callback(response.body);
      return callback(null, response.body);
    });
  },

  _serializeParams(obj, prefix) {
    const str = [];
    const isArray = Array.isArray(obj);

    for (const p in obj) {
      if (obj.hasOwnProperty(p)) {
        let k = '';
        const v = obj[p];

        if (prefix) {
          k += prefix;
          k += '[';
          if (!isArray) {
            k += p;
          }
          k += ']';
        } else {
          k = p;
        }

        str.push(typeof v === 'object' ? this._serializeParams(v, k) : `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
      }
    }
    return str.join('&');
  },

  _makeUrl(path) {
    return `${this.baseUrl}/${path}?autocomplete_key=${this.config.autocompleteKey}`;
  },

  _makeAuthParams() {
    return { user: `${this.config.apiToken}:` };
  },
};

module.exports = Client;
