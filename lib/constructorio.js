/* eslint-disable camelcase, no-console, prefer-object-spread */
const request = require('request');
const needle = require('needle');
const qs = require('qs');
const fs = require('fs');
const path = require('path');
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
 * @description Make requests to the catalog endpoint
 */
function makeRequestWithFormdata(requestParams, callback) {
  const { url, auth, section, formData, method } = requestParams;
  request({
    method,
    url,
    auth,
    formData,
    qs: {
      section,
    },
    qsStringifyOptions: {
      arrayFormat: 'repeat',
    },
  }, (error, response) => {
    handleServerResponse(error, response, callback);
  });
}

/**
 * @description Creates a constructor.io Client
 */
function ConstructorIO(config) {
  const { protocol, host, apiToken, apiKey } = config;

  if (!apiToken || !apiKey) {
    console.error('Could not instantiate ConstructorIO client - `apiToken` and `apiKey` are required parameters');
    return;
  }

  // Read package version from JSON configuration file
  const { version } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json')));

  this.config = {
    protocol: protocol || 'https',
    host: host || 'ac.cnstrc.com',
    basePath: 'v1',
    apiToken,
    apiKey,
    version: `ciojs-node-${version}`,
  };
}

/**
 * @description Validates that correct parameters are supplied for search and autocomplete requests
 */
