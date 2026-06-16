/* eslint-disable no-unused-expressions, import/no-unresolved, no-restricted-syntax, max-nested-callbacks */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const cloneDeep = require('lodash.clonedeep');
const ConstructorIO = require('../../../test/constructorio'); // eslint-disable-line import/extensions
const helpers = require('../../mocha.helpers');

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

describe('ConstructorIO - Campaigns', function ConstructorIOCampaigns() {
  // Ensure Mocha doesn't time out waiting for operation to complete
  this.timeout(10000);

  const clientVersion = 'cio-mocha';
  // Track campaigns created during the suite so they can be cleaned up afterwards
  const createdCampaignIds = [];
  let fetchSpy;
  let campaignId;

  before(async () => {
    const { campaigns } = new ConstructorIO({
      ...validOptions,
    });

    // Save id of an existing campaign for the following tests below
    await campaigns.retrieveCampaigns({ numResultsPerPage: 1 }).then((res) => {
      if (res.campaigns && res.campaigns.length) {
        campaignId = res.campaigns[0].id;
      }
    });

    // Create a campaign if none exists so the tests below have an id to work with
    if (!campaignId) {
      const created = await campaigns.createCampaign({ name: `test-campaign-${Date.now()}`, refinedQueries: [{ query: 'test-query' }] });

      campaignId = created.id;
      createdCampaignIds.push(created.id);
    }
  });

  after(async () => {
    const { campaigns } = new ConstructorIO({
      ...validOptions,
    });

    // Clean up campaigns created during the suite (in parallel to stay within the hook timeout)
    await Promise.all(createdCampaignIds.map((id) => campaigns.deleteCampaign({ id }).catch(() => {})));
  });

  beforeEach(() => {
    global.CLIENT_VERSION = clientVersion;
    fetchSpy = sinon.spy(nodeFetch);
  });

  afterEach((done) => {
    delete global.CLIENT_VERSION;

    fetchSpy = null;

    setTimeout(done, sendTimeout);
  });

  describe('retrieveCampaigns', () => {
    it('Should retrieve a list of campaigns', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.retrieveCampaigns().then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');

        // Response
        expect(res).to.have.property('campaigns').to.be.an('array');
        expect(res).to.have.property('total_count').to.be.a('number');

        done();
      });
    });

    it('Should retrieve a list of campaigns given section', (done) => {
      const section = 'Search Suggestions';
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.retrieveCampaigns({ section }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('section').to.equal(section);

        // Response
        expect(res).to.have.property('campaigns').to.be.an('array');

        done();
      });
    });

    it('Should retrieve a list of campaigns given page and results per page', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.retrieveCampaigns({ page: 1, numResultsPerPage: 50 }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('page').to.equal('1');
        expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal('50');

        // Response
        expect(res).to.have.property('campaigns').to.be.an('array');
        expect(res.campaigns.length).to.be.lte(50);

        done();
      });
    });

    it('Should retrieve a list of campaigns given page and results per page when passing parameters snake_case', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.retrieveCampaigns({ page: 1, num_results_per_page: 50 }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal('50');

        // Response
        expect(res).to.have.property('campaigns').to.be.an('array');
        expect(res.campaigns.length).to.be.lte(50);

        done();
      });
    });

    it('Should retrieve a list of campaigns given offset', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.retrieveCampaigns({ offset: 1 }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('offset').to.equal('1');

        // Response
        expect(res).to.have.property('campaigns').to.be.an('array');

        done();
      });
    });

    it('Should pass the correct custom headers passed in function networkParameters', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.retrieveCampaigns({}, { headers: { 'X-Constructor-IO-Test': 'test' } }).then(() => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should pass the correct custom headers passed in global networkParameters', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
          },
        },
      });

      campaigns.retrieveCampaigns().then(() => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should combine custom headers from function networkParameters and global networkParameters', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
            'X-Constructor-IO-Test-Another': 'test',
          },
        },
      });

      campaigns.retrieveCampaigns({}, { headers: { 'X-Constructor-IO-Test': 'test2' } }).then(() => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test2');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test-Another').to.equal('test');
        done();
      });
    });

    it('Should return error when retrieving a list of campaigns with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiKey = 'notanapikey';

      const { campaigns } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(campaigns.retrieveCampaigns()).to.eventually.be.rejected;
    });

    it('Should return error when retrieving a list of campaigns with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiToken = 'notanapitoken';

      const { campaigns } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(campaigns.retrieveCampaigns()).to.eventually.be.rejected;
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', () => {
        const { campaigns } = new ConstructorIO(validOptions);

        return expect(campaigns.retrieveCampaigns({}, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { campaigns } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(campaigns.retrieveCampaigns()).to.eventually.be.rejectedWith('The operation was aborted.');
      });
    }
  });

  describe('retrieveCampaign', () => {
    it('Should retrieve a campaign given a specific id', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.retrieveCampaign({ id: campaignId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');

        // Response
        expect(res).to.have.property('id').to.equal(campaignId);

        done();
      });
    });

    it('Should retrieve a campaign given a specific id and section', (done) => {
      const section = 'Products';
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.retrieveCampaign({ id: campaignId, section }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('section').to.equal(section);

        // Response
        expect(res).to.have.property('id').to.equal(campaignId);

        done();
      });
    });

    it('Should pass the correct custom headers passed in function networkParameters', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.retrieveCampaign({ id: campaignId }, { headers: { 'X-Constructor-IO-Test': 'test' } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');

        // Response
        expect(res).to.have.property('id').to.equal(campaignId);

        done();
      });
    });

    it('Should pass the correct custom headers passed in global networkParameters', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
          },
        },
      });

      campaigns.retrieveCampaign({ id: campaignId }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');

        // Response
        expect(res).to.have.property('id').to.equal(campaignId);

        done();
      });
    });

    it('Should combine custom headers from function networkParameters and global networkParameters', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
            'X-Constructor-IO-Test-Another': 'test',
          },
        },
      });

      campaigns.retrieveCampaign({ id: campaignId }, { headers: { 'X-Constructor-IO-Test': 'test2' } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test2');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test-Another').to.equal('test');

        // Response
        expect(res).to.have.property('id').to.equal(campaignId);

        done();
      });
    });

    it('Should return error when retrieving a campaign given a specific id with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiKey = 'notanapikey';

      const { campaigns } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(campaigns.retrieveCampaign({ id: campaignId })).to.eventually.be.rejected;
    });

    it('Should return error when retrieving a campaign given a specific id with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiToken = 'notanapitoken';

      const { campaigns } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(campaigns.retrieveCampaign({ id: campaignId })).to.eventually.be.rejected;
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', () => {
        const { campaigns } = new ConstructorIO(validOptions);

        return expect(campaigns.retrieveCampaign({ id: campaignId }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { campaigns } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(campaigns.retrieveCampaign({ id: campaignId })).to.eventually.be.rejectedWith('The operation was aborted.');
      });
    }
  });

  describe('createCampaign', () => {
    const createCampaignName = `test-campaign-${Date.now()}`;

    it('Should create a campaign given a name', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.createCampaign({ name: createCampaignName, refinedQueries: [{ query: 'test-query' }] }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
        const requestedBody = helpers.extractBodyParamsFromFetch(fetchSpy);

        createdCampaignIds.push(res.id);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedBody).to.have.property('name').to.equal(createCampaignName);

        // Response
        expect(res).to.have.property('id').to.be.a('number');
        expect(res).to.have.property('name').to.equal(createCampaignName);

        done();
      });
    });

    it('Should create a campaign given a name, description and section', (done) => {
      const section = 'Products';
      const description = 'Seasonal promotion campaign';
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.createCampaign({ name: `${createCampaignName}-2`, description, section, refinedQueries: [{ query: 'test-query' }] }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
        const requestedBody = helpers.extractBodyParamsFromFetch(fetchSpy);

        createdCampaignIds.push(res.id);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('section').to.equal(section);
        expect(requestedBody).to.have.property('description').to.equal(description);
        expect(requestedBody).to.not.have.property('section');

        // Response
        expect(res).to.have.property('id').to.be.a('number');
        expect(res).to.have.property('description').to.equal(description);

        done();
      });
    });

    it('Should pass the correct custom headers passed in function networkParameters', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.createCampaign({ name: `${createCampaignName}-4`, refinedQueries: [{ query: 'test-query' }] }, { headers: { 'X-Constructor-IO-Test': 'test' } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        createdCampaignIds.push(res.id);

        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should pass the correct custom headers passed in global networkParameters', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
          },
        },
      });

      campaigns.createCampaign({ name: `${createCampaignName}-5`, refinedQueries: [{ query: 'test-query' }] }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        createdCampaignIds.push(res.id);

        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should combine custom headers from function networkParameters and global networkParameters', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
            'X-Constructor-IO-Test-Another': 'test',
          },
        },
      });

      campaigns.createCampaign({ name: `${createCampaignName}-6`, refinedQueries: [{ query: 'test-query' }] }, { headers: { 'X-Constructor-IO-Test': 'test2' } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        createdCampaignIds.push(res.id);

        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test2');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test-Another').to.equal('test');
        done();
      });
    });

    it('Should return error when creating a campaign with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiKey = 'notanapikey';

      const { campaigns } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(campaigns.createCampaign({ name: `${createCampaignName}-invalid-key`, refinedQueries: [{ query: 'test-query' }] })).to.eventually.be.rejected;
    });

    it('Should return error when creating a campaign with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiToken = 'notanapitoken';

      const { campaigns } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(campaigns.createCampaign({ name: `${createCampaignName}-invalid-token`, refinedQueries: [{ query: 'test-query' }] })).to.eventually.be.rejected;
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', () => {
        const { campaigns } = new ConstructorIO(validOptions);

        return expect(campaigns.createCampaign({ name: `${createCampaignName}-timeout`, refinedQueries: [{ query: 'test-query' }] }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { campaigns } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(campaigns.createCampaign({ name: `${createCampaignName}-global-timeout`, refinedQueries: [{ query: 'test-query' }] })).to.eventually.be.rejectedWith('The operation was aborted.');
      });
    }
  });

  describe('updateCampaign', () => {
    let updateCampaignId;

    before(async () => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
      });

      // Create a campaign to update in the following tests below
      await campaigns.createCampaign({ name: `test-campaign-update-${Date.now()}`, refinedQueries: [{ query: 'test-query' }] }).then((res) => {
        updateCampaignId = res.id;
        createdCampaignIds.push(res.id);
      });
    });

    it('Should update a campaign given an id and name', (done) => {
      const updatedName = `updated-campaign-${Date.now()}`;
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.updateCampaign({ id: updateCampaignId, name: updatedName }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
        const requestedBody = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedBody).to.have.property('name').to.equal(updatedName);
        expect(requestedBody).to.not.have.property('id');

        // Response
        expect(res).to.have.property('id').to.equal(updateCampaignId);
        expect(res).to.have.property('name').to.equal(updatedName);

        done();
      });
    });

    it('Should update a campaign given a description and section', (done) => {
      const section = 'Products';
      const description = 'Updated seasonal promotion campaign';
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.updateCampaign({ id: updateCampaignId, description, section }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
        const requestedBody = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('section').to.equal(section);
        expect(requestedBody).to.have.property('description').to.equal(description);
        expect(requestedBody).to.not.have.property('section');
        expect(requestedBody).to.not.have.property('id');

        // Response
        expect(res).to.have.property('id').to.equal(updateCampaignId);
        expect(res).to.have.property('description').to.equal(description);

        done();
      });
    });

    it('Should pass the correct custom headers passed in function networkParameters', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      campaigns.updateCampaign({ id: updateCampaignId }, { headers: { 'X-Constructor-IO-Test': 'test' } }).then(() => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should pass the correct custom headers passed in global networkParameters', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
          },
        },
      });

      campaigns.updateCampaign({ id: updateCampaignId }).then(() => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should combine custom headers from function networkParameters and global networkParameters', (done) => {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
            'X-Constructor-IO-Test-Another': 'test',
          },
        },
      });

      campaigns.updateCampaign({ id: updateCampaignId }, { headers: { 'X-Constructor-IO-Test': 'test2' } }).then(() => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test2');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test-Another').to.equal('test');
        done();
      });
    });

    it('Should return error when updating a campaign with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiKey = 'notanapikey';

      const { campaigns } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(campaigns.updateCampaign({ id: updateCampaignId, name: 'updated' })).to.eventually.be.rejected;
    });

    it('Should return error when updating a campaign with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiToken = 'notanapitoken';

      const { campaigns } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(campaigns.updateCampaign({ id: updateCampaignId, name: 'updated' })).to.eventually.be.rejected;
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', () => {
        const { campaigns } = new ConstructorIO(validOptions);

        return expect(campaigns.updateCampaign({ id: updateCampaignId, name: 'updated' }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { campaigns } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(campaigns.updateCampaign({ id: updateCampaignId, name: 'updated' })).to.eventually.be.rejectedWith('The operation was aborted.');
      });
    }
  });

  describe('deleteCampaign', () => {
    // Create a fresh campaign before each test so it can be safely deleted
    async function createCampaignToDelete() {
      const { campaigns } = new ConstructorIO({
        ...validOptions,
      });

      const res = await campaigns.createCampaign({ name: `test-campaign-delete-${Date.now()}-${Math.random()}`, refinedQueries: [{ query: 'test-query' }] });

      return res.id;
    }

    it('Should delete a campaign given an id', async () => {
      const idToDelete = await createCampaignToDelete();
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      await campaigns.deleteCampaign({ id: idToDelete }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');

        // Response
        expect(res).to.equal(undefined);
      });
    });

    it('Should delete a campaign given an id and section', async () => {
      const section = 'Products';
      const idToDelete = await createCampaignToDelete();
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      await campaigns.deleteCampaign({ id: idToDelete, section }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('section').to.equal(section);

        // Response
        expect(res).to.equal(undefined);
      });
    });

    it('Should pass the correct custom headers passed in function networkParameters', async () => {
      const idToDelete = await createCampaignToDelete();
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      await campaigns.deleteCampaign({ id: idToDelete }, { headers: { 'X-Constructor-IO-Test': 'test' } }).then(() => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
      });
    });

    it('Should pass the correct custom headers passed in global networkParameters', async () => {
      const idToDelete = await createCampaignToDelete();
      const { campaigns } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
          },
        },
      });

      await campaigns.deleteCampaign({ id: idToDelete }).then(() => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
      });
    });

    it('Should return error when deleting a campaign with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiKey = 'notanapikey';

      const { campaigns } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(campaigns.deleteCampaign({ id: campaignId })).to.eventually.be.rejected;
    });

    it('Should return error when deleting a campaign with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiToken = 'notanapitoken';

      const { campaigns } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(campaigns.deleteCampaign({ id: campaignId })).to.eventually.be.rejected;
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', () => {
        const { campaigns } = new ConstructorIO(validOptions);

        return expect(campaigns.deleteCampaign({ id: campaignId }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { campaigns } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(campaigns.deleteCampaign({ id: campaignId })).to.eventually.be.rejectedWith('The operation was aborted.');
      });
    }
  });
});
