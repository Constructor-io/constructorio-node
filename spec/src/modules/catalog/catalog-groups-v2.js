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

const sendTimeout = 300;
const testApiKey = process.env.TEST_CATALOG_API_KEY;
const testApiToken = process.env.TEST_API_TOKEN;
const createdItemGroupIds = [];
const networkTimeoutsItemGroupIds = [];
const validOptions = {
  apiKey: testApiKey,
  apiToken: testApiToken,
};
const skipNetworkTimeoutTests = process.env.SKIP_NETWORK_TIMEOUT_TESTS === 'true';

function createMockItemGroupV2() {
  const uuid = uuidv4();

  return {
    id: `group-v2-${uuid}`,
    name: `Group V2 ${uuid}`,
  };
}

function createMockItemGroupV2WithParent(parentId) {
  const uuid = uuidv4();

  return {
    id: `group-v2-${uuid}`,
    name: `Group V2 ${uuid}`,
    parentIds: [parentId],
  };
}

function createMockItemGroupV2WithData() {
  const uuid = uuidv4();

  return {
    id: `group-v2-${uuid}`,
    name: `Group V2 ${uuid}`,
    data: {
      url: `/category/${uuid}`,
      imageUrl: `https://example.com/images/${uuid}.jpg`,
    },
  };
}

