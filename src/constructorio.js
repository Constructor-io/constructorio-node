/* eslint-disable camelcase, no-unneeded-ternary, max-len */
const nodeFetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Modules
const Search = require('./modules/search');
const Browse = require('./modules/browse');
const Autocomplete = require('./modules/autocomplete');
const Recommendations = require('./modules/recommendations');
const Tracker = require('./modules/tracker');
const Catalog = require('./modules/catalog');
const Tasks = require('./modules/tasks');
const Quizzes = require('./modules/quizzes');
const { version: packageVersion } = require('../package.json');

/**
 * Class to instantiate the ConstructorIO client.
 */
class ConstructorIO {
  /**
   * @param {object} parameters - Parameters for client instantiation
   * @param {string} parameters.apiKey - Constructor.io API key
   * @param {string} [parameters.apiToken] - Constructor.io API token (required for catalog methods)
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

    this.options = {
      apiKey,
      apiToken: apiToken || '',
      securityToken: securityToken || '',
      version: version || global.CLIENT_VERSION || `cio-node-${packageVersion}`,
      serviceUrl: (serviceUrl && serviceUrl.replace(/\/$/, '')) || 'https://ac.cnstrc.com',
      fetch: fetch || nodeFetch,
      networkParameters: networkParameters || {},
    };

    // Expose global modules
    this.search = new Search(this.options);
    this.browse = new Browse(this.options);
    this.autocomplete = new Autocomplete(this.options);
    this.recommendations = new Recommendations(this.options);
    this.tracker = new Tracker(this.options);
    this.catalog = new Catalog(this.options);
    this.tasks = new Tasks(this.options);
    this.quizzes = new Quizzes(this.options);
  }
}

module.exports = ConstructorIO;
