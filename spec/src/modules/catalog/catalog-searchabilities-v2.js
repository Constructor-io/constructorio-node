/* eslint-disable no-unused-expressions, import/no-unresolved, no-restricted-syntax, max-nested-callbacks */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { v4: uuidv4 } = require('uuid');
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

function createMockSearchabilityConfigurationV2() {
  const uuid = uuidv4().substring(0, 8);

  return {
    name: `test_searchability_v2_${uuid}`,
    fuzzySearchable: false,
    exactSearchable: true,
    displayable: true,
    hidden: false,
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

  describe('Searchabilities V2', () => {
    const searchabilitiesToCleanup = [];

    after(async function afterHook() {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      // Clean up all the searchabilities that were created
      this.timeout(30000);
      if (searchabilitiesToCleanup.length > 0) {
        try {
          await catalog.deleteSearchabilitiesV2({
            searchabilities: searchabilitiesToCleanup.map((s) => ({ name: s.name })),
          });
        } catch (e) {
          // Log warning for debugging but don't fail cleanup
          const names = searchabilitiesToCleanup.map((s) => s.name).join(', ');
          console.warn(`Cleanup warning: failed to remove searchabilities [${names}]:`, e.message);
        }
      }
    });

    describe('retrieveSearchabilitiesV2', () => {
      it('Should return a response when retrieving searchabilities', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveSearchabilitiesV2().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/searchabilities');
          expect(res).to.have.property('searchabilities').to.be.an('array');
          expect(res).to.have.property('total_count');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        }).catch(done);
      });

      it('Should return a response when retrieving searchabilities with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveSearchabilitiesV2({ numResultsPerPage: 5, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('searchabilities').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal('5');
          expect(requestedUrlParams).to.have.property('page').to.equal('1');
          done();
        }).catch(done);
      });

      it('Should return a response when retrieving searchabilities with filter parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveSearchabilitiesV2({ displayable: true }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('searchabilities').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('displayable').to.equal('true');
          done();
        }).catch(done);
      });

      it('Should return a response when retrieving searchabilities with sort parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveSearchabilitiesV2({ sortBy: 'name', sortOrder: 'ascending' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('searchabilities').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('sort_by').to.equal('name');
          expect(requestedUrlParams).to.have.property('sort_order').to.equal('ascending');
          done();
        }).catch(done);
      });

      it('Should return a response when retrieving searchabilities with name filter', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveSearchabilitiesV2({ name: 'keywords' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('searchabilities').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('name').to.equal('keywords');
          done();
        }).catch(done);
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.retrieveSearchabilitiesV2({}, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.retrieveSearchabilitiesV2()).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('patchSearchabilitiesV2', () => {
      it('Should return a response when patching searchabilities', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const mockSearchability = createMockSearchabilityConfigurationV2();
        const searchabilityConfigurations = [mockSearchability];

        catalog.patchSearchabilitiesV2({ searchabilities: searchabilityConfigurations }).then((res) => {
          // Track for cleanup
          searchabilitiesToCleanup.push(mockSearchability);

          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/searchabilities');
          expect(res).to.have.property('searchabilities').to.be.an('array').length.gte(1);
          expect(res).to.have.property('total_count');

          const searchabilitiesResponse = res.searchabilities;
          const createdSearchability = searchabilitiesResponse.find((s) => s.name === mockSearchability.name);

          expect(createdSearchability).to.have.property('name').to.equal(mockSearchability.name);
          expect(createdSearchability).to.have.property('exact_searchable').to.equal(mockSearchability.exactSearchable);
          expect(createdSearchability).to.have.property('created_at');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('section');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        }).catch(done);
      });

      it('Should return a response when patching searchabilities with skipRebuild', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const mockSearchability = createMockSearchabilityConfigurationV2();
        const searchabilityConfigurations = [mockSearchability];

        const params = { searchabilities: searchabilityConfigurations, skipRebuild: true };
        catalog.patchSearchabilitiesV2(params).then((res) => {
          // Track for cleanup
          searchabilitiesToCleanup.push(mockSearchability);

          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('searchabilities').to.be.an('array');
          expect(requestedUrlParams).to.have.property('skip_rebuild').to.equal('true');
          done();
        }).catch(done);
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

        const params = { searchabilities: badSearchabilityConfigurations };
        return expect(catalog.patchSearchabilitiesV2(params)).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          const params = { searchabilities: [{ name: 'test' }] };
          return expect(catalog.patchSearchabilitiesV2(params, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          const params = { searchabilities: [{ name: 'test' }] };
          return expect(catalog.patchSearchabilitiesV2(params)).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('getSearchabilityV2', () => {
      it('Should return a response when getting a single searchability', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        // Use a known searchability that should exist
        catalog.getSearchabilityV2({ name: 'keywords' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/searchabilities/');
          expect(res).to.have.property('name').to.equal('keywords');
          expect(res).to.have.property('fuzzy_searchable');
          expect(res).to.have.property('exact_searchable');
          expect(res).to.have.property('displayable');
          expect(res).to.have.property('hidden');
          expect(res).to.have.property('created_at');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        }).catch(done);
      });

      it('Should return error when getting a searchability that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getSearchabilityV2({ name: 'non_existent_searchability_xyz123' })).to.eventually.be.rejected;
      });

      it('Should return error when name parameter is missing', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getSearchabilityV2({})).to.eventually.be.rejectedWith('name is a required parameter of type string');
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.getSearchabilityV2({ name: 'keywords' }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('patchSearchabilityV2', () => {
      let existingSearchability;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        existingSearchability = createMockSearchabilityConfigurationV2();

        catalog.patchSearchabilitiesV2({ searchabilities: [existingSearchability] }).then(() => {
          searchabilitiesToCleanup.push(existingSearchability);
          done();
        }).catch(done);
      });

      it('Should return a response when patching a single searchability', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.patchSearchabilityV2({
          name: existingSearchability.name,
          displayable: false,
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/searchabilities/');
          expect(res).to.have.property('name').to.equal(existingSearchability.name);
          expect(res).to.have.property('displayable').to.equal(false);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        }).catch(done);
      });

      it('Should return a response when patching a single searchability with skipRebuild', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.patchSearchabilityV2({
          name: existingSearchability.name,
          hidden: true,
          skipRebuild: true,
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('name').to.equal(existingSearchability.name);
          expect(requestedUrlParams).to.have.property('skip_rebuild').to.equal('true');
          done();
        }).catch(done);
      });

      it('Should return error when patching a searchability that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.patchSearchabilityV2({ name: 'non_existent_searchability_xyz123', displayable: false })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.patchSearchabilityV2({ name: existingSearchability.name, displayable: false }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('deleteSearchabilitiesV2', () => {
      let searchabilityToDelete;

      beforeEach((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        searchabilityToDelete = createMockSearchabilityConfigurationV2();

        catalog.patchSearchabilitiesV2({ searchabilities: [searchabilityToDelete] }).then(() => {
          done();
        }).catch(done);
      });

      it('Should return a response when deleting searchabilities', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.deleteSearchabilitiesV2({
          searchabilities: [{ name: searchabilityToDelete.name }],
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/searchabilities');
          expect(res).to.have.property('searchabilities').to.be.an('array');
          expect(res).to.have.property('total_count');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        }).catch(done);
      });

      it('Should return a response when deleting searchabilities with skipRebuild', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.deleteSearchabilitiesV2({
          searchabilities: [{ name: searchabilityToDelete.name }],
          skipRebuild: true,
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('searchabilities').to.be.an('array');
          expect(requestedUrlParams).to.have.property('skip_rebuild').to.equal('true');
          done();
        }).catch(done);
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.deleteSearchabilitiesV2({ searchabilities: [{ name: 'test' }] }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('deleteSearchabilityV2', () => {
      let searchabilityToDelete;

      beforeEach((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        searchabilityToDelete = createMockSearchabilityConfigurationV2();

        catalog.patchSearchabilitiesV2({ searchabilities: [searchabilityToDelete] }).then(() => {
          done();
        }).catch(done);
      });

      it('Should return a response when deleting a single searchability', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.deleteSearchabilityV2({ name: searchabilityToDelete.name }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/searchabilities/');
          expect(res).to.have.property('name').to.equal(searchabilityToDelete.name);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        }).catch(done);
      });

      it('Should return a response when deleting a single searchability with skipRebuild', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.deleteSearchabilityV2({ name: searchabilityToDelete.name, skipRebuild: true }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('name').to.equal(searchabilityToDelete.name);
          expect(requestedUrlParams).to.have.property('skip_rebuild').to.equal('true');
          done();
        }).catch(done);
      });

      it('Should return error when deleting a searchability that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteSearchabilityV2({ name: 'non_existent_searchability_xyz123' })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.deleteSearchabilityV2({ name: searchabilityToDelete.name }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });
  });
});
