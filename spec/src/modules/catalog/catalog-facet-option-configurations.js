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
    displayName: `Facet ${uuid}`,
    type: 'multiple',
  };
}

function createMockFacetOptionConfiguration(facetGroupName) {
  const uuid = uuidv4();

  const mockFacetOptionConfiguration = {
    value: `facet-option-${uuid}`,
    displayName: `Facet Option ${uuid}`,
  };

  if (facetGroupName) {
    mockFacetOptionConfiguration.facetGroupName = facetGroupName;
  }

  return mockFacetOptionConfiguration;
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

  describe('Facet Option Configurations', () => {
    const facetConfiguration = createMockFacetConfiguration();
    const facetGroupName = facetConfiguration.name;

    before(async () => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      await catalog.addFacetConfiguration(facetConfiguration);
    });

    after(async () => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      // Clean up all the facet/facet option configurations that were created
      await catalog.removeFacetConfiguration({ name: facetConfiguration.name });
    });

    describe('addFacetOptionConfiguration', () => {
      let mockFacetOptionConfiguration = createMockFacetOptionConfiguration(facetGroupName);

      it('Should resolve when adding a facet option configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addFacetOptionConfiguration(mockFacetOptionConfiguration).then(() => done());
      });

      it('Backwards Compatibility `display_name` - Should resolve when adding a facet option configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        // eslint-disable-next-line camelcase
        const { displayName: display_name, ...rest } = createMockFacetOptionConfiguration(facetGroupName);
        // eslint-disable-next-line camelcase
        catalog.addFacetOptionConfiguration({ display_name, ...rest }).then((response) => {
          expect(response).to.have.property('display_name').to.be.equal(display_name);
          done();
        });
      });

      it('Should return error when adding a facet option configuration that already exists', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addFacetOptionConfiguration(mockFacetOptionConfiguration)).to.eventually.be.rejected;
      });

      it('Should return error when adding a facet option configuration with unsupported options', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        mockFacetOptionConfiguration = createMockFacetOptionConfiguration(facetGroupName);
        mockFacetOptionConfiguration.type = 'hidden';

        return expect(catalog.addFacetOptionConfiguration(mockFacetOptionConfiguration)).to.eventually.be.rejected;
      });

      it('Should return error when adding a facet option configuration with unsupported option values', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        mockFacetOptionConfiguration = createMockFacetOptionConfiguration(facetGroupName);
        mockFacetOptionConfiguration.position = 'one';

        return expect(catalog.addFacetOptionConfiguration(mockFacetOptionConfiguration)).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.addFacetOptionConfiguration(
            createMockFacetOptionConfiguration(facetGroupName),
            { timeout: 10 },
          )).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.addFacetOptionConfiguration(
            createMockFacetOptionConfiguration(facetGroupName),
          )).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('addOrModifyFacetOptionConfigurations', () => {
      let mockFacetOptionConfigurations = [
        createMockFacetOptionConfiguration(),
        createMockFacetOptionConfiguration(),
      ];

      it('Should resolve when adding facet configurations', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOrModifyFacetOptionConfigurations({
          facetGroupName,
          facetOptionConfigurations: mockFacetOptionConfigurations,
        }).then(() => done());
      });

      it('Should return a response when modifying facet configurations', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const newFacetOptionConfigurations = [
          {
            value: mockFacetOptionConfigurations[0].value,
            displayName: 'New Facet Option Display Name',
            position: 3,
          },
          {
            value: mockFacetOptionConfigurations[1].value,
            displayName: 'New Facet Option Display Name #2',
            position: 5,
          },
        ];

        catalog.addOrModifyFacetOptionConfigurations({
          facetGroupName,
          facetOptionConfigurations: newFacetOptionConfigurations,
        }).then((res) => {
          expect(res[0]).to.have.property('value').to.be.a('string').to.be.oneOf([mockFacetOptionConfigurations[0].value, mockFacetOptionConfigurations[1].value]);
          expect(res[0]).to.have.property('display_name').to.be.a('string').to.be.oneOf([newFacetOptionConfigurations[0].displayName, newFacetOptionConfigurations[1].displayName]);
          expect(res[0]).to.have.property('position').to.be.a('number').to.be.oneOf([newFacetOptionConfigurations[0].position, newFacetOptionConfigurations[1].position]);
          expect(res[1]).to.have.property('value').to.be.a('string').to.be.oneOf([mockFacetOptionConfigurations[0].value, mockFacetOptionConfigurations[1].value]);
          expect(res[1]).to.have.property('display_name').to.be.a('string').to.be.oneOf([newFacetOptionConfigurations[0].displayName, newFacetOptionConfigurations[1].displayName]);
          expect(res[1]).to.have.property('position').to.be.a('number').to.be.oneOf([newFacetOptionConfigurations[0].position, newFacetOptionConfigurations[1].position]);
          expect(fetchSpy).to.have.been.called;
          done();
        });
      });

      it('Should return error when adding or modifying facet configurations with unsupported options', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        mockFacetOptionConfigurations = [
          {
            ...createMockFacetConfiguration(),
            type: 'hidden',
          },
        ];

        return expect(catalog.addOrModifyFacetOptionConfigurations({
          facetGroupName: mockFacetOptionConfigurations,
          facetOptionConfigurations: mockFacetOptionConfigurations,
        })).to.eventually.be.rejected;
      });

      it('Should return error when adding or modifying facet configurations with unsupported option values', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        mockFacetOptionConfigurations = [
          {
            ...createMockFacetConfiguration(),
            position: 'one',
          },
        ];

        return expect(catalog.addOrModifyFacetOptionConfigurations({
          facetGroupName: mockFacetOptionConfigurations,
          facetOptionConfigurations: mockFacetOptionConfigurations,
        })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.addOrModifyFacetOptionConfigurations({
            facetGroupName,
            facetOptionConfigurations: mockFacetOptionConfigurations,
          }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.addOrModifyFacetOptionConfigurations({
            facetGroupName,
            facetOptionConfigurations: mockFacetOptionConfigurations,
          })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('getFacetOptionConfigurations', () => {
      before(async () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const mockFacetOptionConfigurations = [
          createMockFacetOptionConfiguration(),
          createMockFacetOptionConfiguration(),
        ];

        await catalog.addOrModifyFacetOptionConfigurations({
          facetGroupName,
          facetOptionConfigurations: mockFacetOptionConfigurations,
        });
      });

      it('Should return a response when getting facet option configurations', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getFacetOptionConfigurations({
          facetGroupName,
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('facet_options').to.be.an('array').length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting facet option configurations with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getFacetOptionConfigurations({
          facetGroupName,
          numResultsPerPage: 1,
          page: 1,
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('facet_options').to.be.an('array').to.have.length(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Backwards Compatibility `num_results_per_page` - Should return a response when getting facet option configurations with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getFacetOptionConfigurations({
          facetGroupName,
          num_results_per_page: 10,
          page: 1,
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('facet_options').to.be.an('array').length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.getFacetOptionConfigurations({
            facetGroupName,
          }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.getFacetOptionConfigurations({
            facetGroupName,
          })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('getFacetOptionConfiguration', () => {
      const mockFacetOptionConfiguration = createMockFacetOptionConfiguration(facetGroupName);

      before(async () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        await catalog.addFacetOptionConfiguration(mockFacetOptionConfiguration);
      });

      it('Should return a response when getting a facet option configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const { value } = mockFacetOptionConfiguration;

        catalog.getFacetOptionConfiguration({
          facetGroupName,
          value,
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('value').to.be.a('string').to.equal(value);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting a facet option configuration with value that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getFacetOptionConfiguration({
          facetGroupName,
          value: 'non-existent-facet-option-value',
        })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);
          const { value } = mockFacetOptionConfiguration;

          return expect(catalog.getFacetOptionConfiguration({
            facetGroupName,
            value,
          }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });
          const { value } = mockFacetOptionConfiguration;

          return expect(catalog.getFacetOptionConfiguration({
            facetGroupName,
            value,
          })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('replaceFacetOptionConfiguration', () => {
      const mockFacetOptionConfiguration = createMockFacetOptionConfiguration(facetGroupName);

      before(async () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        await catalog.addFacetOptionConfiguration(mockFacetOptionConfiguration);
      });

      it('Should return a response when replacing a facet option configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.replaceFacetOptionConfiguration({
          facetGroupName,
          value: mockFacetOptionConfiguration.value,
          displayName: 'New Facet Option Display Name',
          position: 5,
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('value').to.be.a('string').to.equal(mockFacetOptionConfiguration.value);
          expect(res).to.have.property('display_name').to.be.a('string').to.equal('New Facet Option Display Name');
          expect(res).to.have.property('position').to.be.a('number').to.equal(5);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Backwards Compatibility `display_name` - Should return a response when replacing a facet option configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.replaceFacetOptionConfiguration({
          facetGroupName,
          value: mockFacetOptionConfiguration.value,
          display_name: 'New Facet Option Display Name2',
          position: 5,
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('value').to.be.a('string').to.equal(mockFacetOptionConfiguration.value);
          expect(res).to.have.property('display_name').to.be.a('string').to.equal('New Facet Option Display Name2');
          expect(res).to.have.property('position').to.be.a('number').to.equal(5);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when replacing a facet option configuration with value that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const facetOptionConfiguration = {
          facetGroupName,
          value: 'non-existent-facet-config',
          position: 5,
        };

        return expect(catalog.replaceFacetOptionConfiguration(facetOptionConfiguration)).to.eventually.be.rejected;
      });

      it('Should return error when replacing a facet option configuration with unsupported options', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const facetOptionConfiguration = {
          facetGroupName,
          value: mockFacetOptionConfiguration.value,
          placement: 5,
        };

        return expect(catalog.replaceFacetOptionConfiguration(facetOptionConfiguration)).to.eventually.be.rejected;
      });

      it('Should return error when replacing a facet option configuration with unsupported option values', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const facetOptionConfiguration = {
          facetGroupName,
          value: mockFacetOptionConfiguration.value,
          type: 'slider',
        };

        return expect(catalog.replaceFacetOptionConfiguration(facetOptionConfiguration)).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.replaceFacetOptionConfiguration({
            facetGroupName,
            value: mockFacetOptionConfiguration.value,
            displayName: 'New Facet Option Display Name',
            position: 5,
          }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.replaceFacetOptionConfiguration({
            facetGroupName,
            value: mockFacetOptionConfiguration.value,
            displayName: 'New Facet Option Display Name',
            position: 5,
          })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('modifyFacetOptionConfiguration', () => {
      const mockFacetOptionConfiguration = createMockFacetOptionConfiguration(facetGroupName);

      before(async () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        await catalog.addFacetOptionConfiguration(mockFacetOptionConfiguration);
      });

      it('Should return a response when modifying a facet option configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.modifyFacetOptionConfiguration({
          facetGroupName,
          value: mockFacetOptionConfiguration.value,
          displayName: 'New Facet Display Name',
          position: 5,
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('value').to.be.a('string').to.equal(mockFacetOptionConfiguration.value);
          expect(res).to.have.property('display_name').to.be.a('string').to.equal('New Facet Display Name');
          expect(res).to.have.property('position').to.be.a('number').to.equal(5);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Backwards Compatibility `display_name` - Should return a response when modifying a facet option configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.modifyFacetOptionConfiguration({
          facetGroupName,
          value: mockFacetOptionConfiguration.value,
          display_name: 'New Facet Display Name2',
          position: 5,
        }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('value').to.be.a('string').to.equal(mockFacetOptionConfiguration.value);
          expect(res).to.have.property('display_name').to.be.a('string').to.equal('New Facet Display Name2');
          expect(res).to.have.property('position').to.be.a('number').to.equal(5);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when modifying a facet option configuration with value that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const facetOptionConfiguration = {
          facetGroupName,
          value: 'non-existent-facet-config',
          position: 5,
        };

        return expect(catalog.modifyFacetOptionConfiguration(facetOptionConfiguration)).to.eventually.be.rejected;
      });

      it('Should return error when modifying a facet option configuration with unsupported options', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const facetOptionConfiguration = {
          facetGroupName,
          value: mockFacetOptionConfiguration.value,
          placement: 5,
        };

        return expect(catalog.modifyFacetOptionConfiguration(facetOptionConfiguration)).to.eventually.be.rejected;
      });

      it('Should return error when modifying a facet option configuration with unsupported option values', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const facetOptionConfiguration = {
          facetGroupName,
          value: mockFacetOptionConfiguration.value,
          type: 'slider',
        };

        return expect(catalog.modifyFacetOptionConfiguration(facetOptionConfiguration)).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.modifyFacetOptionConfiguration({
            facetGroupName,
            value: mockFacetOptionConfiguration.value,
            displayName: 'New Facet Display Name',
            position: 5,
          }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.modifyFacetOptionConfiguration({
            facetGroupName,
            value: mockFacetOptionConfiguration.value,
            displayName: 'New Facet Display Name',
            position: 5,
          })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('removeFacetOptionConfiguration', () => {
      it('Should resolve when removing a facet option configuration', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const mockFacetOptionConfiguration = createMockFacetOptionConfiguration(facetGroupName);

        catalog.addFacetOptionConfiguration(mockFacetOptionConfiguration).then(() => {
          catalog.removeFacetOptionConfiguration(mockFacetOptionConfiguration).then(() => {
            done();
          });
        });
      });

      it('Should return error when removing a facet option configuration that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const mockFacetOptionConfiguration = createMockFacetOptionConfiguration(facetGroupName);

        return expect(catalog.removeFacetOptionConfiguration(mockFacetOptionConfiguration)).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);
          const mockFacetOptionConfiguration = createMockFacetOptionConfiguration(facetGroupName);

          expect(catalog.removeFacetOptionConfiguration(
            mockFacetOptionConfiguration,
            { timeout: 10 },
          )).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });
          const mockFacetOptionConfiguration = createMockFacetOptionConfiguration(facetGroupName);

          expect(catalog.removeFacetOptionConfiguration(mockFacetOptionConfiguration)).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });
  });
});
