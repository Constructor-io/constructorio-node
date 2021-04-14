/* eslint-disable camelcase, no-unneeded-ternary */

// Modules
const Search = require('./modules/search');
const Browse = require('./modules/browse');
const Autocomplete = require('./modules/autocomplete');
const Recommendations = require('./modules/recommendations');
const Catalog = require('./modules/catalog');
const { version: packageVersion } = require('../package.json');

/**
 * Class to instantiate the ConstructorIO client.
 */
class ConstructorIO {
  /**
   * @param {string} apiKey - Constructor.io API key
   * @param {string} [apiToken] - Constructor.io API token (required for catalog methods)
   * @param {string} [serviceUrl='https://ac.cnstrc.com'] - API URL endpoint
   * @param {array} [segments] - User segments
   * @param {object} [testCells] - User test cells
   * @param {string} [clientId] - Client ID
   * @param {string} [sessionId] - Session ID
   * @param {string} [userId] - User ID
   * @param {function} [fetch] - If supplied, will be utilized for requests rather than default Fetch API
   * @property {object} [search] - Interface to {@link module:search}
   * @property {object} [browse] - Interface to {@link module:browse}
   * @property {object} [autocomplete] - Interface to {@link module:autocomplete}
   * @property {object} [recommendations] - Interface to {@link module:recommendations}
   * @property {object} [catalog] - Interface to {@link module:catalog}
   * @returns {class}
   */
  constructor(options = {}) {
    const {
      apiKey,
      apiToken,
      version,
      serviceUrl,
      segments,
      testCells,
      clientId,
      sessionId,
      userId,
      fetch,
    } = options;

    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('API key is a required parameter of type string');
    }

    if (!clientId || typeof clientId !== 'string') {
      throw new Error('Client ID is a required parameter of type string');
    }

    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('Session ID is a required parameter of type string');
    }

    let session_id;
    let client_id;

    this.options = {
      apiKey,
      apiToken,
      version: version || global.CLIENT_VERSION || `cio-node-${packageVersion}`,
      serviceUrl: serviceUrl || 'https://ac.cnstrc.com',
      sessionId: sessionId || session_id,
      clientId: clientId || client_id,
      userId,
      segments,
      testCells,
      fetch,
    };

    // Expose global modules
    this.search = new Search(this.options);
    this.browse = new Browse(this.options);
    this.autocomplete = new Autocomplete(this.options);
    this.recommendations = new Recommendations(this.options);
    this.catalog = new Catalog(this.options);
  }

  /**
   * Sets the client options
   *
   * @param {string} apiKey - Constructor.io API key
   * @param {string} [apiToken] - Constructor.io API token (required for catalog methods)
   * @param {array} [segments] - User segments
   * @param {object} [testCells] - User test cells
   * @param {string} [userId] - User ID
   */
  setClientOptions(options) {
    if (Object.keys(options).length) {
      const { apiKey, apiToken, segments, testCells, userId } = options;

      if (apiKey) {
        this.options.apiKey = apiKey;
      }

      if (apiToken) {
        this.options.apiToken = apiToken;
      }

      if (segments) {
        this.options.segments = segments;
      }

      if (testCells) {
        this.options.testCells = testCells;
      }

      if (userId) {
        this.options.userId = userId;
      }
    }
  }
}

module.exports = ConstructorIO;
