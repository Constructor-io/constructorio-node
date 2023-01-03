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

const testApiKey = process.env.TEST_API_KEY;
const testApiToken = process.env.TEST_API_TOKEN;
const validClientId = '2b23dd74-5672-4379-878c-9182938d2710';
const validSessionId = '2';
const validOptions = {
  apiKey: testApiKey,
  apiToken: testApiToken,
};
const skipNetworkTimeoutTests = process.env.SKIP_NETWORK_TIMEOUT_TESTS === 'true';

describe('ConstructorIO - Recommendations', () => {
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

  describe('getRecommendations', () => {
    const podId = 'item_page_1';
    const queryRecommendationsPodId = 'query_recommendations';
    const filteredItemsRecommendationsPodId = 'filtered_items';
    const itemId = 'power_drill';
    const itemIds = [itemId, 'drill'];

    it('Should return a response with valid itemIds (singular) and client + session identifiers', (done) => {
      const clientSessionIdentifiers = {
        clientId: validClientId,
        sessionId: validSessionId,
      };
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, { itemIds: itemId }, { ...clientSessionIdentifiers }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.item_id).to.equal(itemId);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res.response).to.have.property('pod');
        expect(res.response.pod).to.have.property('id').to.equal(podId);
        expect(res.response.pod).to.have.property('display_name');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('i');
        expect(requestedUrlParams).to.have.property('s');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        expect(requestedUrlParams).to.have.property('item_id').to.equal(itemId);
        done();
      });
    });

    it('Should return a response with valid itemIds (multiple)', (done) => {
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, { itemIds }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.item_id).to.deep.equal(itemIds);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res.response).to.have.property('pod');
        expect(res.response.pod).to.have.property('id').to.equal(podId);
        expect(res.response.pod).to.have.property('display_name');
        expect(requestedUrlParams).to.have.property('item_id').to.deep.equal(itemIds);
        done();
      });
    });

    it('Should return a response with valid term for query recommendations strategy pod', (done) => {
      const term = 'apple';
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(queryRecommendationsPodId, { term }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.term).to.deep.equal(term);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res.response).to.have.property('pod');
        expect(res.response.pod).to.have.property('id').to.equal(queryRecommendationsPodId);
        expect(res.response.pod).to.have.property('display_name');
        expect(requestedUrlParams).to.have.property('term').to.deep.equal(term);
        done();
      });
    });

    it('Should return a response with valid filters for filtered items strategy pod', (done) => {
      const filters = { keywords: 'battery-powered' };
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(filteredItemsRecommendationsPodId, { filters }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.filters).to.deep.equal(filters);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res.response).to.have.property('pod');
        expect(res.response.pod).to.have.property('id').to.equal(filteredItemsRecommendationsPodId);
        expect(res.response.pod).to.have.property('display_name');
        expect(requestedUrlParams).to.have.property('filters').to.deep.equal(filters);
        done();
      });
    });

    it('Should return a response with valid filters and item id for filtered items strategy pod', (done) => {
      const filters = { keywords: 'battery-powered' };
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(filteredItemsRecommendationsPodId, {
        filters,
        itemIds: itemId,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.filters).to.deep.equal(filters);
        expect(res.request.item_id).to.equal(itemId);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res.response).to.have.property('pod');
        expect(res.response.pod).to.have.property('id').to.equal(filteredItemsRecommendationsPodId);
        expect(res.response.pod).to.have.property('display_name');
        expect(requestedUrlParams).to.have.property('filters').to.deep.equal(filters);
        expect(requestedUrlParams).to.have.property('item_id').to.equal(itemId);
        done();
      });
    });

    it('Should return a response with valid itemIds, and segments', (done) => {
      const segments = ['foo', 'bar'];
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, { itemIds }, { segments }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedUrlParams).to.have.property('us').to.deep.equal(segments);
        done();
      });
    });

    it('Should return a response with valid itemIds, and user id', (done) => {
      const userId = 'user-id';
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, { itemIds }, { userId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedUrlParams).to.have.property('ui').to.equal(userId);
        done();
      });
    });

    it('Should return a response with valid itemIds, and numResults', (done) => {
      const numResults = 2;
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, {
        itemIds,
        numResults,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.num_results).to.equal(numResults);
        expect(requestedUrlParams).to.have.property('num_results').to.equal(numResults.toString());
        done();
      });
    });

    it('Should return a response with valid itemIds, and section', (done) => {
      const section = 'Products';
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, {
        itemIds,
        section,
      }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.section).to.equal(section);
        expect(requestedUrlParams).to.have.property('section').to.equal(section);
        done();
      });
    });

    it('Should return a response with a valid query, section, and user ip', (done) => {
      const userIp = '127.0.0.1';
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, { itemIds }, { userIp }).then((res) => {
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
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        securityToken,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, { itemIds }).then((res) => {
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
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, { itemIds }, { userAgent }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);
        done();
      });
    });

    it('Should return a response with valid itemIds, with a result_id appended to each result', (done) => {
      const { recommendations } = new ConstructorIO(validOptions);

      recommendations.getRecommendations(podId, { itemIds }).then((res) => {
        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('results').to.be.an('array');
        res.response.results.forEach((item) => {
          expect(item).to.have.property('result_id').to.be.a('string').to.equal(res.result_id);
        });
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
      const { recommendations } = new ConstructorIO({ apiKey: testApiKey });

      recommendations.getRecommendations(podId, { itemIds, variationsMap }).then((res) => {
        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(JSON.stringify(res.request.variations_map)).to.eql(JSON.stringify(variationsMap));
        res.response.results.forEach((item) => {
          expect(item).to.have.property('result_id').to.be.a('string').to.equal(res.result_id);
        });
        done();
      });
    });

    it('Should properly encode query parameters', (done) => {
      const specialCharacters = '+[]&';
      const term = `apple ${specialCharacters}`;
      const { recommendations } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(queryRecommendationsPodId, { term }, {}).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.term).to.deep.equal(term);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res.response).to.have.property('pod');
        expect(res.response.pod).to.have.property('id').to.equal(queryRecommendationsPodId);
        expect(res.response.pod).to.have.property('display_name');
        expect(requestedUrlParams).to.have.property('term').to.deep.equal(term);
        done();
      });
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const term = `apple ${breakingSpaces} apple`;
      const termExpected = 'apple     apple';
      const { recommendations } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(queryRecommendationsPodId, { term }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.term).to.deep.equal(termExpected);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res.response).to.have.property('pod');
        expect(res.response.pod).to.have.property('id').to.equal(queryRecommendationsPodId);
        expect(res.response.pod).to.have.property('display_name');
        expect(requestedUrlParams).to.have.property('term').to.deep.equal(termExpected);
        done();
      });
    });

    it('Should pass the correct custom headers passed in function networkParameters', (done) => {
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, { itemIds }, {}, { headers: {
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
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
          },
        },
      });

      recommendations.getRecommendations(podId, { itemIds }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should override the custom headers from global networkParameters with userParameters', (done) => {
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'User-Agent': 'test',
          },
        },
      });

      recommendations.getRecommendations(podId, { itemIds }, { userAgent: 'test2' }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedHeaders).to.have.property('User-Agent').to.equal('test2');
        done();
      });
    });

    it('Should combine custom headers from function networkParameters and global networkParameters', (done) => {
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
            'X-Constructor-IO-Test-Another': 'test',
          },
        },
      });

      recommendations.getRecommendations(podId, { itemIds }, {}, { headers: {
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

    it('Should be rejected when invalid pod id parameter is provided', () => {
      const { recommendations } = new ConstructorIO(validOptions);

      return expect(recommendations.getRecommendations([], {
        itemIds,
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when no pod id parameter is provided', () => {
      const { recommendations } = new ConstructorIO(validOptions);

      return expect(recommendations.getRecommendations(null, {
        itemIds,
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid numResults parameter is provided', () => {
      const { recommendations } = new ConstructorIO(validOptions);

      return expect(recommendations.getRecommendations(podId, {
        itemIds,
        numResults: 'abc',
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid section parameter is provided', () => {
      const { recommendations } = new ConstructorIO(validOptions);

      return expect(recommendations.getRecommendations(podId, {
        itemIds,
        section: 'Nonsense',
      })).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid apiKey is provided', () => {
      const { recommendations } = new ConstructorIO({ ...validOptions, apiKey: 'fyzs7tfF8L161VoAXQ8u' });

      return expect(recommendations.getRecommendations(podId, {
        itemIds,
      })).to.eventually.be.rejected;
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', () => {
        const { recommendations } = new ConstructorIO(validOptions);

        return expect(recommendations.getRecommendations(
          podId,
          { itemIds },
          {},
          { timeout: 10 },
        )).to.eventually.be.rejectedWith('The operation was aborted.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { recommendations } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(recommendations.getRecommendations(
          podId,
          { itemIds },
          {},
        )).to.eventually.be.rejectedWith('The operation was aborted.');
      });
    }
  });

  describe('getRecommendationPods', () => {
    it('Should return a response', (done) => {
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendationPods().then((res) => {
        expect(res).to.be.an('object');
        expect(res).to.have.property('pods');
        expect(res).to.have.property('total_count');
        done();
      });
    });

    it('Should return a response with security token', (done) => {
      const securityToken = 'cio-node-test';
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        securityToken,
        fetch: fetchSpy,
      });

      recommendations.getRecommendationPods().then((res) => {
        expect(res).to.be.an('object');
        expect(res).to.have.property('pods');
        expect(res).to.have.property('total_count');
        done();
      });
    });

    it('Should pass the correct custom headers passed in function networkParameters', (done) => {
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendationPods({ headers: { 'X-Constructor-IO-Test': 'test' } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.be.an('object');
        expect(res).to.have.property('pods');
        expect(res).to.have.property('total_count');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should pass the correct custom headers passed in global networkParameters', (done) => {
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
          },
        },
      });

      recommendations.getRecommendationPods().then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.be.an('object');
        expect(res).to.have.property('pods');
        expect(res).to.have.property('total_count');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should combine custom headers from function networkParameters and global networkParameters', (done) => {
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
            'X-Constructor-IO-Test-Another': 'test',
          },
        },
      });

      recommendations.getRecommendationPods({ headers: { 'X-Constructor-IO-Test': 'test2' } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(res).to.be.an('object');
        expect(res).to.have.property('pods');
        expect(res).to.have.property('total_count');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test2');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test-Another').to.equal('test');
        done();
      });
    });

    it('Should be rejected when invalid apiKey is provided', () => {
      const { recommendations } = new ConstructorIO({ ...validOptions, apiKey: 'fyzs7tfF8L161VoAXQ8u' });

      return expect(recommendations.getRecommendationPods()).to.eventually.be.rejected;
    });

    it('Should be rejected when invalid apiToken is provided', () => {
      const { recommendations } = new ConstructorIO({ ...validOptions, apiToken: 'fyzs7tfF8L161VoAXQ8u' });

      return expect(recommendations.getRecommendationPods()).to.eventually.be.rejected;
    });

    it('Should be rejected when no apiToken is provided', () => {
      const { recommendations } = new ConstructorIO({ ...validOptions, apiToken: null });

      return expect(recommendations.getRecommendationPods()).to.eventually.be.rejected;
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', () => {
        const { recommendations } = new ConstructorIO(validOptions);

        return expect(recommendations.getRecommendationPods(
          { timeout: 10 },
        )).to.eventually.be.rejectedWith('The operation was aborted.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { recommendations } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(recommendations.getRecommendationPods()).to.eventually.be.rejectedWith('The operation was aborted.');
      });
    }
  });
});
