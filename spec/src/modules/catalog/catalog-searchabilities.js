/* eslint-disable no-unused-expressions, import/no-unresolved, no-restricted-syntax, max-nested-callbacks */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const ConstructorIO = require('../../../../test/constructorio'); // eslint-disable-line import/extensions
const helpers = require('../../../mocha.helpers');

const nodeFetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const sendTimeout = 300;
const testApiKey = process.env.TEST_CATALOG_API_KEY;
const testApiToken = process.env.TEST_API_TOKEN;
const validOptions = {
  apiKey: testApiKey,
  apiToken: testApiToken,
};
const skipNetworkTimeoutTests = process.env.SKIP_NETWORK_TIMEOUT_TESTS === 'true';

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

  describe('Searchabilities', () => {
    describe('retrieveSearchabilities', () => {
      it('Should return a response when retrieving searchabilities', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveSearchabilities().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('searchabilities').to.be.an('array').length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Should return a response when retrieving searchabilities with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveSearchabilities({ numResultsPerPage: 1, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('searchabilities').to.be.an('array').length(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal('1');
          expect(requestedUrlParams).to.have.property('page').to.equal('1');
          done();
        });
      });

      it('Should return a response when retrieving searchabilities with name parameter', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveSearchabilities({ name: 'groups' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('searchabilities').to.be.an('array').length(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('filters').to.have.property('name').to.equal('groups');
          done();
        });
      });

      it('Should return a response when retrieving searchabilities with additional parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const additionalParameters = {
          offset: 1,
          numResultsPerPage: 50,
          filters: { exactSearchable: true },
          searchable: true,
          sortBy: 'name',
          sortOrder: 'descending',
        };

        catalog.retrieveSearchabilities(additionalParameters).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('searchabilities').to.be.an('array').length(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('offset').to.equal(String(additionalParameters.offset));
          expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal(String(additionalParameters.numResultsPerPage));
          expect(requestedUrlParams).to.have.property('searchable').to.equal(String(additionalParameters.searchable));
          expect(requestedUrlParams).to.have.property('sort_by').to.equal(additionalParameters.sortBy);
          expect(requestedUrlParams).to.have.property('sort_order').to.equal(additionalParameters.sortOrder);
          expect(requestedUrlParams).to.have.property('filters').to.have.property('exact_searchable').to.equal(String(additionalParameters.filters.exactSearchable));
          done();
        });
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.retrieveSearchabilities({}, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.retrieveSearchabilities()).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('patchSearchabilities', () => {
      it('Should return a response when patching searchabilities', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const searchabilityConfigurations = [
          {
            name: 'keywords',
            exactSearchable: false,
          },
          {
            name: 'testField',
            exactSearchable: false,
          },
        ];

        catalog.patchSearchabilities({ searchabilities: searchabilityConfigurations }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('searchabilities').to.be.an('array').length.gte(1);

          const searchabilitiesResponse = res.searchabilities;

          expect(searchabilitiesResponse[0]).to.have.property('name').to.equal(searchabilityConfigurations[0].name);
          expect(searchabilitiesResponse[0]).to.have.property('exact_searchable').to.equal(searchabilityConfigurations[0].exactSearchable);
          expect(searchabilitiesResponse[0]).to.have.property('created_at');
          expect(searchabilitiesResponse[0]).to.have.property('updated_at');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('section');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Should return error when patching searchabilities with unsupported values', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const badSearchabilityConfigurations = [
          {
            name: 'keywords',
            nonExistentField: false,
          },
        ];

        return expect(catalog.patchSearchabilities({ searchabilities: badSearchabilityConfigurations })).to.eventually.be.rejected; // eslint-disable-line max-len
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.patchSearchabilities({}, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.patchSearchabilities()).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });
  });
});
