/* eslint-disable no-unused-expressions, import/no-unresolved */
const jsdom = require('mocha-jsdom');
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const nodeFetch = require('node-fetch').default;
const ConstructorIO = require('../../../test/constructorio'); // eslint-disable-line import/extensions
const helpers = require('../../mocha.helpers');

const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const testApiKey = process.env.TEST_API_KEY;
const testApiToken = process.env.TEST_API_TOKEN;
const validClientId = '2b23dd74-5672-4379-878c-9182938d2710';
const validSessionId = '2';
const validOptions = { apiKey: testApiKey };

describe('ConstructorIO - Browse', () => {
  const clientVersion = 'cio-mocha';
  let fetchSpy;

  jsdom({ url: 'http://localhost' });

  beforeEach(() => {
    global.CLIENT_VERSION = clientVersion;
    fetchSpy = sinon.spy(nodeFetch);
  });

  afterEach(() => {
    delete global.CLIENT_VERSION;

    fetchSpy = null;
  });

  describe('getBrowseResults', () => {
    const filterName = 'group_id';
    const filterValue = 'drill_collection';
    const filterNameCollection = 'collection_id';
    const filterValueCollection = 'test';

    it('Should return a response with a valid filterName, filterValue, and client + session identifiers', (done) => {
      const clientSessionIdentifiers = {
        clientId: validClientId,
        sessionId: validSessionId,
      };
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, {}, { ...clientSessionIdentifiers }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request).to.have.property('browse_filter_name');
        expect(res.request).to.have.property('browse_filter_value');
        expect(res.request.browse_filter_name).to.equal(filterName);
        expect(res.request.browse_filter_value).to.equal(filterValue);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('i');
        expect(requestedUrlParams).to.have.property('s');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        expect(requestedUrlParams).to.have.property('_dt');
        done();
      });
    });

    it('Should return a response with a valid filterName, filterValue and testCells', (done) => {
      const testCells = { foo: 'bar' };
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, {}, { testCells }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);
        expect(requestedUrlParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);
        done();
      });
    });

    it('Should return a response with a valid filterName, filterValue and segments', (done) => {
      const segments = ['foo', 'bar'];
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, {}, { segments }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedUrlParams).to.have.property('us').to.deep.equal(segments);
        done();
      });
    });

    it('Should return a response with a valid filterName, filterValue and user id', (done) => {
      const userId = 'user-id';
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, {}, { userId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedUrlParams).to.have.property('ui').to.equal(userId);
        done();
      });
    });

    it('Should return a response with a valid filterName, filterValue and page', (done) => {
      const page = 1;
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, { page }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.page).to.equal(page);
        expect(requestedUrlParams).to.have.property('page').to.equal(page.toString());
        done();
      });
    });

    it('Should return a response with a valid filterName, filterValue and resultsPerPage', (done) => {
      const resultsPerPage = 2;
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, { resultsPerPage }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.num_results_per_page).to.equal(resultsPerPage);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal(resultsPerPage.toString());
        done();
      });
    });

    it('Should return a response with a valid filterName, filterValue and additional filters', (done) => {
      const filters = { keywords: ['battery-powered'] };
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, { filters }).then((res) => {
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

    it('Should return a response with a valid filterName, filterValue and additional fmtOptions', (done) => {
      const fmtOptions = { groups_max_depth: 2, groups_start: 'current' };
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, { fmtOptions }).then((res) => {
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

    it('Should return a response with a valid filterName, filterValue and sortBy', (done) => {
      const sortBy = 'relevance';
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, { sortBy }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.sort_by).to.equal(sortBy);
        expect(requestedUrlParams).to.have.property('sort_by').to.equal(sortBy);
        done();
      });
    });

    it('Should return a response with a valid filterName, filterValue and sortOrder', (done) => {
      const sortOrder = 'ascending';
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, { sortOrder }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.sort_order).to.equal(sortOrder);
        expect(requestedUrlParams).to.have.property('sort_order').to.equal(sortOrder);
        done();
      });
    });

    it('Should return a response with a valid filterName, filterValue, and user ip', (done) => {
      const userIp = '127.0.0.1';
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, {}, { userIp }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);
        done();
      });
    });

    it('Should return a response with a valid filterName, filterValue, and security token', (done) => {
      const securityToken = 'cio-node-test';
      const { browse } = new ConstructorIO({
        ...validOptions,
        securityToken,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);
        done();
      });
    });

    it('Should return a response with a valid filterName, filterValue, and user agent', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, {}, { userAgent }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);
        done();
      });
    });

    it('Should return a response with a valid filterName, filterValue and section', (done) => {
      const section = 'Products';
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, { section }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.section).to.equal(section);
        expect(requestedUrlParams).to.have.property('section').to.equal(section);
        done();
      });
    });

    it('Should return a response with a valid collection filterName and collection filterValue', (done) => {
      const section = 'Products';
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterNameCollection, filterValueCollection, { section }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.section).to.equal(section);
        expect(requestedUrlParams).to.have.property('section').to.equal(section);
        done();
      });
    });

    it('Should return a response with a valid filterName and filterValue with a result_id appended to each result', (done) => {
      const { browse } = new ConstructorIO(validOptions);

      browse.getBrowseResults(filterName, filterValue).then((res) => {
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

    it('Should return a response with a valid filterName, filterValue and hiddenFields', (done) => {
      const hiddenFields = ['testField', 'testField2'];
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults('Color', 'yellow', { hiddenFields }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.fmt_options.hidden_fields).to.eql(hiddenFields);
        expect(requestedUrlParams.fmt_options).to.have.property('hidden_fields').to.eql(hiddenFields);
        expect(res.response.results[0].data).to.have.property('testField').to.eql('testFieldValue');
        done();
      });
    });

    it('Should return a response with a valid filterName, filterValue and hiddenFacets', (done) => {
      const hiddenFacets = ['Brand', 'testFacet'];
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults('Brand', 'XYZ', { hiddenFacets }, {}).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.fmt_options.hidden_facets).to.eql(hiddenFacets);
        expect(requestedUrlParams.fmt_options).to.have.property('hidden_facets').to.eql(hiddenFacets);
        expect(res.response.facets[0]).to.have.property('name').to.eql('Brand');
        done();
      });
    });

    it('Should return a response with a valid filterName, filterValue, and section', (done) => {
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResults(filterName, filterValue, { section: 'Search Suggestions' }, {}).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request).to.have.property('browse_filter_name');
        expect(res.request).to.have.property('browse_filter_value');
        expect(res.request.browse_filter_name).to.equal(filterName);
        expect(res.request.browse_filter_value).to.equal(filterValue);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        expect(requestedUrlParams).to.have.property('_dt');
        expect(requestedUrlParams).to.have.property('section').to.equal('Search Suggestions');
        done();
      });
    });

    it('Should be rejected when invalid filterName is provided', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseResults([], filterValue)).to.eventually.be.rejected;
    });

    it('Should be rejected when no filterName is provided', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseResults(null, filterValue)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid filterValue is provided', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseResults(filterName, [])).to.eventually.be.rejected;
    });

    it('Should be rejected when no filterValue is provided', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseResults(filterName, null)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid page parameter is provided', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseResults(filterName, filterValue, {
        page: 'abc',
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid resultsPerPage parameter is provided', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseResults(filterName, filterValue, {
        resultsPerPage: 'abc',
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid filters parameter is provided', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseResults(filterName, filterValue, {
        filters: 123,
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid sortBy parameter is provided', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseResults(filterName, filterValue, {
        sortBy: { foo: 'bar' },
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid sortOrder parameter is provided', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseResults(filterName, filterValue, {
        sortOrder: 'abc',
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid section parameter is provided', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseResults(filterName, filterValue, {
        section: 123,
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid collection filterValue parameter is provided', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseResults(filterNameCollection, 123, {})).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid apiKey is provided', () => {
      const { browse } = new ConstructorIO({ ...validOptions, apiKey: 'fyzs7tfF8L161VoAXQ8u' });

      return expect(browse.getBrowseResults(filterName, filterValue)).to.eventually.be.rejected;
    });

    it('Should be rejected when network request timeout is provided and reached', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseResults(
        filterName,
        filterValue,
        {},
        {},
        { timeout: 10 },
      )).to.eventually.be.rejectedWith('The user aborted a request.');
    });

    it('Should be rejected when global network request timeout is provided and reached', () => {
      const { browse } = new ConstructorIO({
        ...validOptions,
        networkParameters: { timeout: 10 },
      });

      return expect(browse.getBrowseResults(
        filterName,
        filterValue,
        {},
        {},
      )).to.eventually.be.rejectedWith('The user aborted a request.');
    });
  });

  describe('getBrowseResultsForItemIds', () => {
    const ids = ['10002', '10001'];

    it('Should return a response with valid ids', (done) => {
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResultsForItemIds(ids).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        expect(requestedUrlParams).to.have.property('_dt');
        done();
      });
    });

    it('should return a response with valid ids, client id and session id', (done) => {
      const userParameters = {
        clientId: 'example client id',
        sessionId: 123456789,
      };
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResultsForItemIds(ids, null, userParameters).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedUrlParams).to.have.property('i').to.equal('example client id');
        expect(requestedUrlParams).to.have.property('s').to.equal('123456789');
        done();
      });
    });

    it('Should return a response with valid ids and testCells', (done) => {
      const testCells = { foo: 'bar' };
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResultsForItemIds(ids, null, { testCells }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);
        expect(requestedUrlParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);
        done();
      });
    });

    it('Should return a response with valid ids and segments', (done) => {
      const segments = ['foo', 'bar'];
      const { browse } = new ConstructorIO({
        ...validOptions,
        segments,
        fetch: fetchSpy,
      });

      browse.getBrowseResultsForItemIds(ids, null, { segments }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedUrlParams).to.have.property('us').to.deep.equal(segments);
        done();
      });
    });

    it('Should return a response with valid ids and user id', (done) => {
      const userId = 'user-id';
      const { browse } = new ConstructorIO({
        ...validOptions,
        userId,
        fetch: fetchSpy,
      });

      browse.getBrowseResultsForItemIds(ids, null, { userId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedUrlParams).to.have.property('ui').to.equal(userId);
        done();
      });
    });

    it('Should return a response with valid ids and page', (done) => {
      const page = 1;
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResultsForItemIds(ids, { page }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.page).to.equal(page);
        expect(requestedUrlParams).to.have.property('page').to.equal(page.toString());
        done();
      });
    });

    it('Should return a response with valid ids and resultsPerPage', (done) => {
      const resultsPerPage = 2;
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResultsForItemIds(ids, { resultsPerPage }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.num_results_per_page).to.equal(resultsPerPage);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal(resultsPerPage.toString());
        done();
      });
    });

    it('Should return a response with valid ids and additional filters', (done) => {
      const filters = { keywords: ['battery-powered'] };
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResultsForItemIds(ids, { filters }).then((res) => {
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

    it('Should return a response with valid ids and additional fmtOptions', (done) => {
      const fmtOptions = { groups_max_depth: 2, groups_start: 'current' };
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResultsForItemIds(ids, { fmtOptions }).then((res) => {
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

    it('Should return a response with valid ids and section', (done) => {
      const section = 'Products';
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResultsForItemIds(ids, { section }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.section).to.equal(section);
        expect(requestedUrlParams).to.have.property('section').to.equal(section);
        done();
      });
    });

    it('Should return a response with valid ids with a result_id appended to each result', (done) => {
      const { browse } = new ConstructorIO({ ...validOptions });

      browse.getBrowseResultsForItemIds(ids).then((res) => {
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

    it('Should return a response with valid ids and hiddenFields', (done) => {
      const hiddenFields = ['testField', 'testField2'];
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResultsForItemIds(ids, { hiddenFields }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.fmt_options.hidden_fields).to.eql(hiddenFields);
        expect(requestedUrlParams.fmt_options).to.have.property('hidden_fields').to.eql(hiddenFields);
        expect(res.response.results[0].data).to.have.property('testField').to.eql('testFieldValue');
        done();
      });
    });

    it('Should return a response with valid ids and hiddenFacets', (done) => {
      const hiddenFacets = ['Brand', 'testFacet'];
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResultsForItemIds(ids, { hiddenFacets }, {}).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.fmt_options.hidden_facets).to.eql(hiddenFacets);
        expect(requestedUrlParams.fmt_options).to.have.property('hidden_facets').to.eql(hiddenFacets);
        expect(res.response.facets.find((e) => e.name === 'Brand')).to.have.property('name').to.eql('Brand');
        done();
      });
    });

    it('Should return a response with valid ids and section', (done) => {
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseResultsForItemIds(ids, { section: 'Search Suggestions' }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        expect(requestedUrlParams).to.have.property('_dt');
        expect(requestedUrlParams).to.have.property('section').to.equal('Search Suggestions');
        done();
      });
    });

    it('Should be rejected when invalid ids are provided', () => {
      const { browse } = new ConstructorIO({ ...validOptions });

      return expect(browse.getBrowseResultsForItemIds('invalid-ids')).to.eventually.be.rejected;
    });

    it('Should be rejected when no ids are provided', () => {
      const { browse } = new ConstructorIO({ ...validOptions });

      return expect(browse.getBrowseResultsForItemIds(null)).to.eventually.be.rejected;
    });

    it('Should be rejected when empty ids array id provided', () => {
      const { browse } = new ConstructorIO({ ...validOptions });

      return expect(browse.getBrowseResultsForItemIds([])).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid page parameter is provided', () => {
      const { browse } = new ConstructorIO({ ...validOptions });

      return expect(browse.getBrowseResultsForItemIds(ids, {
        page: 'abc',
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid resultsPerPage parameter is provided', () => {
      const { browse } = new ConstructorIO({ ...validOptions });

      return expect(browse.getBrowseResultsForItemIds(ids, {
        resultsPerPage: 'abc',
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid filters parameter is provided', () => {
      const { browse } = new ConstructorIO({ ...validOptions });

      return expect(browse.getBrowseResultsForItemIds(ids, {
        filters: 123,
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid sortBy parameter is provided', () => {
      const { browse } = new ConstructorIO({ ...validOptions });

      return expect(browse.getBrowseResultsForItemIds(ids, {
        sortBy: { foo: 'bar' },
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid sortOrder parameter is provided', () => {
      const { browse } = new ConstructorIO({ ...validOptions });

      return expect(browse.getBrowseResultsForItemIds(ids, {
        sortOrder: 'abc',
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid section parameter is provided', () => {
      const { browse } = new ConstructorIO({ ...validOptions });

      return expect(browse.getBrowseResultsForItemIds(ids, {
        section: 123,
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid apiKey is provided', () => {
      const { browse } = new ConstructorIO({ apiKey: 'fyzs7tfF8L161VoAXQ8u' });

      return expect(browse.getBrowseResultsForItemIds(ids)).to.eventually.be.rejected;
    });

    it('Should be rejected when network request timeout is provided and reached', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseResultsForItemIds(ids, {}, {}, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
    });

    it('Should be rejected when global network request timeout is provided and reached', () => {
      const { browse } = new ConstructorIO({
        ...validOptions,
        networkParameters: { timeout: 20 },
      });

      return expect(browse.getBrowseResultsForItemIds(ids, {}, {})).to.eventually.be.rejectedWith('The user aborted a request.');
    });
  });

  describe('getBrowseGroups', () => {
    it('Should return a response without any parameters', (done) => {
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseGroups().then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('groups').to.be.an('array');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        done();
      });
    });

    it('should return a response with valid ids, client id and session id', (done) => {
      const userParameters = {
        clientId: 'example client id',
        sessionId: 123456789,
      };
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseGroups({}, userParameters).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedUrlParams).to.have.property('i').to.equal('example client id');
        expect(requestedUrlParams).to.have.property('s').to.equal('123456789');
        done();
      });
    });

    it('Should return a response with valid ids and user id', (done) => {
      const userId = 'user-id';
      const { browse } = new ConstructorIO({
        ...validOptions,
        userId,
        fetch: fetchSpy,
      });

      browse.getBrowseGroups({}, { userId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedUrlParams).to.have.property('ui').to.equal(userId);
        done();
      });
    });

    it('Should return a response with valid ids and additional filters', (done) => {
      const filters = { group_id: ['drill_collection'] };
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseGroups({ filters }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('groups').to.be.an('array');
        expect(res.request.filters).to.deep.equal(filters);
        expect(requestedUrlParams).to.have.property('filters');
        done();
      });
    });

    it('Should return a response with valid ids and additional fmtOptions', (done) => {
      const fmtOptions = { groups_max_depth: 2, groups_start: 'current' };
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseGroups({ fmtOptions }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.fmt_options).to.deep.equal(fmtOptions);
        expect(res.response).to.have.property('groups').to.be.an('array');
        expect(requestedUrlParams).to.have.property('fmt_options');
        expect(requestedUrlParams.fmt_options).to.have.property('groups_max_depth').to.equal(Object.values(fmtOptions)[0].toString());
        done();
      });
    });

    it('Should return a response with a section', (done) => {
      const { browse } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      browse.getBrowseGroups({ section: 'Search Suggestions' }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('groups').to.be.an('array');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        expect(requestedUrlParams).to.have.property('section').to.equal('Search Suggestions');
        done();
      });
    });

    it('Should be rejected when invalid filters parameter is provided', () => {
      const { browse } = new ConstructorIO({ ...validOptions });

      return expect(browse.getBrowseGroups({
        filters: 123,
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid apiKey is provided', () => {
      const { browse } = new ConstructorIO({ apiKey: 'fyzs7tfF8L161VoAXQ8u' });

      return expect(browse.getBrowseGroups()).to.eventually.be.rejected;
    });

    it('Should be rejected when network request timeout is provided and reached', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseGroups({}, {}, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
    });

    it('Should be rejected when global network request timeout is provided and reached', () => {
      const { browse } = new ConstructorIO({
        ...validOptions,
        networkParameters: { timeout: 20 },
      });

      return expect(browse.getBrowseGroups({}, {})).to.eventually.be.rejectedWith('The user aborted a request.');
    });
  });

  describe('getBrowseFacets', () => {
    it('Should return a response without any parameters', (done) => {
      const { browse } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      browse.getBrowseFacets().then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('facets').to.be.an('array');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        done();
      });
    });

    it('Should return a response with valid fmtOptions and authorized token', (done) => {
      const fmtOptions = { show_hidden_facets: true, show_protected_facets: true };
      const apiToken = testApiToken;
      const { browse } = new ConstructorIO({
        apiKey: testApiKey,
        apiToken,
        fetch: fetchSpy,
      });

      browse.getBrowseFacets({ fmtOptions }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.fmt_options.show_protected_facets).to.equal(true);
        expect(res.request.fmt_options.show_hidden_facets).to.equal(true);
        expect(requestedUrlParams).to.have.property('fmt_options');
        done();
      });
    });

    it('Should return a response with a section', (done) => {
      const { browse } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      browse.getBrowseFacets({ section: 'Search Suggestions' }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('facets').to.be.an('array');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        expect(requestedUrlParams).to.have.property('section').to.equal('Search Suggestions');
        done();
      });
    });

    it('Should be rejected when invalid apiKey is provided', () => {
      const { browse } = new ConstructorIO({ apiKey: 'fyzs7tfF8L161VoAXQ8u' });

      return expect(browse.getBrowseFacets()).to.eventually.be.rejected;
    });

    it('Should be rejected when network request timeout is provided and reached', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseFacets({}, {}, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
    });

    it('Should be rejected when global network request timeout is provided and reached', () => {
      const { browse } = new ConstructorIO({
        ...validOptions,
        networkParameters: { timeout: 20 },
      });

      return expect(browse.getBrowseFacets({}, {})).to.eventually.be.rejectedWith('The user aborted a request.');
    });
  });

  describe('getBrowseFacetOptions', () => {
    const facetName = 'color';

    it('Should return a response with a facet name without any parameters', (done) => {
      const { browse } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      browse.getBrowseFacetOptions(facetName).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('facets').to.be.an('array');
        expect(res.response.facets[0]).to.have.property('name').to.equal(facetName);
        expect(res.response.facets[0]).to.have.property('options').to.be.an('array');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        done();
      });
    });

    it('Should return a response with valid fmtOptions and authorized token', (done) => {
      const fmtOptions = { show_hidden_facets: true, show_protected_facets: true };
      const apiToken = testApiToken;
      const { browse } = new ConstructorIO({
        apiKey: testApiKey,
        apiToken,
        fetch: fetchSpy,
      });

      browse.getBrowseFacetOptions(facetName, { fmtOptions }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.fmt_options.show_protected_facets).to.equal(true);
        expect(res.request.fmt_options.show_hidden_facets).to.equal(true);
        expect(requestedUrlParams).to.have.property('fmt_options');
        done();
      });
    });

    it('Should return a response with a facet name with a section', (done) => {
      const { browse } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      browse.getBrowseFacetOptions(facetName, { section: 'Products' }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('facets').to.be.an('array');
        expect(res.response.facets[0]).to.have.property('name').to.equal(facetName);
        expect(res.response.facets[0]).to.have.property('options').to.be.an('array');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        expect(requestedUrlParams).to.have.property('section').to.equal('Products');
        done();
      });
    });

    it('Should be rejected when no facetName is provided', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseFacetOptions(null)).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid facetName is provided', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseFacetOptions(['foo'])).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid apiKey is provided', () => {
      const { browse } = new ConstructorIO({ apiKey: 'fyzs7tfF8L161VoAXQ8u' });

      return expect(browse.getBrowseFacetOptions(facetName)).to.eventually.be.rejected;
    });

    it('Should be rejected when network request timeout is provided and reached', () => {
      const { browse } = new ConstructorIO(validOptions);

      return expect(browse.getBrowseFacetOptions(facetName, {}, {}, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
    });

    it('Should be rejected when global network request timeout is provided and reached', () => {
      const { browse } = new ConstructorIO({
        ...validOptions,
        networkParameters: { timeout: 20 },
      });

      return expect(browse.getBrowseFacetOptions(facetName, {}, {}, {})).to.eventually.be.rejectedWith('The user aborted a request.');
    });
  });
});
