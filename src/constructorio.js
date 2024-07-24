/* eslint-disable global-require */
/* eslint-disable camelcase, no-unneeded-ternary, max-len */

// Modules
const Search = require('./modules/search');
const Browse = require('./modules/browse');
const Autocomplete = require('./modules/autocomplete');
const Recommendations = require('./modules/recommendations');
const Tasks = require('./modules/tasks');
const Quizzes = require('./modules/quizzes');
const { version: packageVersion } = require('../package.json');
const utils = require('./utils/helpers');

let nodeFetch;
let Catalog;
let Tracker;

if (typeof process !== 'undefined' && process.env && process.env.NEXT_RUNTIME !== 'edge') {
  nodeFetch = require('./nodeFetch');
  Catalog = require('./modules/catalog');
  Tracker = require('./modules/tracker');
}

/**
 * Class to instantiate the ConstructorIO client.
 */
class ConstructorIO {
  /**
   * @param {object} parameters - Parameters for client instantiation
   * @param {string} parameters.apiKey - Constructor.io API key
   * @param {string} [parameters.apiToken] - Constructor.io API token - Should only be supplied when utilizing the `catalog` module and should be treated as sensitive information
   * @param {string} [parameters.securityToken] - Constructor security token
   * @param {string} [parameters.serviceUrl='https://ac.cnstrc.com'] - API URL endpoint
   * @param {function} [parameters.fetch] - If supplied, will be utilized for requests rather than default Fetch API
   * @param {object} [parameters.networkParameters] - Parameters relevant to network requests
   * @param {number} [parameters.networkParameters.timeout] - Request timeout (in milliseconds) - may be overridden within individual method calls
   * @property {object} search - Interface to {@link module:search}
   * @property {object} browse - Interface to {@link module:browse}
   * @property {object} autocomplete - Interface to {@link module:autocomplete}
   * @property {object} recommendations - Interface to {@link module:recommendations}
   * @property {object} tracker - Interface to {@link module:tracker}
   * @property {object} catalog - Interface to {@link module:catalog}
   * @property {object} tasks - Interface to {@link module:tasks}
   * @property {object} quizzes - Interface to {@link module:quizzes}
   * @returns {class}
   */
  constructor(options = {}) {
    const {
      apiKey,
      apiToken,
      version,
      serviceUrl,
      securityToken,
      fetch,
      networkParameters,
    } = options;

    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('API key is a required parameter of type string');
    }

    const normalizedServiceUrl = serviceUrl && serviceUrl.replace(/\/$/, '');

    this.options = {
      apiKey,
      apiToken: apiToken || '',
      securityToken: securityToken || '',
      version: version || global.CLIENT_VERSION || `cio-node-${packageVersion}`,
      serviceUrl: utils.addHTTPSToString(normalizedServiceUrl) || 'https://ac.cnstrc.com',
      fetch: fetch || nodeFetch,
      networkParameters: networkParameters || {},
    };

    if (typeof process !== 'undefined' && process.env && process.env.NEXT_RUNTIME !== 'edge') {
      this.tracker = new Tracker(this.options);
      this.catalog = new Catalog(this.options);
    }

    // Expose global modules
    this.search = new Search(this.options);
    this.browse = new Browse(this.options);
    this.autocomplete = new Autocomplete(this.options);
    this.recommendations = new Recommendations(this.options);
    this.tasks = new Tasks(this.options);
    this.quizzes = new Quizzes(this.options);
  }
}

module.exports = ConstructorIO;
