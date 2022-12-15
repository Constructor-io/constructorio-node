/* eslint-disable no-unused-expressions, import/no-unresolved */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const nodeFetch = require('node-fetch').default;
const ConstructorIO = require('../../../test/constructorio'); // eslint-disable-line import/extensions
const helpers = require('../../mocha.helpers');

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const testApiKey = process.env.TEST_API_KEY;
const validClientId = '2b23dd74-5672-4379-878c-9182938d2710';
const validSessionId = '2';
const validOptions = { apiKey: testApiKey };
const skipNetworkTimeoutTests = process.env.SKIP_NETWORK_TIMEOUT_TESTS === 'true';

describe('ConstructorIO - Search', () => {
  const clientVersion = 'cio-mocha';
  let fetchSpy;

  beforeEach(() => {
    global.CLIENT_VERSION = clientVersion;
    fetchSpy = sinon.spy(nodeFetch);
  });

  afterEach(() => {
    delete global.CLIENT_VERSION;

    fetchSpy = null;
  });

  describe('getSearchResults', () => {
    const query = 'item';
    const section = 'Products';

    it('Should return a response with a valid query, section, and client + session identifiers', (done) => {
      const clientSessionIdentifiers = {
        clientId: validClientId,
        sessionId: validSessionId,
      };
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }, { ...clientSessionIdentifiers }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.term).to.equal(query);
        expect(res.request.section).to.equal(section);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('i');
        expect(requestedUrlParams).to.have.property('s');
        expect(requestedUrlParams).to.have.property('section').to.equal(section);
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        expect(requestedUrlParams).to.have.property('_dt');
        done();
      });
    });

    it('Should return a response with a valid query, section and testCells', (done) => {
      const testCells = { foo: 'bar' };
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }, { testCells }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);
        expect(requestedUrlParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);
        done();
      });
    });

    it('Should return a response with a valid query, section and segments', (done) => {
      const segments = ['foo', 'bar'];
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }, { segments }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.us).to.deep.equal(segments);
        expect(requestedUrlParams).to.have.property('us').to.deep.equal(segments);
        done();
      });
    });

    it('Should return a response with a valid query, section and user id', (done) => {
      const userId = 'user-id';
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }, { userId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedUrlParams).to.have.property('ui').to.equal(userId);
        done();
      });
    });

    it('Should return a response with a valid query, section, and page', (done) => {
      const page = 1;
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, {
        section,
        page,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.page).to.equal(page);
        expect(requestedUrlParams).to.have.property('page').to.equal(page.toString());
        done();
      });
    });

    it('Should return a response with a valid query, section, and offset', (done) => {
      const offset = 1;
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });
      search.getSearchResults(query, {
        section,
        offset,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.offset).to.equal(offset);
        expect(requestedUrlParams).to.have.property('offset').to.equal(offset.toString());
        done();
      });
    });

    it('Should return a response with a valid query, section, and resultsPerPage', (done) => {
      const resultsPerPage = 2;
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, {
        section,
        resultsPerPage,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.num_results_per_page).to.equal(resultsPerPage);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res.response.results.length).to.equal(resultsPerPage);
        expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal(resultsPerPage.toString());
        done();
      });
    });

    it('Should return a response with a valid query, section, and filters', (done) => {
      const filters = { keywords: ['battery-powered'] };
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, {
        section,
        filters,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.filters).to.deep.equal(filters);
        expect(requestedUrlParams).to.have.property('filters');
        expect(requestedUrlParams.filters).to.have.property('keywords').to.equal(Object.values(filters)[0][0]);
        done();
      });
    });

    it('Should return a response with a valid query, section, and fmtOptions', (done) => {
      const fmtOptions = { groups_max_depth: 2, groups_start: 'current' };
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, {
        section,
        fmtOptions,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.fmt_options).to.deep.equal(fmtOptions);
        expect(requestedUrlParams).to.have.property('fmt_options');
        expect(requestedUrlParams.fmt_options).to.have.property('groups_max_depth').to.equal(Object.values(fmtOptions)[0].toString());
        expect(requestedUrlParams.fmt_options).to.have.property('groups_start').to.equal(Object.values(fmtOptions)[1]);
        done();
      });
    });

    it('Should return a response with a valid query, section, and sortBy', (done) => {
      const sortBy = 'relevance';
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, {
        section,
        sortBy,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.sort_by).to.equal(sortBy);
        expect(requestedUrlParams).to.have.property('sort_by').to.equal(sortBy);
        done();
      });
    });

    it('Should return a response with a valid query, section, and sortOrder', (done) => {
      const sortOrder = 'ascending';
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, {
        section,
        sortOrder,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.sort_order).to.equal(sortOrder);
        expect(requestedUrlParams).to.have.property('sort_order').to.equal(sortOrder);
        done();
      });
    });

    it('Should return a response with a valid query, section, and user ip', (done) => {
      const userIp = '127.0.0.1';
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }, { userIp }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);
        done();
      });
    });

    it('Should return a response with a valid query, section, and security token', (done) => {
      const securityToken = 'cio-node-test';
      const { search } = new ConstructorIO({
        ...validOptions,
        securityToken,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);
        done();
      });
    });

    it('Should return a response with a valid query, section, and user agent', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { section }, { userAgent }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);
        done();
      });
    });

    it('Should return a response with a valid query, section with a result_id appended to each result', (done) => {
      const { search } = new ConstructorIO(validOptions);

      search.getSearchResults(query, { section }).then((res) => {
        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('results').to.be.an('array');
        res.response.results.forEach((result) => {
          expect(result).to.have.property('result_id').to.be.a('string').to.equal(res.result_id);
        });
        done();
      });
    });

    it('Should return a response with a valid query, section and hiddenFields', (done) => {
      const hiddenFields = ['testField', 'testField2'];
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults('item1', { section, hiddenFields }, {}).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
        const resultWithTestField = res.response.results.find((result) => result.data.testField);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.fmt_options.hidden_fields).to.eql(hiddenFields);
        expect(requestedUrlParams.fmt_options).to.have.property('hidden_fields').to.eql(hiddenFields);
        expect(resultWithTestField.data.testField).to.eql('hiddenFieldValue');
        done();
      });
    });

    it('Should return a response with a valid query, section and hiddenFacets', (done) => {
      const hiddenFacets = ['Brand', 'testFacet'];
      const { search } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      search.getSearchResults('item1', { section, hiddenFacets }, {}).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
        const facetWithNameBrand = res.response.facets.find((facet) => facet.name === hiddenFacets[0]);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.fmt_options.hidden_facets).to.eql(hiddenFacets);
        expect(requestedUrlParams.fmt_options).to.have.property('hidden_facets').to.eql(hiddenFacets);
        expect(facetWithNameBrand.name).to.eql(hiddenFacets[0]);
        done();
      });
    });

    it('Should return a redirect rule response with a valid query and section', (done) => {
      const redirectQuery = 'rolling';
      const { search } = new ConstructorIO(validOptions);

      search.getSearchResults(redirectQuery, { section }).then((res) => {
        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('redirect');
        expect(res.response.redirect).to.have.property('matched_terms').includes(redirectQuery);
        expect(res.response.redirect).to.have.property('data');
        expect(res.response.redirect.data).to.have.property('url');
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
      const { search } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      search.getSearchResults('Jacket', { variationsMap }, {}).then((res) => {
        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(JSON.stringify(res.request.variations_map)).to.eql(JSON.stringify(variationsMap));
        expect(res.response.results[0]).to.have.property('variations_map');
        expect(res.response.results[0].variations_map[0]).to.have.property('size');
        expect(res.response.results[0].variations_map[0]).to.have.property('variation');
        done();
      });
    });

    it('Should properly encode path parameter', (done) => {
      const specialCharacters = '+[]&';
      const querySpecialCharacters = `apple ${specialCharacters}`;
      const { search } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      search.getSearchResults(querySpecialCharacters, {}, {}).then((res) => {
        const requestUrl = fetchSpy.args[0][0];

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.term).to.equal(querySpecialCharacters);
        expect(requestUrl).to.include(encodeURIComponent(querySpecialCharacters));
        done();
      });
    });

    it('Should properly encode query parameters', (done) => {
      const specialCharacters = '+[]&';
      const sortBy = `relevance ${specialCharacters}`;
      const { search } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { sortBy }, {}).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.sort_by).to.equal(sortBy);
        expect(requestedUrlParams).to.have.property('sort_by').to.equal(sortBy);
        done();
      });
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const sortBy = `relevance ${breakingSpaces} relevance`;
      const sortByExpected = 'relevance     relevance';
      const { search } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, { sortBy }, {}).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.sort_by).to.equal(sortByExpected);
        expect(requestedUrlParams).to.have.property('sort_by').to.equal(sortByExpected);
        done();
      });
    });

    it('Should pass the correct custom headers passed in function networkParameters', (done) => {
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      search.getSearchResults(query, {}, {}, { headers: {
        'X-Constructor-IO-Test': 'test',
      } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should pass the correct custom headers passed in global networkParameters', (done) => {

      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
          },
        },
      });

      search.getSearchResults(query).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should override the custom headers from networkParameters with userParameters', (done) => {
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'User-Agent': 'test',
          },
        },
      });

      search.getSearchResults(query, {}, { userAgent: 'test2' }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('User-Agent').to.equal('test2');
        done();
      });
    });

    it('Should combine custom headers from function networkParameters and global networkParameters', (done) => {
      const { search } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
            'X-Constructor-IO-Test-Another': 'test',
          },
        },
      });

      search.getSearchResults(query, {}, {}, { headers: {
        'X-Constructor-IO-Test': 'test2',
      } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test2');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test-Another').to.equal('test');
        done();
      });
    });

    it('Should be rejected when invalid query is provided', () => {
      const { search } = new ConstructorIO(validOptions);

      return expect(search.getSearchResults([], { section })).to.eventually.be.rejected;
    });

    it('Should be rejected when no query is provided', () => {
      const { search } = new ConstructorIO(validOptions);

      return expect(search.getSearchResults(null, { section })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid page parameter is provided', () => {
      const { search } = new ConstructorIO(validOptions);
      const searchParams = {
        section,
        page: 'abc',
      };

      return expect(search.getSearchResults(query, searchParams)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid offset parameter is provided', () => {
      const { search } = new ConstructorIO(validOptions);
      const searchParams = {
        section,
        offset: 'abc',
      };

      return expect(search.getSearchResults(query, searchParams)).to.eventually.be.rejected;
    });

    it('Should be rejected when offset and page parameters are provided', () => {
      const { search } = new ConstructorIO(validOptions);
      const searchParams = {
        section,
        offset: 1,
        page: 1,
      };

      return expect(search.getSearchResults(query, searchParams)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid resultsPerPage parameter is provided', () => {
      const { search } = new ConstructorIO(validOptions);
      const searchParams = {
        section,
        resultsPerPage: 'abc',
      };

      return expect(search.getSearchResults(query, searchParams)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid filters parameter is provided', () => {
      const { search } = new ConstructorIO(validOptions);
      const searchParams = {
        section,
        filters: 'abc',
      };

      return expect(search.getSearchResults(query, searchParams)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid sortBy parameter is provided', () => {
      const { search } = new ConstructorIO(validOptions);
      const searchParams = {
        section,
        sortBy: ['foo', 'bar'],
      };

      return expect(search.getSearchResults(query, searchParams)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid sortOrder parameter is provided', () => {
      const { search } = new ConstructorIO(validOptions);
      const searchParams = {
        section,
        sortOrder: 123,
      };

      return expect(search.getSearchResults(query, searchParams)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid section parameter is provided', () => {
      const { search } = new ConstructorIO(validOptions);

      return expect(search.getSearchResults(query, { section: 123 })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid apiKey is provided', () => {
      const { search } = new ConstructorIO({ ...validOptions, apiKey: 'fyzs7tfF8L161VoAXQ8u' });

      return expect(search.getSearchResults(query, { section })).to.eventually.be.rejected;
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', () => {
        const { search } = new ConstructorIO(validOptions);

        return expect(search.getSearchResults(query, { section }, {}, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { search } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(search.getSearchResults(query, { section }, {})).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    }
  });
});
