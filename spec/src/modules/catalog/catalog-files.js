/* eslint-disable no-unused-expressions, import/no-unresolved, no-restricted-syntax, max-nested-callbacks */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { Duplex } = require('stream');
const ConstructorIO = require('../../../../test/constructorio'); // eslint-disable-line import/extensions

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
    let tarArchiveBuffer = null;
    let tarArchiveStream = null;

    before(async () => {
      // Grab catalog files from Integration Examples repo
      const itemsResponse = await nodeFetch(`${catalogExamplesBaseUrl}items.csv`);
      itemsBuffer = await itemsResponse.buffer();

      const variationsResponse = await nodeFetch(`${catalogExamplesBaseUrl}variations.csv`);
      variationsBuffer = await variationsResponse.buffer();

      const itemGroupsResponse = await nodeFetch(`${catalogExamplesBaseUrl}item_groups.csv`);
      itemGroupsBuffer = await itemGroupsResponse.buffer();

      const tarArchiveResponse = await nodeFetch(`${catalogExamplesBaseUrl}catalog.tar.gz`);
      tarArchiveBuffer = await tarArchiveResponse.buffer();
    });

    beforeEach(async () => {
      itemsStream = createStreamFromBuffer(itemsBuffer);
      variationsStream = createStreamFromBuffer(variationsBuffer);
      itemGroupsStream = createStreamFromBuffer(itemGroupsBuffer);
      tarArchiveStream = createStreamFromBuffer(tarArchiveBuffer);
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

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          const data = {
            items: itemsStream,
            section: 'Products',
          };

          return expect(catalog.replaceCatalog(data, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
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

          return expect(catalog.replaceCatalog(data)).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('replaceCatalogUsingTarArchive', () => {
      it('Should replace a catalog of items, variations, and item groups using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          tarArchive: tarArchiveBuffer,
          section: 'Products',
        };

        catalog.replaceCatalogUsingTarArchive(data).then((res) => {
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
          tarArchive: tarArchiveStream,
          section: 'Products',
        };

        catalog.replaceCatalogUsingTarArchive(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          const data = {
            tarArchive: tarArchiveStream,
            section: 'Products',
          };

          return expect(catalog.replaceCatalogUsingTarArchive(data, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          const data = {
            tarArchive: tarArchiveStream,
            section: 'Products',
          };

          return expect(catalog.replaceCatalogUsingTarArchive(data)).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
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

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          const data = {
            items: itemsStream,
            section: 'Products',
          };

          return expect(catalog.updateCatalog(data, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
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

          return expect(catalog.updateCatalog(data)).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('updateCatalogUsingTarArchive', () => {
      it('Should update a catalog of items, variations, and item groups using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          tarArchive: tarArchiveBuffer,
          section: 'Products',
        };

        catalog.updateCatalogUsingTarArchive(data).then((res) => {
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
          tarArchive: tarArchiveStream,
          section: 'Products',
        };

        catalog.updateCatalogUsingTarArchive(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          const data = {
            tarArchive: tarArchiveStream,
            section: 'Products',
          };

          return expect(catalog.updateCatalogUsingTarArchive(data, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          const data = {
            tarArchive: tarArchiveStream,
            section: 'Products',
          };

          return expect(catalog.updateCatalogUsingTarArchive(data)).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
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

      it('Should patch a catalog of items using onMissing', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          items: itemsStream,
          section: 'Products',
          onMissing: 'IGNORE',
        };

        catalog.patchCatalog(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          const data = {
            items: itemsStream,
            section: 'Products',
          };

          return expect(catalog.patchCatalog(data, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
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

          return expect(catalog.patchCatalog(data)).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('patchCatalogUsingTarArchive', () => {
      it('Should patch a catalog of items, variations, and item groups using buffers', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          tarArchive: tarArchiveBuffer,
          section: 'Products',
        };

        catalog.patchCatalogUsingTarArchive(data).then((res) => {
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
          tarArchive: tarArchiveStream,
          section: 'Products',
        };

        catalog.patchCatalogUsingTarArchive(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      it('Should patch a catalog of items, variations, and item groups using onMissing', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const data = {
          tarArchive: tarArchiveBuffer,
          section: 'Products',
          onMissing: 'IGNORE',
        };

        catalog.patchCatalogUsingTarArchive(data).then((res) => {
          expect(res).to.have.property('task_id');
          expect(res).to.have.property('task_status_path');
          done();
        });
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          const data = {
            tarArchive: tarArchiveStream,
            section: 'Products',
          };

          return expect(catalog.patchCatalogUsingTarArchive(data, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          const data = {
            tarArchive: tarArchiveStream,
            section: 'Products',
          };

          return expect(catalog.patchCatalogUsingTarArchive(data)).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });
  });
});
