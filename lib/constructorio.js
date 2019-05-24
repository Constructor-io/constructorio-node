

const Client = require('./client');

const ConstructorIO = function (config) {
  this.config = {
    protocol: config.protocol || 'https',
    host: config.host || 'ac.cnstrc.com',
    basePath: '/v1',
    apiToken: config.apiToken,
    autocompleteKey: config.autocompleteKey,
  };

  this.client = new Client(this.config);
};

ConstructorIO.prototype = {
  verify(callback) {
    this.client.get('verify', undefined, callback);
  },
  add(params, callback) {
    this.client.post('item', undefined, params, callback);
  },
  add_or_update(params, callback) {
    this.client.put('item', { force: 1 }, params, callback);
  },
  remove(params, callback) {
    this.client.delete('item', undefined, params, callback);
  },
  modify(params, callback) {
    this.client.put('item', undefined, params, callback);
  },
  add_batch(params, callback) {
    this.client.post('batch_items', undefined, params, callback);
  },
  add_or_update_batch(params, callback) {
    this.client.put('batch_items', { force: 1 }, params, callback);
  },
  remove_batch(params, callback) {
    this.client.delete('batch_items', undefined, params, callback);
  },

  track_search(params, callback) {
    this.client.post('search', undefined, params, callback);
  },
  track_click_through(params, callback) {
    this.client.post('click_through', undefined, params, callback);
  },
  track_conversion(params, callback) {
    this.client.post('conversion', undefined, params, callback);
  },
};

module.exports = ConstructorIO;
