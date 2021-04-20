/* eslint-disable object-curly-newline, no-underscore-dangle, max-len */
const qs = require('qs');
const nodeFetch = require('node-fetch');
const helpers = require('../utils/helpers');

// Create URL from supplied path and options
function createCatalogUrl(path, options, additionalQueryParams = {}, apiVersion = 'v1') {
  const {
    apiKey,
    version,
    serviceUrl,
  } = options;
  let queryParams = {
    c: version,
    ...additionalQueryParams,
  };

  // Validate path is provided
  if (!path || typeof path !== 'string') {
    throw new Error('path is a required parameter of type string');
  }

  queryParams.key = apiKey;
  queryParams._dt = Date.now();
  queryParams = helpers.cleanParams(queryParams);

  const queryString = qs.stringify(queryParams, { indices: false });

  return `${serviceUrl}/${apiVersion}/${path}?${queryString}`;
}

// Create authorization header to be transmitted with requests
function createAuthHeader(options) {
  const { apiToken } = options;

  return { Authorization: `Basic ${Buffer.from(`${apiToken}:`).toString('base64')}` };
}

/**
 * Interface to catalog related API calls
 *
 * @module catalog
 * @inner
 * @returns {object}
 */
class Catalog {
  constructor(options) {
    this.options = options || {};
  }

