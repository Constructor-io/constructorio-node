'use strict';

var request = require('request'),
    url     = require('url')

var Client = function(config) {
  this.config = config
  this.baseUrl = url.format({ protocol: config.protocol, host: config.host, pathname: config.basePath })
}

Client.prototype = {
  get: function(path, params, callback) {
    request({
      method: 'GET',
      qs: this._serializeParams(uri.params),
      url: this._makeUrl(path),
      auth: this._makeAuthParams(),
    }, function(error, response, body) {
      if (error)
        return callback(error)
      else if (!(response.statusCode.toString().match(/2[\d]{2}/)))
        return callback(JSON.parse(response.body))
      else
        return callback(null, JSON.parse(response.body))
    })
  },

  post: function(path, params, callback) {
    request({
      method: 'POST',
      json: params,
      url: this._makeUrl(path),
      auth: this._makeAuthParams(),
    }, function(error, response, body) {
      if (error)
        return callback(error)
      else if (!(response.statusCode.toString().match(/2[\d]{2}/)))
        return callback(response.body)
      else
        return callback(null, response.body)
    })
  },

  put: function(path, params, callback) {
    request({
      method: 'PUT',
      json: params,
      url: this._makeUrl(path),
      auth: this._makeAuthParams(),
    }, function(error, response, body) {
      if (error)
        return callback(error)
      else if (!(response.statusCode.toString().match(/2[\d]{2}/)))
        return callback(response.body)
      else
        return callback(null, response.body)
    })
  },

  delete: function(path, params, callback) {
    request({
      method: 'DELETE',
      json: params,
      url: this._makeUrl(path),
      auth: this._makeAuthParams(),
    }, function(error, response, body) {
      if (error)
        return callback(error)
      else if (!(response.statusCode.toString().match(/2[\d]{2}/)))
        return callback(response.body)
      else
        return callback(null, response.body)
    })
  },

  _serializeParams: function(obj, prefix) {
    var str = [],
      isArray = Array.isArray(obj);

    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = "",
          v = obj[p];

        if (prefix) {
          k += prefix;
          k += "[";
          if (!isArray) {
            k += p;
          }
          k += "]";
        } else {
          k = p;
        }

        str.push(typeof v == "object" ? this._serializeParams(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
      }
    }
    return str.join("&");
  },

  _makeUrl: function(path) {
    return this.baseUrl + "/" + path + "?autocomplete_key=" + this.config.autocompleteKey;
  },

  _makeAuthParams: function() {
    return { user: this.config.apiToken + ":" }
  },
}

module.exports = Client;
