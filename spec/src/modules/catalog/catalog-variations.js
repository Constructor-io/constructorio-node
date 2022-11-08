/* eslint-disable no-unused-expressions, import/no-unresolved, no-restricted-syntax, max-nested-callbacks */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const nodeFetch = require('node-fetch').default;
const cloneDeep = require('lodash.clonedeep');
const { v4: uuidv4 } = require('uuid');
const ConstructorIO = require('../../../../test/constructorio'); // eslint-disable-line import/extensions
const helpers = require('../../../mocha.helpers');

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

  describe('Variations', () => {
    const item = createMockItem();

    describe('createOrReplaceVariations', () => {
      const variations = [
        createMockVariation(item.id),
        createMockVariation(item.id),
        createMockVariation(item.id),
      ];
      const optionalParameters = {
        section: 'Products',
        force: true,
        notificationEmail: 'test@constructor.io',
      };

      it('Should resolve when adding multiple variations', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceVariations({ variations }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });

        itemsToCleanup.push(item);
        variationsToCleanup.push(...variations);
      });

      it('Should resolve when adding multiple variations and supplying optional parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceVariations({ variations, ...optionalParameters }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(requestedUrlParams).to.have.property('section').to.equal(optionalParameters.section);
          expect(requestedUrlParams).to.have.property('force').to.equal(optionalParameters.force.toString());
          expect(requestedUrlParams).to.have.property('notification_email').to.equal(optionalParameters.notificationEmail);
          done();
        });

        itemsToCleanup.push(item);
        variationsToCleanup.push(...variations);
      });

      it('Should return error when no variations are provided', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceItems()).to.eventually.be.rejected;
      });

      it('Should return error when invalid variations are provided', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceItems({ variations: 'foo' })).to.eventually.be.rejected;
      });

      it('Should return error when adding multiple variations with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceVariations({ variations })).to.eventually.be.rejected;
      });

      it('Should return error when adding multiple variations with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceVariations({ variations })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.createOrReplaceVariations({ variations: [createMockVariation(item.id)] }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.createOrReplaceVariations({ variations: [createMockVariation(item.id)] })).to.eventually.be.rejectedWith('The user aborted a request.');
      });
    });

    describe('updateVariations', () => {
      const variations = [createMockVariation(item.id)];
      const updatedVariations = [{ ...variations[0], name: 'Updated Variation Name' }];
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

        catalog.createOrReplaceVariations({ variations }).then(done);
        variationsToCleanup.push(...updatedVariations);
      });

      it('Should resolve when updating multiple variations', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.updateVariations({ variations: updatedVariations }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should resolve when updating multiple variations and supplying optional parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.updateVariations({ variations: updatedVariations, ...optionalParameters }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(requestedUrlParams).to.have.property('section').to.equal(optionalParameters.section);
          expect(requestedUrlParams).to.have.property('force').to.equal(optionalParameters.force.toString());
          expect(requestedUrlParams).to.have.property('notification_email').to.equal(optionalParameters.notificationEmail);
          done();
        });
      });

      it('Should return error when no variations are provided', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateVariations()).to.eventually.be.rejected;
      });

      it('Should return error when invalid variations are provided', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateVariations({ variation: 'foo' })).to.eventually.be.rejected;
      });

      it('Should return error when updating variations with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateVariations({ variations: updatedVariations })).to.eventually.be.rejected;
      });

      it('Should return error when updating variations with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateVariations({ variations: updatedVariations })).to.eventually.be.rejected;
      });

      it('Should be rejected when network request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO(validOptions);

        return expect(catalog.updateVariations({ variations: updatedVariations }, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
      });

      it('Should be rejected when network global request timeout is provided and reached', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(catalog.updateVariations({ variations: updatedVariations })).to.eventually.be.rejectedWith('The user aborted a request.');
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
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');

          catalog.deleteItems({ items: itemsToCleanup.map((variation) => ({ id: variation.id })), section: 'Products' }).then(done);
        });
      });

      it('Should resolve when removing multiple variations and supplying optional parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const optionalParameters = {
          force: true,
          notificationEmail: 'test@constructor.io',
        };

        variations.push(...variationsToCleanup);
        catalog.deleteVariations({ variations: variations.map((variation) => ({ id: variation.id })), section: 'Products', ...optionalParameters }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(requestedUrlParams).to.have.property('force').to.equal(optionalParameters.force.toString());
          expect(requestedUrlParams).to.have.property('notification_email').to.equal(optionalParameters.notificationEmail);

          catalog.deleteItems({ items: itemsToCleanup.map((variation) => ({ id: variation.id })), section: 'Products' }).then(done);
        });
      });

      it('Should return error when removing variations that do not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteVariations({ variations: variationsDoNotExist, section: 'Products' })).to.eventually.be.rejected;
      });

      it('Should return error when no variations are provided', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteVariations()).to.eventually.be.rejected;
      });

      it('Should return error when invalid variations are provided', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteVariations({ variations: 'foo' })).to.eventually.be.rejected;
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

      it('Should return a response when getting variations', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveVariations().then((res) => {
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

        catalog.retrieveVariations({ ids: variations.map(((variation) => variation.id)) }).then((res) => {
          expect(res).to.have.property('variations').to.be.an('array');
          done();
        });
      });

      it('Should return a response when getting variations by item id', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveVariations({ itemId: item.id }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('variations').to.be.an('array');
          expect(requestedUrlParams).to.have.property('item_id').to.be.an('string').to.equal(item.id);
          done();
        });
      });

      it('Should return a response when getting variations by section with optional parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });
        const optionalParameters = {
          section: 'Products',
          numResultsPerPage: 10,
          page: 1,
        };

        catalog.retrieveVariations(optionalParameters).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('variations').to.be.an('array');
          expect(requestedUrlParams).to.have.property('section').to.equal(optionalParameters.section);
          expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal(optionalParameters.numResultsPerPage.toString());
          expect(requestedUrlParams).to.have.property('page').to.equal(optionalParameters.page.toString());
          done();
        });
      });

      it('Should return variations of length 0 when getting variation by id that does not exist', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveVariations({ ids: [uuidv4()] }).then((res) => {
          expect(res).to.have.property('variations').to.be.an('array').that.is.empty;
          done();
        });
      });

      it('Should return variations of length 0 when getting variations by item id that does not exist', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveVariations({ itemId: 'abc' }).then((res) => {
          expect(res).to.have.property('variations').to.be.an('array').that.is.empty;
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
  });
});