  /**
   * Add item to index
   *
   * @function addItem
   * @param {object} parameters - Additional parameters for item details
   * @param {string} parameters.item_name - The name of the item, as it will appear in the results
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this item is for
   * @param {number} [parameters.suggested_score] - A number between 1 and 100 million that will influence the item's initial ranking relative to other item scores (the higher the score, the higher in the list of suggestions the item will appear)
   * @param {string[]} [parameters.keywords] - An array of keywords for this item. Keywords are useful if you want a product name to appear when a user enters a search term that isn't in the product name itself
   * @param {string} [parameters.url] - A URL to directly send the user after selecting the item
   * @param {string} [parameters.image_url] - A URL that points to an image you'd like displayed next to some item (only applicable when URL is supplied)
   * @param {string} [parameters.description] - A description for some item (only applicable when URL is supplied)
   * @param {string} [parameters.id] - An arbitrary ID you would like associated with this item. You can use this field to store your own ID's of the items to more easily access them in other API calls
   * @param {object} [parameters.facets] - Key/value pairs that can be associated with an item and used to filter them during a search. You can associate multiple values with the same key, by making values a list. Facets can be used as filters in search, autosuggest, and browse requests
   * @param {object} [parameters.metadata] - You can associate schema-less data with items by passing in an object of keys and values. To configure search and display of this data reach out to support@constructor.io.
   * @param {string[]} [parameters.group_ids] - You can associate each item with one or more groups (i.e. categories). To set up a group hierarchy please contact support@constructor.io. group_ids can be used as filters in search, autosuggest, and browse requests
   * @param {object[]} [parameters.variations] - List of this item's variations
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/add_an_item
   */
  addItem(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('item', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Add item to index or updates it if it already exists
   *
   * @function addOrUpdateItem
   * @param {object} parameters - Additional parameters for item details
   * @param {string} parameters.item_name - The name of the item, as it will appear in the results
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this item is for
   * @param {number} [parameters.suggested_score] - A number between 1 and 100 million that will influence the item's initial ranking relative to other item scores (the higher the score, the higher in the list of suggestions the item will appear)
   * @param {string[]} [parameters.keywords] - An array of keywords for this item. Keywords are useful if you want a product name to appear when a user enters a searchterm that isn't in the product name itself
   * @param {string} [parameters.url] - A URL to directly send the user after selecting the item
   * @param {string} [parameters.image_url] - A URL that points to an image you'd like displayed next to some item (only applicable when URL is supplied)
   * @param {string} [parameters.description] - A description for some item (only applicable when URL is supplied)
   * @param {string} [parameters.id] - An arbitrary ID you would like associated with this item. You can use this field to store your own ID's of the items to more easily access them in other API calls
   * @param {object} [parameters.facets] - Key/value pairs that can be associated with an item and used to filter them during a search. You can associate multiple values with the same key, by making values a list. Facets can be used as filters in search, autosuggest, and browse requests
   * @param {object} [parameters.metadata] - You can associate schema-less data with items by passing in an object of keys and values. To configure search and display of this data reach out to support@constructor.io
   * @param {string[]} [parameters.group_ids] - You can associate each item with one or more groups (i.e. categories). To set up a group hierarchy please contact support@constructor.io. group_ids can be used as filters in search, autosuggest, and browse requests
   * @param {object[]} [parameters.variations] - List of this item's variations
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/add_or_update_an_item
   */
  addOrUpdateItem(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = `${createCatalogUrl('item', this.options)}&force=1`;
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Remove item from index
   *
   * @function addOrUpdateItem
   * @param {object} parameters - Additional parameters for item details
   * @param {string} parameters.item_name - The name of the item, as it will appear in the results
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this item is for
   * @param {string} parameters.id - An arbitrary ID you optionally specified when adding the item. If supplied, you don't need to pass in item_name
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/remove_an_item
   */
  removeItem(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('item', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'DELETE',
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Modify an item in index
   *
   * @function modifyItem
   * @param {object} parameters - Additional parameters for item details
   * @param {string} parameters.item_name - The name of the item, as it will appear in the results
   * @param {string} parameters.new_item_name - The new name of the item, as it you'd like it to appear in the results
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this item is for
   * @param {number} [parameters.suggested_score] - A number between 1 and 100 million that will influence the item's initial ranking relative to other item scores (the higher the score, the higher in the list of suggestions the item will appear)
   * @param {string[]} [parameters.keywords] - An array of keywords for this item. Keywords are useful if you want a product name to appear when a user enters a searchterm that isn't in the product name itself
   * @param {string} [parameters.url] - A URL to directly send the user after selecting the item
   * @param {string} [parameters.image_url] - A URL that points to an image you'd like displayed next to some item (only applicable when URL is supplied)
   * @param {string} [parameters.description] - A description for some item (only applicable when URL is supplied)
   * @param {string} [parameters.id] - An arbitrary ID you would like associated with this item. You can use this field to store your own ID's of the items to more easily access them in other API calls
   * @param {object} [parameters.facets] - Key/value pairs that can be associated with an item and used to filter them during a search. You can associate multiple values with the same key, by making values a list. Facets can be used as filters in search, autosuggest, and browse requests
   * @param {object} [parameters.metadata] - You can associate schema-less data with items by passing in an object of keys and values. To configure search and display of this data reach out to support@constructor.io
   * @param {string[]} [parameters.group_ids] - You can associate each item with one or more groups (i.e. categories). To set up a group hierarchy please contact support@constructor.io. group_ids can be used as filters in search, autosuggest, and browse requests
   * @param {object[]} [parameters.variations] - List of this item's variations
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/modify_an_item
   */
  modifyItem(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('item', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Add multiple items to index (limit of 1,000)
   *
   * @function addItemBatch
   * @param {object} parameters - Additional parameters for item details
   * @param {object[]} parameters.items - A list of items with the same attributes as defined in the `addItem` resource
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this item is for
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/batch_add_items
   */
  addItemBatch(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('batch_items', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Add multiple items to index whilst updating existing ones (limit of 1,000)
   *
   * @function addOrUpdateItemBatch
   * @param {object} parameters - Additional parameters for item details
   * @param {object[]} parameters.items - A list of items with the same attributes as defined in the `addItem` resource
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this item is for
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/batch_add_or_update_items
   */
  addOrUpdateItemBatch(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = `${createCatalogUrl('batch_items', this.options)}&force=1`;
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Remove multiple items from your index (limit of 1,000)
   *
   * @function removeItemBatch
   * @param {object} parameters - Additional parameters for item details
   * @param {object[]} parameters.items - A list of items with the same attributes as defined in the `addItem` resource
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this item is for
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/batch_remove_items
   */
  removeItemBatch(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('batch_items', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'DELETE',
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Retrieves item(s) from index for the given section or specific item ID
   *
   * @function getItems
   * @param {object} parameters - Additional parameters for item details
   * @param {string} parameters.item_id - The ID of the item you'd like to retrieve
   * @param {string} parameters.section - The index section you'd like to retrieve results from
   * @param {number} [parameters.num_results_per_page] - The number of items to return. Defaults to 20. Maximum value 1,000
   * @param {number} [parameters.page] - The page of results to return. Defaults to 1
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/get_items
   */
  getItem(parameters = {}) {
    const { item_id: itemId } = parameters;
    const urlPath = itemId ? `item/${itemId}` : 'item';
    const queryParams = {};
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    if (parameters) {
      const { num_results_per_page: numResultsPerPage, page, section } = parameters;

      // Pull number of results per page from parameters
      if (numResultsPerPage) {
        queryParams.num_results_per_page = numResultsPerPage;
      }

      // Pull page from parameters
      if (page) {
        queryParams.page = page;
      }

      // Pull section from parameters
      if (section) {
        queryParams.section = section;
      }
    }

    try {
      requestUrl = `${createCatalogUrl(urlPath, this.options, queryParams)}`;
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then(json => json);
  }

  /**
   * Add item groups to index (limit of 1,000)
   *
   * @function addItemGroups
   * @param {object} parameters - Additional parameters for item group details
   * @param {object[]} parameters.item_groups - A list of item groups
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/item_groups
   */
  addItemGroups(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('item_groups', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Retrieves an item group from index
   *
   * @function getItemGroup
   * @param {object} parameters - Additional parameters for item group details
   * @param {string} parameters.group_id - The group ID you'd like to retrieve results for
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/item_groups
   */
  getItemGroup(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl(`item_groups/${parameters.group_id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then(json => json);
  }

  /**
   * Add multiple item groups to index whilst updating existing ones (limit of 1,000)
   *
   * @function addOrUpdateItemGroups
   * @param {object} parameters - Additional parameters for item group details
   * @param {object[]} parameters.item_groups - A list of item groups
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  addOrUpdateItemGroups(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = `${createCatalogUrl('item_groups', this.options)}`;
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'PATCH',
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then(json => json);
  }

  /**
   * Modify an item group in index
   *
   * @function modifyItemGroup
   * @param {object} parameters - Additional parameters for item group details
   * @param {string} parameters.group_id - The group ID to update
   * @param {string} [parameters.name] - Item group display name
   * @param {string} [parameters.parent_id] - Parent item group customer ID or null for root item groups
   * @param {object} [parameters.data] - JSON object with custom metadata attached with the item group
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/item_groups
   */
  modifyItemGroup(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { id, ...rest } = parameters;

    try {
      requestUrl = createCatalogUrl(`item_groups/${id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then(json => json);
  }

  /**
   * Remove all item groups from index
   *
   * @function removeItemGroups
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  removeItemGroups() {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('item_groups', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'DELETE',
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then(json => json);
  }

  /**
   * Add a one way synonym
   *
   * @function addOneWaySynonym
   * @param {object} parameters - Additional parameters for synonym details
   * @param {string} parameters.phrase - Parent phrase
   * @param {string[]} parameters.child_phrases - Array of synonyms
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/one_way_synonyms/add_synonyms
   */
  addOneWaySynonym(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { phrase, ...rest } = parameters;

    try {
      requestUrl = createCatalogUrl(`one_way_synonyms/${phrase}`, this.options, {}, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Modify a one way synonym for supplied parent phrase
   *
   * @function modifyOneWaySynonym
   * @param {object} parameters - Additional parameters for synonym details
   * @param {string} parameters.phrase - Parent phrase
   * @param {string[]} parameters.child_phrases - Array of synonyms
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/one_way_synonyms/modify_synonyms
   */
  modifyOneWaySynonym(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { phrase, ...rest } = parameters;

    try {
      requestUrl = createCatalogUrl(`one_way_synonyms/${phrase}`, this.options, {}, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Retrieve one way synonym(s)
   *
   * @function getOneWaySynonym
   * @param {object} parameters - Additional parameters for synonym details
   * @param {string} [parameters.phrase] - The phrase for which all synonym groups containing it will be returned
   * @param {number} [parameters.num_results_per_page] - The number of synonym groups to return. Defaults to 100
   * @param {number} [parameters.page] - The page of results to return. Defaults to 1
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  getOneWaySynonym(parameters = {}) {
    const { phrase } = parameters;
    const urlPath = phrase ? `one_way_synonyms/${phrase}` : 'one_way_synonyms';
    const queryParams = {};
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    if (parameters) {
      const { num_results_per_page: numResultsPerPage, phrase, page } = parameters;

      // Pull number of results per page from parameters
      if (numResultsPerPage) {
        queryParams.num_results_per_page = numResultsPerPage;
      }

      // Pull page from parameters
      if (page) {
        queryParams.page = page;
      }
    }

    try {
      requestUrl = `${createCatalogUrl(urlPath, this.options, queryParams, 'v2')}`;
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...createAuthHeader(this.options),
      },
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then(json => json);
  }

  /**
   * Remove all one way synonyms
   *
   * @function removeOneWaySynonyms
  // TODO: Not sure what goes into the params
   * @param {object} params - Additional parameters for synonym details
   * @param {string} [params.synonyms] -
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  removeOneWaySynonyms(params) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('one_way_synonyms', { basePath: 'v2' });
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'DELETE',
      body: JSON.stringify(params),
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Add a synonym group
   *
   * @function addSynonymGroup
  // TODO: Not sure what goes into the params
   * @param {object} params - Additional parameters for synonym group details
   * @param {object[]} params.synonyms - Allows you to add synonyms to the newly created group.
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  addSynonymGroup(params) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('synonym_groups');
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Modify a synonym group for supplied id
   *
   * @function modifySynonymGroup
  // TODO: Not sure what goes into the params
   * @param {object} params - Additional parameters for synonym group details
   * @param {object[]} params.synonyms - Determines what phrases will be included in the final synonym group
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  modifySynonymGroup(params) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { group_id: groupId, ...rest } = params;

    try {
      requestUrl = createCatalogUrl(`synonym_groups/${groupId}`);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(rest),
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Retrieve all synonym groups optionally filtered by phrase
   *
   * @function getSynonymGroups
   * @param {object} params - Additional parameters for synonym group details
   * @param {string} [params.group_id] - The synonym group you would like returned
   * @param {string} [params.phrase] - The phrase for which all synonym groups containing it will be returned
   * @param {number} [params.num_results_per_page] - The number of synonym groups to return. Defaults to 100
   * @param {number} [params.page] - The page of results to return. Defaults to 1
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  getSynonymGroups(params) {
    const { num_results_per_page: numResultsPerPage, phrase, page } = params;
    const qsParams = new URLSearchParams();
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    if (numResultsPerPage) {
      qsParams.append('num_results_per_page', numResultsPerPage);
    }

    if (phrase) {
      qsParams.append('phrase', phrase);
    }

    if (page) {
      qsParams.append('page', page);
    }

    try {
      requestUrl = `${createCatalogUrl('synonym_groups', { appendVersionParameter: false })}&${qsParams.toString()}`;
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'GET',
      body: JSON.stringify(params),
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Retrieves synonym group for supplied id
   *
   * @function getSynonymGroup
   * @param {object} params - Additional parameters for synonym group details
   * @param {string} params.group_id - The synonym group you would like returned
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  getSynonymGroup(params) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { group_id: groupId, ...rest } = params;

    try {
      requestUrl = createCatalogUrl(`synonym_groups/${groupId}`, { appendVersionParameter: false });
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'GET',
      body: JSON.stringify(rest),
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Remove all synonym groups
   TODO: What to do with this note?
   Note: If not given a group_id, all synonyms belonging to the given key will be deleted.
   *
   * @function removeSynonymGroups
   * @param {object} params - Additional parameters for synonym group details
   * @param {string} [params.group_id] - The synonym group you would like deleted
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  removeSynonymGroups(params) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('synonym_groups');
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'DELETE',
      body: JSON.stringify(params),
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Remove synonym group for supplied id
   *
   * @function removeSynonymGroup
   * @param {object} params - Additional parameters for synonym group details
   * @param {string} params.group_id - The synonym group you would like deleted
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  removeSynonymGroup(params) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { group_id: groupId, ...rest } = params;

    try {
      requestUrl = createCatalogUrl(`synonym_groups/${groupId}`);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'DELETE',
      body: JSON.stringify(rest),
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Create a redirect rule
   *
   * @function addRedirectRule
   TODO: Where to define redirect object
   * @param {object} params - Additional parameters for redirect rule details
   * @param {string} params. -
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  addRedirectRule(params) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('redirect_rules');
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Retrieve all redirect rules optionally filtered by query or status
   *
   * @function getRedirectRules
   * @param {object} params - Additional parameters for redirect rule details
   * @param {string} params.key - The index you'd like to to retrieve redirect rules from
   * @param {number} [params.num_results_per_page] - The number of rules to return. Defaults to 20
   * @param {number} [params.page] - The page of redirect rules to return. Defaults to 1
   * @param {string} [params.query] - Return redirect rules whose url or match pattern match the provided query
   * @param {string} [params.status] - One of "current" (return redirect rules that are currently active), "pending" (return redirect rules that will become active in the future), and "expired" (return redirect rules that are not active anymore)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  getRedirectRules(params) {
    const { num_results_per_page: numResultsPerPage, page, query, status } = params;
    const qsParams = new URLSearchParams();
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    if (numResultsPerPage) {
      qsParams.append('num_results_per_page', numResultsPerPage);
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

    try {
      requestUrl = `${createCatalogUrl('redirect_rules', { appendVersionParameter: false })}&${qsParams.toString()}`;
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'GET',
      body: JSON.stringify(params),
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Retrieve redirect rule for supplied id
   *
   * @function getRedirectRule
   * @param {object} params - Additional parameters for redirect rule details
   TODO: Which id?
   * @param {string} params.key - The index you'd like to to retrieve redirect rules from
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  getRedirectRule(params) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { redirect_rule_id: redirectRuleId, ...rest } = params;

    try {
      requestUrl = createCatalogUrl(`redirect_rules/${redirectRuleId}`, { appendVersionParameter: false });
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'GET',
      body: JSON.stringify(rest),
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Completely update a redirect rule for supplied id
   *
   * @function modifyRedirectRule
   TODO: What goes into params?
   * @param {object} params - Additional parameters for redirect rule details
   * @param {string} params.redirect_rule_id -
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  modifyRedirectRule(params) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { redirect_rule_id: redirectRuleId, ...rest } = params;

    try {
      requestUrl = createCatalogUrl(`redirect_rules/${redirectRuleId}`);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(rest),
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Partially update a redirect rule for supplied id
   *
   * @function updateRedirectRule
   TODO: What goes into params?
   * @param {object} params - Additional parameters for redirect rule details
   * @param {string} params.redirect_rule_id -
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  updateRedirectRule(params) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { redirect_rule_id: redirectRuleId, ...rest } = params;

    try {
      requestUrl = createCatalogUrl(`redirect_rules/${redirectRuleId}`);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'PATCH',
      body: JSON.stringify(rest),
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Remove redirect rule for supplied id
   *
   * @function updateRedirectRule
   TODO: What goes into params?
   * @param {object} params - Additional parameters for redirect rule details
   * @param {string} params.redirect_rule_id -
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  removeRedirectRule(params) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { redirect_rule_id: redirectRuleId, ...rest } = params;

    try {
      requestUrl = createCatalogUrl(`redirect_rules/${redirectRuleId}`);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'DELETE',
      body: JSON.stringify(rest),
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Send full catalogs to replace the current catalog
   *
   * @function replaceCatalog
   TODO: What goes into params?
   * @param {object} params - Additional parameters for catalog details
   * @param {string} params.section - The section that you want to update
   * @param {string} [params.notification_email] - An email address where you'd like to receive an email notifcation in case the task fails.
   * @param {boolean} [params.force] - Process the catalog even if it will invalidate a large number of existing items. Defaults to False.
   TODO: CSV File type?
   * @param {file} [params.items] - The CSV file with all new items
   * @param {file} [params.variations] - The CSV file with all new variations
   * @param {file} [params.item_groups] - The CSV file with all new item_groups
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  replaceCatalog(params) {
    // Read Streams
    const { items, variations, item_groups: itemGroups, section = 'Products' } = params;
    const qsParams = new URLSearchParams();
    const formData = {};

    if (section) {
      qsParams.append('section', section);
    }

    if (items) {
      formData.items = {
        buffer: items,
        content_type: 'application/octet-stream',
        filename: 'items.csv',
      };
    }

    if (variations) {
      formData.variations = {
        buffer: variations,
        content_type: 'application/octet-stream',
        filename: 'variations.csv',
      };
    }

    if (itemGroups) {
      formData.item_groups = {
        buffer: itemGroups,
        content_type: 'application/octet-stream',
        filename: 'item_groups.csv',
      };
    }

    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = `${createCatalogUrl('catalog')}&${qsParams.toString()}`;
    } catch (e) {
      return Promise.reject(e);
    }

    try {
      return fetch(requestUrl, {
        method: 'PUT',
        body: JSON.stringify(params),
        headers: createAuthHeader(this.options),
      }).then((response) => {
        if (response.ok) {
          return Promise.resolve();
        }

        return helpers.throwHttpErrorFromResponse(new Error(), response);
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Send deltas to update the current catalog
   *
   * @function updateCatalog
   TODO: What goes into params?
   * @param {object} params - Additional parameters for catalog details
   * @param {string} params.section - The section that you want to update
   * @param {string} [params.notification_email] - An email address where you'd like to receive an email notifcation in case the task fails.
   * @param {boolean} [params.force] - Process the catalog even if it will invalidate a large number of existing items. Defaults to False.
   TODO: CSV File type?
   * @param {file} [params.items] - The CSV file with all new items
   * @param {file} [params.variations] - The CSV file with all new variations
   * @param {file} [params.item_groups] - The CSV file with all new item_groups
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  updateCatalog(params) {
    // Read Streams
    const { items, variations, item_groups: itemGroups, section = 'Products' } = params;
    const qsParams = new URLSearchParams();
    const formData = {};

    if (section) {
      qsParams.append('section', section);
    }

    if (items) {
      formData.items = {
        buffer: items,
        content_type: 'application/octet-stream',
        filename: 'items.csv',
      };
    }

    if (variations) {
      formData.variations = {
        buffer: variations,
        content_type: 'application/octet-stream',
        filename: 'variations.csv',
      };
    }

    if (itemGroups) {
      formData.item_groups = {
        buffer: itemGroups,
        content_type: 'application/octet-stream',
        filename: 'item_groups.csv',
      };
    }

    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = `${createCatalogUrl('catalog')}&${qsParams.toString()}`;
    } catch (e) {
      return Promise.reject(e);
    }

    try {
      return fetch(requestUrl, {
        method: 'PUT',
        body: JSON.stringify(params),
        headers: createAuthHeader(this.options),
      }).then((response) => {
        if (response.ok) {
          return Promise.resolve();
        }

        return helpers.throwHttpErrorFromResponse(new Error(), response);
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

module.exports = Catalog;