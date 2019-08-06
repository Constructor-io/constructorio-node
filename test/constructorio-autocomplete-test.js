const expect = require('chai').expect;
const Constructorio = require('../lib/constructorio');

const testConfig = {
  apiToken: 'YSOxV00F0Kk2R0KnPQN8',
  apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
};

describe('ConstructorIO - Autocomplete', () => {
  describe('getAutocompleteResults', () => {
    it('should return autocomplete results when supplying a valid query', (done) => {
      const constructorio = new Constructorio(testConfig);
      const query = 'Stanley';

      constructorio.getAutocompleteResults({
        query,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('result_id').that.is.a('string');
        expect(response).to.have.property('sections').that.is.an('object');
        expect(response.sections).to.have.property('Search Suggestions').that.is.an('array');
        expect(response.sections).to.have.property('Products').that.is.an('array');
        expect(response).to.have.property('request').that.is.an('object');
        expect(response.request).to.have.property('term').that.is.a('string', query);
        expect(response.request).to.have.property('features').that.is.an('object');
        done();
      });
    });

    it('should return no autocomplete results when supplying a non-matching query', (done) => {
      const constructorio = new Constructorio(testConfig);
      const query = 'xylophone';

      constructorio.getAutocompleteResults({
        query,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.sections).to.have.property('Search Suggestions').that.is.an('array').length(0);
        expect(response.sections).to.have.property('Products').that.is.an('array').length(0);
        expect(response.request).to.have.property('term').that.is.a('string', query);
        done();
      });
    });
  });
});
