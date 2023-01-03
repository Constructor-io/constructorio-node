/* eslint-disable no-unused-expressions, import/no-unresolved, no-restricted-syntax, max-nested-callbacks */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const cloneDeep = require('lodash.clonedeep');
const { v4: uuidv4 } = require('uuid');
const ConstructorIO = require('../../../../test/constructorio'); // eslint-disable-line import/extensions
const helpers = require('../../../mocha.helpers');

const nodeFetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const itemsToCleanup = [];
const sendTimeout = 300;
const testApiKey = process.env.TEST_API_KEY;
const testApiToken = process.env.TEST_API_TOKEN;
const validOptions = {
  apiKey: testApiKey,
  apiToken: testApiToken,
};
const skipNetworkTimeoutTests = process.env.SKIP_NETWORK_TIMEOUT_TESTS === 'true';

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

  describe('Items', () => {
    describe('createOrReplaceItems', () => {
      const items = [
        createMockItem(),
        createMockItem(),
        createMockItem(),
      ];
      const optionalParameters = {
        section: 'Products',
        force: true,
        notificationEmail: 'test@constructor.io',
      };

      it('Should resolve when adding multiple items', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceItems({ items }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });

        itemsToCleanup.push(...items);
      });

      it('Should resolve when adding multiple items and supplying optional parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceItems({ items, ...optionalParameters }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(requestedUrlParams).to.have.property('section').to.equal(optionalParameters.section);
          expect(requestedUrlParams).to.have.property('force').to.equal(optionalParameters.force.toString());
          expect(requestedUrlParams).to.have.property('notification_email').to.equal(optionalParameters.notificationEmail);
          done();
        });

        itemsToCleanup.push(...items);
      });

      it('Should return error when no items are provided', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceItems()).to.eventually.be.rejected;
      });

      it('Should return error when invalid items are provided', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceItems({ items: 'foo' })).to.eventually.be.rejected;
      });

      it('Should return error when adding multiple items with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceItems({ items })).to.eventually.be.rejected;
      });

      it('Should return error when adding multiple items with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceItems({ items })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.createOrReplaceItems({ items: [createMockItem()] }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.createOrReplaceItems({ items: [createMockItem()] })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('updateItems', () => {
      const items = [createMockItem()];
      const updatedItems = [{ ...items[0], name: 'Updated Item Name' }];
      const optionalParameters = {
        section: 'Products',
        force: true,
        notificationEmail: 'test@constructor.io',
      };

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceItems({ items }).then(done);
        itemsToCleanup.push(...items);
      });

      it('Should resolve when updating multiple items', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.updateItems({ items: updatedItems }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should resolve when updating multiple items and supplying optional parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.updateItems({ items: updatedItems, ...optionalParameters }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(requestedUrlParams).to.have.property('section').to.equal(optionalParameters.section);
          expect(requestedUrlParams).to.have.property('force').to.equal(optionalParameters.force.toString());
          expect(requestedUrlParams).to.have.property('notification_email').to.equal(optionalParameters.notificationEmail);
          done();
        });
      });

      it('Should return error when no items are provided', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateItems()).to.eventually.be.rejected;
      });

      it('Should return error when invalid items are provided', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateItems({ items: 'foo' })).to.eventually.be.rejected;
      });

      it('Should return error when updating items with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateItems({ items: updatedItems })).to.eventually.be.rejected;
      });

      it('Should return error when updating items with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateItems({ items: updatedItems })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.updateItems({ items: updatedItems }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when network global request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.updateItems({ items: updatedItems })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('deleteItems', () => {
      const items = [
        createMockItem(),
        createMockItem(),
        createMockItem(),
      ];
      const itemsDoNotExist = [
        createMockItem(),
        createMockItem(),
        createMockItem(),
      ];

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceItems({ items }).then(done);
        itemsToCleanup.push(...items);
      });

      it('Should resolve when removing multiple items', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.deleteItems({ items: items.map((item) => ({ id: item.id })) }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should resolve when removing multiple items and supplying optional parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const optionalParameters = {
          section: 'Products',
          force: true,
          notificationEmail: 'test@constructor.io',
        };

        catalog.deleteItems({ items: items.map((item) => ({ id: item.id })), ...optionalParameters }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(requestedUrlParams).to.have.property('section').to.equal(optionalParameters.section);
          expect(requestedUrlParams).to.have.property('force').to.equal(optionalParameters.force.toString());
          expect(requestedUrlParams).to.have.property('notification_email').to.equal(optionalParameters.notificationEmail);
          done();
        });
      });

      it('Should return error when no items are provided', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteItems()).to.eventually.be.rejected;
      });

      it('Should return error when invalid items are provided', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteItems({ items: 'foo' })).to.eventually.be.rejected;
      });

      it('Should return error when removing items that do not exist', () => {
        const invalidOptions = cloneDeep(validOptions);

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteItems({ items: itemsDoNotExist })).to.eventually.be.rejected;
      });

      it('Should return error when removing items with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteItems({ items })).to.eventually.be.rejected;
      });

      it('Should return error when removing items with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteItems({ items })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.deleteItems({ items }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.deleteItems({ items })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('retrieveItems', () => {
      const mockItems = [createMockItem(), createMockItem(), createMockItem()];

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceItems({ items: mockItems }).then((done));
        itemsToCleanup.push(...mockItems);
      });

      it('Should return a response when getting items', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveItems().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('items').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting items with optional parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const optionalParameters = {
          section: 'Products',
          ids: mockItems.map(((item) => item.id)),
          numResultsPerPage: 10,
          page: 1,
        };

        catalog.retrieveItems(optionalParameters).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('items').to.be.an('array');
          expect(requestedUrlParams).to.have.property('id').to.be.an('array').to.deep.equal(optionalParameters.ids);
          expect(requestedUrlParams).to.have.property('section').to.equal(optionalParameters.section);
          expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal(optionalParameters.numResultsPerPage.toString());
          expect(requestedUrlParams).to.have.property('page').to.equal(optionalParameters.page.toString());
          done();
        });
      });

      it('Should return items of length 0 when getting item by id that does not exist', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveItems({ ids: [uuidv4()], section: 'Products' }).then((res) => {
          expect(res).to.have.property('items').to.be.an('array').that.is.empty;
          done();
        });
      });

      it('Should return error when retrieving an item with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.retrieveItems()).to.eventually.be.rejected;
      });

      it('Should return error when retrieving an item with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.retrieveItems()).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.retrieveItems({}, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.retrieveItems()).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });
  });
});
