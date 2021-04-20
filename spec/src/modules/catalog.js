/* eslint-disable no-unused-expressions, import/no-unresolved */
const jsdom = require('mocha-jsdom');
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const nodeFetch = require('node-fetch');
const cloneDeep = require('lodash.clonedeep');
const { v4: uuidv4 } = require('uuid');
const ConstructorIO = require('../../../test/constructorio');
const helpers = require('../../mocha.helpers');

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const testApiKey = process.env.TEST_API_KEY;
const testApiToken = process.env.TEST_API_TOKEN;
const validOptions = {
  apiKey: testApiKey,
  apiToken: testApiToken,
};

function createMockItem() {
  const uuid = uuidv4();

  return {
    item_name: `product-${uuid}`,
    url: `https://constructor.io/products/${uuid}`,
    section: 'Products',
  };
}

describe('ConstructorIO - Catalog', () => {
  const clientVersion = 'cio-mocha';
  let fetchSpy;

  jsdom({ url: 'http://localhost' });

  beforeEach(() => {
    global.CLIENT_VERSION = clientVersion;
    fetchSpy = sinon.spy(nodeFetch);
  });

  afterEach(() => {
    delete global.CLIENT_VERSION;

    fetchSpy = null;
  });

  describe('addItem', () => {
    const mockItem = createMockItem();

    it('Should resolve when adding an item', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      catalog.addItem(mockItem).then(done);
    });

    it('Should return error when adding an item that already exists', () => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.addItem(mockItem)).to.eventually.be.rejected;
    });

    it('Should return error when adding an item with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiKey = 'abc123';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.addItem(mockItem)).to.eventually.be.rejected;
    });

    it('Should return error when adding an item with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiToken = 'foo987';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.addItem(mockItem)).to.eventually.be.rejected;
    });
  });

  describe('addOrUpdateItem', () => {
    const mockItem = createMockItem();
    const mockItemWithID = createMockItem();

    mockItemWithID.id = uuidv4();

    it('Should resolve when adding an item', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      catalog.addOrUpdateItem(mockItem).then(done);
    });

    it('Should resolve when updating an item', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      catalog.addOrUpdateItem(mockItem).then(done);
    });

    it('Should resolve when adding an item with an id', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      catalog.addOrUpdateItem(mockItemWithID).then(done);
    });

    it('Should resolve when updating an item with an id', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      catalog.addOrUpdateItem(mockItemWithID).then(done);
    });

    it('Should return error when adding an item with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiKey = 'abc123';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.addOrUpdateItem(mockItem)).to.eventually.be.rejected;
    });

    it('Should return error when adding an item with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiToken = 'foo987';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.addOrUpdateItem(mockItem)).to.eventually.be.rejected;
    });
  });

  describe('removeItem', () => {
    const mockItem = createMockItem();
    const mockItemWithID = createMockItem();

    mockItemWithID.id = uuidv4();

    before((done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      catalog.addItem(mockItem).then(done);
    });

    it('Should resolve when removing an item', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      catalog.removeItem(mockItem).then(done);
    });

    it('Should resolve when removing an item with an id', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      catalog.removeItem(mockItemWithID).then(done);
    });

    it('Should return error when adding an item with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiKey = 'abc123';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.removeItem(mockItem)).to.eventually.be.rejected;
    });

    it('Should return error when adding an item with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiToken = 'foo987';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.removeItem(mockItem)).to.eventually.be.rejected;
    });
  });

  describe('modifyItem', () => {
    const mockItem = createMockItem();
    const mockItemDoesNotExist = createMockItem();

    before((done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      catalog.addItem(mockItem).then(done);
    });

    it('Should resolve when modifying an item with updated item name', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      mockItem.new_item_name = `product-${uuidv4()}`;

      catalog.modifyItem(mockItem).then(done);
    });

    it('Should return error when modifying an item that does not exist as item name has changed', () => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.modifyItem(mockItem)).to.eventually.be.rejected;
    });

    it('Should return error when modifying an item that does not exist', () => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.modifyItem(mockItemDoesNotExist)).to.eventually.be.rejected;
    });

    it('Should return error when adding an item with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiKey = 'abc123';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.modifyItem(mockItem)).to.eventually.be.rejected;
    });

    it('Should return error when adding an item with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiToken = 'foo987';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.modifyItem(mockItem)).to.eventually.be.rejected;
    });
  });

  describe('addItemBatch', () => {
    const items = [
      createMockItem(),
      createMockItem(),
      createMockItem(),
    ];

    it('Should resolve when adding multiple items', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });


      catalog.addItemBatch({ items, section: 'Products' }).then(done);
    });

    it('Should return error when adding an item with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiKey = 'abc123';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.addItemBatch({ items, section: 'Products' })).to.eventually.be.rejected;
    });

    it('Should return error when adding an item with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiToken = 'foo987';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.addItemBatch({ items, section: 'Products' })).to.eventually.be.rejected;
    });
  });

  describe('addOrUpdateItemBatch', () => {
    const items = [
      createMockItem(),
      createMockItem(),
      createMockItem(),
    ];

    it('Should resolve when adding multiple items', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });


      catalog.addOrUpdateItemBatch({ items, section: 'Products' }).then(done);
    });

    it('Should resolve when updating multiple items', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });


      catalog.addOrUpdateItemBatch({ items, section: 'Products' }).then(done);
    });

    it('Should return error when adding an item with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiKey = 'abc123';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.addOrUpdateItemBatch({ items, section: 'Products' })).to.eventually.be.rejected;
    });

    it('Should return error when adding an item with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiToken = 'foo987';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.addOrUpdateItemBatch({ items, section: 'Products' })).to.eventually.be.rejected;
    });
  });

  describe('removeItemBatch', () => {
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

      catalog.addItemBatch({ items, section: 'Products' }).then(done);
    });

    it('Should resolve when removing multiple items', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      catalog.removeItemBatch({ items, section: 'Products' }).then(done);
    });

    it('Should return error when removing items that do not exist', () => {
      const invalidOptions = cloneDeep(validOptions);

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.removeItemBatch({ itemsDoNotExist, section: 'Products' })).to.eventually.be.rejected;
    });

    it('Should return error when adding an item with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiKey = 'abc123';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.removeItemBatch({ items, section: 'Products' })).to.eventually.be.rejected;
    });

    it('Should return error when adding an item with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiToken = 'foo987';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.removeItemBatch({ items, section: 'Products' })).to.eventually.be.rejected;
    });
  });

  describe('getItem', () => {
    const mockItem = createMockItem();

    before((done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      mockItem.id = uuidv4();

      catalog.addItem(mockItem).then(done);
    });

    it('Should resolve when getting item by id', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      catalog.getItem({ item_id: mockItem.id, section: 'Products' }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('name').to.equal(mockItem.item_name);
        expect(res).to.have.property('id').to.equal(mockItem.id);
        expect(res).to.have.property('url').to.equal(mockItem.url);
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('_dt');
        done();
      });
    });

    it('Should resolve when getting items by section', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      catalog.getItem({ section: 'Products' }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('items').to.be.an('array');
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('_dt');
        done();
      });
    });

    it('Should return error when getting item by id that does not exist', () => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.getItem({ item_id: uuidv4(), section: 'Products' })).to.eventually.be.rejected;
    });

    it('Should return error when adding an item with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiKey = 'abc123';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.getItem({ item_id: mockItem.id })).to.eventually.be.rejected;
    });

    it('Should return error when adding an item with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiToken = 'foo987';

      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.getItem({ item_id: mockItem.id })).to.eventually.be.rejected;
    });
  });
});