function addToCleanup(groups) {
  groups.forEach((group) => createdItemGroupIds.push(group.id));
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

  after(() => {
    if (!createdItemGroupIds.length && !networkTimeoutsItemGroupIds.length) { return Promise.resolve(); }

    const { catalog } = new ConstructorIO({
      ...validOptions,
      fetch: nodeFetch,
    });
    const APIResponses = [];

    // Clean up created item groups
    APIResponses.push(catalog
      .deleteItemGroups({ itemGroups: createdItemGroupIds.map((id) => ({ id })), force: true }));

    // Clean up potentially created network timeouts item groups
    networkTimeoutsItemGroupIds.forEach((id) => {
      APIResponses.push(catalog.deleteItemGroups({ itemGroups: [{ id }], force: true }));
    });

    return Promise.all(APIResponses);
  });

  describe('Groups V2', () => {
    describe('retrieveItemGroups', () => {
      const mockItemGroup = createMockItemGroupV2();
      const mockItemGroup2 = createMockItemGroupV2();

      it('Should have correct query params when filtering by id', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveItemGroups({ ids: [mockItemGroup.id, mockItemGroup2.id] }).finally(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          expect(requestedUrlParams).to.have.property('id').to.be.an('array');
          expect(requestedUrlParams.id[0]).to.equal(mockItemGroup.id);
          expect(requestedUrlParams.id[1]).to.equal(mockItemGroup2.id);
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Should return a response when retrieving item groups', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveItemGroups().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('item_groups').to.be.an('array');
          expect(res).to.have.property('total_count').to.be.a('number');
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Should return a response when retrieving item groups with pagination', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveItemGroups({ numResultsPerPage: 1, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('item_groups').to.be.an('array');
          expect(res).to.have.property('total_count').to.be.a('number');
          expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal('1');
          expect(requestedUrlParams).to.have.property('page').to.equal('1');
          done();
        });
      });

      it('Should return error when retrieving item groups with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.retrieveItemGroups()).to.eventually.be.rejected;
      });

      it('Should return error when retrieving item groups with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.retrieveItemGroups()).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.retrieveItemGroups({}, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.retrieveItemGroups()).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('retrieveItemGroup', () => {
      const mockItemGroup = createMockItemGroupV2();

      it('Should have correct query params when retrieving single item group', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.retrieveItemGroup({ id: mockItemGroup.id }).finally(() => {
          const requestedUrl = helpers.extractUrlFromFetch(fetchSpy);
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(decodeURIComponent(requestedUrl)).to.include(`/item_groups/${mockItemGroup.id}`);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when retrieving item group without id', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.retrieveItemGroup({})).to.eventually.be.rejectedWith('id is a required parameter');
      });

      it('Should return error when retrieving item group that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.retrieveItemGroup({ id: `non-existent-${uuidv4()}` })).to.eventually.be.rejected;
      });

      it('Should return error when retrieving item group with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.retrieveItemGroup({ id: mockItemGroup.id })).to.eventually.be.rejected;
      });

      it('Should return error when retrieving item group with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.retrieveItemGroup({ id: mockItemGroup.id })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.retrieveItemGroup({ id: mockItemGroup.id }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.retrieveItemGroup({ id: mockItemGroup.id })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('createOrReplaceItemGroups', () => {
      it('Should return a response when creating item groups and have correct body payload', (done) => {
        const groups = [
          createMockItemGroupV2(),
          createMockItemGroupV2(),
          createMockItemGroupV2(),
        ];
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceItemGroups({ itemGroups: groups }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestedBody = helpers.extractBodyParamsFromFetch(fetchSpy);

          addToCleanup(groups);
          expect(res).to.have.property('task_id').to.be.a('number');
          expect(res).to.have.property('task_status_path').to.be.a('string');

          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          expect(requestedBody).to.have.property('item_groups').to.be.an('array').with.length(3);
          expect(requestedBody.item_groups[0]).to.have.property('id').to.equal(groups[0].id);
          expect(requestedBody.item_groups[0]).to.have.property('name').to.equal(groups[0].name);
          done();
        });
      });

      it('Should have correct body payload when creating item groups with parentIds', (done) => {
        const parentGroup = createMockItemGroupV2();
        const childGroup = createMockItemGroupV2WithParent(parentGroup.id);
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceItemGroups({ itemGroups: [parentGroup, childGroup] }).then((res) => {
          const requestedBody = helpers.extractBodyParamsFromFetch(fetchSpy);

          addToCleanup([parentGroup, childGroup]);
          expect(res).to.have.property('task_id').to.be.a('number');
          expect(res).to.have.property('task_status_path').to.be.a('string');
          expect(requestedBody).to.have.property('item_groups').to.be.an('array').with.length(2);
          expect(requestedBody.item_groups[1]).to.have.property('parent_ids').to.be.an('array').that.includes(parentGroup.id);
          done();
        });
      });

      it('Should have correct body payload when creating item groups with data field', (done) => {
        const groupWithData = createMockItemGroupV2WithData();
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceItemGroups({ itemGroups: [groupWithData] }).then((res) => {
          const requestedBody = helpers.extractBodyParamsFromFetch(fetchSpy);

          addToCleanup([groupWithData]);
          expect(res).to.have.property('task_id').to.be.a('number');
          expect(requestedBody).to.have.property('item_groups').to.be.an('array').with.length(1);
          expect(requestedBody.item_groups[0]).to.have.property('data').to.be.an('object');
          expect(requestedBody.item_groups[0].data).to.have.property('url').to.equal(groupWithData.data.url);
          expect(requestedBody.item_groups[0].data).to.have.property('imageUrl').to.equal(groupWithData.data.imageUrl);
          done();
        });
      });

      it('Should have correct query params when creating item groups with force parameter', (done) => {
        const groups = [createMockItemGroupV2()];
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceItemGroups({ itemGroups: groups, force: true }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          addToCleanup(groups);
          expect(res).to.have.property('task_id').to.be.a('number');
          expect(requestedUrlParams).to.have.property('force').to.equal('true');
          done();
        });
      });

      it('Should have correct query params when creating item groups with notificationEmail parameter', (done) => {
        const groups = [createMockItemGroupV2()];
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.createOrReplaceItemGroups({ itemGroups: groups, notificationEmail: 'test@example.com' }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          addToCleanup(groups);
          expect(res).to.have.property('task_id').to.be.a('number');
          expect(requestedUrlParams).to.have.property('notification_email').to.equal('test@example.com');
          done();
        });
      });

      it('Should return error when creating item groups without itemGroups parameter', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceItemGroups({})).to.eventually.be.rejectedWith('itemGroups is a required parameter of type array');
      });

      it('Should return error when creating item groups with non-array itemGroups', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceItemGroups({ itemGroups: 'invalid' })).to.eventually.be.rejectedWith('itemGroups is a required parameter of type array');
      });

      it('Should return error when creating item groups with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceItemGroups({ itemGroups: [createMockItemGroupV2()] }))
          .to.eventually.be.rejected;
      });

      it('Should return error when creating item groups with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.createOrReplaceItemGroups({ itemGroups: [createMockItemGroupV2()] }))
          .to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);
          const mockItemGroup = createMockItemGroupV2();
          networkTimeoutsItemGroupIds.push(mockItemGroup.id);

          return expect(catalog.createOrReplaceItemGroups({ itemGroups: [mockItemGroup] }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });
          const mockItemGroup = createMockItemGroupV2();
          networkTimeoutsItemGroupIds.push(mockItemGroup.id);

          return expect(catalog.createOrReplaceItemGroups({ itemGroups: [mockItemGroup] })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('updateItemGroups', () => {
      const mockItemGroup = createMockItemGroupV2();

      it('Should have correct body payload when updating item groups', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const updatedGroup = { ...mockItemGroup };

        catalog.updateItemGroups({ itemGroups: [updatedGroup] }).finally(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestedBody = helpers.extractBodyParamsFromFetch(fetchSpy);

          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          expect(requestedBody).to.have.property('item_groups').to.be.an('array').with.length(1);
          expect(requestedBody.item_groups[0]).to.have.property('id').to.equal(updatedGroup.id);
          expect(requestedBody.item_groups[0]).to.have.property('name').to.equal(updatedGroup.name);
          done();
        });
      });

      it('Should have correct query params when updating item groups with force parameter', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const updatedGroup = { ...mockItemGroup };

        catalog.updateItemGroups({ itemGroups: [updatedGroup], force: true }).finally(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(requestedUrlParams).to.have.property('force').to.equal('true');
          done();
        });
      });

      it('Should have correct query params when updating item groups with notificationEmail parameter', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const updatedGroup = { ...mockItemGroup };

        catalog.updateItemGroups({ itemGroups: [updatedGroup], notificationEmail: 'test@example.com' }).finally(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(requestedUrlParams).to.have.property('notification_email').to.equal('test@example.com');
          done();
        });
      });

      it('Should have correct body payload when updating item groups with data field', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        const updatedGroup = {
          id: mockItemGroup.id,
          name: 'Test',
          data: {
            url: '/updated-category',
            imageUrl: 'https://example.com/updated.jpg',
          },
        };

        catalog.updateItemGroups({ itemGroups: [updatedGroup] }).finally(() => {
          const requestedBody = helpers.extractBodyParamsFromFetch(fetchSpy);

          expect(requestedBody).to.have.property('item_groups').to.be.an('array').with.length(1);
          expect(requestedBody.item_groups[0]).to.have.property('id').to.equal(updatedGroup.id);
          expect(requestedBody.item_groups[0]).to.have.property('data').to.be.an('object');
          expect(requestedBody.item_groups[0].data).to.have.property('url').to.equal(updatedGroup.data.url);
          expect(requestedBody.item_groups[0].data).to.have.property('imageUrl').to.equal(updatedGroup.data.imageUrl);
          done();
        });
      });

      it('Should return error when updating item groups without itemGroups parameter', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateItemGroups({})).to.eventually.be.rejectedWith('itemGroups is a required parameter of type array');
      });

      it('Should return error when updating item groups with non-array itemGroups', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateItemGroups({ itemGroups: 'invalid' })).to.eventually.be.rejectedWith('itemGroups is a required parameter of type array');
      });

      it('Should return error when updating item groups with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateItemGroups({ itemGroups: [{ id: mockItemGroup.id, name: 'Test' }] })).to.eventually.be.rejected;
      });

      it('Should return error when updating item groups with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.updateItemGroups({ itemGroups: [{ id: mockItemGroup.id, name: 'Test' }] })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.updateItemGroups({ itemGroups: [{ id: mockItemGroup.id, name: 'Test' }] }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.updateItemGroups({ itemGroups: [{ id: mockItemGroup.id, name: 'Test' }] })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('deleteItemGroups', () => {
      it('Should have correct body payload when deleting item groups', (done) => {
        const mockItemGroup = createMockItemGroupV2();
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.deleteItemGroups({ itemGroups: [{ id: mockItemGroup.id }] }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
          const requestedBody = helpers.extractBodyParamsFromFetch(fetchSpy);

          expect(fetchSpy).to.have.been.called;
          expect(res).to.have.property('task_id').to.be.a('number');
          expect(res).to.have.property('task_status_path').to.be.a('string');
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          expect(requestedBody).to.have.property('item_groups').to.be.an('array').with.length(1);
          expect(requestedBody.item_groups[0]).to.have.property('id').to.equal(mockItemGroup.id);
          done();
        });
      });

      it('Should have correct body payload when deleting multiple item groups', (done) => {
        const mockItemGroup1 = createMockItemGroupV2();
        const mockItemGroup2 = createMockItemGroupV2();
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.deleteItemGroups({ itemGroups: [{ id: mockItemGroup1.id }, { id: mockItemGroup2.id }] }).then((res) => {
          const requestedBody = helpers.extractBodyParamsFromFetch(fetchSpy);

          expect(res).to.have.property('task_id').to.be.a('number');
          expect(res).to.have.property('task_status_path').to.be.a('string');
          expect(requestedBody).to.have.property('item_groups').to.be.an('array').with.length(2);
          expect(requestedBody.item_groups[0]).to.have.property('id').to.equal(mockItemGroup1.id);
          expect(requestedBody.item_groups[1]).to.have.property('id').to.equal(mockItemGroup2.id);
          done();
        });
      });

      it('Should have correct query params when deleting item groups with force parameter', (done) => {
        const mockItemGroup = createMockItemGroupV2();
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.deleteItemGroups({ itemGroups: [{ id: mockItemGroup.id }], force: true }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(requestedUrlParams).to.have.property('force').to.equal('true');
          done();
        });
      });

      it('Should have correct query params when deleting item groups with notificationEmail parameter', (done) => {
        const mockItemGroup = createMockItemGroupV2();
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.deleteItemGroups({ itemGroups: [{ id: mockItemGroup.id }], notificationEmail: 'test@example.com' }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(requestedUrlParams).to.have.property('notification_email').to.equal('test@example.com');
          done();
        });
      });

      it('Should return error when deleting item groups without itemGroups parameter', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteItemGroups({})).to.eventually.be.rejectedWith('itemGroups is a required parameter of type array');
      });

      it('Should return error when deleting item groups with non-array itemGroups', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteItemGroups({ itemGroups: 'invalid' })).to.eventually.be.rejectedWith('itemGroups is a required parameter of type array');
      });

      it('Should return error when deleting item groups with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteItemGroups({ itemGroups: [{ id: 'test-group' }] })).to.eventually.be.rejected;
      });

      it('Should return error when deleting item groups with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.deleteItemGroups({ itemGroups: [{ id: 'test-group' }] })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.deleteItemGroups({ itemGroups: [{ id: 'test-group' }] }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.deleteItemGroups({ itemGroups: [{ id: 'test-group' }] })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });
  });
});
