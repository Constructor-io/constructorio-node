'use strict';

var Client = require('./client');

var ConstructorIO = function(config) {
  this.config = {
    protocol: config.protocol || 'https',
    host: config.host || 'ac.cnstrc.com',
    basePath: '/v1',
    apiToken: config.apiToken,
    autocompleteKey: config.autocompleteKey
  };

  this.client = new Client(this.config);
}

ConstructorIO.prototype = {
  verify: function(callback) {
    this.client.get('verify', undefined, callback);
  },
  add: function(params, callback) {
    this.client.post('item', params, callback);
  },
  remove: function(params, callback) {
    this.client.delete('item', params, callback);
  },
  modify: function(params, callback) {
    this.client.put('item', params, callback);
  },

  track_search: function(params, callback) {
    this.client.post('search', params, callback);
  },
  track_click_through: function(params, callback) {
    this.client.post('click_through', params, callback);
  },
  track_conversion: function(params, callback) {
    this.client.post('conversion', params, callback);
  },
}

module.exports = ConstructorIO;
