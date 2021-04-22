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
const fs = require('fs');
const path = require('path');
const ConstructorIO = require('../../../test/constructorio');
const helpers = require('../../mocha.helpers');

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const sendTimeout = 200;
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

describe('ConstructorIO - Catalog', () => {
  const clientVersion = 'cio-mocha';
  let fetchSpy;

  jsdom({ url: 'http://localhost' });

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

      it('Should return error when updating an item with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addOrUpdateItem(mockItem)).to.eventually.be.rejected;
      });

      it('Should return error when updating an item with an invalid API token', () => {
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

      it('Should return error when removing an item with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeItem(mockItem)).to.eventually.be.rejected;
      });

      it('Should return error when removing an item with an invalid API token', () => {
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

      it('Should return error when modifying an item with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyItem(mockItem)).to.eventually.be.rejected;
      });

      it('Should return error when modifying an item with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyItem(mockItem)).to.eventually.be.rejected;
      });
    });

    describe('addItemsBatch', () => {
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


        catalog.addItemsBatch({ items, section: 'Products' }).then(done);
      });

      it('Should return error when adding multiple items with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addItemsBatch({ items, section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should return error when adding multiple items with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addItemsBatch({ items, section: 'Products' })).to.eventually.be.rejected;
      });
    });

    describe('addOrUpdateItemsBatch', () => {
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


        catalog.addOrUpdateItemsBatch({ items, section: 'Products' }).then(done);
      });

      it('Should resolve when updating multiple items', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });


        catalog.addOrUpdateItemsBatch({ items, section: 'Products' }).then(done);
      });

      it('Should return error when updating items with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addOrUpdateItemsBatch({ items, section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should return error when updating items with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addOrUpdateItemsBatch({ items, section: 'Products' })).to.eventually.be.rejected;
      });
    });

    describe('removeItemsBatch', () => {
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

        catalog.addItemsBatch({ items, section: 'Products' }).then(done);
      });

      it('Should resolve when removing multiple items', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.removeItemsBatch({ items, section: 'Products' }).then(done);
      });

      it('Should return error when removing items that do not exist', () => {
        const invalidOptions = cloneDeep(validOptions);

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeItemsBatch({ itemsDoNotExist, section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should return error when removing items with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeItemsBatch({ items, section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should return error when removing items with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeItemsBatch({ items, section: 'Products' })).to.eventually.be.rejected;
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

      it('Should return a response when getting item by id', (done) => {
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

    describe('getItems', () => {
      const mockItem = createMockItem();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        mockItem.id = uuidv4();

        catalog.addItem(mockItem).then(done);
      });

      it('Should return a response when getting items by section', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getItems({ section: 'Products' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('items').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when adding an item with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getItems({ section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should return error when adding an item with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getItems({ section: 'Products' })).to.eventually.be.rejected;
      });
    });
  });

  describe('Groups', () => {
    describe('addItemGroup', () => {
      const group = createMockItemGroup();

      it('Should resolve when adding item group', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addItemGroup(group).then(done);
      });

      it('Should return error when adding an item group with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addItemGroup(group)).to.eventually.be.rejected;
      });

      it('Should return error when adding an item group with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addItemGroup(group)).to.eventually.be.rejected;
      });
    });

    describe('addItemGroups', () => {
      const groups = [
        createMockItemGroup(),
        createMockItemGroup(),
        createMockItemGroup(),
      ];

      it('Should resolve when adding item groups', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addItemGroups({ item_groups: groups }).then(done);
      });

      it('Should return error when adding an item group with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addItemGroups({ item_groups: groups })).to.eventually.be.rejected;
      });

      it('Should return error when adding an item group with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addItemGroups({ item_groups: groups })).to.eventually.be.rejected;
      });
    });

    describe('getItemGroup', () => {
      const mockItemGroup = createMockItemGroup();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addItemGroups({ item_groups: [mockItemGroup] }).then(done);
      });

      it('Should return a response when getting item group', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getItemGroup({ group_id: mockItemGroup.id }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('item_groups').to.be.an('array').to.have.length(1);
          expect(res.item_groups[0]).to.have.property('name').to.equal(mockItemGroup.name);
          expect(res.item_groups[0]).to.have.property('id').to.equal(mockItemGroup.id);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response with no items when getting item group that does not exist', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getItemGroup({ group_id: uuidv4() }).then((res) => {
          expect(res).to.have.property('item_groups').to.be.an('array').of.length(0);
          done();
        });
      });

      it('Should return error when getting item group with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getItemGroup({ group_id: mockItemGroup.id })).to.eventually.be.rejected;
      });

      it('Should return error when getting item group with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getItemGroup({ group_id: mockItemGroup.id })).to.eventually.be.rejected;
      });
    });

    describe('getItemGroups', () => {
      const mockItemGroup = createMockItemGroup();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addItemGroups({ item_groups: [mockItemGroup, mockItemGroup] }).then(done);
      });

      it('Should return a response when getting item groups', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getItemGroups().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('item_groups').to.be.an('array').to.have.length.gt(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting item groups with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getItemGroups()).to.eventually.be.rejected;
      });

      it('Should return error when getting item groups with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getItemGroups()).to.eventually.be.rejected;
      });
    });

    describe('addOrUpdateItemGroups', () => {
      const groups = [
        createMockItemGroup(),
        createMockItemGroup(),
        createMockItemGroup(),
      ];

      it('Should return a response when adding multiple item groups', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOrUpdateItemGroups({ item_groups: groups }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('item_groups').to.be.an('object');
          expect(res.item_groups).to.have.property('processed').to.be.an('number').to.equal(groups.length);
          expect(res.item_groups).to.have.property('inserted').to.be.an('number').to.equal(groups.length);
          expect(res.item_groups).to.have.property('updated').to.be.an('number').to.equal(0);
          expect(res.item_groups).to.have.property('deleted').to.be.an('number');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when updating multiple item groups', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOrUpdateItemGroups({ item_groups: groups }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('item_groups').to.be.an('object');
          expect(res.item_groups).to.have.property('processed').to.be.an('number').to.equal(groups.length);
          expect(res.item_groups).to.have.property('inserted').to.be.an('number').to.equal(0);
          expect(res.item_groups).to.have.property('updated').to.be.an('number').to.equal(0);
          expect(res.item_groups).to.have.property('deleted').to.be.an('number');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when updating multiple item groups with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addOrUpdateItemGroups({ item_groups: groups })).to.eventually.be.rejected;
      });

      it('Should return error when updating multiple item groups with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addOrUpdateItemGroups({ item_groups: groups })).to.eventually.be.rejected;
      });
    });

    describe('modifyItemGroup', () => {
      const mockItemGroup = createMockItemGroup();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addItemGroups({ item_groups: [mockItemGroup] }).then(done);
      });

      it('Should return a response when modifying an item group with updated item group name', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        mockItemGroup.name = `group-${uuidv4()}`;

        catalog.modifyItemGroup(mockItemGroup).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('id').to.be.a('string').to.equal(mockItemGroup.id);
          expect(res).to.have.property('name').to.be.a('string').to.equal(mockItemGroup.name);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when modifying an item with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyItemGroup(mockItemGroup)).to.eventually.be.rejected;
      });

      it('Should return error when modifying an item with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyItemGroup(mockItemGroup)).to.eventually.be.rejected;
      });
    });

    describe('removeItemGroups', () => {
      const groups = [
        createMockItemGroup(),
        createMockItemGroup(),
        createMockItemGroup(),
      ];

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addItemGroups({ item_groups: groups }).then(done);
      });

      it('Should return a response when removing multiple item groups', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.removeItemGroups().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('message').to.be.a('string');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when removing item groups with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeItemGroups()).to.eventually.be.rejected;
      });

      it('Should return error when removing item groups with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeItemGroups()).to.eventually.be.rejected;
      });
    });
  });

  describe('One Way Synonyms', () => {
    describe('addOneWaySynonym', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      it('Should resolve when adding a one way synonym', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should return error when adding a one way synonym that already exists', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejected;
      });

      it('Should return error when adding a one way synonym with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejected;
      });

      it('Should return error when adding a one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejected;
      });
    });

    describe('modifyOneWaySynonym', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should resolve when modifying a one way synonym', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.modifyOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should return an error when modifying a one way synonym that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyOneWaySynonym({
          phrase: createMockOneWaySynonymPhrase(),
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejected;
      });

      it('Should return error when modifying an item with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejected;
      });

      it('Should return error when modifying an item with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejected;
      });
    });

    describe('getOneWaySynonym', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should return a response when getting one way synonym with phrase', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getOneWaySynonym({ phrase: mockOneWaySynonymPhrase }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('one_way_synonym_relations').to.be.an('array').length(1);
          expect(res.one_way_synonym_relations[0]).to.have.property('parent_phrase').to.be.a('string').to.equal(mockOneWaySynonymPhrase);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting one way synonym with phrase that does not exist', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getOneWaySynonym({ phrase: createMockOneWaySynonymPhrase() }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('one_way_synonym_relations').to.be.an('array').length(0);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting one way synonym with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getOneWaySynonym({ phrase: mockOneWaySynonymPhrase })).to.eventually.be.rejected;
      });

      it('Should return error when getting one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getOneWaySynonym({ phrase: mockOneWaySynonymPhrase })).to.eventually.be.rejected;
      });
    });

    describe('getOneWaySynonyms', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should return a response when getting one way synonyms', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getOneWaySynonyms().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('one_way_synonym_relations').to.be.an('array').length.gt(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting one way synonyms with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getOneWaySynonyms()).to.eventually.be.rejected;
      });

      it('Should return error when getting one way synonyms with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getOneWaySynonyms()).to.eventually.be.rejected;
      });
    });

    describe('removeOneWaySynonym', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should resolve when removing one way synonyms with phrase', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.removeOneWaySynonym({ phrase: mockOneWaySynonymPhrase }).then(done);
      });

      it('Should return error when removing one way synonym with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeOneWaySynonym({ phrase: mockOneWaySynonymPhrase })).to.eventually.be.rejected;
      });

      it('Should return error when removing one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeOneWaySynonym({ phrase: mockOneWaySynonymPhrase })).to.eventually.be.rejected;
      });
    });

    describe('removeOneWaySynonyms', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should resolve when removing one way synonyms', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.removeOneWaySynonyms().then(done);
      });

      it('Should return error when removing one way synonyms with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeOneWaySynonyms()).to.eventually.be.rejected;
      });

      it('Should return error when removing one way synonyms with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeOneWaySynonyms()).to.eventually.be.rejected;
      });
    });
  });

  describe('Synonym Groups', () => {
    describe.only('addSynonymGroup', () => {
      const mockSynonym = createMockSynonym();

      it('Should return a response when adding a synonym group', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addSynonymGroup({ synonyms: [mockSynonym] }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('group_id').to.be.a('number');
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

        return expect(catalog.addSynonymGroup({ synonyms: [mockSynonym] })).to.eventually.be.rejected;
      });

      it('Should return error when adding a one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addSynonymGroup({ synonyms: [mockSynonym] })).to.eventually.be.rejected;
      });
    });

    describe.only('modifySynonymGroup', () => {
      const mockSynonym = createMockSynonym();
      let synonymGroupId;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addSynonymGroup({ synonyms: [mockSynonym] }).then((res) => {
          synonymGroupId = res.group_id;

          done();
        });
      });

      it('Should resolve when modifying a synonym group', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.modifySynonymGroup({ id: synonymGroupId, synonyms: [mockSynonym] }).then(done);
      });

      it('Should return an error when modifying a synonym group that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifySynonymGroup({
          id: 'abc123',
          synonyms: [mockSynonym],
        })).to.eventually.be.rejected;
      });

      it('Should return error when modifying an item with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifySynonymGroup({
          id: synonymGroupId,
          synonyms: [mockSynonym],
        })).to.eventually.be.rejected;
      });

      it('Should return error when modifying an item with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifySynonymGroup({
          id: synonymGroupId,
          synonyms: [mockSynonym],
        })).to.eventually.be.rejected;
      });
    });

    describe('getOneWaySynonym', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should return a response when getting one way synonym with phrase', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getOneWaySynonym({ phrase: mockOneWaySynonymPhrase }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('one_way_synonym_relations').to.be.an('array').length(1);
          expect(res.one_way_synonym_relations[0]).to.have.property('parent_phrase').to.be.a('string').to.equal(mockOneWaySynonymPhrase);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting one way synonym with phrase that does not exist', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getOneWaySynonym({ phrase: createMockOneWaySynonymPhrase() }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('one_way_synonym_relations').to.be.an('array').length(0);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting one way synonym with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getOneWaySynonym({ phrase: mockOneWaySynonymPhrase })).to.eventually.be.rejected;
      });

      it('Should return error when getting one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getOneWaySynonym({ phrase: mockOneWaySynonymPhrase })).to.eventually.be.rejected;
      });
    });

    describe('getOneWaySynonyms', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should return a response when getting one way synonyms', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getOneWaySynonyms().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('one_way_synonym_relations').to.be.an('array').length.gt(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting one way synonyms with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getOneWaySynonyms()).to.eventually.be.rejected;
      });

      it('Should return error when getting one way synonyms with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getOneWaySynonyms()).to.eventually.be.rejected;
      });
    });

    describe('removeOneWaySynonym', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should resolve when removing one way synonyms with phrase', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.removeOneWaySynonym({ phrase: mockOneWaySynonymPhrase }).then(done);
      });

      it('Should return error when removing one way synonym with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeOneWaySynonym({ phrase: mockOneWaySynonymPhrase })).to.eventually.be.rejected;
      });

      it('Should return error when removing one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeOneWaySynonym({ phrase: mockOneWaySynonymPhrase })).to.eventually.be.rejected;
      });
    });

    describe('removeOneWaySynonyms', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should resolve when removing one way synonyms', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.removeOneWaySynonyms().then(done);
      });

      it('Should return error when removing one way synonyms with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeOneWaySynonyms()).to.eventually.be.rejected;
      });

      it('Should return error when removing one way synonyms with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeOneWaySynonyms()).to.eventually.be.rejected;
      });
    });
  });

  describe('replaceCatalog', function replaceCatalog() {
    this.timeout(3000);

    beforeEach((done) => {
      // Wait between each test to prevent throttle error from server
      setTimeout(done, 1000);
    });

    it('should replace a catalog of items using streams', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/items.csv');
      const itemsStream = fs.createReadStream(filePath);
      const data = {
        items: itemsStream,
        section: 'Products',
      };

      catalog.replaceCatalog(data).then(done);
    });

    it('should replace a catalog of items using buffers', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/items.csv');
      const itemsBuffer = fs.readFileSync(filePath);
      const data = {
        items: itemsBuffer,
        section: 'Products',
      };

      catalog.replaceCatalog(data).then(done);
    });

    it('should replace a catalog of variations using streams', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/variations.csv');
      const variationsStream = fs.createReadStream(filePath);
      const data = {
        items: variationsStream,
        section: 'Products',
      };

      catalog.replaceCatalog(data).then(done);
    });

    it('should replace a catalog of variations using buffers', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/variations.csv');
      const variationsBuffer = fs.readFileSync(filePath);
      const data = {
        items: variationsBuffer,
        section: 'Products',
      };

      catalog.replaceCatalog(data).then(done);
    });

    it('should replace a catalog of item groups using streams', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/item_groups.csv');
      const itemGroupsStream = fs.createReadStream(filePath);
      const data = {
        items: itemGroupsStream,
        section: 'Products',
      };

      catalog.replaceCatalog(data).then(done);
    });

    it('should replace a catalog of item groups using buffers', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/item_groups.csv');
      const itemGroupBuffer = fs.readFileSync(filePath);
      const data = {
        items: itemGroupBuffer,
        section: 'Products',
      };

      catalog.replaceCatalog(data).then(done);
    });

    it('should replace a catalog of item groups using streams', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/item_groups.csv');
      const itemGroupsStream = fs.createReadStream(filePath);
      const data = {
        items: itemGroupsStream,
        section: 'Products',
      };

      catalog.replaceCatalog(data).then(done);
    });

    it('should replace a catalog of items, variations, and item groups using buffers', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const itemsPath = path.join(process.cwd(), './spec/src/csv/items.csv');
      const itemsBuffer = fs.readFileSync(itemsPath);

      const variationsPath = path.join(process.cwd(), './spec/src/csv/variations.csv');
      const variationsBuffer = fs.readFileSync(variationsPath);

      const itemGroupsPath = path.join(process.cwd(), './spec/src/csv/item_groups.csv');
      const itemGroupsBuffer = fs.readFileSync(itemGroupsPath);

      const data = {
        items: itemsBuffer,
        variations: variationsBuffer,
        itemGroups: itemGroupsBuffer,
        section: 'Products',
      };

      catalog.replaceCatalog(data).then(done);
    });

    it('should replace a catalog of items, variations, and item groups using streams', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const itemsPath = path.join(process.cwd(), './spec/src/csv/items.csv');
      const itemsStream = fs.createReadStream(itemsPath);

      const variationsPath = path.join(process.cwd(), './spec/src/csv/variations.csv');
      const variationsStream = fs.createReadStream(variationsPath);

      const itemGroupsPath = path.join(process.cwd(), './spec/src/csv/item_groups.csv');
      const itemGroupsStream = fs.createReadStream(itemGroupsPath);

      const data = {
        items: itemsStream,
        variations: variationsStream,
        itemGroups: itemGroupsStream,
        section: 'Products',
      };

      catalog.replaceCatalog(data).then(done);
    });
  });

  describe('updateCatalog', function updateCatalog() {
    this.timeout(3000);

    beforeEach((done) => {
      // Wait between each test to prevent throttle error from server
      setTimeout(done, 1000);
    });

    it('should update a catalog of items using streams', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/items.csv');
      const itemsStream = fs.createReadStream(filePath);
      const data = {
        items: itemsStream,
        section: 'Products',
      };

      catalog.updateCatalog(data).then(done);
    });

    it('should update a catalog of items using buffers', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/items.csv');
      const itemsBuffer = fs.readFileSync(filePath);
      const data = {
        items: itemsBuffer,
        section: 'Products',
      };

      catalog.updateCatalog(data).then(done);
    });

    it('should update a catalog of variations using streams', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/variations.csv');
      const variationsStream = fs.createReadStream(filePath);
      const data = {
        items: variationsStream,
        section: 'Products',
      };

      catalog.updateCatalog(data).then(done);
    });

    it('should update a catalog of variations using buffers', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/variations.csv');
      const variationsBuffer = fs.readFileSync(filePath);
      const data = {
        items: variationsBuffer,
        section: 'Products',
      };

      catalog.updateCatalog(data).then(done);
    });

    it('should update a catalog of item groups using streams', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/item_groups.csv');
      const itemGroupsStream = fs.createReadStream(filePath);
      const data = {
        items: itemGroupsStream,
        section: 'Products',
      };

      catalog.updateCatalog(data).then(done);
    });

    it('should update a catalog of item groups using buffers', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/item_groups.csv');
      const itemGroupBuffer = fs.readFileSync(filePath);
      const data = {
        items: itemGroupBuffer,
        section: 'Products',
      };

      catalog.updateCatalog(data).then(done);
    });

    it('should update a catalog of item groups using streams', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const filePath = path.join(process.cwd(), './spec/src/csv/item_groups.csv');
      const itemGroupsStream = fs.createReadStream(filePath);
      const data = {
        items: itemGroupsStream,
        section: 'Products',
      };

      catalog.updateCatalog(data).then(done);
    });

    it('should update a catalog of items, variations, and item groups using buffers', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const itemsPath = path.join(process.cwd(), './spec/src/csv/items.csv');
      const itemsBuffer = fs.readFileSync(itemsPath);

      const variationsPath = path.join(process.cwd(), './spec/src/csv/variations.csv');
      const variationsBuffer = fs.readFileSync(variationsPath);

      const itemGroupsPath = path.join(process.cwd(), './spec/src/csv/item_groups.csv');
      const itemGroupsBuffer = fs.readFileSync(itemGroupsPath);

      const data = {
        items: itemsBuffer,
        variations: variationsBuffer,
        itemGroups: itemGroupsBuffer,
        section: 'Products',
      };

      catalog.updateCatalog(data).then(done);
    });

    it('should update a catalog of items, variations, and item groups using streams', (done) => {
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      const itemsPath = path.join(process.cwd(), './spec/src/csv/items.csv');
      const itemsStream = fs.createReadStream(itemsPath);

      const variationsPath = path.join(process.cwd(), './spec/src/csv/variations.csv');
      const variationsStream = fs.createReadStream(variationsPath);

      const itemGroupsPath = path.join(process.cwd(), './spec/src/csv/item_groups.csv');
      const itemGroupsStream = fs.createReadStream(itemGroupsPath);

      const data = {
        items: itemsStream,
        variations: variationsStream,
        itemGroups: itemGroupsStream,
        section: 'Products',
      };

      catalog.updateCatalog(data).then(done);
    });
  });
});
