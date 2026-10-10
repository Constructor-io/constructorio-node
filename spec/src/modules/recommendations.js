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
    const variationId = 'power_drill_variation';
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
        expect(requestedUrlParams).to.have.property('_dt');
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
        expect(requestedUrlParams).to.have.property('_dt');
        done();
      });
    });

    it('Should return a response with valid itemId and variationId', (done) => {
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, { itemIds: itemId, variationId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.item_id).to.deep.equal(itemId);
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res.response).to.have.property('pod');
        expect(res.response.pod).to.have.property('id').to.equal(podId);
        expect(res.response.pod).to.have.property('display_name');
        expect(requestedUrlParams).to.have.property('item_id').to.deep.equal(itemId);
        expect(requestedUrlParams).to.have.property('variation_id').to.deep.equal(variationId);
        expect(requestedUrlParams).to.have.property('_dt');
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
      const filters = { keywords: ['battery-powered'] };
      const urlParamFilters = { keywords: 'battery-powered' };
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
        expect(requestedUrlParams).to.have.property('filters').to.deep.equal(urlParamFilters);
        done();
      });
    });

    it('Should return a response with valid filters and item id for filtered items strategy pod', (done) => {
      const filters = { keywords: ['battery-powered'] };
      const urlParamFilters = { keywords: 'battery-powered' };
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
        expect(requestedUrlParams).to.have.property('filters').to.deep.equal(urlParamFilters);
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

    it('Should return a response with valid itemIds, and hiddenFields', (done) => {
      const hiddenFields = ['hiddenField1', 'hiddenField2'];
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, { itemIds, hiddenFields }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.request.fmt_options.hidden_fields).to.eql(hiddenFields);
        expect(requestedUrlParams.fmt_options).to.have.property('hidden_fields').to.deep.equal(hiddenFields);
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

    it('Should return a response with valid itemIds, result_id, and origin referrer', (done) => {
      const originReferrer = 'https://localhost';
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, { itemIds }, { originReferrer }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(requestedUrlParams).to.have.property('origin_referrer').to.equal(originReferrer);
        done();
      }).catch(done);
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

    it('Should return a return a response with pre filter expression properly parsed', (done) => {
      const preFilterExpression = {
        or: [
          {
            and: [
              {
                name: 'group_id',
                value: 'electronics-group-id',
              },
              {
                name: 'Price',
                range: ['-inf', 200],
              },
            ],
          },
          {
            and: [
              {
                name: 'Type',
                value: 'Laptop',
              },
              {
                not: {
                  name: 'Price',
                  range: [800, 'inf'],
                },
              },
            ],
          },
        ],
      };
      const { recommendations } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      recommendations.getRecommendations(podId, { itemIds, preFilterExpression }, {}).then((res) => {
        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(JSON.stringify(res.request.pre_filter_expression)).to.equal(JSON.stringify(preFilterExpression));
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

    it('Should be rejected when a variation id parameter is provided without the item id', () => {
      const { recommendations } = new ConstructorIO(validOptions);

      return expect(recommendations.getRecommendations(podId, {
        variationId,
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

    it('Should include requestUrl in the promise for getRecommendations', () => {
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const promise = recommendations.getRecommendations(podId, { itemIds: itemId });
      expect(promise).to.have.property('requestUrl').that.is.a('string');
    });
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

    it('Should build requestURL with query params when parameters are passed', (done) => {
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: async (reqUrl) => ({ ok: true, json: async () => reqUrl }),
      });

      recommendations.getRecommendationPods({ section: 'test-section' }).then((res) => {
        expect(res).to.contain('section=test-section');

        done();
      });
    });

    it('Should successfully send request when parameters are passed', (done) => {
      const { recommendations } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      recommendations.getRecommendationPods({ section: 'Products' }).then((res) => {
        expect(res).to.be.an('object');
        expect(res).to.have.property('pods');
        expect(res).to.have.property('total_count');

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

  describe('getRecommendationPage', () => {
    const mockApiKey = 'key_mock_page_api';
    const pageId = 'pdp_b2c';
    const itemId = 'product-123';
    const pageResultId = 'page-result-id';
    const pageResponse = () => ({
      request: { page_id: pageId, item_id: itemId, num_results: 10 },
      response: {
        page_id: pageId,
        display_name: 'PDP - B2C',
        page_type: 'pdp',
        pods: [
          {
            pod_id: 'similar_items',
            request: { item_id: itemId, num_results: 12 },
            response: {
              results: [
                { data: { id: 'product-987' }, value: 'Red Running Shoe', strategy: { id: 'alternative_items' } },
                { data: { id: 'product-988' }, value: 'Blue Running Shoe', strategy: { id: 'alternative_items' } },
              ],
              total_num_results: 2,
              pod: { id: 'similar_items', display_name: 'Similar Items' },
            },
            result_id: 'similar-items-result-id',
          },
          {
            pod_id: 'complete_the_look',
            request: { item_id: itemId, num_results: 8 },
            response: {
              results: [],
              total_num_results: 0,
              pod: { id: 'complete_the_look', display_name: 'Complete the Look' },
            },
            result_id: 'complete-the-look-result-id',
          },
        ],
      },
      result_id: pageResultId,
    });
    let fetchStub;

    beforeEach(() => {
      fetchStub = sinon.stub().resolves({ ok: true, json: () => Promise.resolve(pageResponse()) });
    });

    it('Should request the page endpoint with shared parameters and user parameters', async () => {
      const { recommendations } = new ConstructorIO({ apiKey: mockApiKey, fetch: fetchStub, securityToken: 'token' });

      await recommendations.getRecommendationPage(pageId, {
        itemIds: itemId,
        numResults: 10,
        section: 'Products',
        filters: { in_stock: 'true' },
        filterMatchTypes: { color: 'any' },
      }, {
        clientId: validClientId,
        sessionId: validSessionId,
        userId: 'user-id',
        segments: ['vip'],
        userIp: '127.0.0.1',
        userAgent: 'agent',
      });

      const [requestedUrl, { headers }] = fetchStub.lastCall.args;
      const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchStub);

      expect(requestedUrl).to.match(/\/recommendations\/v1\/pages\/pdp_b2c\?/);
      expect(requestedUrlParams).to.have.property('key').to.equal(mockApiKey);
      expect(requestedUrlParams).to.have.property('i').to.equal(validClientId);
      expect(requestedUrlParams).to.have.property('s').to.equal(validSessionId);
      expect(requestedUrlParams).to.have.property('ui').to.equal('user-id');
      expect(requestedUrlParams).to.have.property('us').to.equal('vip');
      expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
      expect(requestedUrlParams).to.have.property('_dt');
      expect(requestedUrlParams).to.have.property('item_id').to.equal(itemId);
      expect(requestedUrlParams).to.have.property('num_results').to.equal('10');
      expect(requestedUrlParams).to.have.property('section').to.equal('Products');
      expect(requestedUrlParams.filters).to.deep.equal({ in_stock: 'true' });
      expect(requestedUrlParams.filter_match_types).to.deep.equal({ color: 'any' });
      expect(requestedUrlParams).to.not.have.property('pod_overrides');
      expect(headers).to.include({ 'x-cnstrc-token': 'token', 'X-Forwarded-For': '127.0.0.1', 'User-Agent': 'agent' });
    });

    it('Should encode podOverrides in bracket notation with the same wire format as shared parameters', async () => {
      const { recommendations } = new ConstructorIO({ apiKey: mockApiKey, fetch: fetchStub });
      const preFilterExpression = { or: [{ name: 'brand', value: 'acme' }] };
      const variationsMap = { group_by: [{ name: 'color', field: 'data.color' }], values: {}, dtype: 'array' };

      await recommendations.getRecommendationPage(pageId, {
        itemIds: itemId,
        numResults: 10,
        podOverrides: {
          similar_items: { numResults: 0 },
          complete_the_look: {
            numResults: 8,
            filters: { in_stock: 'true', color: ['red', 'blue'] },
            filterMatchTypes: { color: 'all' },
            preFilterExpression,
            variationsMap,
            fmtOptions: { groups_max_depth: 2 },
            hiddenFields: ['inventory', 'margin'],
          },
        },
      });

      const requestedUrl = decodeURIComponent(fetchStub.lastCall.args[0]);
      const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchStub);
      const completeTheLook = requestedUrlParams.pod_overrides.complete_the_look;

      expect(requestedUrl).to.include('pod_overrides[similar_items][num_results]=0');
      expect(requestedUrl).to.include('pod_overrides[complete_the_look][filters][color]=red&pod_overrides[complete_the_look][filters][color]=blue');
      expect(requestedUrlParams.num_results).to.equal('10');
      expect(requestedUrlParams.pod_overrides.similar_items).to.deep.equal({ num_results: '0' });
      expect(completeTheLook.num_results).to.equal('8');
      expect(completeTheLook.filters).to.deep.equal({ in_stock: 'true', color: ['red', 'blue'] });
      expect(completeTheLook.filter_match_types).to.deep.equal({ color: 'all' });
      expect(JSON.parse(completeTheLook.pre_filter_expression)).to.deep.equal(preFilterExpression);
      expect(JSON.parse(completeTheLook.variations_map)).to.deep.equal(variationsMap);
      expect(completeTheLook.fmt_options).to.deep.equal({ groups_max_depth: '2', hidden_fields: ['inventory', 'margin'] });
    });

    it('Should stamp each pod\'s own result_id onto its results, not the page result_id', async () => {
      const { recommendations } = new ConstructorIO({ apiKey: mockApiKey, fetch: fetchStub });

      const res = await recommendations.getRecommendationPage(pageId, { itemIds: itemId });
      const [similarItems, completeTheLook] = res.response.pods;

      expect(res.result_id).to.equal(pageResultId);
      similarItems.response.results.forEach((result) => {
        expect(result.result_id).to.equal('similar-items-result-id');
      });
      expect(completeTheLook.response.results).to.deep.equal([]);
    });

    it('Should expose the request URL on the returned promise', () => {
      const { recommendations } = new ConstructorIO({ apiKey: mockApiKey, fetch: fetchStub });

      const promise = recommendations.getRecommendationPage(pageId, { itemIds: itemId });

      expect(promise.requestUrl).to.match(/\/recommendations\/v1\/pages\/pdp_b2c\?/);

      return promise;
    });

    it('Should be rejected when the response has no pods', () => {
      fetchStub = sinon.stub().resolves({ ok: true, json: () => Promise.resolve({ response: {} }) });
      const { recommendations } = new ConstructorIO({ apiKey: mockApiKey, fetch: fetchStub });

      return expect(recommendations.getRecommendationPage(pageId)).to.eventually.be.rejectedWith('getRecommendationPage response data is malformed');
    });

    it('Should be rejected when pageId is not provided', () => {
      const { recommendations } = new ConstructorIO({ apiKey: mockApiKey, fetch: fetchStub });

      return expect(recommendations.getRecommendationPage(null, { itemIds: itemId })).to.eventually.be.rejectedWith('pageId is a required parameter of type string');
    });

    it('Should be rejected when podOverrides contains a page-wide parameter', () => {
      const { recommendations } = new ConstructorIO({ apiKey: mockApiKey, fetch: fetchStub });

      return expect(recommendations.getRecommendationPage(pageId, {
        podOverrides: { similar_items: { itemIds: 'other' } },
      })).to.eventually.be.rejectedWith('podOverrides.similar_items contains parameters that cannot be overridden per pod: itemIds');
    });

    it('Should be rejected when variationId is provided without itemIds', () => {
      const { recommendations } = new ConstructorIO({ apiKey: mockApiKey, fetch: fetchStub });

      return expect(recommendations.getRecommendationPage(pageId, { variationId: 'v1' })).to.eventually.be.rejectedWith('itemIds is a required parameter for variationId');
    });
  });

  // The page endpoint is not yet enabled on the test index, and the test index has no
  // page configured (`/recommendations/v1/pages/pdp_b2c` returns 404 there)
  describe.skip('getRecommendationPage - live', () => {
    const pageId = 'pdp_b2c';
    const itemId = 'power_drill';

    it('Should return a response with each pod\'s result_id stamped on its results', async () => {
      const { recommendations } = new ConstructorIO({ ...validOptions, fetch: fetchSpy });

      const res = await recommendations.getRecommendationPage(pageId, { itemIds: itemId });

      expect(res).to.have.property('result_id').to.be.a('string');
      expect(res.response.pods).to.be.an('array').that.is.not.empty;
      res.response.pods.forEach((pod) => {
        expect(pod).to.have.property('pod_id').to.be.a('string');
        expect(pod).to.have.property('result_id').to.be.a('string').that.does.not.equal(res.result_id);
        expect(pod.response.pod.id).to.equal(pod.pod_id);
        pod.response.results.forEach((result) => {
          expect(result.result_id).to.equal(pod.result_id);
        });
      });
    });

    it('Should apply a numResults override to one pod', async () => {
      const { recommendations } = new ConstructorIO({ ...validOptions, fetch: fetchSpy });
      const first = await recommendations.getRecommendationPage(pageId, { itemIds: itemId });
      const overriddenPodId = first.response.pods[0].pod_id;

      const res = await recommendations.getRecommendationPage(pageId, {
        itemIds: itemId,
        podOverrides: { [overriddenPodId]: { numResults: 1 } },
      });

      expect(res.response.pods[0].request.num_results).to.equal(1);
      expect(res.response.pods[0].response.results.length).to.be.at.most(1);
    });
  });
});
