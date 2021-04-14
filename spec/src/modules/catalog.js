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

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const testApiKey = process.env.TEST_API_KEY;
const testApiToken = process.env.TEST_API_TOKEN;
const validClientId = '2b23dd74-5672-4379-878c-9182938d2710';
const validSessionId = '2';
const validOptions = {
  apiKey: testApiKey,
  apiToken: testApiToken,
  clientId: validClientId,
  sessionId: validSessionId,
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
    it('Should resolve when adding an item', (done) => {
      const mockItem = createMockItem();
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      catalog.addItem(mockItem).then(done);
    });

    it('should resolve when adding an item with metadata', (done) => {
      const mockItem = createMockItem();
      const { catalog } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      mockItem.metadata = {
        key1: 'value1',
        key2: 'value2',
      };

      catalog.addItem(mockItem).then(done);
    });

    it('should return error when adding an item with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiKey = 'abc123';

      const mockItem = createMockItem();
      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.addItem(mockItem)).to.eventually.be.rejected;
    });

    it('should return error when adding an item with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);

      invalidOptions.apiToken = 'foo987';

      const mockItem = createMockItem();
      const { catalog } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(catalog.addItem(mockItem)).to.eventually.be.rejected;
    });
  });
});