function validateUserParams(params) {
  const { s, i, ui, us } = params;

  // Validate `s` and `i` parameters
  if (!s || !i || typeof s !== 'number' || typeof i !== 'string') {
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
  makeUrl(urlPath, options) {
    const configOptions = Object.assign({}, this.config, options);
    // Note: getSynonymGroups and getRedirectRules cannot accept the `c` parameter currently
    const { protocol, host, basePath, apiKey, appendVersionParameter } = configOptions;
    const versionParameter = appendVersionParameter ? `&c=${this.config.version}` : '';

    return `${protocol}://${host}/${basePath}/${urlPath}?key=${apiKey}${versionParameter}`;
  },

  /**
   * @description Makes an auth token
   */
  makeAuthToken() {
    const { apiToken } = this.config;
    return {
      username: `${apiToken}`,
      password: '',
    };
  },

  /**
   * @description Verifies that an autocomplete service is working
   */
  verify(callback) {
    const options = this.makeAuthToken();
    const url = this.makeUrl('verify');

    needle.get(url, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Adds an item to your index
   */
  addItem(params, callback) {
    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl('item');

    needle.post(url, params, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Adds an item to your index or updates it if it already exists
   */
  addOrUpdateItem(params, callback) {
    const options = { ...this.makeAuthToken(), json: true };
    const url = `${this.makeUrl('item')}&force=1`;

    needle.put(url, params, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Removes an item from your index
   */
  removeItem(params, callback) {
    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl('item');

    needle.delete(url, params, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Modifies an item in your index
   */
  modifyItem(params, callback) {
    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl('item');

    needle.put(url, params, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Adds multiple items to your index (limit of 1000 items)
   */
  addItemBatch(params, callback) {
    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl('batch_items');

    needle.post(url, params, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Adds multiple items to your index whilst updating existing ones (limit of 1000 items)
   */
  addOrUpdateItemBatch(params, callback) {
    const options = { ...this.makeAuthToken(), json: true };
    const url = `${this.makeUrl('batch_items')}&force=1`;

    needle.put(url, params, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Removes multiple items from your index (limit of 1000 items)
   */
  removeItemBatch(params, callback) {
    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl('batch_items');

    needle.delete(url, params, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Retrieves item(s) from your index for the given section or specific item id
   */
  getItem(params, callback) {
    const { num_results_per_page, page, section, item_id } = params;
    const urlPath = item_id ? `item/${item_id}` : 'item';
    const qsParams = new URLSearchParams();

    if (num_results_per_page) {
      qsParams.append('num_results_per_page', num_results_per_page);
    }
    if (page) {
      qsParams.append('page', page);
    }
    if (section) {
      qsParams.append('section', section);
    }

    const options = this.makeAuthToken();
    const url = `${this.makeUrl(urlPath)}&${qsParams.toString()}`;

    needle.get(url, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Adds item groups to your index
   */
  addItemGroups(params, callback) {
    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl('item_groups');

    needle.post(url, params, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Gets an item group from your index
   */
  getItemGroup(params, callback) {
    const options = this.makeAuthToken();
    const url = this.makeUrl(`item_groups/${params.group_id}`);

    needle.get(url, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Adds multiple item groups to your index whilst updating existing ones (limit of 1000 items)
   */
  addOrUpdateItemGroups(params, callback) {
    const options = { ...this.makeAuthToken(), json: true };
    const url = `${this.makeUrl('item_groups')}&force=1`;

    needle.patch(url, params, options, (error, response) => {
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

    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl(`item_groups/${id}`);

    needle.put(url, json, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Removes all item groups from your index
   */
  removeItemGroups(params, callback) {
    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl('item_groups');

    needle.delete(url, null, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Retrieves autocomplete results for supplied query
   */
  getAutocompleteResults(params, userParams, callback) {
    const qsParams = clonedeep(params);
    const validationResults = validateUserParams(userParams);
    const { query } = qsParams;
    delete qsParams.query;
    const queryParams = qs.stringify({
      ...qsParams,
      ...userParams,
    }, { arrayFormat: 'repeat' });
    const url = `${this.makeUrl(`autocomplete/${query}`)}&${queryParams}`;

    if (validationResults.isValid) {
      needle.get(url, null, (error, response) => {
        handleServerResponse(error, response, callback);
      });
    } else {
      handleServerResponse({ message: validationResults.message }, null, callback);
    }
  },

  /**
   * @description Retrieves search results for supplied query
   */
  getSearchResults(params, userParams, callback) {
    const qsParams = clonedeep(params);
    const validationResults = validateUserParams(userParams);
    const { query } = qsParams;
    delete qsParams.query;
    const queryParams = qs.stringify({
      ...qsParams,
      ...userParams,
    }, { arrayFormat: 'repeat' });
    const url = `${this.makeUrl(`search/${query}`)}&${queryParams}`;

    if (validationResults.isValid) {
      needle.get(url, null, (error, response) => {
        handleServerResponse(error, response, callback);
      });
    } else {
      handleServerResponse({ message: validationResults.message }, null, callback);
    }
  },

  /**
   * @description Adds a one way synonym
   */
  addOneWaySynonym(params, callback) {
    const json = clonedeep(params);
    const { phrase } = json;
    delete json.phrase;

    if (phrase && typeof phrase === 'string') {
      const options = { ...this.makeAuthToken(), json: true };
      const url = this.makeUrl(`one_way_synonyms/${phrase}`, { basePath: 'v2' });

      needle.post(url, json, options, (error, response) => {
        handleServerResponse(error, response, callback);
      });
    } else {
      handleServerResponse({ message: 'phrase is a required field of type string' }, null, callback);
    }
  },

  /**
   * @description Modifies a one way synonym for supplied parent phrase
   */
  modifyOneWaySynonym(params, callback) {
    const json = clonedeep(params);
    const { phrase } = json;
    delete json.phrase;

    if (phrase && typeof phrase === 'string') {
      const options = { ...this.makeAuthToken(), json: true };
      const url = this.makeUrl(`one_way_synonyms/${phrase}`, { basePath: 'v2' });

      needle.put(url, json, options, (error, response) => {
        handleServerResponse(error, response, callback);
      });
    } else {
      handleServerResponse({ message: 'phrase is a required field of type string' }, null, callback);
    }
  },

  /**
   * @description Retrieves all one way synonyms
   */
  getOneWaySynonyms(params, callback) {
    const { num_results_per_page, phrase, page } = params;
    const qsParams = new URLSearchParams();

    if (num_results_per_page) {
      qsParams.append('num_results_per_page', num_results_per_page);
    }
    if (phrase) {
      qsParams.append('phrase', phrase);
    }
    if (page) {
      qsParams.append('page', page);
    }

    const options = this.makeAuthToken();
    const url = `${this.makeUrl('one_way_synonyms', { basePath: 'v2' })}&${qsParams.toString()}`;

    needle.get(url, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Retrieves a one way synonym for supplied parent phrase
   */
  getOneWaySynonym(params, callback) {
    const json = clonedeep(params);
    const { phrase } = json;
    delete json.phrase;

    if (phrase && typeof phrase === 'string') {
      const options = this.makeAuthToken();
      const url = this.makeUrl(`one_way_synonyms/${phrase}`, { basePath: 'v2' });

      needle.get(url, options, (error, response) => {
        handleServerResponse(error, response, callback);
      });
    } else {
      handleServerResponse({ message: 'phrase is a required field of type string' }, null, callback);
    }
  },

  /**
   * @description Remove all one way synonyms
   */
  removeOneWaySynonyms(params, callback) {
    const options = this.makeAuthToken();
    const url = this.makeUrl('one_way_synonyms', { basePath: 'v2' });

    needle.delete(url, params, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Remove a one way synonym for supplied parent phrase
   */
  removeOneWaySynonym(params, callback) {
    const json = clonedeep(params);
    const { phrase } = json;
    delete json.phrase;

    if (phrase && typeof phrase === 'string') {
      const options = this.makeAuthToken();
      const url = this.makeUrl(`one_way_synonyms/${phrase}`, { basePath: 'v2' });

      needle.delete(url, params, options, (error, response) => {
        handleServerResponse(error, response, callback);
      });
    } else {
      handleServerResponse({ message: 'phrase is a required field of type string' }, null, callback);
    }
  },


  /**
   * @description Adds a synonym group
   */
  addSynonymGroup(params, callback) {
    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl('synonym_groups');

    needle.post(url, params, options, (error, response) => {
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

    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl(`synonym_groups/${group_id}`);

    needle.put(url, json, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Retrieves all synonym groups optionally filtered by phrase
   */
  getSynonymGroups(params, callback) {
    const { num_results_per_page, phrase, page } = params;
    const qsParams = new URLSearchParams();

    if (num_results_per_page) {
      qsParams.append('num_results_per_page', num_results_per_page);
    }

    if (phrase) {
      qsParams.append('phrase', phrase);
    }

    if (page) {
      qsParams.append('page', page);
    }

    const options = this.makeAuthToken();
    const url = `${this.makeUrl('synonym_groups', { appendVersionParameter: false })}&${qsParams.toString()}`;

    needle.get(url, options, (error, response) => {
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

    const options = this.makeAuthToken();
    const url = this.makeUrl(`synonym_groups/${group_id}`, { appendVersionParameter: false });

    needle.get(url, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Remove all synonym groups
   */
  removeSynonymGroups(params, callback) {
    const options = this.makeAuthToken();
    const url = this.makeUrl('synonym_groups');

    needle.delete(url, params, options, (error, response) => {
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

    const options = this.makeAuthToken();
    const url = this.makeUrl(`synonym_groups/${group_id}`);

    needle.delete(url, json, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Creates a redirect rule
   */
  addRedirectRule(params, callback) {
    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl('redirect_rules');

    needle.post(url, params, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Retrieves all redirect rules optionally filtered by query or status
   */
  getRedirectRules(params, callback) {
    const { num_results_per_page, page, query, status } = params;
    const qsParams = new URLSearchParams();

    if (num_results_per_page) {
      qsParams.append('num_results_per_page', num_results_per_page);
    }

    if (page) {
      qsParams.append('page', page);
    }

    if (query) {
      qsParams.append('query', query);
    }

    if (status) {
      qsParams.append('status', status);
    }

    const options = this.makeAuthToken();
    const url = `${this.makeUrl('redirect_rules', { appendVersionParameter: false })}&${qsParams.toString()}`;

    needle.get(url, options, (error, response) => {
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

    const options = this.makeAuthToken();
    const url = this.makeUrl(`redirect_rules/${redirect_rule_id}`, { appendVersionParameter: false });

    needle.get(url, options, (error, response) => {
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

    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl(`redirect_rules/${redirect_rule_id}`);

    needle.put(url, json, options, (error, response) => {
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

    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl(`redirect_rules/${redirect_rule_id}`);

    needle.patch(url, json, options, (error, response) => {
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

    const options = { ...this.makeAuthToken(), json: true };
    const url = this.makeUrl(`redirect_rules/${redirect_rule_id}`);

    needle.delete(url, json, options, (error, response) => {
      handleServerResponse(error, response, callback);
    });
  },

  /**
   * @description Send full catalogs to replace the current catalog
   */
  replaceCatalog(params, callback) {
    // Read Streams
    const { items, variations, item_groups, section } = params;
    const formData = {};

    if (items) {
      formData.items = items;
    }
    if (variations) {
      formData.variations = variations;
    }
    if (item_groups) {
      formData.item_groups = item_groups;
    }

    const requestParams = {
      url: this.makeUrl('catalog'),
      auth: this.makeAuthToken(),
      section: section || 'Products',
      formData,
      method: 'PUT',
    };

    makeRequestWithFormdata(requestParams, callback);
  },

  /**
   * @description Send deltas to update the current catalog
   */
  updateCatalog(params, callback) {
    // Read Streams
    const { items, variations, item_groups, section } = params;
    const formData = {};

    if (items) {
      formData.items = items;
    }
    if (variations) {
      formData.variations = variations;
    }
    if (item_groups) {
      formData.item_groups = item_groups;
    }

    const requestParams = {
      url: this.makeUrl('catalog'),
      auth: this.makeAuthToken(),
      section: section || 'Products',
      formData,
      method: 'PATCH',
    };

    makeRequestWithFormdata(requestParams, callback);
  },
};

module.exports = ConstructorIO;
