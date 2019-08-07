/* eslint-disable prefer-destructuring, no-unused-expressions */

const expect = require('chai').expect;
const Constructorio = require('../lib/constructorio');

const testConfig = {
  apiToken: 'YSOxV00F0Kk2R0KnPQN8',
  apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
};

describe('ConstructorIO - Autocomplete', () => {
  const personalizationParameters = {
    s: 1,
    i: 'user',
  };

  describe('getAutocompleteResults', () => {
    it('should return autocomplete results when supplying a valid query', (done) => {
      const constructorio = new Constructorio(testConfig);
      const query = 'Stanley';

      constructorio.getAutocompleteResults({
        query,
        ...personalizationParameters,
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
        ...personalizationParameters,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.sections).to.have.property('Search Suggestions').that.is.an('array').length(0);
        expect(response.sections).to.have.property('Products').that.is.an('array').length(0);
        expect(response.request).to.have.property('term').that.is.a('string', query);
        done();
      });
    });

    it('should return limited number of autocomplete results when specifying a num results parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getAutocompleteResults({
        query: 'drill',
        num_results: 4,
        ...personalizationParameters,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.sections).to.have.property('Search Suggestions').that.is.an('array').length(2);
        expect(response.sections).to.have.property('Products').that.is.an('array').length(2);
        done();
      });
    });

    it('should return limited number of autocomplete results for sections when specifying num results parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getAutocompleteResults({
        query: 'drill',
        'num_results_Search Suggestions': 3,
        num_results_Products: 4,
        ...personalizationParameters,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.sections).to.have.property('Search Suggestions').that.is.an('array').length(3);
        expect(response.sections).to.have.property('Products').that.is.an('array').length(4);
        done();
      });
    });

    it('should return limited number of autocomplete results based on num results parameter, not num results per section parameters', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getAutocompleteResults({
        query: 'drill',
        'num_results_Search Suggestions': 3,
        num_results_Products: 4,
        num_results: 2,
        ...personalizationParameters,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.sections).to.have.property('Search Suggestions').that.is.an('array').length(1);
        expect(response.sections).to.have.property('Products').that.is.an('array').length(1);
        done();
      });
    });

    it('should return no autocomplete results when non-matching filter is supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getAutocompleteResults({
        query: 'drill',
        filters: ['xylophone'],
        ...personalizationParameters,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.sections).to.have.property('Search Suggestions').that.is.an('array').length(0);
        expect(response.sections).to.have.property('Products').that.is.an('array').length(0);
        expect(response.request).to.have.property('filters').that.is.an('object');
        done();
      });
    });

    it('should return autocomplete results when supplying a valid optional ui parameter', (done) => {
      const constructorio = new Constructorio(testConfig);
      const query = 'Stanley';

      constructorio.getAutocompleteResults({
        query,
        ...personalizationParameters,
        ui: 'testing',
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.sections).to.have.property('Search Suggestions').that.is.an('array');
        expect(response.sections).to.have.property('Products').that.is.an('array');
        done();
      });
    });

    it('should return autocomplete results when supplying a valid optional us parameter', (done) => {
      const constructorio = new Constructorio(testConfig);
      const query = 'Stanley';

      constructorio.getAutocompleteResults({
        query,
        ...personalizationParameters,
        us: ['foo', 'bar'],
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response.sections).to.have.property('Search Suggestions').that.is.an('array');
        expect(response.sections).to.have.property('Products').that.is.an('array');
        done();
      });
    });

    it('should return autocomplete results when supplying invalid optional ui parameter', (done) => {
      const constructorio = new Constructorio(testConfig);
      const query = 'Stanley';

      constructorio.getAutocompleteResults({
        query,
        ...personalizationParameters,
        ui: {},
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Request could not be completed - `ui` parameter must be a string');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return autocomplete results when supplying invalid optional us parameter', (done) => {
      const constructorio = new Constructorio(testConfig);
      const query = 'Stanley';

      constructorio.getAutocompleteResults({
        query,
        ...personalizationParameters,
        us: 'failure',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Request could not be completed - `us` parameter must be a list');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when invalid num results parameter is supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getAutocompleteResults({
        query: 'drill',
        num_results: 'abc',
        ...personalizationParameters,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'num_results must be an integer');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when invalid num results section parameter is supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getAutocompleteResults({
        query: 'drill',
        num_results_Products: 'abc',
        ...personalizationParameters,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'num_results_Products must be an integer');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when invalid filters parameter is supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getAutocompleteResults({
        query: 'drill',
        filters: 'abc',
        ...personalizationParameters,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Failed to parse the provided filters. Please check the syntax and try again');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when more than one filters are supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getAutocompleteResults({
        query: 'drill',
        filters: ['abc', 'def'],
        ...personalizationParameters,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Only single filters are supported in autocomplete, but you seem to have provided more than one.');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when no personalization parameters are supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getAutocompleteResults({
        query: 'drill',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Request could not be completed - `s` and `i` are required parameters and must be a number and string, respectively');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when invalid personalization parameters are supplied', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getAutocompleteResults({
        query: 'drill',
        s: 'abc',
        i: 0,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Request could not be completed - `s` and `i` are required parameters and must be a number and string, respectively');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when removing groups with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.getAutocompleteResults({
        query: 'drill',
        ...personalizationParameters,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/We have no record of this key./);
        expect(response).to.be.undefined;
        done();
      });
    });
  });
});
