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

function createMockFacetConfigurationV2() {
  const uuid = uuidv4();

  return {
    name: `facet-v2-${uuid}`,
    pathInMetadata: `metadata.facet_v2_${uuid}`,
    displayName: `Facet V2 ${uuid}`,
    type: 'multiple',
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
    setTimeout(() => done(), sendTimeout);
  });

  describe('Facet Configurations V2', () => {
    const facetConfigurations = [];

    after(async function afterHook() {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      // Clean up all the facet configurations that were created
      // Increasing timeout, since cleanup is consistently taking longer than default 5 seconds
      this.timeout(30000);
      for await (const facetConfig of facetConfigurations) {
        try {
          await catalog.removeFacetConfigurationV2(facetConfig);
        } catch (e) {
          // Log warning for debugging but don't fail cleanup
          console.warn(`Cleanup warning: failed to remove facet ${facetConfig.name}:`, e.message);
        }
      }
    });

    describe('addFacetConfigurationV2', () => {
      const mockFacetConfiguration = createMockFacetConfigurationV2();

      it('Should resolve when adding a facet configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addFacetConfigurationV2(mockFacetConfiguration).then((response) => {
          // Push mock facet configuration into saved list to be cleaned up afterwards
          facetConfigurations.push(mockFacetConfiguration);

          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/facets');
          expect(response).to.have.property('name').to.equal(mockFacetConfiguration.name);
          expect(response).to.have.property('path_in_metadata');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Backwards Compatibility `display_name` - Should resolve when adding a facet configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const mockConfig = createMockFacetConfigurationV2();
        // eslint-disable-next-line camelcase
        const { displayName: display_name, pathInMetadata: path_in_metadata, ...rest } = mockConfig;
        const newFacetConfiguration = { display_name, path_in_metadata, ...rest }; // eslint-disable-line camelcase
        catalog.addFacetConfigurationV2(newFacetConfiguration).then((response) => {
          // Push mock facet configuration into saved list to be cleaned up afterwards
          facetConfigurations.push(newFacetConfiguration);

          expect(response).to.have.property('display_name').to.be.equal(newFacetConfiguration.display_name);
          done();
        });
      });

      it('Should return error when adding a facet configuration that already exists', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        // Grab a mock configuration that already exists and try to add it
        const facetConfiguration = facetConfigurations[0];

        return expect(catalog.addFacetConfigurationV2(facetConfiguration)).to.eventually.be.rejected;
      });

      it('Should return error when adding a facet configuration without required pathInMetadata', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const invalidConfig = {
          name: `facet-v2-${uuidv4()}`,
          type: 'multiple',
          // Missing pathInMetadata
        };

        return expect(catalog.addFacetConfigurationV2(invalidConfig)).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.addFacetConfigurationV2(mockFacetConfiguration, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.addFacetConfigurationV2(mockFacetConfiguration)).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('getFacetConfigurationsV2', () => {
      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const mockFacetConfiguration = createMockFacetConfigurationV2();

        catalog.addFacetConfigurationV2(mockFacetConfiguration).then(() => {
          // Push mock facet configuration into saved list to be cleaned up afterwards
          facetConfigurations.push(mockFacetConfiguration);
          done();
        });
      });

      it('Should return a response when getting facet configurations', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getFacetConfigurationsV2().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/facets');
          expect(res).to.have.property('facets').to.be.an('array').length.gte(1);
          expect(res).to.have.property('total_count');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Should return a response when getting facet configurations with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getFacetConfigurationsV2({ numResultsPerPage: 1, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('facets').to.be.an('array').length(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal('1');
          expect(requestedUrlParams).to.have.property('page').to.equal('1');
          done();
        });
      });

      it('Should return a response when getting facet configurations with offset parameter', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getFacetConfigurationsV2({ offset: 0, numResultsPerPage: 10 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('facets').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('offset').to.equal('0');
          done();
        });
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.getFacetConfigurationsV2({}, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.getFacetConfigurationsV2()).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('getFacetConfigurationV2', () => {
      let existingFacetConfiguration;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        existingFacetConfiguration = createMockFacetConfigurationV2();

        catalog.addFacetConfigurationV2(existingFacetConfiguration).then(() => {
          // Push mock facet configuration into saved list to be cleaned up afterwards
          facetConfigurations.push(existingFacetConfiguration);
          done();
        });
      });

      it('Should return a response when getting a single facet configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getFacetConfigurationV2({ name: existingFacetConfiguration.name }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/facets/');
          expect(res).to.have.property('name').to.equal(existingFacetConfiguration.name);
          expect(res).to.have.property('path_in_metadata');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Should return error when getting a facet configuration that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getFacetConfigurationV2({ name: 'non-existent-facet' })).to.eventually.be.rejected;
      });

      it('Should return error when name parameter is missing', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getFacetConfigurationV2({})).to.eventually.be.rejectedWith('name is a required parameter of type string');
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.getFacetConfigurationV2({ name: existingFacetConfiguration.name }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('modifyFacetConfigurationsV2', () => {
      let existingFacetConfiguration;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        existingFacetConfiguration = createMockFacetConfigurationV2();

        catalog.addFacetConfigurationV2(existingFacetConfiguration).then(() => {
          // Push mock facet configuration into saved list to be cleaned up afterwards
          facetConfigurations.push(existingFacetConfiguration);
          done();
        });
      });

      it('Should return a response when modifying multiple facet configurations', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const updateData = {
          facetConfigurations: [
            {
              name: existingFacetConfiguration.name,
              displayName: 'Updated Display Name V2',
            },
          ],
        };

        catalog.modifyFacetConfigurationsV2(updateData).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/facets');
          expect(res).to.have.property('facets').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Should return error when facetConfigurations parameter is missing', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyFacetConfigurationsV2({})).to.eventually.be.rejectedWith('facetConfigurations is a required parameter of type array');
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.modifyFacetConfigurationsV2({ facetConfigurations: [{ name: 'test' }] }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('modifyFacetConfigurationV2', () => {
      let existingFacetConfiguration;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        existingFacetConfiguration = createMockFacetConfigurationV2();

        catalog.addFacetConfigurationV2(existingFacetConfiguration).then(() => {
          // Push mock facet configuration into saved list to be cleaned up afterwards
          facetConfigurations.push(existingFacetConfiguration);
          done();
        });
      });

      it('Should return a response when modifying a single facet configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const updateData = {
          name: existingFacetConfiguration.name,
          displayName: 'Updated Single Display Name V2',
          sortOrder: 'value',
        };

        catalog.modifyFacetConfigurationV2(updateData).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/facets/');
          expect(res).to.have.property('name').to.equal(existingFacetConfiguration.name);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Should return error when modifying a facet configuration that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyFacetConfigurationV2({ name: 'non-existent-facet', displayName: 'Test' })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.modifyFacetConfigurationV2({ name: existingFacetConfiguration.name, displayName: 'Test' }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('replaceFacetConfigurationV2', () => {
      let existingFacetConfiguration;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        existingFacetConfiguration = createMockFacetConfigurationV2();

        catalog.addFacetConfigurationV2(existingFacetConfiguration).then(() => {
          // Push mock facet configuration into saved list to be cleaned up afterwards
          facetConfigurations.push(existingFacetConfiguration);
          done();
        });
      });

      it('Should return a response when replacing a facet configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const replaceData = {
          name: existingFacetConfiguration.name,
          pathInMetadata: existingFacetConfiguration.pathInMetadata,
          type: 'multiple',
          displayName: 'Replaced Display Name V2',
        };

        catalog.replaceFacetConfigurationV2(replaceData).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/facets/');
          expect(res).to.have.property('name').to.equal(existingFacetConfiguration.name);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          const replaceData = {
            name: existingFacetConfiguration.name,
            pathInMetadata: existingFacetConfiguration.pathInMetadata,
            type: 'multiple',
          };

          return expect(catalog.replaceFacetConfigurationV2(replaceData, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('createOrReplaceFacetConfigurationsV2', () => {
      it('Should return a response when creating or replacing facet configurations', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const newConfig = createMockFacetConfigurationV2();
        const createOrReplaceData = {
          facetConfigurations: [newConfig],
        };

        catalog.createOrReplaceFacetConfigurationsV2(createOrReplaceData).then((res) => {
          // Push mock facet configuration into saved list to be cleaned up afterwards
          facetConfigurations.push(newConfig);

          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/facets');
          expect(res).to.have.property('facets').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.createOrReplaceFacetConfigurationsV2({ facetConfigurations: [] }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('removeFacetConfigurationV2', () => {
      let facetToRemove;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        facetToRemove = createMockFacetConfigurationV2();

        catalog.addFacetConfigurationV2(facetToRemove).then(() => {
          done();
        });
      });

      it('Should return a response when removing a facet configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.removeFacetConfigurationV2({ name: facetToRemove.name }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestUrl = fetchSpy.args[0][0];

          expect(requestUrl).to.include('/v2/facets/');
          expect(res).to.have.property('name').to.equal(facetToRemove.name);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when removing a facet configuration that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeFacetConfigurationV2({ name: 'non-existent-facet' })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.removeFacetConfigurationV2({ name: 'test-facet' }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });
  });
});
