/* eslint-disable no-unused-expressions, import/no-unresolved, no-new */
const { expect } = require('chai');
const jsdom = require('mocha-jsdom');
const ConstructorIO = require('../../test/constructorio'); // eslint-disable-line import/extensions

const validApiKey = 'testing';
const validOptions = { apiKey: validApiKey };

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
    expect(instance).to.have.property('search');
    expect(instance).to.have.property('autocomplete');
    expect(instance).to.have.property('recommendations');
    expect(instance).to.have.property('browse');
    expect(instance).to.have.property('catalog');
    expect(instance).to.have.property('tracker');
  });

  it('Should return an instance with custom options when valid API key is provided', () => {
    const serviceUrl = 'http://constructor.io';
    const version = 'custom-version';
    const apiToken = 'token';
    const securityToken = 'security-token';
    const networkParameters = { timeout: 5000 };
    const instance = new ConstructorIO({
      ...validOptions,
      apiToken,
      serviceUrl,
      version,
      securityToken,
      networkParameters,
    });

    expect(instance).to.be.an('object');
    expect(instance.options).to.have.property('apiToken').to.equal(apiToken);
    expect(instance.options).to.have.property('serviceUrl').to.equal(serviceUrl);
    expect(instance.options).to.have.property('version').to.equal(version);
    expect(instance.options).to.have.property('securityToken').to.equal(securityToken);
    expect(instance.options).to.have.property('networkParameters').to.equal(networkParameters);
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
});
