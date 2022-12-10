/* eslint-disable no-unused-expressions, import/no-unresolved, no-restricted-syntax, max-nested-callbacks */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const nodeFetch = require('node-fetch').default;
const cloneDeep = require('lodash.clonedeep');
const { v4: uuidv4 } = require('uuid');
const ConstructorIO = require('../../../../test/constructorio'); // eslint-disable-line import/extensions
const helpers = require('../../../mocha.helpers');

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const sendTimeout = 300;
const testApiKey = process.env.TEST_API_KEY;
const testApiToken = process.env.TEST_API_TOKEN;
const validOptions = {
  apiKey: testApiKey,
  apiToken: testApiToken,
};
const skipNetworkTimeoutTests = process.env.SKIP_NETWORK_TIMEOUT_TESTS === 'true';

function createMockRedirectRule() {
  const uuid = uuidv4();

  return {
    url: `http://www.${uuid}.com`,
    matches: [{
      match_type: 'EXACT',
      pattern: uuid,
    }],
  };
}

describe('ConstructorIO - Catalog', () => {
  const clientVersion = 'cio-mocha';
  let fetchSpy;

  beforeEach(() => {
    global.CLIENT_VERSION = clientVersion;
    fetchSpy = sinon.spy(nodeFetch);
  });

  afterEach((done) => {
    delete global.CLIENT_VERSION;

    fetchSpy = null;

    // Add throttling between requests to avoid rate limiting
    setTimeout(done, sendTimeout);
  });

  describe('Redirect Rules', () => {
    describe('addRedirectRule', () => {
      const mockRedirectRule = createMockRedirectRule();

      it('Should return a response when adding a redirect rule', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addRedirectRule(mockRedirectRule).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('id').to.be.a('number');
          expect(res).to.have.property('url').to.eq(mockRedirectRule.url);
          expect(res).to.have.property('matches').to.be.an('array').of.length(1);
          expect(res.matches[0]).to.have.property('id').to.be.a('number');
          expect(res.matches[0]).to.have.property('pattern').to.eq(mockRedirectRule.matches[0].pattern);
          expect(res.matches[0]).to.have.property('match_type').to.eq(mockRedirectRule.matches[0].match_type);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when a synonym group with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addRedirectRule(mockRedirectRule)).to.eventually.be.rejected;
      });

      it('Should return error when adding a one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addRedirectRule(mockRedirectRule)).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.addRedirectRule(createMockRedirectRule(), { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.addRedirectRule(createMockRedirectRule())).to.eventually.be.rejectedWith('The user aborted a request.');
        });
      }
    });

    describe('updateRedirectRule', () => {
      const mockRedirectRule = createMockRedirectRule();
      let redirectRuleId;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addRedirectRule(mockRedirectRule).then((res) => {
          redirectRuleId = res.id;

          done();
        });
      });

      it('Should return a response when completely updating a redirect rule', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.updateRedirectRule({ id: redirectRuleId, ...mockRedirectRule }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('id').to.be.a('number');
          expect(res).to.have.property('url').to.eq(mockRedirectRule.url);
          expect(res).to.have.property('matches').to.be.an('array').of.length(1);
          expect(res.matches[0]).to.have.property('id').to.be.a('number');
          expect(res.matches[0]).to.have.property('pattern').to.eq(mockRedirectRule.matches[0].pattern);
          expect(res.matches[0]).to.have.property('match_type').to.eq(mockRedirectRule.matches[0].match_type);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return an error when completely updating a redirect rule that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateRedirectRule({
          id: 'abc123',
          ...mockRedirectRule,
        })).to.eventually.be.rejected;
      });

      it('Should return error when completely updating a redirect rule with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateRedirectRule({
          id: redirectRuleId,
          ...mockRedirectRule,
        })).to.eventually.be.rejected;
      });

      it('Should return error when completely updating a redirect rule with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateRedirectRule({
          id: redirectRuleId,
          ...mockRedirectRule,
        })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.updateRedirectRule({
            id: redirectRuleId,
            ...mockRedirectRule,
          }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.updateRedirectRule({
            id: redirectRuleId,
            ...mockRedirectRule,
          })).to.eventually.be.rejectedWith('The user aborted a request.');
        });
      }
    });

    describe('modifyRedirectRule', () => {
      const mockRedirectRule = createMockRedirectRule();
      let redirectRuleId;
      let redirectRuleUrl;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addRedirectRule(mockRedirectRule).then((res) => {
          redirectRuleId = res.id;
          redirectRuleUrl = res.url;

          delete mockRedirectRule.url;

          done();
        });
      });

      it('Should return a response when partially updating a redirect rule', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.modifyRedirectRule({ id: redirectRuleId, ...mockRedirectRule }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('id').to.be.a('number');
          expect(res).to.have.property('url').to.eq(redirectRuleUrl);
          expect(res).to.have.property('matches').to.be.an('array').of.length(1);
          expect(res.matches[0]).to.have.property('id').to.be.a('number');
          expect(res.matches[0]).to.have.property('pattern').to.eq(mockRedirectRule.matches[0].pattern);
          expect(res.matches[0]).to.have.property('match_type').to.eq(mockRedirectRule.matches[0].match_type);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return an error when partially updating a redirect rule that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyRedirectRule({ id: 'abc123', ...mockRedirectRule })).to.eventually.be.rejected;
      });

      it('Should return error when partially updating a redirect rule with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyRedirectRule({
          id: redirectRuleId,
          ...mockRedirectRule,
        })).to.eventually.be.rejected;
      });

      it('Should return error when partially updating a redirect rule with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyRedirectRule({
          id: redirectRuleId,
          ...mockRedirectRule,
        })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.modifyRedirectRule({
            id: redirectRuleId,
            ...mockRedirectRule,
          }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.modifyRedirectRule({
            id: redirectRuleId,
            ...mockRedirectRule,
          })).to.eventually.be.rejectedWith('The user aborted a request.');
        });
      }
    });

    describe('getRedirectRule', () => {
      const mockRedirectRule = createMockRedirectRule();
      let redirectRuleId;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addRedirectRule(mockRedirectRule).then((res) => {
          redirectRuleId = res.id;

          done();
        });
      });

      it('Should return a response when getting redirect rule with id', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getRedirectRule({ id: redirectRuleId }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('id').to.be.a('number');
          expect(res).to.have.property('url').to.eq(mockRedirectRule.url);
          expect(res).to.have.property('matches').to.be.an('array').of.length(1);
          expect(res.matches[0]).to.have.property('id').to.be.a('number');
          expect(res.matches[0]).to.have.property('pattern').to.eq(mockRedirectRule.matches[0].pattern);
          expect(res.matches[0]).to.have.property('match_type').to.eq(mockRedirectRule.matches[0].match_type);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting redirect rule with id that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getRedirectRule({ id: 'abc123' })).to.eventually.be.rejected;
      });

      it('Should return error when getting redirect rule with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getRedirectRule({ id: redirectRuleId })).to.eventually.be.rejected;
      });

      it('Should return error when getting redirect rule with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getRedirectRule({ id: redirectRuleId })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.getRedirectRule({ id: redirectRuleId }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.getRedirectRule({ id: redirectRuleId })).to.eventually.be.rejectedWith('The user aborted a request.');
        });
      }
    });

    describe('getRedirectRules', () => {
      const mockRedirectRule = createMockRedirectRule();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addRedirectRule(mockRedirectRule).then(() => {
          done();
        });
      });

      it('Should return a response when getting redirect rules', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getRedirectRules().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('redirect_rules').an('array').of.length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting redirect rules with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getRedirectRules({ numResultsPerPage: 10, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('redirect_rules').an('array').of.length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Backwards Compatibility `num_results_per_page` - Should return a response when getting redirect rules with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getRedirectRules({ num_results_per_page: 10, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('redirect_rules').an('array').of.length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting redirect rules with query parameter', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getRedirectRules({ query: 'constructor' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('redirect_rules').an('array').of.length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting redirect rules with phrase parameter', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getRedirectRules({ phrase: mockRedirectRule.matches[0].pattern }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('redirect_rules').an('array').of.length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting redirect rules with status parameter', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getRedirectRules({ status: 'current' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('redirect_rules').an('array').of.length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting redirect rules with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getRedirectRules()).to.eventually.be.rejected;
      });

      it('Should return error when getting redirect rules with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getRedirectRules()).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.getRedirectRules({}, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.getRedirectRules()).to.eventually.be.rejectedWith('The user aborted a request.');
        });
      }
    });

    describe('removeRedirectRule', () => {
      const mockRedirectRule = createMockRedirectRule();
      let redirectRuleId;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addRedirectRule(mockRedirectRule).then((res) => {
          redirectRuleId = res.id;

          done();
        });
      });

      it('Should return a response when removing redirect rule with id', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.removeRedirectRule({ id: redirectRuleId }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('id').to.be.a('number');
          expect(res).to.have.property('url').to.eq(mockRedirectRule.url);
          expect(res).to.have.property('matches').to.be.an('array').of.length(1);
          expect(res.matches[0]).to.have.property('id').to.be.a('number');
          expect(res.matches[0]).to.have.property('pattern').to.eq(mockRedirectRule.matches[0].pattern);
          expect(res.matches[0]).to.have.property('match_type').to.eq(mockRedirectRule.matches[0].match_type);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when removing redirect rule with id that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeRedirectRule({ id: 'abc123' })).to.eventually.be.rejected;
      });

      it('Should return error when removing redirect rule with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeRedirectRule({ id: redirectRuleId })).to.eventually.be.rejected;
      });

      it('Should return error when removing redirect rule with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeRedirectRule({ id: redirectRuleId })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.removeRedirectRule({ id: redirectRuleId }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.removeRedirectRule({ id: redirectRuleId })).to.eventually.be.rejectedWith('The user aborted a request.');
        });
      }
    });
  });
});
