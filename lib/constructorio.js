/* eslint-disable camelcase, no-console */
const request = require('request');
const fs = require('fs');
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
  const { protocol, host, apiToken, apiKey } = config;

  if (!apiToken || !apiKey) {
    console.error('Could not instantiate ConstructorIO client - `apiToken` and `apiKey` are required parameters');
    return;
  }

  // Read package version from JSON configuration file
  const { version } = JSON.parse(fs.readFileSync('./package.json'));

  this.config = {
    protocol: protocol || 'https',
    host: host || 'ac.cnstrc.com',
    basePath: 'v1',
    apiToken,
    apiKey,
    version: `ciojs-rest-${version}`,
  };
}

/**
 * @description Validates that correct parameters are supplied for search and autocomplete requests
 */
function validatePersonalizationParams(params) {
  const { s, i, ui, us } = params;

  // Validate `s` and `i` parameters
  if (
    !s
    || !i
    || typeof s !== 'number'
    || typeof i !== 'string'
  ) {
    return {
      isValid: false,
      message: 'Request could not be completed - `s` and `i` are required parameters and must be a number and string, respectively',
    };
  }

  // Validate optional `ui` parameter
  if (ui && typeof ui !== 'string') {
    return {
      isValid: false,
      message: 'Request could not be completed - `ui` parameter must be a string',
    };
  }

  // Validate optional `us` parameter
  if (us && !Array.isArray(us)) {
    return {
      isValid: false,
      message: 'Request could not be completed - `us` parameter must be a list',
    };
  }

  return {
    isValid: true,
    message: null,
  };
}

ConstructorIO.prototype = {
  /**
   * @description Makes a URL to issue the requests to. Note that the URL will automagically have the apiKey embedded
   */
  makeUrl(path, appendVersionParameter = true) {
    const { protocol, host, basePath, apiKey } = this.config;
    const versionParameter = appendVersionParameter ? `&c=${this.config.version}` : '';

    return `${protocol}://${host}/${basePath}/${path}?key=${apiKey}${versionParameter}`;
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
   * @description Verifies that an autocomplete service is working
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
   * @description Adds an item to your index
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
   * @description Adds an item to your index or updates it if it already exists
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
   * @description Removes an item from your index
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
   * @description Modifies an item in your index
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
   * @description Adds item groups to your index
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
   * @description Gets an item group from your index
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
   * @description Modifies an item group in your index
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
   * @description Removes all item groups from your index
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
   * @description Retrieves autocomplete results for supplied query
   */
  getAutocompleteResults(params, callback) {
    const json = clonedeep(params);
    const validationResults = validatePersonalizationParams(params);
    const { query } = json;
    delete json.query;

    if (validationResults.isValid) {
      request({
        method: 'GET',
        url: this.makeUrl(`autocomplete/${query}`),
        auth: this.makeAuthToken(),
        qs: json,
      }, (error, response) => {
        handleServerResponse(error, response, callback);
      });
    } else {
      handleServerResponse(validationResults, null, callback);
    }
  },

  /**
   * @description Adds a synonym group
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
   * @description Modifies a synonym group for supplied id
   */
  modifySynonymGroup(params, callback) {
    const json = clonedeep(params);
    const { group_id } = json;
    delete json.group_id;

    request({
      method: 'PUT',
      url: this.makeUrl(`synonym_groups/${group_id}`),
      auth: this.makeAuthToken(),
      json,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Retrieves all synonym groups optionally filtered by phrase
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
      url: this.makeUrl('synonym_groups', false),
      auth: this.makeAuthToken(),
      qs: qsParams,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Retrieves synonym group for supplied id
   */
  getSynonymGroup(params, callback) {
    const json = clonedeep(params);
    const { group_id } = json;
    delete json.group_id;

    request({
      method: 'GET',
      url: this.makeUrl(`synonym_groups/${group_id}`, false),
      auth: this.makeAuthToken(),
      json,
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
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Remove synonym group for supplied id
   */
  removeSynonymGroup(params, callback) {
    const json = clonedeep(params);
    const { group_id } = json;
    delete json.group_id;

    request({
      method: 'DELETE',
      url: this.makeUrl(`synonym_groups/${group_id}`),
      auth: this.makeAuthToken(),
      json,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Creates a redirect rule.
   */
  addRedirectRule(params, callback) {
    request({
      method: 'POST',
      url: this.makeUrl('redirect_rules'),
      auth: this.makeAuthToken(),
      json: params,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Retrieves all redirect rules optionally filtered by query or status
   */
  getRedirectRules(params, callback) {
    const { num_results_per_page, page, query, status } = params;
    const qsParams = {};

    if (num_results_per_page) {
      qsParams.num_results_per_page = num_results_per_page;
    }

    if (page) {
      qsParams.page = page;
    }

    if (query) {
      qsParams.query = query;
    }

    if (status) {
      qsParams.status = status;
    }

    request({
      method: 'GET',
      url: this.makeUrl('redirect_rules', false),
      auth: this.makeAuthToken(),
      qs: qsParams,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Retrieves redirect rule for supplied id
   */
  getRedirectRule(params, callback) {
    const json = clonedeep(params);
    const { redirect_rule_id } = json;
    delete json.redirect_rule_id;

    request({
      method: 'GET',
      url: this.makeUrl(`redirect_rules/${redirect_rule_id}`, false),
      auth: this.makeAuthToken(),
      json,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Completely updates a redirect rule for supplied id
   */
  modifyRedirectRule(params, callback) {
    const json = clonedeep(params);
    const { redirect_rule_id } = json;
    delete json.redirect_rule_id;

    request({
      method: 'PUT',
      url: this.makeUrl(`redirect_rules/${redirect_rule_id}`),
      auth: this.makeAuthToken(),
      json,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Partially updates a redirect rule for supplied id
   */
  updateRedirectRule(params, callback) {
    const json = clonedeep(params);
    const { redirect_rule_id } = json;
    delete json.redirect_rule_id;

    request({
      method: 'PATCH',
      url: this.makeUrl(`redirect_rules/${redirect_rule_id}`),
      auth: this.makeAuthToken(),
      json,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Remove redirect rule for supplied id
   */
  removeRedirectRule(params, callback) {
    const json = clonedeep(params);
    const { redirect_rule_id } = json;
    delete json.group_id;

    request({
      method: 'DELETE',
      url: this.makeUrl(`redirect_rules/${redirect_rule_id}`),
      auth: this.makeAuthToken(),
      json,
    }, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },
};

module.exports = ConstructorIO;
