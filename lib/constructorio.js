/* eslint-disable camelcase */
const request = require('request');
const clonedeep = require('lodash.clonedeep');

/**
 * @description Handle responses to requests
 */
function handleServerResponse(error, response, callback) {
  const statusCode = response && response.statusCode.toString();
  let body = response && response.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {
        message: body,
      };
    }
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
    basePath: 'v1',
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
      user: `${apiToken}`,
      pass: '',
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
   * @description Adds an item to your index.
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
   * @description Adds an item to your index or updates it if it already exists.
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
   * @description Removes an item from your index.
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
   * @description Modifies an item in your index.
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
   * @description Adds multiple items to your index (limit of 1000 items)
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
   * @description Adds multiple items to your index whilst updating existing ones (limit of 1000 items)
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
   * @description Removes multiple items from your index (limit of 1000 items)
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
   * @description Retrieves item(s) from your index for the given section or specific item id
   */
  getItem(params, callback) {
    const { num_results_per_page, page, section, item_id } = params;
    const path = item_id ? `item/${item_id}` : 'item';
    const qsParams = {};

    if (num_results_per_page) {
      qsParams.num_results_per_page = num_results_per_page;
    }
    if (page) {
      qsParams.page = page;
    }
    if (section) {
      qsParams.section = section;
    }

    request({
      method: 'GET',
      url: this.makeUrl(path),
      auth: this.makeAuthToken(),
      qs: qsParams,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Adds item groups to your index.
   */
  addItemGroups(params, callback) {
    request({
      method: 'POST',
      url: this.makeUrl('item_groups'),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Gets an item group from your index.
   */
  getItemGroup(params, callback) {
    request({
      method: 'GET',
      url: this.makeUrl(`item_groups/${params.group_id}`),
      auth: this.makeAuthToken(),
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Adds multiple item groups to your index whilst updating existing ones (limit of 1000 items)
   */
  addOrUpdateItemGroups(params, callback) {
    request({
      method: 'PATCH',
      url: this.makeUrl('item_groups'),
      auth: this.makeAuthToken(),
      qs: { force: 1 },
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Modifies an item group in your index.
   */
  modifyItemGroup(params, callback) {
    const json = clonedeep(params);
    const { id } = json;
    delete json.id;

    request({
      method: 'PUT',
      url: this.makeUrl(`item_groups/${id}`),
      auth: this.makeAuthToken(),
      json,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Removes all item groups from your index.
   */
  removeItemGroups(params, callback) {
    request({
      method: 'DELETE',
      url: this.makeUrl('item_groups'),
      auth: this.makeAuthToken(),
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

  /**
   * @description Adds a synonym group.
   */
  addSynonymGroup(params, callback) {
    request({
      method: 'POST',
      url: this.makeUrl('synonym_groups'),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Modifies a synonym group for supplied id.
   */
  modifySynonymGroup(params, callback) {
    const json = clonedeep(params);
    const { group_id } = json;
    delete json.group_id;

    request({
      method: 'PUT',
      url: this.makeUrl(`synonym_groups/${group_id}`),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Retrieves all synonym groups.
   */
  getSynonymGroups(params, callback) {
    const { num_results_per_page, phrase, page } = params;
    const qsParams = {};

    if (num_results_per_page) {
      qsParams.num_results_per_page = num_results_per_page;
    }

    if (phrase) {
      qsParams.phrase = phrase;
    }

    if (page) {
      qsParams.page = page;
    }

    request({
      method: 'GET',
      url: this.makeUrl('synonym_groups'),
      auth: this.makeAuthToken(),
      qs: qsParams,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Retrieves synonym group for supplied id or phrase.
   */
  getSynonymGroup(params, callback) {
    const json = clonedeep(params);
    const { group_id, phrase } = json;
    delete json.group_id;
    delete json.phrase;

    request({
      method: 'GET',
      url: this.makeUrl(`synonym_groups/${group_id || phrase}`),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Remove all synonym groups.
   */
  removeSynonymGroups(params, callback) {
    request({
      method: 'DELETE',
      url: this.makeUrl('synonym_groups'),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Remove synonym group for supplied id.
   */
  removeSynonymGroup(params, callback) {
    const json = clonedeep(params);
    const { group_id } = json;
    delete json.group_id;

    request({
      method: 'DELETE',
      url: this.makeUrl(`synonym_groups/${group_id}`),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },
};

module.exports = ConstructorIO;
