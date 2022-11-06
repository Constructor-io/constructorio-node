/* eslint-disable no-unused-expressions, import/no-unresolved, no-restricted-syntax, max-nested-callbacks */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const nodeFetch = require('node-fetch').default;
const cloneDeep = require('lodash.clonedeep');
const { v4: uuidv4 } = require('uuid');
const { Duplex } = require('stream');
const ConstructorIO = require('../../../test/constructorio'); // eslint-disable-line import/extensions
const helpers = require('../../mocha.helpers');

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const itemsToCleanup = [];
const variationsToCleanup = [];
const sendTimeout = 300;
const testApiKey = process.env.TEST_API_KEY;
const testApiToken = process.env.TEST_API_TOKEN;
const validOptions = {
  apiKey: testApiKey,
  apiToken: testApiToken,
};

function createMockItem() {
  const uuid = uuidv4();

  return {
    name: `product-${uuid}`,
    id: uuid,
    data: {
      facets: { color: ['blue', 'red'] },
      brand: 'abc',
      url: 'https://constructor.io/products/',
      image_url: 'https://constructor.io/products/',
      complexMetadataField: {
        key1: 'val1',
        key2: 'val2',
      },
    },
  };
}

function createMockVariation(itemId) {
  const uuid = uuidv4();

  return {
    id: uuid,
    item_id: itemId,
    name: `product-${uuid}`,
    data: {
      facets: { color: ['blue'] },
      brand: 'abc',
      url: 'https://constructor.io/products/',
      image_url: 'https://constructor.io/products/',
      complexMetadataField: {
        key1: 'val1',
        key2: 'val2',
      },
    },
  };
}

function createMockItemGroup() {
  const uuid = uuidv4();

  return {
    id: `group-${uuid}`,
    name: `Group ${uuid}`,
  };
}

function createMockOneWaySynonymPhrase() {
  const uuid = uuidv4();

  return `phrase-${uuid}`;
}

function createMockSynonym() {
  const uuid = uuidv4();

  return `synonym-${uuid}`;
}

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

function createMockFacetConfiguration() {
  const uuid = uuidv4();

  return {
    name: `facet-${uuid}`,
    display_name: `Facet ${uuid}`,
    type: 'multiple',
  };
}

function createMockFacetOptionConfiguration(facetGroupName) {
  const uuid = uuidv4();

  const mockFacetOptionConfiguration = {
    value: `facet-option-${uuid}`,
    display_name: `Facet Option ${uuid}`,
  };

  if (facetGroupName) {
    mockFacetOptionConfiguration.facetGroupName = facetGroupName;
  }

  return mockFacetOptionConfiguration;
}

