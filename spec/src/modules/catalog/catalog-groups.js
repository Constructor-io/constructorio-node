/* eslint-disable no-unused-expressions, import/no-unresolved, no-restricted-syntax, max-nested-callbacks */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const nodeFetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cloneDeep = require('lodash.clonedeep');
const { v4: uuidv4 } = require('uuid');
const ConstructorIO = require('../../../../test/constructorio'); // eslint-disable-line import/extensions
const helpers = require('../../../mocha.helpers');

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const sendTimeout = 300;
const testApiKey = process.env.TEST_API_KEY;
const testApiToken = process.env.TEST_API_TOKEN;
const validOptions = {
  apiKey: testApiKey,
  apiToken: testApiToken,
};
const skipNetworkTimeoutTests = process.env.SKIP_NETWORK_TIMEOUT_TESTS === 'true';

function createMockItemGroup() {
  const uuid = uuidv4();

  return {
    id: `group-${uuid}`,
    name: `Group ${uuid}`,
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

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.addItemGroup(createMockItemGroup(), { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.addItemGroup(createMockItemGroup())).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
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

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.addItemGroups([createMockItemGroup()], { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.addItemGroups([createMockItemGroup()])).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
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

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.getItemGroup({ group_id: mockItemGroup.id }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.getItemGroup({ group_id: mockItemGroup.id })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
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

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.getItemGroups({ timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.getItemGroups()).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
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

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.addOrUpdateItemGroups(
            { item_groups: groups },
            { timeout: 10 },
          )).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.addOrUpdateItemGroups(
            { item_groups: groups },
          )).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
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

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.modifyItemGroup(mockItemGroup, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.modifyItemGroup(mockItemGroup)).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
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

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.removeItemGroups({ timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.removeItemGroups()).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });
  });
});
