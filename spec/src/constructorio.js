/* eslint-disable no-unused-expressions, import/no-unresolved, no-new */
const { expect } = require('chai');
const jsdom = require('mocha-jsdom');
const ConstructorIO = require('../../test/constructorio');

const validApiKey = 'testing';
const validClientId = '2b23dd74-5672-4379-878c-9182938d2710';
const validSessionId = '2';
const validOptions = { apiKey: validApiKey, clientId: validClientId, sessionId: validSessionId };

describe('ConstructorIO', () => {
  jsdom({
    url: 'http://localhost',
  });

  beforeEach(() => {
    global.CLIENT_VERSION = 'cio-mocha';
  });

  afterEach(() => {
    delete global.CLIENT_VERSION;
  });

  it('Should return an instance when valid API key is provided', () => {
    const instance = new ConstructorIO(validOptions);

    expect(instance).to.be.an('object');
    expect(instance).to.have.property('options').to.be.an('object');
    expect(instance.options).to.have.property('apiKey').to.equal(validApiKey);
    expect(instance.options).to.have.property('version').to.equal(global.CLIENT_VERSION);
    expect(instance.options).to.have.property('serviceUrl');
    expect(instance.options).to.have.property('clientId');
    expect(instance.options).to.have.property('sessionId');
    expect(instance).to.have.property('search');
    expect(instance).to.have.property('autocomplete');
    expect(instance).to.have.property('recommendations');
    expect(instance).to.have.property('browse');
  });

  it('Should return an instance with custom options when valid API key is provided', () => {
    const serviceUrl = 'http://constructor.io';
    const version = 'custom-version';
    const instance = new ConstructorIO({
      ...validOptions,
      serviceUrl,
      version,
    });

    expect(instance).to.be.an('object');
    expect(instance.options).to.have.property('clientId').to.equal(validClientId);
    expect(instance.options).to.have.property('sessionId').to.equal(validSessionId);
    expect(instance.options).to.have.property('serviceUrl').to.equal(serviceUrl);
    expect(instance.options).to.have.property('version').to.equal(version);
  });

  it('Should throw an error when invalid API key is provided', () => {
    expect(() => new ConstructorIO({ ...validOptions, apiKey: 123456789 })).to.throw('API key is a required parameter of type string');
  });

  it('Should throw an error when no API key is provided', () => {
    expect(() => new ConstructorIO({ ...validOptions, apiKey: null })).to.throw('API key is a required parameter of type string');
  });

  it('Should throw an error when no options are provided', () => {
    expect(() => new ConstructorIO()).to.throw('API key is a required parameter of type string');
  });

  it('Should throw an error when invalid Client ID is provided', () => {
    expect(() => new ConstructorIO({ ...validOptions, clientId: 123456789 })).to.throw('Client ID is a required parameter of type string');
  });

  it('Should throw an error when no Client ID is provided', () => {
    expect(() => new ConstructorIO({ ...validOptions, clientId: null })).to.throw('Client ID is a required parameter of type string');
  });

  it('Should throw an error when invalid Session ID is provided', () => {
    expect(() => new ConstructorIO({ ...validOptions, sessionId: 123456789 })).to.throw('Session ID is a required parameter of type string');
  });

  it('Should throw an error when no Session ID is provided', () => {
    expect(() => new ConstructorIO({ ...validOptions, sessionId: null })).to.throw('Session ID is a required parameter of type string');
  });

  describe('setClientOptions', () => {
    it('Should update the client options with new API key', () => {
      const newAPIKey = 'newAPIKey';
      const instance = new ConstructorIO(validOptions);

      expect(instance.options).to.have.property('apiKey').to.equal(validApiKey);

      instance.setClientOptions({
        apiKey: newAPIKey,
      });

      expect(instance.options).to.have.property('apiKey').to.equal(newAPIKey);
    });

    it('Should update the options for modules with new API key', () => {
      const newAPIKey = 'newAPIKey';
      const instance = new ConstructorIO(validOptions);

      expect(instance.options).to.have.property('apiKey').to.equal(validApiKey);
      expect(instance.search.options).to.have.property('apiKey').to.equal(validApiKey);
      expect(instance.autocomplete.options).to.have.property('apiKey').to.equal(validApiKey);
      expect(instance.browse.options).to.have.property('apiKey').to.equal(validApiKey);
      expect(instance.recommendations.options).to.have.property('apiKey').to.equal(validApiKey);

      instance.setClientOptions({
        apiKey: newAPIKey,
      });

      expect(instance.options).to.have.property('apiKey').to.equal(newAPIKey);
      expect(instance.search.options).to.have.property('apiKey').to.equal(newAPIKey);
      expect(instance.autocomplete.options).to.have.property('apiKey').to.equal(newAPIKey);
      expect(instance.browse.options).to.have.property('apiKey').to.equal(newAPIKey);
      expect(instance.recommendations.options).to.have.property('apiKey').to.equal(newAPIKey);
    });

    it('Should update the client options with new segments', () => {
      const oldSegments = ['old_segment_1', 'old_segment_2'];
      const newSegments = ['new_segment_1'];
      const instance = new ConstructorIO({
        ...validOptions,
        segments: oldSegments,
      });

      expect(instance.options).to.have.property('segments').to.deep.equal(oldSegments);

      instance.setClientOptions({
        segments: newSegments,
      });

      expect(instance.options).to.have.property('segments').to.deep.equal(newSegments);
    });

    it('Should update the options for modules with new segments', () => {
      const oldSegments = ['old_segment_1', 'old_segment_2'];
      const newSegments = ['new_segment_1'];
      const instance = new ConstructorIO({
        ...validOptions,
        segments: oldSegments,
      });

      expect(instance.options).to.have.property('segments').to.equal(oldSegments);
      expect(instance.search.options).to.have.property('segments').to.equal(oldSegments);
      expect(instance.autocomplete.options).to.have.property('segments').to.equal(oldSegments);
      expect(instance.browse.options).to.have.property('segments').to.equal(oldSegments);
      expect(instance.recommendations.options).to.have.property('segments').to.equal(oldSegments);

      instance.setClientOptions({
        segments: newSegments,
      });

      expect(instance.options).to.have.property('segments').to.equal(newSegments);
      expect(instance.search.options).to.have.property('segments').to.equal(newSegments);
      expect(instance.autocomplete.options).to.have.property('segments').to.equal(newSegments);
      expect(instance.browse.options).to.have.property('segments').to.equal(newSegments);
      expect(instance.recommendations.options).to.have.property('segments').to.equal(newSegments);
    });

    it('Should update the client options with new test cells', () => {
      const oldTestCells = {
        'old-cell-name-1': 'old-cell-value-1',
        'old-cell-name-2': 'old-cell-value-2',
      };
      const newTestCells = {
        'new-cell-name-1': 'new-cell-value-1',
      };
      const instance = new ConstructorIO({
        ...validOptions,
        testCells: oldTestCells,
      });

      expect(instance.options).to.have.property('testCells').to.deep.equal(oldTestCells);

      instance.setClientOptions({
        testCells: newTestCells,
      });

      expect(instance.options).to.have.property('testCells').to.deep.equal(newTestCells);
    });

    it('Should update the options for modules with new test cells', () => {
      const oldTestCells = {
        'old-cell-name-1': 'old-cell-value-1',
        'old-cell-name-2': 'old-cell-value-2',
      };
      const newTestCells = {
        'new-cell-name-1': 'new-cell-value-1',
      };
      const instance = new ConstructorIO({
        ...validOptions,
        testCells: oldTestCells,
      });

      expect(instance.options).to.have.property('testCells').to.deep.equal(oldTestCells);
      expect(instance.search.options).to.have.property('testCells').to.equal(oldTestCells);
      expect(instance.autocomplete.options).to.have.property('testCells').to.equal(oldTestCells);
      expect(instance.browse.options).to.have.property('testCells').to.equal(oldTestCells);
      expect(instance.recommendations.options).to.have.property('testCells').to.equal(oldTestCells);

      instance.setClientOptions({
        testCells: newTestCells,
      });

      expect(instance.options).to.have.property('testCells').to.deep.equal(newTestCells);
      expect(instance.search.options).to.have.property('testCells').to.equal(newTestCells);
      expect(instance.autocomplete.options).to.have.property('testCells').to.equal(newTestCells);
      expect(instance.browse.options).to.have.property('testCells').to.equal(newTestCells);
      expect(instance.recommendations.options).to.have.property('testCells').to.equal(newTestCells);
    });

    it('Should update the client options with a new user id', () => {
      const oldUserId = 'old_user_id';
      const newUserId = 'new_user_id';
      const instance = new ConstructorIO({
        ...validOptions,
        userId: oldUserId,
      });

      expect(instance.options).to.have.property('userId').to.deep.equal(oldUserId);

      instance.setClientOptions({
        userId: newUserId,
      });

      expect(instance.options).to.have.property('userId').to.deep.equal(newUserId);
    });

    it('Should update the options for modules with a new user id', () => {
      const oldUserId = 'old_user_id';
      const newUserId = 'new_user_id';
      const instance = new ConstructorIO({
        ...validOptions,
        userId: oldUserId,
      });

      expect(instance.options).to.have.property('userId').to.deep.equal(oldUserId);
      expect(instance.search.options).to.have.property('userId').to.equal(oldUserId);
      expect(instance.autocomplete.options).to.have.property('userId').to.equal(oldUserId);
      expect(instance.browse.options).to.have.property('userId').to.equal(oldUserId);
      expect(instance.recommendations.options).to.have.property('userId').to.equal(oldUserId);

      instance.setClientOptions({
        userId: newUserId,
      });

      expect(instance.options).to.have.property('userId').to.deep.equal(newUserId);
      expect(instance.search.options).to.have.property('userId').to.equal(newUserId);
      expect(instance.autocomplete.options).to.have.property('userId').to.equal(newUserId);
      expect(instance.browse.options).to.have.property('userId').to.equal(newUserId);
      expect(instance.recommendations.options).to.have.property('userId').to.equal(newUserId);
    });
  });
});