function createStreamFromBuffer(buffer) {
  const stream = new Duplex();

  stream.push(buffer);
  stream.push(null);

  return stream;
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

  describe('Files', function catalogFiles() {
    // Ensure Mocha doesn't time out waiting for operation to complete
    this.timeout(10000);

    const catalogExamplesBaseUrl = 'https://raw.githubusercontent.com/Constructor-io/integration-examples/main/catalog/';
    let itemsBuffer = null;
    let itemsStream = null;
    let variationsBuffer = null;
    let variationsStream = null;
    let itemGroupsBuffer = null;
    let itemGroupsStream = null;

    before(async () => {
      // Grab catalog files from Integration Examples repo
      const itemsResponse = await nodeFetch(`${catalogExamplesBaseUrl}items.csv`);
      itemsBuffer = await itemsResponse.buffer();

      const variationsResponse = await nodeFetch(`${catalogExamplesBaseUrl}variations.csv`);
      variationsBuffer = await variationsResponse.buffer();

      const itemGroupsResponse = await nodeFetch(`${catalogExamplesBaseUrl}item_groups.csv`);
      itemGroupsBuffer = await itemGroupsResponse.buffer();
    });

    beforeEach(async () => {
      itemsStream = createStreamFromBuffer(itemsBuffer);
      variationsStream = createStreamFromBuffer(variationsBuffer);
      itemGroupsStream = createStreamFromBuffer(itemGroupsBuffer);
    });

    afterEach((done) => {
      // Wait between each test to prevent throttle error from server
      setTimeout(done, 1000);
    });

    describe('replaceCatalog', () => {
      it('Should replace a catalog of items using streams', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          items: itemsStream,
          section: 'Products',
        };

        catalog.replaceCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should replace a catalog of items using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          items: itemsBuffer,
          section: 'Products',
        };

        catalog.replaceCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should replace a catalog of variations using streams', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          variations: variationsStream,
          section: 'Products',
        };

        catalog.replaceCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should replace a catalog of variations using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          variations: variationsBuffer,
          section: 'Products',
        };

        catalog.replaceCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should replace a catalog of item groups using streams', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          item_groups: itemGroupsStream,
          section: 'Products',
        };

        catalog.replaceCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should replace a catalog of item groups using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          item_groups: itemGroupsBuffer,
          section: 'Products',
        };

        catalog.replaceCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should replace a catalog of items, variations, and item groups using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          items: itemsBuffer,
          variations: variationsBuffer,
          item_groups: itemGroupsBuffer,
          section: 'Products',
        };

        catalog.replaceCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should replace a catalog of items, variations, and item groups using streams', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          items: itemsStream,
          variations: variationsStream,
          item_groups: itemGroupsStream,
          section: 'Products',
        };

        catalog.replaceCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        const data = {
          items: itemsStream,
          section: 'Products',
        };

        return expect(catalog.replaceCatalog(data, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        const data = {
          items: itemsStream,
          section: 'Products',
        };

        return expect(catalog.replaceCatalog(data)).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('updateCatalog', () => {
      it('Should update a catalog of items using streams', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          items: itemsStream,
          section: 'Products',
        };

        catalog.updateCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should update a catalog of items using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          items: itemsBuffer,
          section: 'Products',
        };

        catalog.updateCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should update a catalog of variations using streams', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          variations: variationsStream,
          section: 'Products',
        };

        catalog.updateCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should update a catalog of variations using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          variations: variationsBuffer,
          section: 'Products',
        };

        catalog.updateCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should update a catalog of item groups using streams', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          item_groups: itemGroupsStream,
          section: 'Products',
        };

        catalog.updateCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should update a catalog of item groups using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          item_groups: itemGroupsBuffer,
          section: 'Products',
        };

        catalog.updateCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should update a catalog of items, variations, and item groups using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          items: itemsBuffer,
          variations: variationsBuffer,
          item_groups: itemGroupsBuffer,
          section: 'Products',
        };

        catalog.updateCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should update a catalog of items, variations, and item groups using streams', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          items: itemsStream,
          variations: variationsStream,
          item_groups: itemGroupsStream,
          section: 'Products',
        };

        catalog.updateCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        const data = {
          items: itemsStream,
          section: 'Products',
        };

        return expect(catalog.updateCatalog(data, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        const data = {
          items: itemsStream,
          section: 'Products',
        };

        return expect(catalog.updateCatalog(data)).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('patchCatalog', () => {
      it('Should patch a catalog of items using streams', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          items: itemsStream,
          section: 'Products',
        };

        catalog.patchCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should patch a catalog of items using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          items: itemsBuffer,
          section: 'Products',
        };

        catalog.patchCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should patch a catalog of variations using streams', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          variations: variationsStream,
          section: 'Products',
        };

        catalog.patchCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should patch a catalog of variations using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          variations: variationsBuffer,
          section: 'Products',
        };

        catalog.patchCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should patch a catalog of item groups using streams', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          item_groups: itemGroupsStream,
          section: 'Products',
        };

        catalog.patchCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should patch a catalog of item groups using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          item_groups: itemGroupsBuffer,
          section: 'Products',
        };

        catalog.patchCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should patch a catalog of items, variations, and item groups using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          items: itemsBuffer,
          variations: variationsBuffer,
          item_groups: itemGroupsBuffer,
          section: 'Products',
        };

        catalog.patchCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should patch a catalog of items, variations, and item groups using streams', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          items: itemsStream,
          variations: variationsStream,
          item_groups: itemGroupsStream,
          section: 'Products',
        };

        catalog.patchCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        const data = {
          items: itemsStream,
          section: 'Products',
        };

        return expect(catalog.patchCatalog(data, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        const data = {
          items: itemsStream,
          section: 'Products',
        };

        return expect(catalog.patchCatalog(data)).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });
  });
});
