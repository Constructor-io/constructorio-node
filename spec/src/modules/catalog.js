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

  describe.only('Items', () => {
    describe('createOrReplaceItems', () => {
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

        catalog.createOrReplaceItems({ items }).then((done));
        itemsToCleanup.push(...items);
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.createOrReplaceItems({ items: [createMockItem()] }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.createOrReplaceItems({ items: [createMockItem()] })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('updateItems', () => {
      const items = [
        createMockItem(),
      ];
      const updatedItems = [{ ...items[0], name: 'Updated Item Name' }];

      it('Should resolve when updating multiple items', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceItems({ items }).then(() => {
          catalog.updateItems({ items: updatedItems, section: 'Products' }).then(done);
        });
        itemsToCleanup.push(...updatedItems);
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.updateItems({ items: updatedItems }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when network global request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.updateItems({ items: updatedItems })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
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
      });

      it('Should resolve when removing multiple items', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        items.push(...itemsToCleanup);
        catalog.deleteItems({ items: items.map((item) => ({ id: item.id })) }).then(done);
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

        return expect(catalog.deleteItems({ items, section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.deleteItems({ items, section: 'Products' }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.deleteItems({ items, section: 'Products' })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('retrieveItems', () => {
      const mockItems = [createMockItem(), createMockItem(), createMockItem()];

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceItems({ items: mockItems, section: 'Products' }).then((done));
        itemsToCleanup.push(...mockItems);
      });

      it('Should return a response when getting items by section', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveItems({ section: 'Products' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('items').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting items by id', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveItems({ ids: mockItems.map(((item) => item.id)), section: 'Products' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          expect(res).to.have.property('items').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting items by section with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveItems({ section: 'Products', num_results_per_page: 10, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('items').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return items of length 0 when getting item by id that does not exist', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveItems({ ids: [uuidv4()], section: 'Products' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('items').to.be.an('array').that.is.empty;
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
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

        return expect(catalog.retrieveItems({ section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should return error when retrieving an item with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.retrieveItems({ section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.retrieveItems({ section: 'Products' }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.retrieveItems({ section: 'Products' })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });
  });

  describe('Variations', () => {
    const item = createMockItem();
    describe('createOrReplaceVariations', () => {
      const variations = [
        createMockVariation(item.id),
        createMockVariation(item.id),
        createMockVariation(item.id),
      ];

      it('Should resolve when adding multiple variations', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceVariations({ variations, section: 'Products' }).then((done));
        itemsToCleanup.push(item);
        variationsToCleanup.push(...variations);
      });

      it('Should return error when adding multiple variations with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceVariations({ variations, section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should return error when adding multiple variations with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceVariations({ variations, section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.createOrReplaceVariations([createMockVariation(item.id)], { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.createOrReplaceVariations([createMockVariation(item.id)])).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('updateVariations', () => {
      const variations = [
        createMockVariation(item.id),
      ];
      const updatedVariations = [{ ...variations[0], name: 'Updated Variation Name' }];

      it('Should resolve when updating multiple variations', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        catalog.createOrReplaceVariations({ variations, section: 'Products' }).then(() => {
          catalog.updateVariations({ variations: updatedVariations, section: 'Products' }).then(done);
        });
        variationsToCleanup.push(...updatedVariations);
      });

      it('Should return error when updating variations with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateVariations({ variations: updatedVariations, section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should return error when updating variations with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateVariations({ variations: updatedVariations, section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.updateVariations({ variations: updatedVariations, section: 'Products' }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when network global request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.updateVariations({ variations: updatedVariations, section: 'Products' })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('retrieveVariations', () => {
      const variations = [createMockVariation(item.id), createMockVariation(item.id), createMockVariation(item.id)];

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceVariations({ variations, section: 'Products' }).then((done));
        variationsToCleanup.push(...variations);
      });

      it('Should return a response when getting variations by section', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveVariations({ section: 'Products' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('variations').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting variations by id', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveVariations({ ids: variations.map(((variation) => variation.id)), section: 'Products' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          expect(res).to.have.property('variations').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting variations by itemsIds', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveVariations({ itemsIds: [item.id] }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          expect(res).to.have.property('variations').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting variations by section with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveVariations({ section: 'Products', num_results_per_page: 10, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('variations').to.be.an('array');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return variations of length 0 when getting variation by id that does not exist', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveVariations({ ids: [uuidv4()], section: 'Products' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('variations').to.be.an('array').that.is.empty;
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
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

        return expect(catalog.retrieveVariations({ section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should return error when retrieving an item with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.retrieveVariations({ section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.retrieveVariations({ section: 'Products' }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.retrieveVariations({ section: 'Products' })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('deleteVariations', () => {
      const variations = [
        createMockVariation(item.id),
        createMockVariation(item.id),
        createMockVariation(item.id),
      ];
      const variationsDoNotExist = [
        createMockVariation(item.id),
        createMockVariation(item.id),
        createMockVariation(item.id),
      ];

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceVariations({ variations, section: 'Products' }).then(done);
      });

      it('Should resolve when removing multiple variations', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        variations.push(...variationsToCleanup);
        catalog.deleteVariations({ variations: variations.map((variation) => ({ id: variation.id })), section: 'Products' }).then(() => {
          catalog.deleteItems({ items: itemsToCleanup.map((variation) => ({ id: variation.id })), section: 'Products' }).then(done);
        });
      });

      it('Should return error when removing variations that do not exist', () => {
        const invalidOptions = cloneDeep(validOptions);

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteVariations({ variationsDoNotExist, section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should return error when removing variations with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteVariations({ variations, section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should return error when removing variations with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteVariations({ variations, section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.deleteVariations({ variations, section: 'Products' }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.deleteVariations({ variations, section: 'Products' })).to.eventually.be.rejectedWith('The user aborted a request.');
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.addItemGroup(createMockItemGroup(), { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.addItemGroup(createMockItemGroup())).to.eventually.be.rejectedWith('The user aborted a request.');
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.addItemGroups([createMockItemGroup()], { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.addItemGroups([createMockItemGroup()])).to.eventually.be.rejectedWith('The user aborted a request.');
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

        catalog.getItemGroup({ id: mockItemGroup.id }).then((res) => {
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.getItemGroup({ group_id: mockItemGroup.id }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.getItemGroup({ group_id: mockItemGroup.id })).to.eventually.be.rejectedWith('The user aborted a request.');
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.getItemGroups({ timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.getItemGroups()).to.eventually.be.rejectedWith('The user aborted a request.');
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.addOrUpdateItemGroups(
          { item_groups: groups },
          { timeout: 10 },
        )).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.addOrUpdateItemGroups(
          { item_groups: groups },
        )).to.eventually.be.rejectedWith('The user aborted a request.');
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.modifyItemGroup(mockItemGroup, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.modifyItemGroup(mockItemGroup)).to.eventually.be.rejectedWith('The user aborted a request.');
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.removeItemGroups({ timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.removeItemGroups()).to.eventually.be.rejectedWith('The user aborted a request.');
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.addOneWaySynonym({
          phrase: createMockOneWaySynonymPhrase(),
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.addOneWaySynonym({
          phrase: createMockOneWaySynonymPhrase(),
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejectedWith('The user aborted a request.');
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.modifyOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.modifyOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejectedWith('The user aborted a request.');
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.getOneWaySynonym(
          { phrase: mockOneWaySynonymPhrase },
          { timeout: 10 },
        )).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.getOneWaySynonym(
          { phrase: mockOneWaySynonymPhrase },
        )).to.eventually.be.rejectedWith('The user aborted a request.');
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

          expect(res).to.have.property('one_way_synonym_relations').to.be.an('array').length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting one way synonyms with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getOneWaySynonyms({ num_results_per_page: 10, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('one_way_synonym_relations').to.be.an('array').length.gte(1);
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.getOneWaySynonyms({}, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.getOneWaySynonyms({})).to.eventually.be.rejectedWith('The user aborted a request.');
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.removeOneWaySynonym(
          { phrase: mockOneWaySynonymPhrase },
          { timeout: 10 },
        )).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.removeOneWaySynonym(
          { phrase: mockOneWaySynonymPhrase },
        )).to.eventually.be.rejectedWith('The user aborted a request.');
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.removeOneWaySynonyms({ timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.removeOneWaySynonyms()).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });
  });

  describe('Synonym Groups', () => {
    describe('addSynonymGroup', () => {
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.addSynonymGroup(
          { synonyms: [createMockSynonym()] },
          { timeout: 10 },
        )).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.addSynonymGroup(
          { synonyms: [createMockSynonym()] },
        )).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('modifySynonymGroup', () => {
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.modifySynonymGroup({
          id: synonymGroupId,
          synonyms: [mockSynonym],
        }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.modifySynonymGroup({
          id: synonymGroupId,
          synonyms: [mockSynonym],
        })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('getSynonymGroup', () => {
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

      it('Should return a response when getting synonym group with id', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getSynonymGroup({ id: synonymGroupId }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('synonym_groups').to.be.an('array').length(1);
          expect(res.synonym_groups[0]).to.have.property('synonym_group_id').to.be.a('number').to.equal(synonymGroupId);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting one way synonym with id that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getSynonymGroup({ id: 'abc123' })).to.eventually.be.rejected;
      });

      it('Should return error when getting one way synonym with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getSynonymGroup({ id: synonymGroupId })).to.eventually.be.rejected;
      });

      it('Should return error when getting one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getSynonymGroup({ id: synonymGroupId })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.getSynonymGroup({ id: synonymGroupId }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.getSynonymGroup({ id: synonymGroupId })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('getSynonymGroups', () => {
      const mockSynonym = createMockSynonym();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addSynonymGroup({ synonyms: [mockSynonym] }).then(() => done());
      });

      it('Should return a response when getting synonym groups', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getSynonymGroups().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('synonym_groups').to.be.an('array').of.length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting synonym groups with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getSynonymGroups({ num_results_per_page: 10, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('synonym_groups').to.be.an('array').of.length.gte(1);
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

        return expect(catalog.getSynonymGroups()).to.eventually.be.rejected;
      });

      it('Should return error when getting one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getSynonymGroups()).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.getSynonymGroups({}, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.getSynonymGroups({})).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('removeSynonymGroup', () => {
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

      it('Should resolve when removing synonyms group with id', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.removeSynonymGroup({ id: synonymGroupId }).then(done);
      });

      it('Should return error when removing synonyms group with id that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeSynonymGroup({ id: 'abc123' })).to.eventually.be.rejected;
      });

      it('Should return error when removing one way synonym with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeSynonymGroup({ id: synonymGroupId })).to.eventually.be.rejected;
      });

      it('Should return error when removing one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeSynonymGroup({ id: synonymGroupId })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.removeSynonymGroup({ id: synonymGroupId }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.removeSynonymGroup({ id: synonymGroupId })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('removeSynonymGroups', () => {
      const mockSynonym = createMockSynonym();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addSynonymGroup({ synonyms: [mockSynonym] }).then(() => done());
      });

      it('Should resolve when removing synonym groups', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.removeSynonymGroups().then(done);
      });

      it('Should return error when removing one way synonyms with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeSynonymGroups()).to.eventually.be.rejected;
      });

      it('Should return error when removing one way synonyms with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeSynonymGroups()).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.removeSynonymGroups({ timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.removeSynonymGroups()).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });
  });

  describe('Redirect Rules', () => {
    describe('addRedirectRule', () => {
      const mockRedirectRule = createMockRedirectRule();

      it('Should return a response when adding a redirect rule', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addRedirectRule(mockRedirectRule).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('id').to.be.a('number');
          expect(res).to.have.property('url').to.eq(mockRedirectRule.url);
          expect(res).to.have.property('matches').to.be.an('array').of.length(1);
          expect(res.matches[0]).to.have.property('id').to.be.a('number');
          expect(res.matches[0]).to.have.property('pattern').to.eq(mockRedirectRule.matches[0].pattern);
          expect(res.matches[0]).to.have.property('match_type').to.eq(mockRedirectRule.matches[0].match_type);
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

        return expect(catalog.addRedirectRule(mockRedirectRule)).to.eventually.be.rejected;
      });

      it('Should return error when adding a one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addRedirectRule(mockRedirectRule)).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.addRedirectRule(createMockRedirectRule(), { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.addRedirectRule(createMockRedirectRule())).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('updateRedirectRule', () => {
      const mockRedirectRule = createMockRedirectRule();
      let redirectRuleId;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addRedirectRule(mockRedirectRule).then((res) => {
          redirectRuleId = res.id;

          done();
        });
      });

      it('Should return a response when completely updating a redirect rule', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.updateRedirectRule({ id: redirectRuleId, ...mockRedirectRule }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('id').to.be.a('number');
          expect(res).to.have.property('url').to.eq(mockRedirectRule.url);
          expect(res).to.have.property('matches').to.be.an('array').of.length(1);
          expect(res.matches[0]).to.have.property('id').to.be.a('number');
          expect(res.matches[0]).to.have.property('pattern').to.eq(mockRedirectRule.matches[0].pattern);
          expect(res.matches[0]).to.have.property('match_type').to.eq(mockRedirectRule.matches[0].match_type);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return an error when completely updating a redirect rule that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateRedirectRule({
          id: 'abc123',
          ...mockRedirectRule,
        })).to.eventually.be.rejected;
      });

      it('Should return error when completely updating a redirect rule with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateRedirectRule({
          id: redirectRuleId,
          ...mockRedirectRule,
        })).to.eventually.be.rejected;
      });

      it('Should return error when completely updating a redirect rule with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateRedirectRule({
          id: redirectRuleId,
          ...mockRedirectRule,
        })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.updateRedirectRule({
          id: redirectRuleId,
          ...mockRedirectRule,
        }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.updateRedirectRule({
          id: redirectRuleId,
          ...mockRedirectRule,
        })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('modifyRedirectRule', () => {
      const mockRedirectRule = createMockRedirectRule();
      let redirectRuleId;
      let redirectRuleUrl;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addRedirectRule(mockRedirectRule).then((res) => {
          redirectRuleId = res.id;
          redirectRuleUrl = res.url;

          delete mockRedirectRule.url;

          done();
        });
      });

      it('Should return a response when partially updating a redirect rule', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.modifyRedirectRule({ id: redirectRuleId, ...mockRedirectRule }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('id').to.be.a('number');
          expect(res).to.have.property('url').to.eq(redirectRuleUrl);
          expect(res).to.have.property('matches').to.be.an('array').of.length(1);
          expect(res.matches[0]).to.have.property('id').to.be.a('number');
          expect(res.matches[0]).to.have.property('pattern').to.eq(mockRedirectRule.matches[0].pattern);
          expect(res.matches[0]).to.have.property('match_type').to.eq(mockRedirectRule.matches[0].match_type);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return an error when partially updating a redirect rule that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyRedirectRule({ id: 'abc123', ...mockRedirectRule })).to.eventually.be.rejected;
      });

      it('Should return error when partially updating a redirect rule with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyRedirectRule({
          id: redirectRuleId,
          ...mockRedirectRule,
        })).to.eventually.be.rejected;
      });

      it('Should return error when partially updating a redirect rule with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyRedirectRule({
          id: redirectRuleId,
          ...mockRedirectRule,
        })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.modifyRedirectRule({
          id: redirectRuleId,
          ...mockRedirectRule,
        }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.modifyRedirectRule({
          id: redirectRuleId,
          ...mockRedirectRule,
        })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('getRedirectRule', () => {
      const mockRedirectRule = createMockRedirectRule();
      let redirectRuleId;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addRedirectRule(mockRedirectRule).then((res) => {
          redirectRuleId = res.id;

          done();
        });
      });

      it('Should return a response when getting redirect rule with id', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getRedirectRule({ id: redirectRuleId }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('id').to.be.a('number');
          expect(res).to.have.property('url').to.eq(mockRedirectRule.url);
          expect(res).to.have.property('matches').to.be.an('array').of.length(1);
          expect(res.matches[0]).to.have.property('id').to.be.a('number');
          expect(res.matches[0]).to.have.property('pattern').to.eq(mockRedirectRule.matches[0].pattern);
          expect(res.matches[0]).to.have.property('match_type').to.eq(mockRedirectRule.matches[0].match_type);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting redirect rule with id that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getRedirectRule({ id: 'abc123' })).to.eventually.be.rejected;
      });

      it('Should return error when getting redirect rule with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getRedirectRule({ id: redirectRuleId })).to.eventually.be.rejected;
      });

      it('Should return error when getting redirect rule with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getRedirectRule({ id: redirectRuleId })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.getRedirectRule({ id: redirectRuleId }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.getRedirectRule({ id: redirectRuleId })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('getRedirectRules', () => {
      const mockRedirectRule = createMockRedirectRule();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addRedirectRule(mockRedirectRule).then(() => {
          done();
        });
      });

      it('Should return a response when getting redirect rules', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getRedirectRules().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('redirect_rules').an('array').of.length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting redirect rules with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getRedirectRules({ num_results_per_page: 10, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('redirect_rules').an('array').of.length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting redirect rules with query parameter', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getRedirectRules({ query: 'constructor' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('redirect_rules').an('array').of.length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting redirect rules with phrase parameter', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getRedirectRules({ phrase: mockRedirectRule.matches[0].pattern }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('redirect_rules').an('array').of.length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return a response when getting redirect rules with status parameter', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getRedirectRules({ status: 'current' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('redirect_rules').an('array').of.length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting redirect rules with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getRedirectRules()).to.eventually.be.rejected;
      });

      it('Should return error when getting redirect rules with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getRedirectRules()).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.getRedirectRules({}, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.getRedirectRules({})).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('removeRedirectRule', () => {
      const mockRedirectRule = createMockRedirectRule();
      let redirectRuleId;

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addRedirectRule(mockRedirectRule).then((res) => {
          redirectRuleId = res.id;

          done();
        });
      });

      it('Should return a response when removing redirect rule with id', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.removeRedirectRule({ id: redirectRuleId }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('id').to.be.a('number');
          expect(res).to.have.property('url').to.eq(mockRedirectRule.url);
          expect(res).to.have.property('matches').to.be.an('array').of.length(1);
          expect(res.matches[0]).to.have.property('id').to.be.a('number');
          expect(res.matches[0]).to.have.property('pattern').to.eq(mockRedirectRule.matches[0].pattern);
          expect(res.matches[0]).to.have.property('match_type').to.eq(mockRedirectRule.matches[0].match_type);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when removing redirect rule with id that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeRedirectRule({ id: 'abc123' })).to.eventually.be.rejected;
      });

      it('Should return error when removing redirect rule with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeRedirectRule({ id: redirectRuleId })).to.eventually.be.rejected;
      });

      it('Should return error when removing redirect rule with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeRedirectRule({ id: redirectRuleId })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.removeRedirectRule({ id: redirectRuleId }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.removeRedirectRule({ id: redirectRuleId })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });
  });

  describe('Catalog Files', function catalogFiles() {
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.addFacetConfiguration(mockFacetConfiguration, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.addFacetConfiguration(mockFacetConfiguration)).to.eventually.be.rejectedWith('The user aborted a request.');
      });
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.getFacetConfigurations({}, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.getFacetConfigurations({})).to.eventually.be.rejectedWith('The user aborted a request.');
      });
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.addFacetConfiguration(mockFacetConfiguration, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.addFacetConfiguration(mockFacetConfiguration)).to.eventually.be.rejectedWith('The user aborted a request.');
      });
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
        )).to.eventually.be.rejectedWith('The user aborted a request.');
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
        )).to.eventually.be.rejectedWith('The user aborted a request.');
      });
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.replaceFacetConfiguration({
          name: mockFacetConfiguration.name,
          display_name: 'New Facet Display Name',
          type: 'multiple',
          position: 5,
        }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
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
        })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.modifyFacetConfiguration({
          name: mockFacetConfiguration.name,
          display_name: 'New Facet Display Name',
          position: 5,
        }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
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
        })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);
        const mockFacetConfiguration = createMockFacetConfiguration();

        return expect(catalog.removeFacetConfiguration(
          mockFacetConfiguration,
          { timeout: 10 },
        )).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });
        const mockFacetConfiguration = createMockFacetConfiguration();

        return expect(catalog.removeFacetConfiguration(
          mockFacetConfiguration,
        )).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.addFacetOptionConfiguration(
          createMockFacetOptionConfiguration(facetGroupName),
          { timeout: 10 },
        )).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.addFacetOptionConfiguration(
          createMockFacetOptionConfiguration(facetGroupName),
        )).to.eventually.be.rejectedWith('The user aborted a request.');
      });
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
            display_name: 'New Facet Option Display Name',
            position: 3,
          },
          {
            value: mockFacetOptionConfigurations[1].value,
            display_name: 'New Facet Option Display Name #2',
            position: 5,
          },
        ];

        catalog.addOrModifyFacetOptionConfigurations({
          facetGroupName,
          facetOptionConfigurations: newFacetOptionConfigurations,
        }).then((res) => {
          expect(res[0]).to.have.property('value').to.be.a('string').to.be.oneOf([mockFacetOptionConfigurations[0].value, mockFacetOptionConfigurations[1].value]);
          expect(res[0]).to.have.property('display_name').to.be.a('string').to.be.oneOf([newFacetOptionConfigurations[0].display_name, newFacetOptionConfigurations[1].display_name]);
          expect(res[0]).to.have.property('position').to.be.a('number').to.be.oneOf([newFacetOptionConfigurations[0].position, newFacetOptionConfigurations[1].position]);
          expect(res[1]).to.have.property('value').to.be.a('string').to.be.oneOf([mockFacetOptionConfigurations[0].value, mockFacetOptionConfigurations[1].value]);
          expect(res[1]).to.have.property('display_name').to.be.a('string').to.be.oneOf([newFacetOptionConfigurations[0].display_name, newFacetOptionConfigurations[1].display_name]);
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.addOrModifyFacetOptionConfigurations({
          facetGroupName,
          facetOptionConfigurations: mockFacetOptionConfigurations,
        }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.addOrModifyFacetOptionConfigurations({
          facetGroupName,
          facetOptionConfigurations: mockFacetOptionConfigurations,
        })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.getFacetOptionConfigurations({
          facetGroupName,
        }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.getFacetOptionConfigurations({
          facetGroupName,
        })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);
        const { value } = mockFacetOptionConfiguration;

        return expect(catalog.getFacetOptionConfiguration({
          facetGroupName,
          value,
        }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
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
        })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
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
          display_name: 'New Facet Option Display Name',
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.replaceFacetOptionConfiguration({
          facetGroupName,
          value: mockFacetOptionConfiguration.value,
          display_name: 'New Facet Option Display Name',
          position: 5,
        }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.replaceFacetOptionConfiguration({
          facetGroupName,
          value: mockFacetOptionConfiguration.value,
          display_name: 'New Facet Option Display Name',
          position: 5,
        })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
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
          display_name: 'New Facet Display Name',
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.modifyFacetOptionConfiguration({
          facetGroupName,
          value: mockFacetOptionConfiguration.value,
          display_name: 'New Facet Display Name',
          position: 5,
        }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.modifyFacetOptionConfiguration({
          facetGroupName,
          value: mockFacetOptionConfiguration.value,
          display_name: 'New Facet Display Name',
          position: 5,
        })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
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

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);
        const mockFacetOptionConfiguration = createMockFacetOptionConfiguration(facetGroupName);

        expect(catalog.removeFacetOptionConfiguration(
          mockFacetOptionConfiguration,
          { timeout: 10 },
        )).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });
        const mockFacetOptionConfiguration = createMockFacetOptionConfiguration(facetGroupName);

        expect(catalog.removeFacetOptionConfiguration(mockFacetOptionConfiguration)).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });
  });
});
