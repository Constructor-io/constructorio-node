/* eslint-disable max-len */
const Campaigns = require('./campaigns');

/**
 * Interface to searchandising related API calls
 *
 * @module searchandising
 * @inner
 * @returns {object}
 */
class Searchandising {
  constructor(options) {
    this.options = options || {};
    this.campaigns = new Campaigns(this.options);
  }
}

module.exports = Searchandising;
