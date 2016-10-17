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
    this.client.post('item', undefined, params, callback);
  },
  add_or_update: function(params, callback) {
    this.client.put('item', { force: 1 }, params, callback);
  },
  remove: function(params, callback) {
    this.client.delete('item', undefined, params, callback);
  },
  modify: function(params, callback) {
    this.client.put('item', undefined, params, callback);
  },
  add_batch: function(params, callback) {
    this.client.post('batch_items', undefined, params, callback);
  },
  add_or_update_batch: function(params, callback) {
    this.client.put('batch_items', { force: 1 }, params, callback);
  },
  remove_batch: function(params, callback) {
    this.client.delete('batch_items', undefined, params, callback);
  },

  track_search: function(params, callback) {
    this.client.post('search', undefined, params, callback);
  },
  track_click_through: function(params, callback) {
    this.client.post('click_through', undefined, params, callback);
  },
  track_conversion: function(params, callback) {
    this.client.post('conversion', undefined, params, callback);
  },
}

module.exports = ConstructorIO;
