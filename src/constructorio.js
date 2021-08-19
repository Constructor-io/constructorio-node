/* eslint-disable camelcase, no-unneeded-ternary, max-len */

// Modules
const Search = require('./modules/search');
const Browse = require('./modules/browse');
const Autocomplete = require('./modules/autocomplete');
const Recommendations = require('./modules/recommendations');
const Tracker = require('./modules/tracker');
const Catalog = require('./modules/catalog');
const { version: packageVersion } = require('../package.json');

/**
 * Class to instantiate the ConstructorIO client.
 */
class ConstructorIO {
  /**
   * @param {string} apiKey - Constructor.io API key
   * @param {string} [apiToken] - Constructor.io API token (required for catalog methods)
   * @param {string} [securityToken] - Constructor security token
   * @param {string} [serviceUrl='https://ac.cnstrc.com'] - API URL endpoint
   * @param {function} [fetch] - If supplied, will be utilized for requests rather than default Fetch API
   * @param {object} [networkParameters] - Parameters relevant to network requests
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds) - may be overridden within individual method calls
   * @property {object} [search] - Interface to {@link module:search}
   * @property {object} [browse] - Interface to {@link module:browse}
   * @property {object} [autocomplete] - Interface to {@link module:autocomplete}
   * @property {object} [recommendations] - Interface to {@link module:recommendations}
   * @property {object} [tracker] - Interface to {@link module:tracker}
   * @property {object} [catalog] - Interface to {@link module:catalog}
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
      serviceUrl: serviceUrl || 'https://ac.cnstrc.com',
      fetch,
      networkParameters: networkParameters || {},
    };

    // Expose global modules
    this.search = new Search(this.options);
    this.browse = new Browse(this.options);
    this.autocomplete = new Autocomplete(this.options);
    this.recommendations = new Recommendations(this.options);
    this.tracker = new Tracker(this.options);
    this.catalog = new Catalog(this.options);
  }
}

module.exports = ConstructorIO;
