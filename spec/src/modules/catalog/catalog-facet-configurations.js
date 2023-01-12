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

function createMockFacetConfiguration() {
  const uuid = uuidv4();

  return {
    name: `facet-${uuid}`,
    display_name: `Facet ${uuid}`,
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
    setTimeout(done, sendTimeout);
  });

  describe('Facet Configurations', () => {
    const facetConfigurations = [];

    after(async () => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      // Clean up all the facet configurations that were created
      for await (const facetConfig of facetConfigurations) {
        await catalog.removeFacetConfiguration(facetConfig);
      }
    });

    describe('addFacetConfiguration', () => {
      let mockFacetConfiguration = createMockFacetConfiguration();

      it('Should resolve when adding a facet configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addFacetConfiguration(mockFacetConfiguration).then(() => {
          // Push mock facet configuration into saved list to be cleaned up afterwards
          facetConfigurations.push(mockFacetConfiguration);
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

        return expect(catalog.addFacetConfiguration(facetConfiguration)).to.eventually.be.rejected;
      });

      it('Should return error when adding a facet configuration with unsupported options', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        mockFacetConfiguration = createMockFacetConfiguration();
        mockFacetConfiguration.sort_ascending = 'true';

        return expect(catalog.addFacetConfiguration(mockFacetConfiguration)).to.eventually.be.rejected;
      });

      it('Should return error when adding a facet configuration with unsupported option values', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        mockFacetConfiguration = createMockFacetConfiguration();
        mockFacetConfiguration.sort_by = 'not ascending';

        return expect(catalog.addFacetConfiguration(mockFacetConfiguration)).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.addFacetConfiguration(mockFacetConfiguration, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.addFacetConfiguration(mockFacetConfiguration)).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('getFacetConfigurations', () => {
      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const mockFacetConfiguration = createMockFacetConfiguration();

        catalog.addFacetConfiguration(mockFacetConfiguration).then(() => {
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

        catalog.getFacetConfigurations().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('facets').to.be.an('array').length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting facet configurations with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getFacetConfigurations({ num_results_per_page: 10, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('facets').to.be.an('array').length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.getFacetConfigurations({}, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.getFacetConfigurations()).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('getFacetConfiguration', () => {
      const mockFacetConfiguration = createMockFacetConfiguration();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addFacetConfiguration(mockFacetConfiguration).then(() => {
          // Push mock facet configuration into saved list to be cleaned up afterwards
          facetConfigurations.push(mockFacetConfiguration);
          done();
        });
      });

      it('Should return a response when getting a facet configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const { name } = mockFacetConfiguration;

        catalog.getFacetConfiguration({ name }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('name').to.be.a('string').to.equal(name);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting a facet configuration with name that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getFacetConfiguration({ name: 'gibberish' })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.addFacetConfiguration(mockFacetConfiguration, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.addFacetConfiguration(mockFacetConfiguration)).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('modifyFacetConfigurations', () => {
      const mockFacetConfigurations = [
        createMockFacetConfiguration(),
        createMockFacetConfiguration(),
      ];

      before(async () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        // Push mock facet configurations into saved list to be cleaned up afterwards
        for await (const mockFacetConfig of mockFacetConfigurations) {
          await catalog.addFacetConfiguration(mockFacetConfig).then(() => {
            facetConfigurations.push(mockFacetConfig);
          });
        }
      });

      it('Should return a response when modifying facet configurations', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const newFacetConfigurations = [
          {
            name: mockFacetConfigurations[0].name,
            display_name: 'New Facet Display Name',
          },
          {
            name: mockFacetConfigurations[1].name,
            position: 5,
          },
        ];

        catalog.modifyFacetConfigurations({ facetConfigurations: newFacetConfigurations }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res[0]).to.have.property('name').to.be.a('string').to.equal(mockFacetConfigurations[0].name);
          expect(res[0]).to.have.property('display_name').to.be.a('string').to.equal('New Facet Display Name');
          expect(res[1]).to.have.property('name').to.be.a('string').to.equal(mockFacetConfigurations[1].name);
          expect(res[1]).to.have.property('position').to.be.a('number').to.equal(5);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when modifying facet configurations with names that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const nonExistentFacetConfigurations = [
          {
            name: 'non-existent-facet-config-1',
            type: 'range',
          },
          {
            name: 'non-existent-facet-config-2',
            sort_descending: true,
          },
        ];

        return expect(catalog.modifyFacetConfigurations({ facetConfigurations: nonExistentFacetConfigurations })).to.eventually.be.rejected; // eslint-disable-line max-len
      });

      it('Should return error when modifying facet configurations with unsupported options', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const badFacetConfigurations = [
          {
            name: mockFacetConfigurations[0].name,
            sort_ascending: 'true',
          },
          {
            name: mockFacetConfigurations[1].name,
            placement: 5,
          },
        ];

        return expect(catalog.modifyFacetConfigurations({ facetConfigurations: badFacetConfigurations })).to.eventually.be.rejected; // eslint-disable-line max-len
      });

      it('Should return error when modifying facet configurations with unsupported option values', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const badFacetConfigurations = [
          {
            name: mockFacetConfigurations[0].name,
            sort_ascending: 'true',
          },
          {
            name: mockFacetConfigurations[1].name,
            placement: 5,
          },
        ];

        return expect(catalog.modifyFacetConfigurations({ facetConfigurations: badFacetConfigurations })).to.eventually.be.rejected; // eslint-disable-line max-len
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);
          const newFacetConfigurations = [
            {
              name: mockFacetConfigurations[0].name,
              display_name: 'New Facet Display Name',
            },
            {
              name: mockFacetConfigurations[1].name,
              position: 5,
            },
          ];

          return expect(catalog.modifyFacetConfigurations(
            { facetConfigurations: newFacetConfigurations },
            { timeout: 10 },
          )).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });
          const newFacetConfigurations = [
            {
              name: mockFacetConfigurations[0].name,
              display_name: 'New Facet Display Name',
            },
            {
              name: mockFacetConfigurations[1].name,
              position: 5,
            },
          ];

          return expect(catalog.modifyFacetConfigurations(
            { facetConfigurations: newFacetConfigurations },
          )).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('replaceFacetConfiguration', () => {
      const mockFacetConfiguration = createMockFacetConfiguration();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        // Push mock facet configuration into saved list to be cleaned up afterwards
        catalog.addFacetConfiguration(mockFacetConfiguration).then(() => {
          facetConfigurations.push(mockFacetConfiguration);
          done();
        });
      });

      it('Should return a response when replacing a facet configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.replaceFacetConfiguration({
          name: mockFacetConfiguration.name,
          display_name: 'New Facet Display Name',
          type: 'multiple',
          position: 5,
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('name').to.be.a('string').to.equal(mockFacetConfiguration.name);
          expect(res).to.have.property('display_name').to.be.a('string').to.equal('New Facet Display Name');
          expect(res).to.have.property('type').to.be.a('string').to.equal('multiple');
          expect(res).to.have.property('position').to.be.a('number').to.equal(5);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when replacing a facet configuration with name that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const facetConfiguration = {
          name: 'non-existent-facet-config',
          position: 5,
        };

        return expect(catalog.replaceFacetConfiguration(facetConfiguration)).to.eventually.be.rejected;
      });

      it('Should return error when replacing a facet configuration with unsupported options', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const facetConfiguration = {
          name: mockFacetConfiguration.name,
          placement: 5,
        };

        return expect(catalog.replaceFacetConfiguration(facetConfiguration)).to.eventually.be.rejected;
      });

      it('Should return error when replacing a facet configuration with unsupported option values', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const facetConfiguration = {
          name: mockFacetConfiguration.name,
          type: 'slider',
        };

        return expect(catalog.replaceFacetConfiguration(facetConfiguration)).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.replaceFacetConfiguration({
            name: mockFacetConfiguration.name,
            display_name: 'New Facet Display Name',
            type: 'multiple',
            position: 5,
          }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.replaceFacetConfiguration({
            name: mockFacetConfiguration.name,
            display_name: 'New Facet Display Name',
            type: 'multiple',
            position: 5,
          })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('modifyFacetConfiguration', () => {
      const mockFacetConfiguration = createMockFacetConfiguration();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        // Push mock facet configuration into saved list to be cleaned up afterwards
        catalog.addFacetConfiguration(mockFacetConfiguration).then(() => {
          facetConfigurations.push(mockFacetConfiguration);
          done();
        });
      });

      it('Should return a response when modifying a facet configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.modifyFacetConfiguration({
          name: mockFacetConfiguration.name,
          display_name: 'New Facet Display Name',
          position: 5,
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('name').to.be.a('string').to.equal(mockFacetConfiguration.name);
          expect(res).to.have.property('display_name').to.be.a('string').to.equal('New Facet Display Name');
          expect(res).to.have.property('position').to.be.a('number').to.equal(5);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when modifying a facet configuration with name that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const facetConfiguration = {
          name: 'non-existent-facet-config',
          position: 5,
        };

        return expect(catalog.modifyFacetConfiguration(facetConfiguration)).to.eventually.be.rejected;
      });

      it('Should return error when modifying a facet configuration with unsupported options', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const facetConfiguration = {
          name: mockFacetConfiguration.name,
          placement: 5,
        };

        return expect(catalog.modifyFacetConfiguration(facetConfiguration)).to.eventually.be.rejected;
      });

      it('Should return error when modifying a facet configuration with unsupported option values', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const facetConfiguration = {
          name: mockFacetConfiguration.name,
          type: 'slider',
        };

        return expect(catalog.modifyFacetConfiguration(facetConfiguration)).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.modifyFacetConfiguration({
            name: mockFacetConfiguration.name,
            display_name: 'New Facet Display Name',
            position: 5,
          }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.modifyFacetConfiguration({
            name: mockFacetConfiguration.name,
            display_name: 'New Facet Display Name',
            position: 5,
          })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('removeFacetConfiguration', () => {
      it('Should resolve when removing a facet configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const mockFacetConfiguration = createMockFacetConfiguration();

        catalog.addFacetConfiguration(mockFacetConfiguration).then(() => {
          catalog.removeFacetConfiguration(mockFacetConfiguration).then(() => {
            done();
          });
        });
      });

      it('Should return error when removing a facet configuration that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const mockFacetConfiguration = createMockFacetConfiguration();

        return expect(catalog.removeFacetConfiguration(mockFacetConfiguration)).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);
          const mockFacetConfiguration = createMockFacetConfiguration();

          return expect(catalog.removeFacetConfiguration(
            mockFacetConfiguration,
            { timeout: 10 },
          )).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });
          const mockFacetConfiguration = createMockFacetConfiguration();

          return expect(catalog.removeFacetConfiguration(
            mockFacetConfiguration,
          )).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });
  });
});
