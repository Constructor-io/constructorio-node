/* eslint-disable prefer-destructuring, no-unused-expressions */

const expect = require('chai').expect;
const Constructorio = require('../lib/constructorio');

const testConfig = {
  apiToken: 'YSOxV00F0Kk2R0KnPQN8',
  apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
};

function createProductItemToTest(done) {
  const constructorio = new Constructorio(testConfig);
  const data = {
    item_name: 'Alphabet soup',
    url: 'https://constructor.io/products/alphabet-soup',
    autocomplete_section: 'Products',
  };
  constructorio.addOrUpdateItem(data, done);
}

describe('ConstructorIO', () => {
  describe('new', () => {
    it('should set the API token and key', () => {
      const constructorio = new Constructorio(testConfig);

      expect(constructorio.config.apiToken).to.eq(testConfig.apiToken);
      expect(constructorio.config.apiKey).to.eq(testConfig.apiKey);
    });
  });

  describe('verify', () => {
    it('should return successful authentication when given a valid key/token pair', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.verify((err, response) => {
        expect(err).to.be.undefined;
        expect(response.message).to.match(/successful authentication/);
        done();
      });
    });
  });

  describe.skip('trackSearch', () => {
    before(createProductItemToTest);
    it('should return nothing when tracking a search', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        term: 'xyz',
        num_results: 302,
      };

      constructorio.trackSearch(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('trackClickThrough', () => {
    before(createProductItemToTest);
    it('should return nothing when tracking a click through', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        term: 'xyz',
        item: 'Alphabet soup',
        autocomplete_section: 'Products',
      };

      constructorio.trackClickThrough(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('trackConversion', () => {
    before(createProductItemToTest);
    it('should return nothing when tracking a conversion', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        term: 'xyz',
        item: 'Alphabet soup',
        autocomplete_section: 'Products',
      };

      constructorio.trackConversion(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });
  });
});
