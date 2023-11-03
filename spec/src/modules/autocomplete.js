/* eslint-disable no-unused-expressions, import/no-unresolved */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const ConstructorIO = require('../../../test/constructorio'); // eslint-disable-line import/extensions
const helpers = require('../../mocha.helpers');

const nodeFetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const testApiKey = process.env.TEST_REQUEST_API_KEY;
const validClientId = '2b23dd74-5672-4379-878c-9182938d2710';
const validSessionId = '2';
const validOptions = { apiKey: testApiKey };
const skipNetworkTimeoutTests = process.env.SKIP_NETWORK_TIMEOUT_TESTS === 'true';

describe('ConstructorIO - Autocomplete', () => {
  const clientVersion = 'cio-mocha';
  let fetchSpy;

  beforeEach(() => {
    global.CLIENT_VERSION = 'cio-mocha';
    fetchSpy = sinon.spy(nodeFetch);
  });

  afterEach(() => {
    delete global.CLIENT_VERSION;

    fetchSpy = null;
  });

  describe('getAutocompleteResults', () => {
    const query = 'item1';

    it('Should return a response with a valid query and client + session identifiers', (done) => {
      const clientSessionIdentifiers = {
        clientId: validClientId,
        sessionId: validSessionId,
      };
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, {}, { ...clientSessionIdentifiers }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.term).to.equal(query);
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('i');
        expect(requestedUrlParams).to.have.property('s');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        expect(requestedUrlParams).to.have.property('_dt');
        done();
      });
    });

    it('Should return a response with a valid query and testCells', (done) => {
      const testCells = { foo: 'bar' };
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, {}, { testCells }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);
        expect(requestedUrlParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);
        done();
      });
    });

    it('Should return a response with a valid query and segments', (done) => {
      const segments = ['foo', 'bar'];
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, {}, { segments }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.us).to.deep.equal(segments);
        expect(requestedUrlParams).to.have.property('us').to.deep.equal(segments);
        done();
      });
    });

    it('Should return a response with a valid query and user id', (done) => {
      const userId = 'user-id';
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, {}, { userId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedUrlParams).to.have.property('ui').to.equal(userId);
        done();
      });
    });

    it('Should return a response with a valid query and numResults', (done) => {
      const numResults = 2;
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, { numResults }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
        const sectionKeys = Object.keys(res.sections);
        let resultCount = 0;

        sectionKeys.forEach((section) => {
          const sectionItems = res.sections[section];

          resultCount += sectionItems.length;
        });

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.num_results).to.equal(numResults);
        expect(resultCount).to.equal(numResults);
        expect(requestedUrlParams).to.have.property('num_results').to.equal(numResults.toString());
        done();
      });
    });

    it('Should return a response with a valid query and resultsPerSection', (done) => {
      const resultsPerSection = {
        Products: 1,
        'Search Suggestions': 2,
      };
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, { resultsPerSection }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.num_results_Products).to.equal(resultsPerSection.Products);
        expect(res.request['num_results_Search Suggestions']).to.equal(resultsPerSection['Search Suggestions']);
        expect(requestedUrlParams).to.have.property('num_results_Products').to.equal(resultsPerSection.Products.toString());
        expect(requestedUrlParams).to.have.property('num_results_Search Suggestions').to.equal(resultsPerSection['Search Suggestions'].toString());
        done();
      });
    });

    it.only('Should return a response with a valid query and pagePerSection and resultsPerPagePerSection', (done) => {
      const pagePerSection = { Products: 1 };
      const resultsPerPagePerSection = { Products: 5 };
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, { pagePerSection, resultsPerPagePerSection }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.page).to.deep.equal(pagePerSection);
        expect(res.request.num_results_per_page).to.deep.equal(resultsPerPagePerSection);
        expect(requestedUrlParams).to.have.property('page');
        expect(requestedUrlParams).to.have.property('num_results_per_page');
        expect(requestedUrlParams.page).to.have.property('Products').to.equal(pagePerSection.Products.toString());
        expect(requestedUrlParams.num_results_per_page).to.have.property('Products').to.equal(resultsPerPagePerSection.Products.toString());
        done();
      });
    });

    it('Should return a response with a valid query and multiple pagePerSection and resultsPerPagePerSection', (done) => {
      const pagePerSection = { Products: 1, 'Search Suggestions': 2 };
      const resultsPerPagePerSection = { Products: 5, 'Search Suggestions': 3 };
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, { pagePerSection, resultsPerPagePerSection }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.page).to.deep.equal(pagePerSection);
        expect(res.request.num_results_per_page).to.deep.equal(resultsPerPagePerSection);
        expect(requestedUrlParams).to.have.property('page');
        expect(requestedUrlParams).to.have.property('num_results_per_page');
        expect(requestedUrlParams.page).to.have.property('Products').to.equal(Object.values(pagePerSection)[0].toString());
        expect(requestedUrlParams.page).to.have.property('Search Suggestions').to.equal(Object.values(pagePerSection)[1].toString());
        expect(requestedUrlParams.num_results_per_page).to.have.property('Products').to.equal(Object.values(resultsPerPagePerSection)[0].toString());
        expect(requestedUrlParams.num_results_per_page).to.have.property('Search Suggestions').to.equal(Object.values(resultsPerPagePerSection)[1].toString());
        done();
      });
    });

    it('Should return a response with a valid query and filters', (done) => {
      const filters = { keywords: ['battery-powered'] };
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, { filters }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.filters).to.deep.equal(filters);
        expect(requestedUrlParams).to.have.property('filters');
        expect(requestedUrlParams.filters).to.have.property('keywords').to.equal(Object.values(filters)[0][0]);
        done();
      });
    });

    it('Should return a response with a valid query, and multiple filters', (done) => {
      const filters = { group_id: ['All'], Brand: ['XYZ'] };
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, { filters }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.filters).to.eql(filters);
        expect(requestedUrlParams).to.have.property('filters');
        expect(requestedUrlParams.filters).to.have.property('group_id').to.equal(Object.values(filters)[0][0]);
        expect(requestedUrlParams.filters).to.have.property('Brand').to.equal(Object.values(filters)[1][0]);
        done();
      });
    });

    it.only('Should return a response with a valid query and filtersPerSection', (done) => {
      const filtersPerSection = { 'Search Suggestions': { keywords: ['battery-powered'] } };
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, { filtersPerSection }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.filters).to.deep.equal(filtersPerSection);
        expect(requestedUrlParams).to.have.property('filters');
        expect(requestedUrlParams.filters).to.have.property('keywords').to.equal(Object.values(filtersPerSection)[0][0]);
        done();
      });
    });

    it.only('Should return a response with a valid query, and multiple filtersPerSection', (done) => {
      const filtersPerSection = {
        'Search Suggestions': { keywords: ['battery-powered'] },
        Products: { group_id: ['All'] },
      };
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, { filtersPerSection }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.filters).to.eql(filtersPerSection);
        expect(requestedUrlParams).to.have.property('filters');
        expect(requestedUrlParams.filters).to.have.property('group_id').to.equal(Object.values(filtersPerSection)[0][0]);
        expect(requestedUrlParams.filters).to.have.property('Brand').to.equal(Object.values(filtersPerSection)[1][0]);
        done();
      });
    });

    it('Should return a response with a valid query and user ip', (done) => {
      const userIp = '127.0.0.1';
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, {}, { userIp }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);
        done();
      });
    });

    it('Should return a response with a valid query and security token', (done) => {
      const securityToken = 'cio-node-test';
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        securityToken,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);
        done();
      });
    });

    it('Should return a response with a valid query and user agent', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, {}, { userAgent }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);
        done();
      });
    });

    it('Should return a response with a valid query, with a result_id appended to each result', (done) => {
      const { autocomplete } = new ConstructorIO(validOptions);

      autocomplete.getAutocompleteResults(query).then((res) => {
        const sectionKeys = Object.keys(res.sections);
        let sectionItems = [];

        sectionKeys.forEach((section) => {
          sectionItems = res.sections[section];
        });

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        sectionItems.forEach((item) => {
          expect(item).to.have.property('result_id').to.be.a('string').to.equal(res.result_id);
        });
        done();
      });
    });

    it('Should return a response with a valid query and hiddenFields', (done) => {
      const hiddenFields = ['testField', 'hiddenField2'];
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, { hiddenFields }, {}).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.sections.Products[0].data).to.have.property('testField').to.eql('hiddenFieldValue');
        expect(res.request.fmt_options.hidden_fields).to.eql(hiddenFields);
        expect(requestedUrlParams.fmt_options).to.have.property('hidden_fields').to.eql(hiddenFields);
        done();
      });
    });

    it('Should return a variations_map object in the response', (done) => {
      const variationsMap = {
        group_by: [
          {
            name: 'variation',
            field: 'data.variation_id',
          },
        ],
        values: {
          size: {
            aggregation: 'all',
            field: 'data.facets.size',
          },
        },
        dtype: 'array',
      };
      const { autocomplete } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults('Jacket', { variationsMap }, {}).then((res) => {
        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(JSON.stringify(res.request.variations_map)).to.eql(JSON.stringify(variationsMap));
        expect(res.sections.Products[0]).to.have.property('variations_map');
        expect(res.sections.Products[0].variations_map[0]).to.have.property('size');
        expect(res.sections.Products[0].variations_map[0]).to.have.property('variation');
        done();
      });
    });

    it('Should properly encode path parameter', (done) => {
      const specialCharacters = '+[]&';
      const querySpecialCharacters = `apple ${specialCharacters}`;
      const { autocomplete } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(querySpecialCharacters, {}, {}).then((res) => {
        const requestUrl = fetchSpy.args[0][0];

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.term).to.equal(querySpecialCharacters);
        expect(requestUrl).to.include(encodeURIComponent(querySpecialCharacters));
        done();
      });
    });

    it('Should properly encode query parameters', (done) => {
      const specialCharacters = '+[]&';
      const filters = { keywords: [`battery-powered ${specialCharacters}`] };
      const { autocomplete } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, { filters }, {}).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.filters).to.deep.equal(filters);
        expect(requestedUrlParams).to.have.property('filters');
        expect(requestedUrlParams.filters).to.have.property('keywords').to.equal(Object.values(filters)[0][0]);
        done();
      });
    });

    it('Should return a response with a / query', (done) => {
      const { autocomplete } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults('/').then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.term).to.equal('/');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        done();
      });
    });

    it('Should pass the correct custom headers passed in function networkParameters', (done) => {
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      autocomplete.getAutocompleteResults(query, {}, {}, { headers: {
        'X-Constructor-IO-Test': 'test',
      } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should pass the correct custom headers passed in global networkParameters', (done) => {
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
          },
        },
      });

      autocomplete.getAutocompleteResults(query).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should override the custom headers from networkParameters with userParameters', (done) => {
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'User-Agent': 'test',
          },
        },
      });

      autocomplete.getAutocompleteResults(query, {}, { userAgent: 'test2' }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('User-Agent').to.equal('test2');
        done();
      });
    });

    it('Should combine custom headers from function networkParameters and global networkParameters', (done) => {
      const { autocomplete } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
            'X-Constructor-IO-Test-Another': 'test',
          },
        },
      });

      autocomplete.getAutocompleteResults(query, {}, {}, { headers: {
        'X-Constructor-IO-Test': 'test2',
      } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('sections').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test2');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test-Another').to.equal('test');
        done();
      });
    });

    it('Should be rejected when invalid query is provided', () => {
      const { autocomplete } = new ConstructorIO(validOptions);

      return expect(autocomplete.getAutocompleteResults([])).to.eventually.be.rejected;
    });

    it('Should be rejected when no query is provided', () => {
      const { autocomplete } = new ConstructorIO(validOptions);

      return expect(autocomplete.getAutocompleteResults(null)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid numResults parameter is provided', () => {
      const { autocomplete } = new ConstructorIO(validOptions);

      return expect(autocomplete.getAutocompleteResults(query, { numResults: 'abc' })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid filters parameter is provided', () => {
      const { autocomplete } = new ConstructorIO(validOptions);

      return expect(autocomplete.getAutocompleteResults(query, { filters: 'abc' })).to.eventually.be.rejected;
    });

    it.only('Should be rejected when invalid resultsPerPagePerSection parameter is provided', () => {
      const { autocomplete } = new ConstructorIO(validOptions);

      return expect(autocomplete.getAutocompleteResults(query, { resultsPerPagePerSection: 'abc' })).to.eventually.be.rejected;
    });

    it.only('Should be rejected when invalid pagePerSection parameter is provided', () => {
      const { autocomplete } = new ConstructorIO(validOptions);

      return expect(autocomplete.getAutocompleteResults(query, { pagePerSection: 'abc' })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid apiKey is provided', () => {
      const { autocomplete } = new ConstructorIO({ ...validOptions, apiKey: 'fyzs7tfF8L161VoAXQ8u' });

      return expect(autocomplete.getAutocompleteResults(query)).to.eventually.be.rejected;
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', () => {
        const { autocomplete } = new ConstructorIO(validOptions);

        return expect(autocomplete.getAutocompleteResults(query, {}, {}, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { autocomplete } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(autocomplete.getAutocompleteResults(query, {}, {})).to.eventually.be.rejectedWith('The operation was aborted.');
      });
    }
  });
});
