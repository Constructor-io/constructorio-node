const request = require('request');

/**
 * @description Handle responses to requests
 */
function handleServerResponse(error, response, callback) {
  const statusCode = response && response.statusCode.toString();
  let body = response && response.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  if (error) {
    callback(error);
  } else if (!statusCode.match(/2[\d]{2}/)) {
    callback(body);
  } else if (body) {
    callback(undefined, body);
  } else {
    callback();
  }
}

/**
 * @description Creates a constructor.io Client.
 */
function ConstructorIO(config) {
  this.config = {
    protocol: config.protocol || 'https',
    host: config.host || 'ac.cnstrc.com',
    basePath: '/v1',
    apiToken: config.apiToken,
    apiKey: config.apiKey,
  };
}

ConstructorIO.prototype = {

  /**
   * @description Makes a URL to issue the requests to.  Note that the URL will automagically have the apiKey embedded.
   */
  makeUrl(path) {
    const { protocol, host, basePath, apiKey } = this.config;
    return `${protocol}://${host}/${basePath}/${path}?key=${apiKey}`;
  },

  /**
   * @description Makes an auth token
   */
  makeAuthToken() {
    const { apiToken } = this.config;
    return {
      user: `${apiToken}:`,
    };
  },

  /**
   * @description Verifies that an autocomplete service is working.
   */
  verify(callback) {
    request({
      method: 'GET',
      url: this.makeUrl('verify'),
      auth: this.makeAuthToken(),
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Adds an item to your autocomplete.
   */
  addItem(params, callback) {
    request({
      method: 'POST',
      url: this.makeUrl('item'),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Adds an item to your autocomplete or updates it if it already exists.
   */
  addOrUpdateItem(params, callback) {
    request({
      method: 'PUT',
      url: this.makeUrl('item'),
      auth: this.makeAuthToken(),
      qs: { force: 1 },
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Removes an item from your autocomplete.
   */
  removeItem(params, callback) {
    request({
      method: 'DELETE',
      url: this.makeUrl('item'),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Modifies an item from your autocomplete.
   */
  modifyItem(params, callback) {
    request({
      method: 'PUT',
      url: this.makeUrl('item'),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Adds multiple items to your autocomplete (limit of 1000 items)
   */
  addItemBatch(params, callback) {
    request({
      method: 'POST',
      url: this.makeUrl('batch_items'),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Adds multiple items to your autocomplete whilst updating existing ones (limit of 1000 items)
   */
  addOrUpdateItemBatch(params, callback) {
    request({
      method: 'PUT',
      url: this.makeUrl('batch_items'),
      auth: this.makeAuthToken(),
      qs: { force: 1 },
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Removes multiple items from your autocomplete (limit of 1000 items)
   */
  removeItemBatch(params, callback) {
    request({
      method: 'DELETE',
      url: this.makeUrl('batch_items'),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Tracks the fact that someone searched on your site.
   */
  trackSearch(params, callback) {
    request({
      method: 'POST',
      url: this.makeUrl('search'),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Tracks the fact that someone clicked through a search result on the site.
   */
  trackClickThrough(params, callback) {
    request({
      method: 'POST',
      url: this.makeUrl('click_through'),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Tracks the fact that someone converted on your site.
   */
  trackConversion(params, callback) {
    request({
      method: 'POST',
      url: this.makeUrl('conversion'),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

};

module.exports = ConstructorIO;
