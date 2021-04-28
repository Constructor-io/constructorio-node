/* eslint-disable object-curly-newline, no-underscore-dangle, max-len */
const qs = require('qs');
const nodeFetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const helpers = require('../utils/helpers');

// Create URL from supplied path and options
function createCatalogUrl(path, options, additionalQueryParams = {}, apiVersion = 'v1') {
  const {
    apiKey,
    serviceUrl,
  } = options;
  let queryParams = {
    ...additionalQueryParams,
  };

  // Validate path is provided
  if (!path || typeof path !== 'string') {
    throw new Error('path is a required parameter of type string');
  }

  queryParams.key = apiKey;
  queryParams = helpers.cleanParams(queryParams);

  const queryString = qs.stringify(queryParams, { indices: false });

  return `${serviceUrl}/${encodeURIComponent(apiVersion)}/${encodeURIComponent(path)}?${queryString}`;
}

// Create authorization header to be transmitted with requests
function createAuthHeader(options) {
  const { apiToken } = options;

  return { Authorization: `Basic ${Buffer.from(`${apiToken}:`).toString('base64')}` };
}

// Convert a read stream to buffer
function convertToBuffer(stream) {
  return new Promise((resolve, reject) => {
    let buffer = '';

    stream.on('data', (chunk) => {
      buffer += chunk;
    });

    stream.on('end', () => {
      resolve(buffer);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
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
   * @param {object} [parameters.metadata] - You can associate schema-less data with items by passing in an object of keys and values. To configure search and display of this data reach out to support@constructor.io
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
   * @function removeItem
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
   * @function addItemsBatch
   * @param {object} parameters - Additional parameters for item details
   * @param {object[]} parameters.items - A list of items with the same attributes as defined in the `addItem` resource
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this item is for
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/batch_add_items
   */
  addItemsBatch(parameters = {}) {
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
   * @function addOrUpdateItemsBatch
   * @param {object} parameters - Additional parameters for item details
   * @param {object[]} parameters.items - A list of items with the same attributes as defined in the `addItem` resource
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this item is for
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/batch_add_or_update_items
   */
  addOrUpdateItemsBatch(parameters = {}) {
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
   * @function removeItemsBatch
   * @param {object} parameters - Additional parameters for item details
   * @param {object[]} parameters.items - A list of items with the same attributes as defined in the `addItem` resource
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this item is for
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/batch_remove_items
   */
  removeItemsBatch(parameters = {}) {
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
   * @function getItem
   * @param {object} parameters - Additional parameters for item details
   * @param {string} parameters.id - The ID of the item you'd like to retrieve
   * @param {number} [parameters.num_results_per_page] - The number of items to return. Defaults to 20. Maximum value 1,000
   * @param {number} [parameters.page] - The page of results to return. Defaults to 1
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/get_items
   */
  getItem(parameters = {}) {
    const queryParams = {};
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    if (parameters) {
      const { section } = parameters;

      // Pull section from parameters
      if (section) {
        queryParams.section = section;
      }
    }

    try {
      requestUrl = createCatalogUrl(`item/${parameters.id}`, this.options, queryParams);
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
   * Retrieves items from index for the given section
   *
   * @function getItems
   * @param {object} parameters - Additional parameters for item details
   * @param {string} parameters.section - The index section you'd like to retrieve results from
   * @param {number} [parameters.num_results_per_page] - The number of items to return. Defaults to 20. Maximum value 1,000
   * @param {number} [parameters.page] - The page of results to return. Defaults to 1
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/get_items
   */
  getItems(parameters = {}) {
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
      requestUrl = createCatalogUrl('item', this.options, queryParams);
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
   * Add item group to index
   *
   * @function addItemGroup
   * @param {object} parameters - Additional parameters for item group details
   * @param {string} parameters.id - Item group ID
   * @param {string} parameters.name - Item group name
   * @param {string} [parameters.parent_id] - Item group parent ID
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/item_groups
   */
  addItemGroup(parameters = {}) {
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
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
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
   * @param {string} parameters.id - The group ID you'd like to retrieve results for
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/item_groups
   */
  getItemGroup(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl(`item_groups/${parameters.id}`, this.options);
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
   * Retrieves item groups from index
   *
   * @function getItemGroups
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/item_groups
   */
  getItemGroups() {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('item_groups', this.options);
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
      requestUrl = createCatalogUrl('item_groups', this.options);
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
   * @param {string} parameters.id - The group ID to update
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
   * Retrieve one way synonym
   *
   * @function getOneWaySynonym
   * @param {object} parameters - Additional parameters for synonym details
   * @param {string} parameters.phrase - Parent phrase
   * @param {number} [parameters.num_results_per_page] - The number of synonym groups to return. Defaults to 100
   * @param {number} [parameters.page] - The page of results to return. Defaults to 1
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/one_way_synonyms/retrieve_synonyms
   */
  getOneWaySynonym(parameters = {}) {
    const { phrase } = parameters;
    const queryParams = {};
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl(`one_way_synonyms/${phrase}`, this.options, queryParams, 'v2');
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
   * Retrieve one way synonyms
   *
   * @function getOneWaySynonyms
   * @param {object} [parameters] - Additional parameters for synonym details
   * @param {number} [parameters.num_results_per_page] - The number of synonym groups to return. Defaults to 100
   * @param {number} [parameters.page] - The page of results to return. Defaults to 1
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/one_way_synonyms/retrieve_synonyms
   */
  getOneWaySynonyms(parameters = {}) {
    const queryParams = {};
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    if (parameters) {
      const { num_results_per_page: numResultsPerPage, page } = parameters;

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
      requestUrl = createCatalogUrl('one_way_synonyms', this.options, queryParams, 'v2');
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
   * Remove all one way synonym
   *
   * @function removeOneWaySynonyms
   * @param {object} parameters - Additional parameters for synonym details
   * @param {string} parameters.phrase - Parent phrase
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/one_way_synonyms/remove_synonyms
   */
  removeOneWaySynonym(parameters = {}) {
    const { phrase } = parameters;
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl(`one_way_synonyms/${phrase}`, this.options, {}, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'DELETE',
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
   * Remove all one way synonyms
   *
   * @function removeOneWaySynonyms
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/one_way_synonyms/remove_synonyms
   */
  removeOneWaySynonyms() {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('one_way_synonyms', this.options, {}, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'DELETE',
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
   * Add a synonym group
   *
   * @function addSynonymGroup
   * @param {object} parameters - Additional parameters for synonym group details
   * @param {object[]} parameters.synonyms - Allows you to add synonyms to the newly created group
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html
   */
  addSynonymGroup(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('synonym_groups', this.options);
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
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then(json => json);
  }

  /**
   * Modify a synonym group for supplied ID
   *
   * @function modifySynonymGroup
   * @param {object} parameters - Additional parameters for synonym group details
   * @param {number} parameters.id - Synonym group ID
   * @param {object[]} parameters.synonyms - Determines what phrases will be included in the final synonym group
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  modifySynonymGroup(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { id, ...rest } = parameters;

    try {
      requestUrl = createCatalogUrl(`synonym_groups/${id}`, this.options);
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
   * Retrieves synonym group for supplied ID
   *
   * @function getSynonymGroup
   * @param {object} parameters - Additional parameters for synonym group details
   * @param {number} parameters.id - The synonym group you would like returned
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  getSynonymGroup(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl(`synonym_groups/${parameters.id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'GET',
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then(json => json);
  }

  /**
   * Retrieve all synonym groups optionally filtered by phrase
   *
   * @function getSynonymGroups
   * @param {object} [parameters] - Additional parameters for synonym group details
   * @param {string} [parameters.phrase] - The phrase for which all synonym groups containing it will be returned
   * @param {number} [parameters.num_results_per_page] - The number of synonym groups to return. Defaults to 100
   * @param {number} [parameters.page] - The page of results to return. Defaults to 1
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  getSynonymGroups(parameters = {}) {
    const queryParams = {};
    const { phrase } = parameters;
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    if (parameters) {
      const { num_results_per_page: numResultsPerPage, page } = parameters;

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
      requestUrl = createCatalogUrl(phrase ? `synonym_groups/${phrase}` : 'synonym_groups', this.options, queryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'GET',
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then(json => json);
  }


  /**
   * Remove synonym group for supplied ID
   *
   * @function removeSynonymGroup
   * @param {object} parameters - Additional parameters for synonym group details
   * @param {number} parameters.id - The synonym group you would like deleted
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  removeSynonymGroup(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { id } = parameters;

    try {
      requestUrl = createCatalogUrl(`synonym_groups/${id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'DELETE',
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
   *
   * @function removeSynonymGroups
   * @returns {Promise}
   * @see https://docs.constructor.io/rest-api.html#catalog
   */
  removeSynonymGroups() {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('synonym_groups', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'DELETE',
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
   * @param {object} parameters - Additional parameters for redirect rule details
   * @param {string} parameters.url - Target URL returned when a match happens
   * @param {object[]} parameters.matches - List of match definitions
   * @param {string} [parameters.start_time] - Time at which rule begins to apply (ISO8601 format preferred)
   * @param {string} [parameters.end_time] - Time at which rule stops to apply (ISO8601 format preferred)
   * @param {object[]} [parameters.user_segments] - List of user segments
   * @param {object} [parameters.metadata] - Object with arbitrary metadata
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/redirect_rules
   */
  addRedirectRule(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl('redirect_rules', this.options);
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
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then(json => json);
  }

  /**
   * Completely update a redirect rule for supplied ID
   *
   * @function updateRedirectRule
   * @param {object} parameters - Additional parameters for redirect rule details
   * @param {string} parameters.id - Redirect rule ID
   * @param {string} parameters.url - Target URL returned when a match happens
   * @param {object[]} parameters.matches - List of match definitions
   * @param {string} [parameters.start_time] - Time at which rule begins to apply (ISO8601 format preferred)
   * @param {string} [parameters.end_time] - Time at which rule stops to apply (ISO8601 format preferred)
   * @param {object[]} [parameters.user_segments] - List of user segments
   * @param {object} [parameters.metadata] - Object with arbitrary metadata
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/redirect_rules
   */
  updateRedirectRule(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { id, ...rest } = parameters;

    try {
      requestUrl = createCatalogUrl(`redirect_rules/${id}`, this.options);
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
   * Partially update (modify) a redirect rule for supplied ID
   *
   * @function modifyRedirectRule
   * @param {object} parameters - Additional parameters for redirect rule details
   * @param {string} parameters.id - Redirect rule ID
   * @param {string} parameters.url - Target URL returned when a match happens
   * @param {object[]} parameters.matches - List of match definitions
   * @param {string} [parameters.start_time] - Time at which rule begins to apply (ISO8601 format preferred)
   * @param {string} [parameters.end_time] - Time at which rule stops to apply (ISO8601 format preferred)
   * @param {object[]} [parameters.user_segments] - List of user segments
   * @param {object} [parameters.metadata] - Object with arbitrary metadata
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/redirect_rules
   */
  modifyRedirectRule(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const { id, ...rest } = parameters;

    try {
      requestUrl = createCatalogUrl(`redirect_rules/${id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'PATCH',
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
   * Retrieve redirect rule for supplied ID
   *
   * @function getRedirectRule
   * @param {object} parameters - Additional parameters for redirect rule details
   * @param {string} parameters.id - Redirect rule ID
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/redirect_rules
   */
  getRedirectRule(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl(`redirect_rules/${parameters.id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'GET',
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then(json => json);
  }

  /**
   * Retrieve all redirect rules optionally filtered by query or status
   *
   * @function getRedirectRules
   * @param {object} [parameters] - Additional parameters for redirect rule details
   * @param {number} [parameters.num_results_per_page] - The number of rules to return. Defaults to 20
   * @param {number} [parameters.page] - The page of redirect rules to return. Defaults to 1
   * @param {string} [parameters.query] - Return redirect rules whose url or match pattern match the provided query
   * @param {string} [parameters.status] - One of "current" (return redirect rules that are currently active), "pending" (return redirect rules that will become active in the future), and "expired" (return redirect rules that are not active anymore)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/redirect_rules
   */
  getRedirectRules(parameters = {}) {
    const queryParams = {};
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    if (parameters) {
      const { num_results_per_page: numResultsPerPage, page, query, status } = parameters;

      // Pull number of results per page from parameters
      if (numResultsPerPage) {
        queryParams.num_results_per_page = numResultsPerPage;
      }

      // Pull page from parameters
      if (page) {
        queryParams.page = page;
      }

      // Pull query from parameters
      if (query) {
        queryParams.query = query;
      }

      // Pull status from parameters
      if (status) {
        queryParams.status = status;
      }
    }

    try {
      requestUrl = createCatalogUrl('redirect_rules', this.options, queryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    return fetch(requestUrl, {
      method: 'GET',
      headers: createAuthHeader(this.options),
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then(json => json);
  }

  /**
   * Remove redirect rule for supplied ID
   *
   * @function removeRedirectRule
   * @param {object} parameters - Additional parameters for redirect rule details
   * @param {string} parameters.id - Redirect rule ID
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/redirect_rules
   */
  removeRedirectRule(parameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    try {
      requestUrl = createCatalogUrl(`redirect_rules/${parameters.id}`, this.options);
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
   * Send full catalog files to replace the current catalog
   *
   * @function replaceCatalog
   * @param {object} parameters - Additional parameters for catalog details
   * @param {string} parameters.section - The section that you want to update
   * @param {string} [parameters.notification_email] - An email address where you'd like to receive an email notifcation in case the task fails
   * @param {boolean} [parameters.force] - Process the catalog even if it will invalidate a large number of existing items. Defaults to false
   * @param {file} [parameters.items] - The CSV file with all new items
   * @param {file} [parameters.variations] - The CSV file with all new variations
   * @param {file} [parameters.item_groups] - The CSV file with all new item_groups
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/full_catalog
   */
  async replaceCatalog(parameters = {}) {
    let requestUrl;
    const queryParams = {};
    const formData = new FormData();
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    if (parameters) {
      const { section } = parameters;
      let { items, variations, item_groups: itemGroups } = parameters;

      try {
        // Convert items to buffer if passed as stream
        if (items instanceof fs.ReadStream) {
          items = await convertToBuffer(items);
        }

        // Convert variations to buffer if passed as stream
        if (variations instanceof fs.ReadStream) {
          variations = await convertToBuffer(variations);
        }

        // Convert item groups to buffer if passed as stream
        if (itemGroups instanceof fs.ReadStream) {
          itemGroups = await convertToBuffer(itemGroups);
        }
      } catch (e) {
        return Promise.reject(e);
      }

      // Pull section from parameters
      if (section) {
        queryParams.section = section;
      }

      // Pull items from parameters
      if (items) {
        formData.append('items', items, {
          filename: 'items.csv',
        });
      }

      // Pull variations from parameters
      if (variations) {
        formData.append('variations', variations, {
          filename: 'variations.csv',
        });
      }

      // Pull item groups from parameters
      if (itemGroups) {
        formData.append('item_groups', itemGroups, {
          filename: 'item_groups.csv',
        });
      }
    }

    try {
      requestUrl = createCatalogUrl('catalog', this.options, queryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    try {
      return fetch(requestUrl, {
        method: 'PUT',
        body: formData,
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
   * Send delta catalog files to update the current catalog
   *
   * @function updateCatalog
   * @param {object} parameters - Additional parameters for catalog details
   * @param {string} parameters.section - The section that you want to update
   * @param {string} [parameters.notification_email] - An email address where you'd like to receive an email notifcation in case the task fails.
   * @param {boolean} [parameters.force] - Process the catalog even if it will invalidate a large number of existing items. Defaults to False.
   * @param {file} [parameters.items] - The CSV file with all new items
   * @param {file} [parameters.variations] - The CSV file with all new variations
   * @param {file} [parameters.item_groups] - The CSV file with all new item_groups
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/full_catalog
   */
  async updateCatalog(parameters = {}) {
    let requestUrl;
    const queryParams = {};
    const formData = new FormData();
    const fetch = (this.options && this.options.fetch) || nodeFetch;

    if (parameters) {
      const { section } = parameters;
      let { items, variations, item_groups: itemGroups } = parameters;

      try {
        // Convert items to buffer if passed as stream
        if (items instanceof fs.ReadStream) {
          items = await convertToBuffer(items);
        }

        // Convert variations to buffer if passed as stream
        if (variations instanceof fs.ReadStream) {
          variations = await convertToBuffer(variations);
        }

        // Convert item groups to buffer if passed as stream
        if (itemGroups instanceof fs.ReadStream) {
          itemGroups = await convertToBuffer(itemGroups);
        }
      } catch (e) {
        return Promise.reject(e);
      }

      // Pull section from parameters
      if (section) {
        queryParams.section = section;
      }

      // Pull items from parameters
      if (items) {
        formData.append('items', items, {
          filename: 'items.csv',
        });
      }

      // Pull variations from parameters
      if (variations) {
        formData.append('variations', variations, {
          filename: 'variations.csv',
        });
      }

      // Pull item groups from parameters
      if (itemGroups) {
        formData.append('item_groups', itemGroups, {
          filename: 'item_groups.csv',
        });
      }
    }

    try {
      requestUrl = createCatalogUrl('catalog', this.options, queryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    try {
      return fetch(requestUrl, {
        method: 'PATCH',
        body: formData,
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
