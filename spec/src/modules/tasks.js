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
const testApiKey = process.env.TEST_API_KEY;
const testApiToken = process.env.TEST_API_TOKEN;
const validOptions = {
  apiKey: testApiKey,
  apiToken: testApiToken,
};
const skipNetworkTimeoutTests = process.env.SKIP_NETWORK_TIMEOUT_TESTS === 'true';

describe('ConstructorIO - Tasks', function ConstructorIOTasks() {
  // Ensure Mocha doesn't time out waiting for operation to complete
  this.timeout(10000);

  const clientVersion = 'cio-mocha';
  let fetchSpy;
  let taskId;

  before(async () => {
    const { catalog } = new ConstructorIO({
      ...validOptions,
    });

    // Grab items file from Integration Examples repo and upload
    const itemsResponse = await nodeFetch('https://raw.githubusercontent.com/Constructor-io/integration-examples/main/catalog/items.csv');
    const itemsBuffer = await itemsResponse.buffer();

    const data = {
      items: itemsBuffer,
      section: 'Products',
    };

    // Save task id of uploaded catalog for the following tests below
    await catalog.replaceCatalog(data).then((res) => {
      taskId = res.task_id;
    });
  });

  beforeEach(() => {
    global.CLIENT_VERSION = clientVersion;
    fetchSpy = sinon.spy(nodeFetch);
  });

  afterEach((done) => {
    delete global.CLIENT_VERSIONS;

    fetchSpy = null;

    setTimeout(done, sendTimeout);
  });

  describe('getAllTasks', () => {
    it('Should retrieve a list of tasks', (done) => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      tasks.getAllTasks().then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
        const task = res.tasks.find((taskObj) => taskObj.id === taskId);

        expect(fetchSpy).to.have.been.called;
        expect(res.total_count).to.be.gte(1);
        expect(task.id).to.eq(taskId);
        expect(requestedUrlParams).to.have.property('key');
        done();
      });
    });

    it('Should retrieve a list of tasks given page and results per page (old)', (done) => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      tasks.getAllTasks({ page: 2, num_results_per_page: 50 }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(res.total_count).to.be.gte(1);
        expect(res.tasks.length).to.be.lte(50);
        expect(requestedUrlParams).to.have.property('key');
        done();
      });
    });

    it('Should retrieve a list of tasks given page and results per page', (done) => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      tasks.getAllTasks({ page: 2, numResultsPerPage: 50 }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(res.total_count).to.be.gte(1);
        expect(res.tasks.length).to.be.lte(50);
        expect(requestedUrlParams).to.have.property('key');
        done();
      });
    });

    it('Should retrieve a list of tasks given startDate and endDate', (done) => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });
      const startDate = '2022-01-01';
      const endDate = new Date().toISOString().split('T')[0]; // Today

      tasks.getAllTasks({ page: 1, num_results_per_page: 50, startDate, endDate }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(res.total_count).to.be.gte(1);
        expect(res.tasks.length).to.be.lte(50);
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('start_date').to.equal(startDate);
        expect(requestedUrlParams).to.have.property('end_date').to.equal(endDate);
        done();
      });
    });

    it('Should retrieve a list of tasks given status', (done) => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      tasks.getAllTasks({ page: 2, num_results_per_page: 50, status: 'CANCELED' }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(res.tasks.length).to.be.lte(50);
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('status').to.equal('CANCELED');
        done();
      });
    });

    it('Should retrieve a list of tasks given type', (done) => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      tasks.getAllTasks({ num_results_per_page: 50, type: 'ingestion' }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(res.tasks.length).to.be.lte(50);
        expect(res.tasks.length).to.be.gte(1);
        expect(res.tasks[0].type).to.equal('ingestion');
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('type').to.equal('ingestion');
        done();
      });
    });

    it('Should pass the correct custom headers passed in function networkParameters', (done) => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      tasks.getAllTasks({}, { headers: { 'X-Constructor-IO-Test': 'test' } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);
        const task = res.tasks.find((taskObj) => taskObj.id === taskId);

        expect(fetchSpy).to.have.been.called;
        expect(res.total_count).to.be.gte(1);
        expect(task.id).to.eq(taskId);
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should pass the correct custom headers passed in global networkParameters', (done) => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
          },
        },
      });

      tasks.getAllTasks().then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);
        const task = res.tasks.find((taskObj) => taskObj.id === taskId);

        expect(fetchSpy).to.have.been.called;
        expect(res.total_count).to.be.gte(1);
        expect(task.id).to.eq(taskId);
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should combine custom headers from function networkParameters and global networkParameters', (done) => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
            'X-Constructor-IO-Test-Another': 'test',
          },
        },
      });

      tasks.getAllTasks({}, { headers: { 'X-Constructor-IO-Test': 'test2' } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);
        const task = res.tasks.find((taskObj) => taskObj.id === taskId);

        expect(fetchSpy).to.have.been.called;
        expect(res.total_count).to.be.gte(1);
        expect(task.id).to.eq(taskId);
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test2');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test-Another').to.equal('test');
        done();
      });
    });

    it('Should return error when retrieving a list of tasks with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiKey = 'notanapikey';

      const { tasks } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(tasks.getAllTasks()).to.eventually.be.rejected;
    });

    it('Should return error when retrieving a list of tasks with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiToken = 'notanapitoken';

      const { tasks } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(tasks.getAllTasks()).to.eventually.be.rejected;
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', () => {
        const { tasks } = new ConstructorIO(validOptions);

        return expect(tasks.getAllTasks({}, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { tasks } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(tasks.getAllTasks()).to.eventually.be.rejectedWith('The operation was aborted.');
      });
    }
  });

  describe('getTask', () => {
    it('Should retrieve a task given a specific id', (done) => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      tasks.getTask({ id: taskId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(res.id).to.eq(taskId);
        expect(requestedUrlParams).to.have.property('key');
        done();
      });
    });

    it('Should pass the correct custom headers passed in function networkParameters', (done) => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
      });

      tasks.getTask({ id: taskId }, { headers: { 'X-Constructor-IO-Test': 'test' } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(res.id).to.eq(taskId);
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should pass the correct custom headers passed in global networkParameters', (done) => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
          },
        },
      });

      tasks.getTask({ id: taskId }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(res.id).to.eq(taskId);
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');
        done();
      });
    });

    it('Should combine custom headers from function networkParameters and global networkParameters', (done) => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
            'X-Constructor-IO-Test-Another': 'test',
          },
        },
      });

      tasks.getTask({ id: taskId }, { headers: { 'X-Constructor-IO-Test': 'test2' } }).then((res) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        expect(fetchSpy).to.have.been.called;
        expect(res.id).to.eq(taskId);
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test2');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test-Another').to.equal('test');
        done();
      });
    });

    it('Should return error when retrieving a task given a specific id with an invalid API key', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiKey = 'notanapikey';

      const { tasks } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(tasks.getTask()).to.eventually.be.rejected;
    });

    it('Should return error when retrieving a task given a specific id with an invalid API token', () => {
      const invalidOptions = cloneDeep(validOptions);
      invalidOptions.apiToken = 'notanapitoken';

      const { tasks } = new ConstructorIO({
        ...invalidOptions,
        fetch: fetchSpy,
      });

      return expect(tasks.getTask()).to.eventually.be.rejected;
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', () => {
        const { tasks } = new ConstructorIO(validOptions);

        return expect(tasks.getTask({}, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { tasks } = new ConstructorIO({
          ...validOptions,
          networkParameters: { timeout: 20 },
        });

        return expect(tasks.getTask()).to.eventually.be.rejectedWith('The operation was aborted.');
      });
    }
  });
});
