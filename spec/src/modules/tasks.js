/* eslint-disable no-unused-expressions, import/no-unresolved, no-restricted-syntax, max-nested-callbacks */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const nodeFetch = require('node-fetch').default;
const cloneDeep = require('lodash.clonedeep');
const ConstructorIO = require('../../../test/constructorio'); // eslint-disable-line import/extensions
const helpers = require('../../mocha.helpers');

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
        const taskExists = res.tasks.find((task) => task.id === taskId);

        expect(fetchSpy).to.have.been.called;
        expect(res.total_count).to.be.gte(1);
        expect(taskExists).to.eq(true);
        expect(requestedUrlParams).to.have.property('key');
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

    it('Should be rejected when network request timeout is provided and reached', () => {
      const { tasks } = new ConstructorIO(validOptions);

      return expect(tasks.getAllTasks({}, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
    });

    it('Should be rejected when global network request timeout is provided and reached', () => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        networkParameters: { timeout: 20 },
      });

      return expect(tasks.getAllTasks()).to.eventually.be.rejectedWith('The user aborted a request.');
    });
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

    it('Should be rejected when network request timeout is provided and reached', () => {
      const { tasks } = new ConstructorIO(validOptions);

      return expect(tasks.getTask({}, { timeout: 10 })).to.eventually.be.rejectedWith('The user aborted a request.');
    });

    it('Should be rejected when global network request timeout is provided and reached', () => {
      const { tasks } = new ConstructorIO({
        ...validOptions,
        networkParameters: { timeout: 20 },
      });

      return expect(tasks.getTask()).to.eventually.be.rejectedWith('The user aborted a request.');
    });
  });
});
