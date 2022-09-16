/* eslint-disable camelcase */
/* eslint-disable object-curly-newline, no-underscore-dangle, max-len */
const qs = require('qs');
const nodeFetch = require('node-fetch').default;
const { AbortController } = require('node-abort-controller');
const FormData = require('form-data');
const fs = require('fs');
const { Duplex } = require('stream');
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

// Create query parameters and form data using the parameters
async function createQueryParamsAndFormData(parameters) {
  const queryParams = {};
  const formData = new FormData();

  if (parameters) {
    const { section, notification_email: notificationEmail, force } = parameters;
    let { items, variations, item_groups: itemGroups } = parameters;

    try {
      // Convert items to buffer if passed as stream
      if (items instanceof fs.ReadStream || items instanceof Duplex) {
        items = await convertToBuffer(items);
      }

      // Convert variations to buffer if passed as stream
      if (variations instanceof fs.ReadStream || variations instanceof Duplex) {
        variations = await convertToBuffer(variations);
      }

      // Convert item groups to buffer if passed as stream
      if (itemGroups instanceof fs.ReadStream || itemGroups instanceof Duplex) {
        itemGroups = await convertToBuffer(itemGroups);
      }
    } catch (e) {
      throw new Error(e);
    }

    // Pull section from parameters
    if (section) {
      queryParams.section = section;
    }

    // Pull notification email from parameters
    if (notificationEmail) {
      queryParams.notification_email = notificationEmail;
    }

    // Pull force from parameters
    if (force) {
      queryParams.force = force;
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

  return { queryParams, formData };
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
   * Adds multiple items to your index whilst replacing existing ones (limit of 1,000)
   *
   * @function createOrReplaceItems
   * @param {object} parameters - Additional parameters for item details
   * @param {boolean} [parameters.force=false] - Process the request even if it will invalidate a large number of existing items. Defaults to False.
   * @param {string} parameters.notification_email - An email address where you'd like to receive an email notification in case the task fails.
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this item is for
   * @param {object[]} parameters.items - A list of items with the same attributes as defined in the Item schema resource https://docs.constructor.io/rest_api/items/items/#item-schema
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/items#create-or-replace-items
   * @example
   * constructorio.catalog.createOrReplaceItems({
   *     items: [
   *         {
   *             name: 'midnight black pullover hoodie',
   *             id: 'blk_pllvr_hd_001',
   *             data: {
   *               keywords: ['midnight black', 'black', 'hoodie', 'tops', 'outerwear'],
   *               url: '/products/blk_pllvr_hd_001'
   *               image_url: '/products/images/blk_pllvr_hd_001'
   *               description: 'a modified short description about the black pullover hoodie',
   *             }
   *         },
   *         . . .
   *     ],
   *     section: 'Products',
   * });
   */
  createOrReplaceItems(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { section, force = false, notification_email, ...rest } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
      force,
      ...(notification_email && { notification_email }),
    };

    try {
      requestUrl = createCatalogUrl('items', this.options, additionalQueryParams, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Update multiple items to index (limit of 1,000)
   *
   * @function updateItems
   * @param {object} parameters - Additional parameters for item details
   * @param {boolean} [parameters.force=false] - Process the request even if it will invalidate a large number of existing items. Defaults to False.
   * @param {string} parameters.notification_email - An email address where you'd like to receive an email notification in case the task fails.
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this item is for
   * @param {object[]} parameters.items - A list of items with the same attributes as defined in the Item schema resource https://docs.constructor.io/rest_api/items/items/#item-schema
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/items#update-items
   * @example
   * constructorio.catalog.updateItems({
   *     items: [
   *         {
   *             name: 'midnight black pullover hoodie',
   *             id: 'blk_pllvr_hd_001',
   *             data: {
   *               keywords: ['midnight black', 'black', 'hoodie', 'tops', 'outerwear'],
   *               url: '/products/blk_pllvr_hd_001'
   *               image_url: '/products/images/blk_pllvr_hd_001'
   *               description: 'a modified short description about the black pullover hoodie',
   *             }
   *         },
   *         . . .
   *     ],
   *     section: 'Products',
   * });
   */
  updateItems(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { section, force, notification_email, ...rest } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
      force,
      ...(notification_email && { notification_email }),
    };

    try {
      requestUrl = createCatalogUrl('items', this.options, additionalQueryParams, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PATCH',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
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
   * @function deleteItems
   * @param {object} parameters - Additional parameters for item details
   * @param {object[]} parameters.items - A list of items with the same attributes as defined in the Item schema resource https://docs.constructor.io/rest_api/items/items/#item-schema. Only IDs are required for the delete operation.
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this item is for
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/items#delete-items
   * @example
   * constructorio.catalog.deleteItems({
   *     items: [
   *         { id: 'blk_pllvr_hd_001' },
   *         { id: 'red_pllvr_hd_02' },
   *     ],
   *     section: 'Products',
   * });
   */
  deleteItems(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    const { section, key, ...rest } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
      key,
    };

    try {
      requestUrl = createCatalogUrl('items', this.options, additionalQueryParams, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'DELETE',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
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
   * @function retrieveItems
   * @param {object} parameters - Additional parameters for item details
   * @param {string[]} parameters.ids - Id(s) of items to return. Maximum number of ids to request is 1000.
   * @param {string} parameters.section - The index section you'd like to retrieve results from.
   * @param {number} parameters.numResultsPerPage - The number of items to return. Defaults to 100. Maximum value 100.
   * @param {number} parameters.page -The page of results to return. Defaults to 1.
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/items#retrieve-items
   * @example
   * constructorio.catalog.retrieveItems({
   *     section: 'Products',
   *     numResultsPerPage: 50,
   *     page: 2,
   * });
   * @example
   * constructorio.catalog.retrieveItems({
   *     ids: ['blk_pllvr_hd_001', 'blk_pllvr_hd_002']
   *     section: 'Products',
   *     numResultsPerPage: 50,
   *     page: 2,
   * });
   */
  retrieveItems(parameters = {}, networkParameters = {}) {
    let queryParams = {};
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { ids, section, numResultsPerPage, page } = parameters;
    queryParams = {
      section,
      ...(numResultsPerPage && { numResultsPerPage }),
      ...(page && { page }),
      ...(ids && { id: ids }),
    };

    try {
      requestUrl = createCatalogUrl('items', this.options, queryParams, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {

        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Adds multiple variations to your index whilst replacing existing ones (limit of 1,000)
   *
   * @function createOrReplaceVariations
   * @param {object} parameters - Additional parameters for variation details
   * @param {boolean} [parameters.force=false] - Process the request even if it will invalidate a large number of existing variations. Defaults to False.
   * @param {string} parameters.notification_email - An email address where you'd like to receive an email notification in case the task fails.
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this variation is for
   * @param {object[]} parameters.variations - A list of variations with the same attributes as defined in the Variation schema resource https://docs.constructor.io/rest_api/items/variations/#variation-schema
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/variations/#create-or-replace-variations
   * @example
   * constructorio.catalog.createOrReplaceVariations({
   *     variations: [
   *         {
   *             name: 'midnight black pullover hoodie',
   *             id: 'blk_pllvr_hd_001',
   *             item_id: "nike-shoes-brown",
   *             data: {
   *               keywords: ['midnight black', 'black', 'hoodie', 'tops', 'outerwear'],
   *               url: '/products/blk_pllvr_hd_001'
   *               image_url: '/products/images/blk_pllvr_hd_001'
   *               description: 'a modified short description about the black pullover hoodie',
   *             }
   *         },
   *         . . .
   *     ],
   *     section: 'Products',
   * });
   */
  createOrReplaceVariations(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { section, force = false, notification_email, ...rest } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
      force,
      ...(notification_email && { notification_email }),
    };

    try {
      requestUrl = createCatalogUrl('variations', this.options, additionalQueryParams, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Update multiple variations to index (limit of 1,000)
   *
   * @function updateVariations
   * @param {object} parameters - Additional parameters for variation details
   * @param {boolean} [parameters.force=false] - Process the request even if it will invalidate a large number of existing variations. Defaults to False.
   * @param {string} parameters.notification_email - An email address where you'd like to receive an email notification in case the task fails.
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this variation is for
   * @param {object[]} parameters.variations - A list of variations with the same attributes as defined in the Variation schema resource https://docs.constructor.io/rest_api/items/variations/#variation-schema
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/variations/#update-variations
   * @example
   * constructorio.catalog.updateVariations({
   *     variations: [
   *         {
   *             name: 'midnight black pullover hoodie',
   *             id: 'blk_pllvr_hd_001',
   *             item_id: "nike-shoes-brown",
   *             data: {
   *               keywords: ['midnight black', 'black', 'hoodie', 'tops', 'outerwear'],
   *               url: '/products/blk_pllvr_hd_001'
   *               image_url: '/products/images/blk_pllvr_hd_001'
   *               description: 'a modified short description about the black pullover hoodie',
   *             }
   *         },
   *         . . .
   *     ],
   *     section: 'Products',
   * });
   */
  updateVariations(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { section, force, notification_email, ...rest } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
      force,
      ...(notification_email && { notification_email }),
    };

    try {
      requestUrl = createCatalogUrl('variations', this.options, additionalQueryParams, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PATCH',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Remove multiple variations from your index (limit of 1,000)
   *
   * @function deleteVariations
   * @param {object} parameters - Additional parameters for variation details
   * @param {object[]} parameters.variations - A list of variations with the same attributes as defined in the Variation schema resource https://docs.constructor.io/rest_api/items/variations/#variation-schema
   * @param {string} parameters.section - Your autosuggest and search results can have multiple sections like "Products" and "Search Suggestions". This indicates which section this variation is for
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/variations/#delete-variations
   * @example
   * constructorio.catalog.deleteVariations({
   *     variations: [
   *         { id: 'blk_pllvr_hd_001' },
   *         { id: 'red_pllvr_hd_02' },
   *     ],
   *     section: 'Products',
   * });
   */
  deleteVariations(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    const { section, key, ...rest } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
      key,
    };

    try {
      requestUrl = createCatalogUrl('variations', this.options, additionalQueryParams, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'DELETE',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return Promise.resolve();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Retrieves variation(s) from index for the given section or specific variation ID
   *
   * @function retrieveVariations
   * @param {object} parameters - Additional parameters for variation details
   * @param {string[]} parameters.ids - Id(s) of variations to return. Maximum number of ids to request is 1000.
   * @param {string[]} parameters.itemsIds - items Id(s) of items of variations to return. Maximum number of ids to request is 1000.
   * @param {string} parameters.section - The index section you'd like to retrieve results from.
   * @param {number} parameters.numResultsPerPage - The number of variations to return. Defaults to 100. Maximum value 100.
   * @param {number} parameters.page -The page of results to return. Defaults to 1.
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/items/variations/#retrieve-variations
   * @example
   * constructorio.catalog.retrieveVariations({
   *     section: 'Products',
   *     numResultsPerPage: 50,
   *     page: 2,
   * });
   * @example
   * constructorio.catalog.retrieveVariations({
   *     ids: ['blk_pllvr_hd_001', 'blk_pllvr_hd_002']
   *     section: 'Products',
   *     numResultsPerPage: 50,
   *     page: 2,
   * });
   */
  retrieveVariations(parameters = {}, networkParameters = {}) {
    let queryParams = {};
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { ids, itemsIds, section, numResultsPerPage, page } = parameters;
    queryParams = {
      section,
      ...(numResultsPerPage && { numResultsPerPage }),
      ...(page && { page }),
      ...(ids && { id: ids }),
      ...(itemsIds && { item_id: itemsIds }),

    };

    try {
      requestUrl = createCatalogUrl('variations', this.options, queryParams, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Add item group to index
   *
   * @function addItemGroup
   * @param {object} parameters - Additional parameters for item group details
   * @param {string} parameters.id - Item group ID
   * @param {string} parameters.name - Item group name
   * @param {string} [parameters.parent_id] - Item group parent ID
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/item_groups
   * @example
   * constructorio.catalog.addItemGroup({
   *     id: 'subcat_12891',
   *     name: 'Hoodies & Sweaters',
   *     parent_id: 'cat_49203',
   * });
   */
  addItemGroup(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { id, ...rest } = parameters;

    try {
      requestUrl = createCatalogUrl(`item_groups/${id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
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
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/item_groups
   * @example
   * constructorio.catalog.addItemGroups({
   *     item_groups: [
   *         {
   *             id: 'subcat_12891',
   *             name: 'Hoodies & Sweaters',
   *             parent_id: 'cat_49203',
   *         },
   *         {
   *             id: 'cat49203',
   *             name: 'Outerwear',
   *         },
   *     ],
   * });
   */
  addItemGroups(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl('item_groups', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
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
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/item_groups
   * @example
   * constructorio.catalog.getItemGroup({
   *     id: 'subcat_12891',
   * });
   */
  getItemGroup(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl(`item_groups/${parameters.id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Retrieves item groups from index
   *
   * @function getItemGroups
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/item_groups
   * @example
   * constructorio.catalog.getItemGroups();
   */
  getItemGroups(networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl('item_groups', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Add multiple item groups to index whilst updating existing ones (limit of 1,000)
   *
   * @function addOrUpdateItemGroups
   * @param {object} parameters - Additional parameters for item group details
   * @param {object[]} parameters.item_groups - A list of item groups
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/item_groups
  * @example
   * constructorio.catalog.addOrUpdateItemGroups({
   *     item_groups: [
   *         {
   *             id: 'subcat_12891',
   *             name: 'Hoodies, Sweaters, & Jackets',
   *             parent_id: 'cat_49203',
   *         },
   *         {
   *             id: 'cat49203',
   *             name: 'Outerwear',
   *         },
   *     ],
   * });
   */
  addOrUpdateItemGroups(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl('item_groups', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PATCH',
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
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
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/item_groups
   * @example
   * constructorio.catalog.modifyItemGroup({
   *     id: 'subcat_12891',
   *     name: 'Hoodies, Sweaters & Jackets',
   *     parent_id: 'cat_49203',
   *     data: {
   *         landing_image_url: '/images/hd_swtrs_jckts.jpg',
   *     },
   * });
   */
  modifyItemGroup(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { id, ...rest } = parameters;

    try {
      requestUrl = createCatalogUrl(`item_groups/${id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Remove all item groups from index
   *
   * @function removeItemGroups
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/item_groups
   * @example
   * constructorio.catalog.removeItemGroups();
   */
  removeItemGroups(networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl('item_groups', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'DELETE',
      headers: helpers.createAuthHeader(this.options),
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Add a one way synonym
   *
   * @function addOneWaySynonym
   * @param {object} parameters - Additional parameters for synonym details
   * @param {string} parameters.phrase - Parent phrase
   * @param {string[]} parameters.child_phrases - Array of synonyms
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/one_way_synonyms/add_synonyms
   * @example
   * constructorio.catalog.addOneWaySynonym({
   *     phrase: 'spices',
   *     child_phrases: [
   *         { phrase: 'pepper' },
   *         { phrase: 'cinnamon' },
   *     ],
   * });
   */
  addOneWaySynonym(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { phrase, ...rest } = parameters;

    try {
      requestUrl = createCatalogUrl(`one_way_synonyms/${phrase}`, this.options, {}, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
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
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/one_way_synonyms/modify_synonyms
   * @example
   * constructorio.catalog.modifyOneWaySynonym({
   *     phrase: 'spices',
   *     child_phrases: [
   *         { phrase: 'pepper' },
   *         { phrase: 'cinnamon' },
   *         { phrase: 'paprika' },
   *     ],
   * });
   */
  modifyOneWaySynonym(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { phrase, ...rest } = parameters;

    try {
      requestUrl = createCatalogUrl(`one_way_synonyms/${phrase}`, this.options, {}, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
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
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/one_way_synonyms/retrieve_synonyms
   * @example
   * constructorio.catalog.getOneWaySynonym({
   *     phrase: 'spices',
   * });
   */
  getOneWaySynonym(parameters = {}, networkParameters = {}) {
    const { phrase } = parameters;
    const queryParams = {};
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl(`one_way_synonyms/${phrase}`, this.options, queryParams, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Retrieve one way synonyms
   *
   * @function getOneWaySynonyms
   * @param {object} [parameters] - Additional parameters for synonym details
   * @param {number} [parameters.num_results_per_page] - The number of synonym groups to return. Defaults to 100
   * @param {number} [parameters.page] - The page of results to return. Defaults to 1
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/one_way_synonyms/retrieve_synonyms
   * @example
   * constructorio.catalog.getOneWaySynonyms({
   *     num_results_per_page: 50,
   *     page: 2,
   * });
   */
  getOneWaySynonyms(parameters = {}, networkParameters = {}) {
    const queryParams = {};
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

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

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Remove one way synonym
   *
   * @function removeOneWaySynonym
   * @param {object} parameters - Additional parameters for synonym details
   * @param {string} parameters.phrase - Parent phrase
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/one_way_synonyms/remove_synonyms
   * @example
   * constructorio.catalog.removeOneWaySynonym({
   *     phrase: 'spices',
   * });
   */
  removeOneWaySynonym(parameters = {}, networkParameters = {}) {
    const { phrase } = parameters;
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl(`one_way_synonyms/${phrase}`, this.options, {}, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
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
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/one_way_synonyms/remove_synonyms
   * @example
   * constructorio.catalog.removeOneWaySynonyms();
   */
  removeOneWaySynonyms(networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl('one_way_synonyms', this.options, {}, 'v2');
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
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
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/synonyms/
   * @example
   * constructorio.catalog.addSynonymGroup({
   *     synonyms: ['0% milk', 'skim milk'],
   * });
   */
  addSynonymGroup(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl('synonym_groups', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Modify a synonym group for supplied ID
   *
   * @function modifySynonymGroup
   * @param {object} parameters - Additional parameters for synonym group details
   * @param {number} parameters.id - Synonym group ID
   * @param {object[]} parameters.synonyms - Determines what phrases will be included in the final synonym group
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/synonyms/
   * @example
   * constructorio.catalog.modifySynonymGroup({
   *     id: 32,
   *     synonyms: ['0% milk', 'skim milk', 'fat free milk'],
   * });
   */
  modifySynonymGroup(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { id, ...rest } = parameters;

    try {
      requestUrl = createCatalogUrl(`synonym_groups/${id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
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
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/synonyms/
   * @example
   * constructorio.catalog.modifySynonymGroup({
   *     id: 32,
   * });
   */
  getSynonymGroup(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl(`synonym_groups/${parameters.id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: helpers.createAuthHeader(this.options),
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Retrieve all synonym groups optionally filtered by phrase
   *
   * @function getSynonymGroups
   * @param {object} [parameters] - Additional parameters for synonym group details
   * @param {string} [parameters.phrase] - The phrase for which all synonym groups containing it will be returned
   * @param {number} [parameters.num_results_per_page] - The number of synonym groups to return. Defaults to 100
   * @param {number} [parameters.page] - The page of results to return. Defaults to 1
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/synonyms/
   * @example
   * constructorio.catalog.modifySynonymGroup({
   *     phrase: '0% milk',
   *     num_results_per_page: 50,
   *     page: 3,
   * });
   */
  getSynonymGroups(parameters = {}, networkParameters = {}) {
    const queryParams = {};
    const { phrase } = parameters;
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

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

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: helpers.createAuthHeader(this.options),
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Remove synonym group for supplied ID
   *
   * @function removeSynonymGroup
   * @param {object} parameters - Additional parameters for synonym group details
   * @param {number} parameters.id - The synonym group you would like deleted
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/synonyms/
   * @example
   * constructorio.catalog.removeSynonymGroup({
   *     id: 32,
   * });
   */
  removeSynonymGroup(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { id } = parameters;

    try {
      requestUrl = createCatalogUrl(`synonym_groups/${id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'DELETE',
      headers: helpers.createAuthHeader(this.options),
      signal,
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
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/synonyms/
   * @example
   * constructorio.catalog.modifySynonymGroup();
   */
  removeSynonymGroups(networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl('synonym_groups', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'DELETE',
      headers: helpers.createAuthHeader(this.options),
      signal,
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
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/redirect_rules
   * @example
   * constructorio.catalog.addRedirectRule({
   *     url: '/categories/cat_49203',
   *     matches: [{
   *         pattern: 'outerwear',
   *         match_type: 'EXACT'
   *     }],
   *     start_time: '2022-08-11T23:41:02.568Z',
   *     end_time: '2022-08-20T23:41:02.568Z',
   *     user_segments: ['US', 'Mobile'],
   *     metadata: {
   *         additional_data: 'additional string data',
   *     },
   * });
   */
  addRedirectRule(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl('redirect_rules', this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
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
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/redirect_rules
   * @example
   * constructorio.catalog.updateRedirectRule({
   *     id: 1,
   *     url: '/categories/cat_49203',
   *     matches: [{
   *         pattern: 'outerwear',
   *         match_type: 'EXACT'
   *     }],
   *     user_segments: ['US', 'Mobile', 'Web'],
   *     metadata: {
   *         additional_data: 'additional string data',
   *     },
   * });
   */
  updateRedirectRule(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { id, ...rest } = parameters;

    try {
      requestUrl = createCatalogUrl(`redirect_rules/${id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
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
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/redirect_rules
   * @example
   * constructorio.catalog.modifyRedirectRule({
   *     id: '1',
   *     url: '/categories/cat_49203',
   *     matches: [{
   *         pattern: 'outerwear',
   *         match_type: 'EXACT'
   *     }],
   *     user_segments: ['US', 'Mobile', 'Web'],
   * });
   */
  modifyRedirectRule(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { id, ...rest } = parameters;

    try {
      requestUrl = createCatalogUrl(`redirect_rules/${id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PATCH',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Retrieve redirect rule for supplied ID
   *
   * @function getRedirectRule
   * @param {object} parameters - Additional parameters for redirect rule details
   * @param {string} parameters.id - Redirect rule ID
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/redirect_rules
   * @example
   * constructorio.catalog.getRedirectRule({
   *     id: '1',
   * });
   */
  getRedirectRule(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl(`redirect_rules/${parameters.id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: helpers.createAuthHeader(this.options),
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
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
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/redirect_rules
   * @example
   * constructorio.catalog.getRedirectRules({
   *     num_results_per_page: 50,
   *     page: 2,
   *     query: 'outerwear',
   *     status: 'active',
   * });
   */
  getRedirectRules(parameters = {}, networkParameters = {}) {
    const queryParams = {};
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

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

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: helpers.createAuthHeader(this.options),
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Remove redirect rule for supplied ID
   *
   * @function removeRedirectRule
   * @param {object} parameters - Additional parameters for redirect rule details
   * @param {string} parameters.id - Redirect rule ID
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/redirect_rules
   * @example
   * constructorio.catalog.removeRedirectRule({
   *     id: '1',
   * });
   */
  removeRedirectRule(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createCatalogUrl(`redirect_rules/${parameters.id}`, this.options);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'DELETE',
      headers: helpers.createAuthHeader(this.options),
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    }).then((json) => json);
  }

  /**
   * Send full catalog files to replace the current catalog
   *
   * @function replaceCatalog
   * @param {object} parameters - Additional parameters for catalog details
   * @param {string} parameters.section - The section to update
   * @param {string} [parameters.notification_email] - An email address to receive an email notification if the task fails
   * @param {boolean} [parameters.force=false] - Process the catalog even if it will invalidate a large number of existing items
   * @param {file} [parameters.items] - The CSV file with all new items
   * @param {file} [parameters.variations] - The CSV file with all new variations
   * @param {file} [parameters.item_groups] - The CSV file with all new item_groups
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/full_catalog
   * @example
   * constructorio.catalog.replaceCatalog({
   *     section: 'Products',
   *     notification_email: 'notifications@example.com',
   *     items: itemsFileBufferOrStream,
   *     variations: variationsFileBufferOrStream,
   *     item_groups: itemGroupsFileBufferOrStream,
   * });
   */
  async replaceCatalog(parameters = {}, networkParameters = {}) {
    try {
      const fetch = (this.options && this.options.fetch) || nodeFetch;
      const controller = new AbortController();
      const { signal } = controller;
      const { queryParams, formData } = await createQueryParamsAndFormData(parameters);
      const requestUrl = createCatalogUrl('catalog', this.options, queryParams);

      // Handle network timeout if specified
      helpers.applyNetworkTimeout(this.options, networkParameters, controller);

      const response = await fetch(requestUrl, {
        method: 'PUT',
        body: formData,
        headers: helpers.createAuthHeader(this.options),
        signal,
      });

      if (response.ok) {
        return Promise.resolve(response.json());
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Send delta catalog files to update the current catalog
   *
   * @function updateCatalog
   * @param {object} parameters - Additional parameters for catalog details
   * @param {string} parameters.section - The section to update
   * @param {string} [parameters.notification_email] - An email address to receive an email notification if the task fails
   * @param {boolean} [parameters.force=false] - Process the catalog even if it will invalidate a large number of existing items
   * @param {file} [parameters.items] - The CSV file with all new items
   * @param {file} [parameters.variations] - The CSV file with all new variations
   * @param {file} [parameters.item_groups] - The CSV file with all new item_groups
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/full_catalog
   * @example
   * constructorio.catalog.updateCatalog({
   *     section: 'Products',
   *     notification_email: 'notifications@example.com',
   *     items: itemsFileBufferOrStream,
   *     variations: variationsFileBufferOrStream,
   *     item_groups: itemGroupsFileBufferOrStream,
   * });
   */
  async updateCatalog(parameters = {}, networkParameters = {}) {
    try {
      const fetch = (this.options && this.options.fetch) || nodeFetch;
      const controller = new AbortController();
      const { signal } = controller;
      const { queryParams, formData } = await createQueryParamsAndFormData(parameters);
      const requestUrl = createCatalogUrl('catalog', this.options, queryParams);

      // Handle network timeout if specified
      helpers.applyNetworkTimeout(this.options, networkParameters, controller);

      const response = await fetch(requestUrl, {
        method: 'PATCH',
        body: formData,
        headers: helpers.createAuthHeader(this.options),
        signal,
      });

      if (response.ok) {
        return Promise.resolve(response.json());
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Send patch delta catalog files to patch the current catalog
   *
   * @function patchCatalog
   * @param {object} parameters - Additional parameters for catalog details
   * @param {string} parameters.section - The section to update
   * @param {string} [parameters.notification_email] - An email address to receive an email notification if the task fails
   * @param {boolean} [parameters.force=false] - Process the catalog even if it will invalidate a large number of existing items
   * @param {file} [parameters.items] - The CSV file with all new items
   * @param {file} [parameters.variations] - The CSV file with all new variations
   * @param {file} [parameters.item_groups] - The CSV file with all new item_groups
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/full_catalog
   * @example
   * constructorio.catalog.patchCatalog({
   *     section: 'Products',
   *     notification_email: 'notifications@example.com',
   *     items: itemsFileBufferOrStream,
   *     variations: variationsFileBufferOrStream,
   *     item_groups: itemGroupsFileBufferOrStream,
   * });
   */
  async patchCatalog(parameters = {}, networkParameters = {}) {
    try {
      const fetch = (this.options && this.options.fetch) || nodeFetch;
      const controller = new AbortController();
      const { signal } = controller;
      const { queryParams, formData } = await createQueryParamsAndFormData(parameters);
      const requestUrl = createCatalogUrl('catalog', this.options, { ...queryParams, patch_delta: true });

      // Handle network timeout if specified
      helpers.applyNetworkTimeout(this.options, networkParameters, controller);

      const response = await fetch(requestUrl, {
        method: 'PATCH',
        body: formData,
        headers: helpers.createAuthHeader(this.options),
        signal,
      });

      if (response.ok) {
        return Promise.resolve(response.json());
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Create a facet configuration
   *
   * @function addFacetConfiguration
   * @param {object} parameters - Aditional paramaters for facet configuration details
   * @param {string} parameters.name - Unique facet name used to refer to the facet in your catalog
   * @param {string} parameters.type - Type of facet. Must be one of multiple or range (numerical).
   * @param {string} [parameters.display_name] - The name of the facet presented to the end users. Defaults to null, in which case the name will be presented.
   * @param {string} [parameters.sort_order] - Defines the criterion by which the options of this facet group are sorted. Must be one of relevance, value, num_matches. Defaults to relevance. Can be overriden by setting position attribute on facet options.
   * @param {boolean} [parameters.sort_descending] - Set to true if the options should be sorted in descending order, false to sort ascencing. Default value is true if sort_order is relevance and false for others.
   * @param {string} [parameters.range_type] - Specifies how the range buckets are determined. Must be one of dynamic or static. Default value is null. Required if facet type is range and range_format is options.
   * @param {string} [parameters.range_format] - Determine wether the range facet is configured to displayed as a slider (with min/max values) or as a list of buckets. Must be one of boundaries (for sliders) or options (for buckets).
   * @param {string} [parameters.range_inclusive] - Used to create inclusive buckets. Must be one of above (options have no upper bound), below (no lower bound), or null (if range options should not be inclusive).
   * @param {number} [parameters.bucket_size] - Specifies the size of generated buckets. Default is null. Either this or range_limits are required for facet type range, format options, and range_type static
   * @param {json} [parameters.range_limits] - Defines the cut-off points for generating static range buckets. Should be a list of sorted numbers (i.e. [10, 25, 40]). Default value is null.
   * @param {string} [parameters.match_type] - Specifies the behavior of filters when multiple options of the same facet group are selected. Must be one of any, all, or none. Default value is any.
   * @param {number} [parameters.position] - Slot facet groups to fixed positions. Default value is null.
   * @param {boolean} [parameters.hidden] - Specifies whether the facet is hidden from users. Used for non-sensitive data that you don't want to show to end users. Default value is false.
   * @param {boolean} [parameters.protected] - Specifies whether the facet is protected from users. Setting to true will require authentication to view the facet. Default value is false.
   * @param {object} [parameters.data] - Dictionary/Object with any extra facet data. Default value is {} (empty dictionary/object).
   * @param {string} [parameters.section] - The section in which your facet is defined. Default value is Products.
   * @param {object[]} [parameters.options] - List of facet option configurations to create and associate with this facet group. Default value is [] (empty list).
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facets#create-a-facet-config
   * @example
   * constructorio.catalog.addFacetConfiguration({
   *     name: 'color',
   *     type: 'multiple',
   *     display_name: 'Color',
   *     sort_order: 'value',
   *     sort_descending: false,
   *     position: 1,
   * });
   */
  addFacetConfiguration(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { section, ...rest } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl('facets', this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Get all facet configurations
   *
   * @function getFacetConfigurations
   * @param {object} parameters - Aditional paramaters for retrieving facet configurations.
   * @param {number} [parameters.page] - Page number you'd like to request. Defaults to 1.
   * @param {number} [parameters.num_results_per_page] - Number of facets per page in paginated response. Default value is 100.
   * @param {string} [parameters.section] - The section in which your facet is defined. Default value is Products.
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facets#get-all-facet-configs
   * @example
   * constructorio.catalog.getFacetConfigurations({
   *     page: 2,
   *     num_results_per_page: 50,
   * });
   */
  getFacetConfigurations(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const additionalQueryParams = {
      section: parameters.section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl('facets', this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Get a single facet's configuration
   *
   * @function getFacetConfiguration
   * @param {object} parameters - Aditional paramaters for retrieving a facet configuration.
   * @param {number} [parameters.name] - Unique facet name used to refer to the facet in your catalog
   * @param {string} [parameters.section] - The section in which your facet is defined. Default value is Products.
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facets#get-a-single-facets-config
   * @example
   * constructorio.catalog.getFacetConfiguration({
   *     name: 'color',
   * });
   */
  getFacetConfiguration(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { section, name } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl(`facets/${name}`, this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Modify the configurations of multiple facets (partially) at once.
   *
   * @function modifyFacetConfigurations
   * @param {object} parameters - Aditional paramaters for modifying facet configurations
   * @param {array} parameters.facetConfigurations - List of facet configurations you would like to update. See [addFacetConfiguration]{@link module:catalog~addFacetConfiguration} for additional details on what parameters you can supply for each facet configuration.
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facets#update-facet-configs-partial
   * @example
   * constructorio.catalog.modifyFacetConfigurations(
   *     facetConfigurations: [
   *         {
   *             name: 'color',
   *             type: 'multiple',
   *             display_name: 'Color',
   *             sort_order: 'value',
   *             sort_descending: false,
   *             position: 1,
   *         },
   *         {
   *             name: 'size',
   *             ...
   *         }
   *     ],
   * });
   */
  modifyFacetConfigurations(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { section, facetConfigurations } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl('facets', this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PATCH',
      body: JSON.stringify(facetConfigurations),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Replace the configuration of a facet (completely)
   *
   * Caution: Overwrites all other configurations you may have defined for the facet group, resetting them to their defaults. This includes all facet option configurations you may have defined.
   *
   * @function replaceFacetConfiguration
   * @param {object} parameters - Aditional paramaters for facet configuration details
   * @param {string} parameters.name - Unique facet name used to refer to the facet in your catalog
   * @param {string} parameters.type - Type of facet. Must be one of multiple or range (numerical).
   * @param {string} [parameters.display_name] - The name of the facet presented to the end users. Defaults to null, in which case the name will be presented.
   * @param {string} [parameters.sort_order] - Defines the criterion by which the options of this facet group are sorted. Must be one of relevance, value, num_matches. Defaults to relevance. Can be overriden by setting position attribute on facet options.
   * @param {boolean} [parameters.sort_descending] - Set to true if the options should be sorted in descending order, false to sort ascencing. Default value is true if sort_order is relevance and false for others.
   * @param {string} [parameters.range_type] - Specifies how the range buckets are determined. Must be one of dynamic or static. Default value is null. Required if facet type is range and range_format is options.
   * @param {string} [parameters.range_format] - Determine wether the range facet is configured to displayed as a slider (with min/max values) or as a list of buckets. Must be one of boundaries (for sliders) or options (for buckets).
   * @param {string} [parameters.range_inclusive] - Used to create inclusive buckets. Must be one of above (options have no upper bound), below (no lower bound), or null (if range options should not be inclusive).
   * @param {number} [parameters.bucket_size] - Specifies the size of generated buckets. Default is null. Either this or range_limits are required for facet type range, format options, and range_type static
   * @param {json} [parameters.range_limits] - Defines the cut-off points for generating static range buckets. Should be a list of sorted numbers (i.e. [10, 25, 40]). Default value is null.
   * @param {string} [parameters.match_type] - Specifies the behavior of filters when multiple options of the same facet group are selected. Must be one of any, all, or none. Default value is any.
   * @param {number} [parameters.position] - Slot facet groups to fixed positions. Default value is null.
   * @param {boolean} [parameters.hidden] - Specifies whether the facet is hidden from users. Used for non-sensitive data that you don't want to show to end users. Default value is false.
   * @param {boolean} [parameters.protected] - Specifies whether the facet is protected from users. Setting to true will require authentication to view the facet. Default value is false.
   * @param {object} [parameters.data] - Dictionary/Object with any extra facet data. Default value is {} (empty dictionary/object).
   * @param {string} [parameters.section] - The section in which your facet is defined. Default value is Products.
   * @param {object[]} [parameters.options] - List of facet option configurations to create and associate with this facet group. Default value is [] (empty list).
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facets#update-a-facet-config-total
   * @example
   * constructorio.catalog.replaceFacetConfiguration({
   *     name: 'color',
   *     type: 'multiple',
   *     display_name: 'Color',
   *     sort_order: 'value',
   *     sort_descending: false,
   *     position: 1,
   * });
   */
  replaceFacetConfiguration(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { section, name, ...rest } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl(`facets/${name}`, this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify({ name, ...rest }),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Modify the configuration of a facet (partially)
   *
   * @function modifyFacetConfiguration
   * @param {object} parameters - Aditional paramaters for facet configuration details
   * @param {string} parameters.name - Unique facet name used to refer to the facet in your catalog
   * @param {string} parameters.type - Type of facet. Must be one of multiple or range (numerical).
   * @param {string} [parameters.display_name] - The name of the facet presented to the end users. Defaults to null, in which case the name will be presented.
   * @param {string} [parameters.sort_order] - Defines the criterion by which the options of this facet group are sorted. Must be one of relevance, value, num_matches. Defaults to relevance. Can be overriden by setting position attribute on facet options.
   * @param {boolean} [parameters.sort_descending] - Set to true if the options should be sorted in descending order, false to sort ascencing. Default value is true if sort_order is relevance and false for others.
   * @param {string} [parameters.range_type] - Specifies how the range buckets are determined. Must be one of dynamic or static. Default value is null. Required if facet type is range and range_format is options.
   * @param {string} [parameters.range_format] - Determine wether the range facet is configured to displayed as a slider (with min/max values) or as a list of buckets. Must be one of boundaries (for sliders) or options (for buckets).
   * @param {string} [parameters.range_inclusive] - Used to create inclusive buckets. Must be one of above (options have no upper bound), below (no lower bound), or null (if range options should not be inclusive).
   * @param {number} [parameters.bucket_size] - Specifies the size of generated buckets. Default is null. Either this or range_limits are required for facet type range, format options, and range_type static
   * @param {json} [parameters.range_limits] - Defines the cut-off points for generating static range buckets. Should be a list of sorted numbers (i.e. [10, 25, 40]). Default value is null.
   * @param {string} [parameters.match_type] - Specifies the behavior of filters when multiple options of the same facet group are selected. Must be one of any, all, or none. Default value is any.
   * @param {number} [parameters.position] - Slot facet groups to fixed positions. Default value is null.
   * @param {boolean} [parameters.hidden] - Specifies whether the facet is hidden from users. Used for non-sensitive data that you don't want to show to end users. Default value is false.
   * @param {boolean} [parameters.protected] - Specifies whether the facet is protected from users. Setting to true will require authentication to view the facet. Default value is false.
   * @param {object} [parameters.data] - Dictionary/Object with any extra facet data. Default value is {} (empty dictionary/object).
   * @param {string} [parameters.section] - The section in which your facet is defined. Default value is Products.
   * @param {object[]} [parameters.options] - List of facet option configurations to create and associate with this facet group. Default value is [] (empty list).
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facets#update-a-facet-config-partial
   * @example
   * constructorio.catalog.modifyFacetConfiguration({
   *     name: 'color',
   *     type: 'multiple',
   *     display_name: 'Color',
   *     sort_order: 'num_matches',
   *     sort_descending: true,
   *     position: 1,
   * });
   */
  modifyFacetConfiguration(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { section, name, ...rest } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl(`facets/${name}`, this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PATCH',
      body: JSON.stringify({ name, ...rest }),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Remove a facet configuration
   *
   * Caution: Once a facet group's configuration is removed, all configurations will return to their default values. This includes all facet option configurations (display name, position, etc) you may have defined for the facet group.
   *
   * @function removeFacetConfiguration
   * @param {object} parameters - Aditional paramaters for facet configuration details
   * @param {string} parameters.name - Unique facet name used to refer to the facet in your catalog
   * @param {string} [parameters.section] - The section in which your facet is defined. Default value is Products.
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facets#delete-a-facet-config
   * @example
   * constructorio.catalog.removeFacetConfiguration({
   *     name: 'color',
   * });
   */
  removeFacetConfiguration(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { section, name } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl(`facets/${name}`, this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'DELETE',
      headers: {
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Create a facet option configuration
   *
   * @function addFacetOptionConfiguration
   * @param {object} parameters - Aditional paramaters for facet option configuration details
   * @param {string} parameters.facetGroupName - Unique facet name used to refer to the facet in your catalog
   * @param {string} parameters.value - A unique value for the facet option
   * @param {string} [parameters.display_name=null] - The name of the facet presented to the end users - if none is supplied, the value from name will be used
   * @param {number} [parameters.position=null] - Slot facet groups to fixed positions
   * @param {boolean} [parameters.hidden=false] - Specifies whether the facet option is hidden from users
   * @param {object} [parameters.data={}] - Dictionary/Object with any extra facet data
   * @param {string} [parameters.section='Products'] - The section in which your facet is defined
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facet_options#create-a-facet-option-config
   * @example
   * constructorio.catalog.addFacetOptionConfiguration({
   *     facetGroupName: 'color',
   *     value: 'blue',
   *     display_name: 'Blue',
   *     position: 5,
   * });
   */
  addFacetOptionConfiguration(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { facetGroupName, section, ...rest } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl(`facets/${facetGroupName}/options`, this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(rest),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Create new facet option configurations or modify if they already exist
   *
   * @function addOrModifyFacetOptionConfigurations
   * @param {object} parameters - Aditional paramaters for facet option configuration details
   * @param {string} parameters.facetGroupName - Unique facet name used to refer to the facet in the catalog
   * @param {object[]} parameters.facetOptionConfigurations - List of facet option configurations to would like to update - refer to [addFacetConfiguration]{@link module:catalog~addFacetOptionConfiguration} for additional details on what parameters can be supplied for each facet option configuration
   * @param {string} [parameters.section='Products'] - The section in which your facet is defined
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facet_options#batch-update-or-create-facet-options-configs
   * @example
   * constructorio.catalog.addOrModifyFacetOptionConfigurations({
   *     facetGroupName: 'color',
   *     facetOptionConfigurations: [
   *         {
   *             value: 'blue',
   *             display_name: 'Blue',
   *             position: 5,
   *         },
   *         {
   *             value: 'red',
   *             display_name: 'Red',
   *             position: 3,
   *         },
   *     ],
   * });
   */
  addOrModifyFacetOptionConfigurations(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { facetGroupName, section, facetOptionConfigurations } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl(`facets/${facetGroupName}/options`, this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PATCH',
      body: JSON.stringify(facetOptionConfigurations),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Get all facet option configurations for a given facet
   *
   * @function getFacetOptionConfigurations
   * @param {object} parameters - Aditional paramaters for facet option configuration details
   * @param {string} parameters.facetGroupName - Unique facet name used to refer to the facet in your catalog
   * @param {number} [parameters.page=1] - Page number you'd like to request
   * @param {number} [parameters.num_results_per_page=100] - Number of facets per page in paginated response
   * @param {string} [parameters.section='Products'] - The section in which your facet is defined
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facet_options#get-all-option-configs-for-facet
   * @example
   * constructorio.catalog.getFacetOptionConfigurations({
   *     facetGroupName: 'color',
   *     page: 3,
   *     num_results_per_page: 50
   * });
   */
  getFacetOptionConfigurations(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { facetGroupName, section } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl(`facets/${facetGroupName}/options`, this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Get a single facet option configuration for a given facet
   *
   * @function getFacetOptionConfiguration
   * @param {object} parameters - Aditional paramaters for facet option configuration details
   * @param {string} parameters.facetGroupName - Unique facet name used to refer to the facet in your catalog
   * @param {string} parameters.value - The facet option value. Unique for a particular facet
   * @param {string} [parameters.section='Products'] - The section in which your facet is defined
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facet_options#get-a-single-facet-option-config
   * @example
   * constructorio.catalog.getFacetOptionConfiguration({
   *     facetGroupName: 'color',
   *     value: 'blue',
   * });
   */
  getFacetOptionConfiguration(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { facetGroupName, value, section } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl(`facets/${facetGroupName}/options/${value}`, this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Replace a facet option configuration
   *
   * @function replaceFacetOptionConfiguration
   * @param {object} parameters - Aditional paramaters for facet option configuration details
   * @param {string} parameters.facetGroupName - Unique facet name used to refer to the facet in your catalog
   * @param {string} parameters.value - A unique facet option value
   * @param {string} [parameters.display_name=null] - The name of the facet presented to the end users - if none is supplied, the value from name will be used
   * @param {number} [parameters.position=null] - Slot facet groups to fixed positions
   * @param {boolean} [parameters.hidden=false] - Specifies whether the facet option is hidden from users
   * @param {object} [parameters.data={}] - Dictionary/Object with any extra facet data
   * @param {string} [parameters.section='Products'] - The section in which your facet is defined
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facet_options#update-facet-option-total
   * @example
   * constructorio.catalog.replaceFacetOptionConfiguration({
   *     facetGroupName: 'color',
   *     value: 'blue',
   *     display_name: 'Midnight Blue',
   *     position: 9,
   * });
   */
  replaceFacetOptionConfiguration(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { facetGroupName, section, value, ...rest } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl(`facets/${facetGroupName}/options/${value}`, this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PUT',
      body: JSON.stringify({ value, ...rest }),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Modify a facet option configuration
   *
   * @function modifyFacetOptionConfiguration
   * @param {object} parameters - Aditional paramaters for facet option configuration details
   * @param {string} parameters.facetGroupName - Unique facet name used to refer to the facet in your catalog
   * @param {string} parameters.value - A unique facet option value
   * @param {string} [parameters.display_name=null] - The name of the facet presented to the end users - if none is supplied, the value from name will be used
   * @param {number} [parameters.position=null] - Slot facet groups to fixed positions
   * @param {boolean} [parameters.hidden=false] - Specifies whether the facet option is hidden from users
   * @param {object} [parameters.data={}] - Dictionary/Object with any extra facet data
   * @param {string} [parameters.section='Products] - The section in which your facet is defined
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facet_options#update-facet-option-partial
   * @example
   * constructorio.catalog.modifyFacetOptionConfiguration({
   *     facetGroupName: 'color',
   *     value: 'blue',
   *     display_name: 'Midnight Blue',
   *     position: 9,
   * });
   */
  modifyFacetOptionConfiguration(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { facetGroupName, section, value, ...rest } = parameters;
    const additionalQueryParams = {
      section: section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl(`facets/${facetGroupName}/options/${value}`, this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'PATCH',
      body: JSON.stringify({ value, ...rest }),
      headers: {
        'Content-Type': 'application/json',
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }

  /**
   * Remove a facet option configuration
   *
   * @function removeFacetOptionConfiguration
   * @param {object} parameters - Aditional paramaters for facet option configuration details
   * @param {string} parameters.facetGroupName - Unique facet name used to refer to the facet in your catalog
   * @param {string} parameters.value - A unique value for this facet option
   * @param {string} [parameters.section='Products'] - The section in which your facet is defined
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/facet_options#delete-a-facet-option-config
   * @example
   * constructorio.removeFacetOptionConfiguration({
   *     facetGroupName: 'color',
   *     value: 'red',
   * });
   */
  removeFacetOptionConfiguration(parameters = {}, networkParameters = {}) {
    let requestUrl;
    const fetch = (this.options && this.options.fetch) || nodeFetch;
    const controller = new AbortController();
    const { signal } = controller;
    const { facetGroupName, value } = parameters;
    const additionalQueryParams = {
      section: parameters.section || 'Products',
    };

    try {
      requestUrl = createCatalogUrl(`facets/${facetGroupName}/options/${value}`, this.options, additionalQueryParams);
    } catch (e) {
      return Promise.reject(e);
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, {
      method: 'DELETE',
      headers: {
        ...helpers.createAuthHeader(this.options),
      },
      signal,
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }

      return helpers.throwHttpErrorFromResponse(new Error(), response);
    });
  }
}

module.exports = Catalog;
