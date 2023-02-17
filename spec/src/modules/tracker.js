/* eslint-disable no-unused-expressions, import/no-unresolved */
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

const delayBetweenTests = 25;
const testApiKey = process.env.TEST_REQUEST_API_KEY;
const skipNetworkTimeoutTests = process.env.SKIP_NETWORK_TIMEOUT_TESTS === 'true';

describe('ConstructorIO - Tracker', () => {
  const clientVersion = 'cio-mocha';
  let fetchSpy = null;
  const userParameters = {
    clientId: '6c73138f-c27b-49f0-872d-63b00ed0e395',
    sessionId: 1,
  };

  beforeEach(() => {
    fetchSpy = sinon.spy(nodeFetch);
    global.CLIENT_VERSION = clientVersion;
  });

  afterEach((done) => {
    fetchSpy = null;

    delete global.CLIENT_VERSION;
    setTimeout(done, delayBetweenTests);
  });

  describe('trackSessionStart', () => {
    it('Should respond with a valid response', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('action').to.equal('session_start');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal('true');

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSessionStart(userParameters)).to.equal(true);
    });

    it('Should respond with a valid response with user identifier', (done) => {
      const userId = 'bd2d9d1f097614c4b4de';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSessionStart({
        ...userParameters,
        userId,
      })).to.equal(true);
    });

    it('Should respond with a valid response with segments', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSessionStart({
        ...userParameters,
        segments,
      })).to.equal(true);
    });

    it('Should respond with a valid response with test cells', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSessionStart({
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response with multiple test cells', (done) => {
      const testCells = {
        foo: 'bar',
        bar: 'foo',
        far: 'boo',
      };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[1]}`).to.equal(Object.values(testCells)[1]);
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[2]}`).to.equal(Object.values(testCells)[2]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSessionStart({
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response with origin referrer', (done) => {
      const originReferrer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSessionStart({
        ...userParameters,
        originReferrer,
      })).to.equal(true);
    });

    it('Should respond with a valid response with security token', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSessionStart(userParameters)).to.equal(true);
    });

    it('Should respond with a valid response with user ip', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSessionStart({
        ...userParameters,
        userIp,
      })).to.equal(true);
    });

    it('Should respond with a valid response with user agent', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSessionStart({
        ...userParameters,
        userAgent,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSessionStart({
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSessionStart({
        ...userParameters,
        referer,
      })).to.equal(true);
    });

    it('Should pass the correct custom headers passed in function networkParameters', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');

        done();
      });

      expect(tracker.trackSessionStart(userParameters, { headers: { 'X-Constructor-IO-Test': 'test' } })).to.equal(true);
    });

    it('Should pass the correct custom headers passed in global networkParameters', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
          },
        },
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');

        done();
      });

      expect(tracker.trackSessionStart(userParameters)).to.equal(true);
    });

    it('Should override the custom headers from networkParameters with userParameters', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'User-Agent': 'test',
          },
        },
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');
        expect(requestedHeaders).to.have.property('User-Agent').to.equal('test2');

        done();
      });

      expect(tracker.trackSessionStart({ ...userParameters, userAgent: 'test2' })).to.equal(true);
    });

    it('Should combine custom headers from function networkParameters and global networkParameters', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
            'X-Constructor-IO-Test-Another': 'test',
          },
        },
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test2');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test-Another').to.equal('test');

        done();
      });

      expect(tracker.trackSessionStart(userParameters, { headers: { 'X-Constructor-IO-Test': 'test2' } })).to.equal(true);
    });

    if (!skipNetworkTimeoutTests) {
      it('Should throw an error when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({ apiKey: testApiKey });

        tracker.on('error', () => { done(); });

        expect(tracker.trackSessionStart(userParameters, { timeout: 10 })).to.equal(true);
      });

      it('Should throw an error when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: { timeout: 20 },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackSessionStart(userParameters)).to.equal(true);
      });
    }

    it('Should properly encode query parameters', (done) => {
      const specialCharacters = '+[]&';
      const userId = `user-id ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSessionStart({ ...userParameters, userId })).to.equal(true);
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const nonBreakingSpaces = '   ';
      const userId = `user-id ${nonBreakingSpaces} user-id`;
      const userIdExpected = 'user-id     user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userIdExpected);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSessionStart({ ...userParameters, userId })).to.equal(true);
    });
  });

  describe('trackInputFocus', () => {
    it('Should respond with a valid response', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('action').to.equal('focus');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal('true');

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackInputFocus(userParameters)).to.equal(true);
    });

    it('Should respond with a valid response with user identifier', (done) => {
      const userId = 'bd2d9d1f097614c4b4de';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackInputFocus({
        userId,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with segments', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackInputFocus({
        segments,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with test cells', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackInputFocus({
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response with multiple test cells', (done) => {
      const testCells = {
        foo: 'bar',
        bar: 'foo',
        far: 'boo',
      };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[1]}`).to.equal(Object.values(testCells)[1]);
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[2]}`).to.equal(Object.values(testCells)[2]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackInputFocus({
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response with origin referrer', (done) => {
      const originReferrer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackInputFocus({
        ...userParameters,
        originReferrer,
      })).to.equal(true);
    });

    it('Should respond with a valid response with security token', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackInputFocus(userParameters)).to.equal(true);
    });

    it('Should respond with a valid response with user ip', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackInputFocus({
        ...userParameters,
        userIp,
      })).to.equal(true);
    });

    it('Should respond with a valid response with user agent', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackInputFocus({
        ...userParameters,
        userAgent,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackInputFocus({
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackInputFocus({
        ...userParameters,
        referer,
      })).to.equal(true);
    });

    it('Should pass the correct custom headers passed in function networkParameters', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');

        done();
      });

      expect(tracker.trackInputFocus(userParameters, { headers: { 'X-Constructor-IO-Test': 'test' } })).to.equal(true);
    });

    it('Should pass the correct custom headers passed in global networkParameters', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
          },
        },
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test');

        done();
      });

      expect(tracker.trackInputFocus(userParameters)).to.equal(true);
    });

    it('Should override the custom headers from networkParameters with userParameters', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'User-Agent': 'test',
          },
        },
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');
        expect(requestedHeaders).to.have.property('User-Agent').to.equal('test2');

        done();
      });

      expect(tracker.trackInputFocus({ ...userParameters, userAgent: 'test2' })).to.equal(true);
    });

    it('Should combine custom headers from function networkParameters and global networkParameters', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        networkParameters: {
          headers: {
            'X-Constructor-IO-Test': 'test',
            'X-Constructor-IO-Test-Another': 'test',
          },
        },
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test').to.equal('test2');
        expect(requestedHeaders).to.have.property('X-Constructor-IO-Test-Another').to.equal('test');

        done();
      });

      expect(tracker.trackInputFocus(userParameters, { headers: { 'X-Constructor-IO-Test': 'test2' } })).to.equal(true);
    });

    if (!skipNetworkTimeoutTests) {
      it('Should throw an error when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({ apiKey: testApiKey });

        tracker.on('error', () => { done(); });

        expect(tracker.trackInputFocus(userParameters, { timeout: 10 })).to.equal(true);
      });

      it('Should throw an error when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: { timeout: 20 },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackInputFocus(userParameters)).to.equal(true);
      });
    }

    it('Should properly encode query parameters', (done) => {
      const specialCharacters = '+[]&';
      const userId = `user-id ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackInputFocus({ ...userParameters, userId })).to.equal(true);
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const userId = `user-id ${breakingSpaces} user-id`;
      const userIdExpected = 'user-id     user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userIdExpected);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackInputFocus({ ...userParameters, userId })).to.equal(true);
    });
  });

  describe('trackAutocompleteSelect', () => {
    const term = 'Where The Wild Things Are';
    const requiredParameters = {
      originalQuery: 'original-query',
      section: 'Search Suggestions',
    };
    const optionalParameters = {
      tr: 'click',
      groupId: 'group-id',
      displayName: 'display-name',
    };

    
    it('Backwards Compatibility - Should respond with a valid response when snake cased parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      snakeCaseParameters = {
        original_query: 'original-query',
        section: 'Search Suggestions',
        tr: 'click',
        group_id: 'group-id',
        display_name: 'display-name',
      }

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal('true');
        expect(requestParams).to.have.property('original_query').to.equal(snakeCaseParameters.original_query);
        expect(requestParams).to.have.property('section').to.equal(snakeCaseParameters.section);
        expect(requestParams).to.have.property('group').to.deep.equal({
          display_name: snakeCaseParameters.display_name,
          group_id: snakeCaseParameters.group_id,
        })

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(term, snakeCaseParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term and required parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal('true');
        expect(requestParams).to.have.property('original_query').to.equal(requiredParameters.originalQuery);
        expect(requestParams).to.have.property('section').to.equal(requiredParameters.section);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(term, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term and required parameters and user identifier are provided', (done) => {
      const userId = 'bd2d9d1f097614c4b4de';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(term, requiredParameters, {
        userId,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and segments are provided', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(term, requiredParameters, {
        ...userParameters,
        segments,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and test cells are provided', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(term, requiredParameters, {
        testCells,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and origin referrer are provided', (done) => {
      const originReferrer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(term, requiredParameters, {
        originReferrer,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and security token are provided', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(term, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user ip are provided', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(term, requiredParameters, {
        userIp,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user agent are provided', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(term, requiredParameters, {
        userAgent,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(term, requiredParameters, {
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(term, requiredParameters, {
        ...userParameters,
        referer,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required and optional parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('tr').to.equal(optionalParameters.tr);
        expect(requestParams).to.have.property('group').to.deep.equal({
          group_id: optionalParameters.groupId,
          display_name: optionalParameters.displayName,
        });

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(
        term,
        Object.assign(requiredParameters, optionalParameters),
        userParameters,
      )).to.equal(true);
    });

    it('Should throw an error when invalid term is provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackAutocompleteSelect([], requiredParameters, userParameters)).to.be.an('error');
    });

    it('Should throw an error when no term is provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackAutocompleteSelect(null, requiredParameters, userParameters)).to.be.an('error');
    });

    it('Should throw an error when invalid parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackAutocompleteSelect(term, [], userParameters)).to.be.an('error');
    });

    it('Should throw an error when no parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackAutocompleteSelect(term, null, userParameters)).to.be.an('error');
    });

    if (!skipNetworkTimeoutTests) {
      it('Should throw an error when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({ apiKey: testApiKey });

        tracker.on('error', () => { done(); });

        expect(tracker.trackAutocompleteSelect(
          term,
          requiredParameters,
          userParameters,
          { timeout: 10 },
        )).to.equal(true);
      });

      it('Should throw an error when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: { timeout: 20 },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackAutocompleteSelect(term, requiredParameters, userParameters)).to.equal(true);
      });
    }

    it('Should properly encode path parameter', (done) => {
      const specialCharacters = '+[]&';
      const termSpecialCharacters = `apple ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestUrl = fetchSpy.args[0][0];

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestUrl).to.include(encodeURIComponent(termSpecialCharacters));

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(termSpecialCharacters, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should properly encode query parameters', (done) => {
      const specialCharacters = '+[]&';
      const userId = `user-id ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(term, requiredParameters, { ...userParameters, userId })).to.equal(true);
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const userId = `user-id ${breakingSpaces} user-id`;
      const userIdExpected = 'user-id     user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userIdExpected);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackAutocompleteSelect(term, requiredParameters, { ...userParameters, userId })).to.equal(true);
    });
  });

  describe('trackItemDetailLoad', () => {
    const requiredParameters = {
      itemId: 'test1',
      itemName: 'test name',
      url: 'http://constructor.io',
    };
    const optionalParameters = {
      variationId: 'test1-small',
    };
    const legacyParameters = {
      customerId: 'test1',
      name: 'test name',
      url: 'http://constructor.io',
    };
    const originReferrer = 'https://localhost';
  
    it('Backwards Compatibiilty - Should respond with a valid response when snake cased parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const snakeCaseParameters = {
        item_id: 'test1',
        item_name: 'test name',
        url: 'http://constructor.io',
        variation_id: 'test1-small'
      }

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('item_id').to.equal(snakeCaseParameters.item_id);
        expect(requestParams).to.have.property('item_name').to.equal(snakeCaseParameters.item_name);
        expect(requestParams).to.have.property('variation_id').to.equal(snakeCaseParameters.variation_id);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackItemDetailLoad(snakeCaseParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('item_id').to.equal(requiredParameters.itemId);
        expect(requestParams).to.have.property('item_name').to.equal(requiredParameters.itemName);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackItemDetailLoad(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and segments are provided', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackItemDetailLoad(requiredParameters, {
        segments,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and userId are provided', (done) => {
      const userId = 'user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackItemDetailLoad(requiredParameters, {
        userId,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and testCells are provided', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackItemDetailLoad(requiredParameters, {
        testCells,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required and optional parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('item_id').to.equal(requiredParameters.itemId);
        expect(requestParams).to.have.property('item_name').to.equal(requiredParameters.itemName);
        expect(requestParams).to.have.property('variation_id').to.deep.equal(optionalParameters.variationId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackItemDetailLoad(Object.assign(requiredParameters, optionalParameters), userParameters))
        .to.equal(true);
    });

    it('Should respond with a valid response when legacy parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('item_id').to.equal(legacyParameters.customerId);
        expect(requestParams).to.have.property('item_name').to.equal(legacyParameters.name);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackItemDetailLoad(legacyParameters, userParameters)).to.equal(true);
    });

    it('Should throw an error when invalid parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackItemDetailLoad([])).to.be.an('error');
    });

    it('Should throw an error when no parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackItemDetailLoad()).to.be.an('error');
    });

    it('Should respond with a valid response when required parameters and origin referrer are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackItemDetailLoad(requiredParameters, {
        originReferrer,
        ...userParameters,
      })).to.equal(true);
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackItemDetailLoad(requiredParameters, userParameters, { timeout: 10 })).to.equal(true);
      });

      it('Should be rejected when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: {
            timeout: 20,
          },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackItemDetailLoad(requiredParameters, userParameters)).to.equal(true);
      });
    }

    it('Should respond with a valid response when term, required parameters and security token are provided', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackItemDetailLoad(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user ip are provided', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackItemDetailLoad(requiredParameters, {
        userIp,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user agent are provided', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackItemDetailLoad(requiredParameters, {
        userAgent,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackItemDetailLoad(requiredParameters, {
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackItemDetailLoad(requiredParameters, {
        ...userParameters,
        referer,
      })).to.equal(true);
    });
  });

  describe('trackSearchSubmit', () => {
    const term = 'Where The Wild Things Are';
    const requiredParameters = { originalQuery: 'original-query' };
    const optionalParameters = {
      groupId: 'group-id',
      displayName: 'display-name',
    };
    
    it('Backwards Compatibility - Should respond with a valid response when snake cased parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const snakeCaseParameters = {
        original_query: 'original-query',
        group_id: 'group-id',
        display_name: 'display-name',
      }

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal('true');
        expect(requestParams).to.have.property('original_query').to.equal(snakeCaseParameters.original_query);
        expect(requestParams).to.have.property('group').to.deep.equal(
          {
            display_name: snakeCaseParameters.display_name,
            group_id: snakeCaseParameters.group_id,
          }
        )

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(term, snakeCaseParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term and required parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal('true');
        expect(requestParams).to.have.property('original_query').to.equal(requiredParameters.originalQuery);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(term, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user identifier are provided', (done) => {
      const userId = 'bd2d9d1f097614c4b4de';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(term, requiredParameters, {
        ...userParameters,
        userId,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and segments are provided', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(term, requiredParameters, {
        ...userParameters,
        segments,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and test cells are provided', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(term, requiredParameters, {
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and origin referrer are provided', (done) => {
      const originReferrer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(term, requiredParameters, {
        originReferrer,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and security token are provided', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(term, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user ip are provided', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(term, requiredParameters, {
        userIp,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user agent are provided', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(term, requiredParameters, {
        userAgent,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(term, requiredParameters, {
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(term, requiredParameters, {
        ...userParameters,
        referer,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required and optional parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('group').to.deep.equal({
          group_id: optionalParameters.groupId,
          display_name: optionalParameters.displayName,
        });

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(
        term,
        Object.assign(requiredParameters, optionalParameters),
        userParameters,
      )).to.equal(true);
    });

    it('Should throw an error when invalid term is provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackSearchSubmit([], requiredParameters), userParameters).to.be.an('error');
    });

    it('Should throw an error when no term is provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackSearchSubmit(null, requiredParameters), userParameters).to.be.an('error');
    });

    it('Should throw an error when invalid parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackSearchSubmit(term, [], userParameters)).to.be.an('error');
    });

    it('Should throw an error when no parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackSearchSubmit(term, null, userParameters)).to.be.an('error');
    });

    if (!skipNetworkTimeoutTests) {
      it('Should throw an error when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({ apiKey: testApiKey });

        tracker.on('error', () => { done(); });

        expect(tracker.trackSearchSubmit(term, requiredParameters, userParameters, { timeout: 10 })).to.equal(true);
      });

      it('Should throw an error when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: { timeout: 20 },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackSearchSubmit(term, requiredParameters, userParameters, { timeout: 10 })).to.equal(true);
      });
    }

    it('Should properly encode path parameter', (done) => {
      const specialCharacters = '+[]&';
      const termSpecialCharacters = `apple ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestUrl = fetchSpy.args[0][0];

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestUrl).to.include(encodeURIComponent(termSpecialCharacters));

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(termSpecialCharacters, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should properly encode query parameters', (done) => {
      const specialCharacters = '+[]&';
      const userId = `user-id ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(term, requiredParameters, { ...userParameters, userId })).to.equal(true);
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const userId = `user-id ${breakingSpaces} user-id`;
      const userIdExpected = 'user-id     user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userIdExpected);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchSubmit(term, requiredParameters, { ...userParameters, userId })).to.equal(true);
    });
  });

  describe('trackSearchResultsLoaded', () => {
    const term = 'Cat in the Hat';
    const requiredParameters = { numResults: 1337 };
    const optionalParameters = { itemIds: [1, 2, 3] };
    const legacyParameters = {
      ...requiredParameters,
      customer_ids: [1, 2, 3],
    };

    it('Backwards Compatibility - Should respond with a valid response when snake cased parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const snakeCaseParameters = {
        num_results: 1337,
        item_ids: [1, 2, 3]
      }

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal('true');
        expect(requestParams).to.have.property('num_results').to.equal(snakeCaseParameters.num_results.toString());
        expect(requestParams).to.have.property('customer_ids').to.equal(snakeCaseParameters.item_ids.join(','));

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, snakeCaseParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term and required parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal('true');
        expect(requestParams).to.have.property('num_results').to.equal(requiredParameters.numResults.toString());

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user identifier are provided', (done) => {
      const userId = 'bd2d9d1f097614c4b4de';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, requiredParameters, {
        ...userParameters,
        userId,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and segments are provided', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, requiredParameters, {
        ...userParameters,
        segments,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and test cells are provided', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, requiredParameters, {
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and origin referrer are provided', (done) => {
      const originReferrer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, requiredParameters, {
        originReferrer,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and security token are provided', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user ip are provided', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, requiredParameters, {
        userIp,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user agent are provided', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, requiredParameters, {
        userAgent,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, requiredParameters, {
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, requiredParameters, {
        ...userParameters,
        referer,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required and optional parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('customer_ids').to.equal(optionalParameters.itemIds.join(','));

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(
        term,
        Object.assign(requiredParameters, optionalParameters),
        userParameters,
      )).to.equal(true);
    });

    it('Should respond with a valid response when term and legacy parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('customer_ids').to.equal(legacyParameters.customer_ids.join(','));

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, legacyParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, and zero value num_results parameter are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        ...userParameters,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('num_results').to.equal('0');

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, { num_results: 0 }, userParameters)).to.equal(true);
    });

    it('Should trim term parameter if extra spaces are provided', (done) => {
      const spaceTerm = `   ${term}   `;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        ...userParameters,
      });

      tracker.on('success', () => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(requestParams).to.have.property('term').to.equal(term);

        done();
      });

      expect(tracker.trackSearchResultsLoaded(spaceTerm, {}, userParameters)).to.equal(true);
    });

    it('Should throw an error when invalid term is provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackSearchResultsLoaded([], requiredParameters, userParameters)).to.be.an('error');
    });

    it('Should throw an error when no term is provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackSearchResultsLoaded(null, requiredParameters, userParameters)).to.be.an('error');
    });

    it('Should throw an error when invalid parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackSearchResultsLoaded(term, [], userParameters)).to.be.an('error');
    });

    it('Should throw an error when no parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackSearchResultsLoaded(term, null, userParameters)).to.be.an('error');
    });

    if (!skipNetworkTimeoutTests) {
      it('Should throw an error when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({ apiKey: testApiKey });

        tracker.on('error', () => { done(); });

        expect(tracker.trackSearchResultsLoaded(
          term,
          requiredParameters,
          userParameters,
          { timeout: 10 },
        )).to.equal(true);
      });

      it('Should throw an error when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: { timeout: 20 },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackSearchResultsLoaded(
          term,
          requiredParameters,
          userParameters,
        )).to.equal(true);
      });
    }

    it('Should limit number of customer_ids to 100 when using item_ids', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const itemIDs = [...Array(1000).keys()];
      const parameters = {
        ...requiredParameters,
        itemIds: itemIDs,
      };

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('num_results').to.equal(requiredParameters.numResults.toString());
        expect(requestParams).to.have.property('customer_ids');

        const customerIds = requestParams.customer_ids;

        expect(customerIds.split(',')).to.have.length(100);
        expect(customerIds).to.equal(itemIDs.slice(0, 100).join(','));

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, parameters, userParameters)).to.equal(true);
    });

    it('Should limit number of customer_ids to 100 when using customer_ids', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const customerIDs = [...Array(1000).keys()];
      const parameters = {
        ...requiredParameters,
        itemIds: customerIDs,
      };

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('num_results').to.equal(requiredParameters.numResults.toString());
        expect(requestParams).to.have.property('customer_ids');

        const customerIds = requestParams.customer_ids;

        expect(customerIds.split(',')).to.have.length(100);
        expect(customerIds).to.equal(customerIDs.slice(0, 100).join(','));

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, parameters, userParameters)).to.equal(true);
    });

    it('Should properly encode query parameters', (done) => {
      const specialCharacters = '+[]&';
      const userId = `user-id ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, requiredParameters, { ...userParameters, userId })).to.equal(true);
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const userId = `user-id ${breakingSpaces} user-id`;
      const userIdExpected = 'user-id     user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userIdExpected);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultsLoaded(term, requiredParameters, { ...userParameters, userId })).to.equal(true);
    });
  });

  describe('trackSearchResultClick', () => {
    const term = 'Where The Wild Things Are';
    const requiredParameters = {
      itemName: 'name',
      itemId: 'customer-id',
    };
    const legacyParameters = {
      name: 'name',
      customer_id: 'customer-id',
    };
    const optionalParameters = {
      variationId: 'foobar',
      resultId: 'result-id',
    };

    it('Backwards Compatibility - Should respond with a valid response when snake cased parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const snakeCaseParameters = {
        item_name: 'name',
        item_id: 'customer-id',
        variation_id: 'foobar',
        result_id: 'result-id',
      }

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal('true');
        expect(requestParams).to.have.property('name').to.equal(snakeCaseParameters.item_name);
        expect(requestParams).to.have.property('customer_id').to.equal(snakeCaseParameters.item_id);
        expect(requestParams).to.have.property('variation_id').to.equal(snakeCaseParameters.variation_id);
        expect(requestParams).to.have.property('result_id').to.equal(snakeCaseParameters.result_id);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, snakeCaseParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term and required parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal('true');
        expect(requestParams).to.have.property('name').to.equal(requiredParameters.itemName);
        expect(requestParams).to.have.property('customer_id').to.equal(requiredParameters.itemId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user identifier are provided', (done) => {
      const userId = 'bd2d9d1f097614c4b4de';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, requiredParameters, {
        ...userParameters,
        userId,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and segments are provided', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, requiredParameters, {
        ...userParameters,
        segments,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and test cells are provided', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, requiredParameters, {
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and origin referrer are provided', (done) => {
      const originReferrer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, requiredParameters, {
        originReferrer,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and security token are provided', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user ip are provided', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, requiredParameters, {
        userIp,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user agent are provided', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, requiredParameters, {
        userAgent,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, requiredParameters, {
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, requiredParameters, {
        ...userParameters,
        referer,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and variation id is provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('variation_id').to.equal('variation-id');

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, {
        ...requiredParameters,
        variation_id: 'variation-id',
      }, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and optional parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('result_id').to.equal(optionalParameters.resultId);
        expect(requestParams).to.have.property('variation_id').to.equal(optionalParameters.variationId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, Object.assign(
        requiredParameters,
        optionalParameters,
      ), userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term and legacy parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('customer_id').to.equal(legacyParameters.customer_id);
        expect(requestParams).to.have.property('name').to.equal(legacyParameters.name);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, legacyParameters, userParameters)).to.equal(true);
    });

    it('Should throw an error when invalid term is provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackSearchResultClick([], requiredParameters, userParameters)).to.be.an('error');
    });

    it('Should throw an error when no term is provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackSearchResultClick(null, requiredParameters, userParameters)).to.be.an('error');
    });

    it('Should throw an error when invalid parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackSearchResultClick(term, [], userParameters)).to.be.an('error');
    });

    it('Should throw an error when no parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackSearchResultClick(term, null, userParameters)).to.be.an('error');
    });

    if (!skipNetworkTimeoutTests) {
      it('Should throw an error when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({ apiKey: testApiKey });

        tracker.on('error', () => { done(); });

        expect(tracker.trackSearchResultClick(
          term,
          requiredParameters,
          userParameters,
          { timeout: 10 },
        )).to.equal(true);
      });

      it('Should throw an error when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: { timeout: 20 },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackSearchResultClick(term, requiredParameters, userParameters)).to.equal(true);
      });
    }

    it('Should properly encode path parameter', (done) => {
      const specialCharacters = '+[]&';
      const termSpecialCharacters = `apple ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestUrl = fetchSpy.args[0][0];

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestUrl).to.include(encodeURIComponent(termSpecialCharacters));

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(termSpecialCharacters, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should properly encode query parameters', (done) => {
      const specialCharacters = '+[]&';
      const userId = `user-id ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, requiredParameters, { ...userParameters, userId })).to.equal(true);
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const userId = `user-id ${breakingSpaces} user-id`;
      const userIdExpected = 'user-id     user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userIdExpected);

        // Response
        expect(responseParams).to.have.property('method').to.equal('GET');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackSearchResultClick(term, requiredParameters, { ...userParameters, userId })).to.equal(true);
    });
  });

  describe('trackConversion', () => {
    const term = 'Where The Wild Things Are';
    const requiredParameters = {
      itemId: 'labradoodle',
      revenue: 123,
    };
    const optionalParameters = {
      itemName: 'item_name',
      variationId: 'variation-id',
      section: 'Products',
    };
    const legacyParameters = {
      customer_id: 'customer-id',
      revenue: 123,
      name: 'item_name',
    };

    it('Backwards Compatibility - Should respond with a valid response when snake cased parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const snakeCaseParameters = {
        item_id: 'labradoodle',
        revenue: 123,
        item_name: 'item_name',
        variation_id: 'variation-id',
        is_custom_type: true,
        display_name: 'Add To Wishlist',
      }

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('item_id').to.equal(snakeCaseParameters.item_id);
        expect(requestParams).to.have.property('revenue').to.equal(snakeCaseParameters.revenue.toString());
        expect(requestParams).to.have.property('is_custom_type').to.equal(snakeCaseParameters.is_custom_type);
        expect(requestParams).to.have.property('item_name').to.equal(snakeCaseParameters.item_name);
        expect(requestParams).to.have.property('variation_id').to.equal(snakeCaseParameters.variation_id);
        expect(requestParams).to.have.property('display_name').to.equal(snakeCaseParameters.display_name);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, snakeCaseParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term and required parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('item_id').to.equal(requiredParameters.itemId);
        expect(requestParams).to.have.property('revenue').to.equal(requiredParameters.revenue.toString());

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters, and optional parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const queryParams = helpers.extractUrlParamsFromFetch(fetchSpy);
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(queryParams).to.have.property('section').to.equal(optionalParameters.section);
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('item_id').to.equal(requiredParameters.itemId);
        expect(requestParams).to.have.property('revenue').to.equal(requiredParameters.revenue.toString());
        expect(requestParams).to.have.property('section').to.equal(optionalParameters.section);
        expect(requestParams).to.have.property('item_name').to.equal(optionalParameters.itemName);
        expect(requestParams).to.have.property('variation_id').to.equal(optionalParameters.variationId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(
        term,
        { ...requiredParameters, ...optionalParameters },
        userParameters,
      )).to.equal(true);
    });

    it('Should respond with a valid response and section should be defaulted when term and required parameters are provided', (done) => {
      const clonedParameters = cloneDeep(requiredParameters);
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('section').to.equal('Products');

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      delete clonedParameters.section;

      expect(tracker.trackConversion(term, clonedParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user identifier are provided', (done) => {
      const userId = 'bd2d9d1f097614c4b4de';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, requiredParameters, {
        ...userParameters,
        userId,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and segments are provided', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, requiredParameters, {
        ...userParameters,
        segments,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and test cells are provided', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, requiredParameters, {
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and origin referrer are provided', (done) => {
      const originReferrer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, requiredParameters, {
        originReferrer,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and security token are provided', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user ip are provided', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, requiredParameters, {
        userIp,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user agent are provided', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, requiredParameters, {
        userAgent,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, requiredParameters, {
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, requiredParameters, {
        ...userParameters,
        referer,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and conversion type are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const fullParameters = { ...requiredParameters, type: 'add_to_wishlist' };

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('type').to.equal(fullParameters.type);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, fullParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and custom conversion type are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const fullParameters = { ...requiredParameters,
        type: 'add_to_loves',
        displayName: 'Add To Loves List',
        isCustomType: true };

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('type').to.equal(fullParameters.type);
        expect(requestParams).to.have.property('is_custom_type').to.equal(fullParameters.isCustomType);
        expect(requestParams).to.have.property('display_name').to.equal(fullParameters.displayName);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, fullParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term and legacy parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('item_id').to.equal(legacyParameters.customer_id);
        expect(requestParams).to.have.property('item_name').to.equal(legacyParameters.name);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, legacyParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when no term is provided, but parameters are', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackConversion(null, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response if is_custom_type is true, display_name is provided, and no type is specified', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const fullParameters = { ...requiredParameters,
        display_name: 'Add To Loves List',
        is_custom_type: true };

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('display_name').to.equal(fullParameters.display_name);
        expect(requestParams).to.have.property('is_custom_type').to.equal(fullParameters.is_custom_type);
        expect(requestParams).to.not.have.property('type');

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, fullParameters, userParameters)).to.equal(true);
    });

    it('Should support v1 endpoint arguments', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const parameters = {
        customer_id: 'labradoodle',
        name: 'name',
        section: 'Products',
        revenue: 123,
      };

      tracker.on('success', (responseParams) => {
        const queryParams = helpers.extractUrlParamsFromFetch(fetchSpy);
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(queryParams).to.have.property('section').to.equal(parameters.section);
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('item_id').to.equal(parameters.customer_id);
        expect(requestParams).to.have.property('item_name').to.equal(parameters.name);
        expect(requestParams).to.have.property('revenue').to.equal(parameters.revenue.toString());
        expect(requestParams).to.have.property('section').to.equal(parameters.section);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, parameters, userParameters)).to.equal(true);
    });

    it('Should respond with an error if is_custom_type is true, type is provided, and no display_name is specified', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const fullParameters = { ...requiredParameters,
        type: 'add_to_loves',
        is_custom_type: true };

      tracker.on('error', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('type').to.equal(fullParameters.type);
        expect(requestParams).to.have.property('is_custom_type').to.equal(fullParameters.is_custom_type);
        expect(requestParams).to.not.have.property('display_name');

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('Conversion type must be one of add_to_wishlist, add_to_cart, like, message, make_offer, read. If you wish to use custom conversion types, please set is_custom_type to true and specify a display_name.');

        done();
      });

      expect(tracker.trackConversion(term, fullParameters, userParameters)).to.equal(true);
    });

    it('Should trim term parameter if extra spaces are provided', (done) => {
      const spaceTerm = `   ${term}   `;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        ...userParameters,
      });

      tracker.on('success', () => {
        const bodyParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        expect(bodyParams).to.have.property('search_term').to.equal(term);

        done();
      });

      expect(tracker.trackConversion(spaceTerm, requiredParameters, userParameters)).to.equal(true);
    });

    it('Should throw an error when invalid parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackConversion(term, [], userParameters)).to.be.an('error');
    });

    it('Should throw an error when no parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackConversion(term, null, userParameters)).to.be.an('error');
    });

    if (!skipNetworkTimeoutTests) {
      it('Should throw an error when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({ apiKey: testApiKey });

        tracker.on('error', () => { done(); });

        expect(tracker.trackConversion(term, requiredParameters, userParameters, { timeout: 10 })).to.equal(true);
      });

      it('Should throw an error when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: { timeout: 20 },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackConversion(term, requiredParameters, userParameters)).to.equal(true);
      });
    }

    it('Should not encode body parameters', (done) => {
      const specialCharacters = '+[]&';
      const userId = `user-id ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, requiredParameters, { ...userParameters, userId })).to.equal(true);
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const userId = `user-id ${breakingSpaces} user-id`;
      const userIdExpected = 'user-id     user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userIdExpected);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackConversion(term, requiredParameters, { ...userParameters, userId })).to.equal(true);
    });
  });

  describe('trackPurchase', () => {
    const requiredParameters = {
      items: [
        {
          itemId: 'labradoodle',
          variationId: 'labradoodle-black',
        },
        {
          itemId: 'product55f1b3577fa84947a93ea01b91d52f45',
        },
      ],
      revenue: 123.45,
    };
    const optionalParameters = {
      orderId: '123938123',
      section: 'Products',
    };
    const snakeCaseItems = [
      {
        item_id: "labradoodle",
        variation_id: "labradoodle-black",
      },
      {
        item_id: "product55f1b3577fa84947a93ea01b91d52f45",
      },
    ];

    it('Backwards Compatibility - Should respond with a valid response when snake cased parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const snakeCaseParameters = {
        order_id: '123938123',
        revenue: 123.45,
        items: snakeCaseItems,
      }

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);
        
        try {
        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('items').to.deep.equal(snakeCaseParameters.items);
        expect(requestParams).to.have.property('revenue').to.equal(snakeCaseParameters.revenue);
        expect(requestParams).to.have.property('order_id').to.deep.equal(snakeCaseParameters.order_id);


        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
        } catch (e) {
          done(e);
        }
      });

      expect(tracker.trackPurchase(snakeCaseParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        try {
        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('items').to.deep.equal(snakeCaseItems);
        expect(requestParams).to.have.property('revenue').to.equal(requiredParameters.revenue);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
        } catch (e) {
          done(e);
        }
      });

      expect(tracker.trackPurchase(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when optional parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestQueryParams = helpers.extractUrlParamsFromFetch(fetchSpy);
        const requestBodyParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestQueryParams).to.have.property('section').to.equal(optionalParameters.section);
        expect(requestBodyParams).to.have.property('order_id').to.equal(optionalParameters.orderId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackPurchase(
        Object.assign(requiredParameters, optionalParameters),
        userParameters,
      )).to.equal(true);
    });

    it('Should respond with a valid response and section should be defaulted when required parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('section').to.equal('Products');

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackPurchase(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and user identifier are provided', (done) => {
      const userId = 'bd2d9d1f097614c4b4de';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackPurchase(requiredParameters, {
        ...userParameters,
        userId,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and segments are provided', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackPurchase(requiredParameters, {
        ...userParameters,
        segments,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and test cells are provided', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackPurchase(requiredParameters, {
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and origin referrer are provided', (done) => {
      const originReferrer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackPurchase(requiredParameters, {
        originReferrer,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and security token are provided', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackPurchase(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user ip are provided', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackPurchase(requiredParameters, {
        userIp,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user agent are provided', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackPurchase(requiredParameters, {
        userAgent,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackPurchase(requiredParameters, {
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackPurchase(requiredParameters, {
        ...userParameters,
        referer,
      })).to.equal(true);
    });

    it('Should respond with a valid response and limit items to no more than 100', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestBodyParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestBodyParams).to.have.property('items').length.to.be(100);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackPurchase(
        {
          ...requiredParameters,
          items: Array(200).fill({ item_id: 'product55f1b3a93ea01b91d52f45' }),
        },
        { ...userParameters },
      )).to.equal(true);
    });

    it('Should throw an error when invalid parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackPurchase([], userParameters)).to.be.an('error');
    });

    it('Should throw an error when no parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackPurchase(null, userParameters)).to.be.an('error');
    });

    it('Should throw an error when invalid parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackPurchase([], userParameters)).to.be.an('error');
    });

    it('Should throw an error when no parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackPurchase(null, userParameters)).to.be.an('error');
    });

    if (!skipNetworkTimeoutTests) {
      it('Should throw an error when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({ apiKey: testApiKey });

        tracker.on('error', () => { done(); });

        expect(tracker.trackPurchase(requiredParameters, userParameters, { timeout: 10 })).to.equal(true);
      });

      it('Should throw an error when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: { timeout: 20 },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackPurchase(requiredParameters, userParameters)).to.equal(true);
      });
    }

    it('Should not encode body parameters', (done) => {
      const specialCharacters = '+[]&';
      const userId = `user-id ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackPurchase(requiredParameters, { ...userParameters, userId })).to.equal(true);
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const userId = `user-id ${breakingSpaces} user-id`;
      const userIdExpected = 'user-id     user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userIdExpected);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackPurchase(requiredParameters, { ...userParameters, userId })).to.equal(true);
    });
  });

  describe('trackRecommendationView', () => {
    const requiredParameters = {
      podId: 'test_pod_id',
      numResultsViewed: 5,
      url: 'https://constructor.io',
    };
    const optionalParameters = {
      resultCount: 5,
      resultPage: 1,
      resultId: 'result-id',
      section: 'Products',
    };

    it('Backwards Compatibility - Should respond with a valid response when snake cased parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const snakeCaseParameters = {
        pod_id: 'test_pod_id',
        num_results_viewed: 5,
        url: 'https://constructor.io',
        result_count: 5,
        result_page: 1,
        result_id: 'result_id',
        section: 'Products',
      }

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('url').to.equal(snakeCaseParameters.url);
        expect(requestParams).to.have.property('pod_id').to.equal(snakeCaseParameters.pod_id);
        expect(requestParams).to.have.property('num_results_viewed').to.equal(snakeCaseParameters.num_results_viewed);
        expect(requestParams).to.have.property('result_count').to.equal(snakeCaseParameters.result_count);
        expect(requestParams).to.have.property('result_page').to.equal(snakeCaseParameters.result_page);
        expect(requestParams).to.have.property('result_id').to.equal(snakeCaseParameters.result_id);



        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackRecommendationView(snakeCaseParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('url').to.equal(requiredParameters.url);
        expect(requestParams).to.have.property('pod_id').to.equal(requiredParameters.podId);
        expect(requestParams).to.have.property('num_results_viewed').to.equal(requiredParameters.numResultsViewed);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackRecommendationView(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response and section should be defaulted when required parameters are provided', (done) => {
      const clonedParameters = cloneDeep(requiredParameters);
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('section').to.equal('Products');

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      delete clonedParameters.section;

      expect(tracker.trackRecommendationView(clonedParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required and optional parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('result_count').to.equal(optionalParameters.resultCount);
        expect(requestParams).to.have.property('result_page').to.equal(optionalParameters.resultPage);
        expect(requestParams).to.have.property('result_id').to.equal(optionalParameters.resultId);
        expect(requestParams).to.have.property('section').to.equal(optionalParameters.section);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackRecommendationView(
        Object.assign(requiredParameters, optionalParameters),
        userParameters,
      )).to.equal(true);
    });

    it('Should respond with a valid response when parameters and user identifier are provided', (done) => {
      const userId = 'bd2d9d1f097614c4b4de';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackRecommendationView(requiredParameters, {
        ...userParameters,
        userId,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and segments are provided', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackRecommendationView(requiredParameters, {
        ...userParameters,
        segments,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and test cells are provided', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackRecommendationView(requiredParameters, {
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and origin referrer are provided', (done) => {
      const originReferrer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationView(requiredParameters, {
        originReferrer,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and security token are provided', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationView(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user ip are provided', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationView(requiredParameters, {
        userIp,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user agent are provided', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationView(requiredParameters, {
        userAgent,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationView(requiredParameters, {
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationView(requiredParameters, {
        ...userParameters,
        referer,
      })).to.equal(true);
    });

    it('Should throw an error when invalid parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackRecommendationView([], userParameters)).to.be.an('error');
    });

    it('Should throw an error when no parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackRecommendationView(null, userParameters)).to.be.an('error');
    });

    if (!skipNetworkTimeoutTests) {
      it('Should throw an error when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({ apiKey: testApiKey });

        tracker.on('error', () => { done(); });

        expect(tracker.trackRecommendationView(requiredParameters, userParameters, { timeout: 10 })).to.equal(true);
      });

      it('Should throw an error when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: { timeout: 20 },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackRecommendationView(requiredParameters, userParameters)).to.equal(true);
      });
    }

    it('Should not encode body parameters', (done) => {
      const specialCharacters = '+[]&';
      const userId = `user-id ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationView(requiredParameters, { ...userParameters, userId })).to.equal(true);
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const userId = `user-id ${breakingSpaces} user-id`;
      const userIdExpected = 'user-id     user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userIdExpected);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationView(requiredParameters, { ...userParameters, userId })).to.equal(true);
    });
  });

  describe('trackRecommendationClick', () => {
    // Note: `variation_id` parameter not being passed as none are defined for this item_id in catalog
    const requiredParameters = {
      podId: 'test_pod_id',
      strategyId: 'strategy-id',
      itemId: 'product0dbae320-3950-11ea-9251-8dee6d0eb3cd-new',
    };
    const optionalParameters = {
      resultPositionOnPage: 10,
      numResultsPerPage: 5,
      resultCount: 5,
      resultPage: 1,
      resultId: 'result-id',
      section: 'Products',
    };

    it('Backwards Compatibility - Should respond with a valid response when snake cased parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const snakeCaseParameters = {
        pod_id: 'test_pod_id',
        strategy_id: 'strategy-id',
        item_id: 'product0dbae320-3950-11ea-9251-8dee6d0eb3cd-new',
        result_position_on_page: 10,
        num_results_per_page: 5,
        result_count: 5,
        result_page: 1,
        result_id: 'result-id',
        section: 'Products',
      };

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('pod_id').to.equal(snakeCaseParameters.pod_id);
        expect(requestParams).to.have.property('strategy_id').to.equal(snakeCaseParameters.strategy_id);
        expect(requestParams).to.have.property('item_id').to.equal(snakeCaseParameters.item_id);
        expect(requestParams).to.have.property('result_position_on_page').to.equal(snakeCaseParameters.result_position_on_page);
        expect(requestParams).to.have.property('num_results_per_page').to.equal(snakeCaseParameters.num_results_per_page);
        expect(requestParams).to.have.property('result_count').to.equal(snakeCaseParameters.result_count);
        expect(requestParams).to.have.property('result_page').to.equal(snakeCaseParameters.result_page);
        expect(requestParams).to.have.property('result_id').to.equal(snakeCaseParameters.result_id);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackRecommendationClick(snakeCaseParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('pod_id').to.equal(requiredParameters.podId);
        expect(requestParams).to.have.property('strategy_id').to.equal(requiredParameters.strategyId);
        expect(requestParams).to.have.property('item_id').to.equal(requiredParameters.itemId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackRecommendationClick(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when only item_name is provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const parametersWithItemName = {
        pod_id: 'test_pod_id',
        strategy_id: 'strategy-id',
        item_name: 'product',
      };

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('pod_id').to.equal(parametersWithItemName.pod_id);
        expect(requestParams).to.have.property('strategy_id').to.equal(parametersWithItemName.strategy_id);
        expect(requestParams).to.have.property('item_name').to.equal(parametersWithItemName.item_name);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackRecommendationClick(parametersWithItemName, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response and section should be defaulted when required parameters are provided', (done) => {
      const clonedParameters = cloneDeep(requiredParameters);
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('section').to.equal('Products');

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      delete clonedParameters.section;

      expect(tracker.trackRecommendationClick(clonedParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and user identifier are provided', (done) => {
      const userId = 'user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackRecommendationClick(requiredParameters, {
        ...userParameters,
        userId,
      })).to.equal(true);
    });

    it('Should respond with a valid response when parameters and segments are provided', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackRecommendationClick(requiredParameters, {
        ...userParameters,
        segments,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and test cells are provided', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackRecommendationClick(requiredParameters, {
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and origin referrer are provided', (done) => {
      const originReferrer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationClick(requiredParameters, {
        originReferrer,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and security token are provided', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationClick(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user ip are provided', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationClick(requiredParameters, {
        userIp,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user agent are provided', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationClick(requiredParameters, {
        userAgent,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationClick(requiredParameters, {
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationClick(requiredParameters, {
        ...userParameters,
        referer,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required and optional parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('result_position_on_page').to.equal(optionalParameters.resultPositionOnPage);
        expect(requestParams).to.have.property('num_results_per_page').to.equal(optionalParameters.numResultsPerPage);
        expect(requestParams).to.have.property('result_count').to.equal(optionalParameters.resultCount);
        expect(requestParams).to.have.property('result_page').to.equal(optionalParameters.resultPage);
        expect(requestParams).to.have.property('result_id').to.equal(optionalParameters.resultId);
        expect(requestParams).to.have.property('section').to.equal(optionalParameters.section);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackRecommendationClick(
        Object.assign(requiredParameters, optionalParameters),
        userParameters,
      )).to.equal(true);
    });

    it('Should throw an error when invalid parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackRecommendationClick([], userParameters)).to.be.an('error');
    });

    it('Should throw an error when no parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackRecommendationClick(null, userParameters)).to.be.an('error');
    });

    if (!skipNetworkTimeoutTests) {
      it('Should throw an error when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({ apiKey: testApiKey });

        tracker.on('error', () => { done(); });

        expect(tracker.trackRecommendationClick(requiredParameters, userParameters, { timeout: 10 })).to.equal(true);
      });

      it('Should throw an error when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: { timeout: 20 },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackRecommendationClick(requiredParameters, userParameters)).to.equal(true);
      });
    }

    it('Should not encode body parameters', (done) => {
      const specialCharacters = '+[]&';
      const userId = `user-id ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationClick(requiredParameters, { ...userParameters, userId })).to.equal(true);
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const userId = `user-id ${breakingSpaces} user-id`;
      const userIdExpected = 'user-id     user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userIdExpected);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackRecommendationClick(requiredParameters, { ...userParameters, userId })).to.equal(true);
    });
  });

  describe('trackBrowseResultsLoaded', () => {
    const requiredParameters = {
      sortBy: 'price',
      sortOrder: 'ascending',
      filterName: 'group_id',
      filterValue: 'Clothing',
      url: 'http://constructor.io',
    };
    const optionalParameters = {
      section: 'Products',
      resultCount: 5,
      resultPage: 1,
      resultId: 'result-id',
      selectedFilters: { foo: ['bar'] },
      items: [
        {
          itemId: '123',
          variationId: '456',
        },
        {
          itemId: '789',
        },
      ],
    };
    const snakeCaseItems = [
      {
        item_id: "123",
        variation_id: "456",
      },
      {
        item_id: "789",
      },
    ];

    it('Backwards Compatibility - Should respond with a valid response when snake cased parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const snakeCaseParameters = {
        sort_by: 'price',
        sort_order: 'ascending',
        filter_name: 'group_id',
        filter_value: 'Clothing',
        url: 'http://constructor.io',
        result_count: 5,
        result_page: 1,
        result_id: 'result-id',
        selected_filters: { foo: ['bar'] },
        items: snakeCaseItems
      };

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('sort_by').to.equal(snakeCaseParameters.sort_by);
        expect(requestParams).to.have.property('sort_order').to.equal(snakeCaseParameters.sort_order);
        expect(requestParams).to.have.property('filter_name').to.equal(snakeCaseParameters.filter_name);
        expect(requestParams).to.have.property('filter_value').to.equal(snakeCaseParameters.filter_value);
        expect(requestParams).to.have.property('url').to.equal(snakeCaseParameters.url);
        expect(requestParams).to.have.property('result_count').to.equal(snakeCaseParameters.result_count);
        expect(requestParams).to.have.property('result_page').to.equal(snakeCaseParameters.result_page);
        expect(requestParams).to.have.property('result_id').to.equal(snakeCaseParameters.result_id);
        expect(requestParams).to.have.property('selected_filters').to.deep.equal(snakeCaseParameters.selected_filters);
        expect(requestParams).to.have.property('items').to.deep.equal(snakeCaseParameters.items);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(snakeCaseParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('sort_by').to.equal(requiredParameters.sortBy);
        expect(requestParams).to.have.property('sort_order').to.equal(requiredParameters.sortOrder);
        expect(requestParams).to.have.property('filter_name').to.equal(requiredParameters.filterName);
        expect(requestParams).to.have.property('filter_value').to.equal(requiredParameters.filterValue);
        expect(requestParams).to.have.property('url').to.equal(requiredParameters.url);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response and section should be defaulted when required parameters are provided', (done) => {
      const clonedParameters = cloneDeep(requiredParameters);
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('section').to.equal('Products');

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      delete clonedParameters.section;

      expect(tracker.trackBrowseResultsLoaded(clonedParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and user identifier are provided', (done) => {
      const userId = 'bd2d9d1f097614c4b4de';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(requiredParameters, {
        ...userParameters,
        userId,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and segments are provided', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(requiredParameters, {
        ...userParameters,
        segments,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and test cells are provided', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(requiredParameters, {
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and origin referrer are provided', (done) => {
      const originReferrer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(requiredParameters, {
        originReferrer,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and security token are provided', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user ip are provided', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(requiredParameters, {
        userIp,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user agent are provided', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(requiredParameters, {
        userAgent,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(requiredParameters, {
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(requiredParameters, {
        ...userParameters,
        referer,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required and optional parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        ...userParameters,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('section').to.equal(optionalParameters.section);
        expect(requestParams).to.have.property('result_count').to.equal(optionalParameters.resultCount);
        expect(requestParams).to.have.property('result_page').to.equal(optionalParameters.resultPage);
        expect(requestParams).to.have.property('result_id').to.equal(optionalParameters.resultId);
        expect(requestParams).to.have.property('selected_filters').to.deep.equal(optionalParameters.selectedFilters);
        expect(requestParams).to.have.property('items').to.deep.equal(snakeCaseItems);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(
        Object.assign(requiredParameters, optionalParameters),
        userParameters,
      )).to.equal(true);
    });

    it('Should throw an error when invalid parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackBrowseResultsLoaded([], userParameters)).to.be.an('error');
    });

    it('Should throw an error when no parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackBrowseResultsLoaded(null, userParameters)).to.be.an('error');
    });

    if (!skipNetworkTimeoutTests) {
      it('Should throw an error when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({ apiKey: testApiKey });

        tracker.on('error', () => { done(); });

        expect(tracker.trackBrowseResultsLoaded(requiredParameters, userParameters, { timeout: 10 })).to.equal(true);
      });

      it('Should throw an error when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: { timeout: 20 },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackBrowseResultsLoaded(requiredParameters, userParameters)).to.equal(true);
      });
    }

    it('Should limit number of items to 100', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const parameters = {
        ...optionalParameters,
        resultCount: 1000,
        items: [...Array(1000).keys()].map((e) => ({ item_id: e.toString() })),
      };

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('section').to.equal(parameters.section);
        expect(requestParams).to.have.property('result_count').to.equal(parameters.resultCount);
        expect(requestParams).to.have.property('result_page').to.equal(parameters.resultPage);
        expect(requestParams).to.have.property('result_id').to.equal(parameters.resultId);
        expect(requestParams).to.have.property('selected_filters').to.deep.equal(parameters.selectedFilters);
        expect(requestParams).to.have.property('items').to.deep.equal(parameters.items.slice(0, 100));

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(
        Object.assign(requiredParameters, parameters),
        userParameters,
      )).to.equal(true);
    });

    it('Should not encode body parameters', (done) => {
      const specialCharacters = '+[]&';
      const userId = `user-id ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(requiredParameters, { ...userParameters, userId })).to.equal(true);
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const userId = `user-id ${breakingSpaces} user-id`;
      const userIdExpected = 'user-id     user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userIdExpected);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultsLoaded(requiredParameters, { ...userParameters, userId })).to.equal(true);
    });
  });

  describe('trackBrowseResultClick', () => {
    // Note: `variation_id` parameter not being passed as none are defined for this item_id in catalog
    const requiredParameters = {
      itemId: 'product0dbae320-3950-11ea-9251-8dee6d0eb3cd-new',
      filterName: 'group_id',
      filterValue: 'Clothing',
    };
    const optionalParameters = {
      variationId: 'product-variation',
      section: 'Products',
      resultCount: 5,
      resultPage: 1,
      resultId: 'result-id',
      resultPositionOnPage: 10,
      numResultsPerPage: 5,
      selectedFilters: { foo: ['bar'] },
    };

    it('Backwards Compatibility - Should respond with a valid response when snake cased parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const snakeCaseParameters = {
        item_id: 'product0dbae320-3950-11ea-9251-8dee6d0eb3cd-new',
        variation_id: 'product-variation',
        filter_name: 'group_id',
        filter_value: 'Clothing',
        result_count: 5,
        result_page: 1,
        result_id: 'result-id',
        result_position_on_page: 10,
        num_results_per_page: 5,
        selected_filters: { foo: ['bar'] },
      };

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('item_id').to.equal(snakeCaseParameters.item_id);
        expect(requestParams).to.have.property('filter_name').to.equal(snakeCaseParameters.filter_name);
        expect(requestParams).to.have.property('filter_value').to.equal(snakeCaseParameters.filter_value);
        expect(requestParams).to.have.property('variation_id').to.equal(snakeCaseParameters.variation_id);
        expect(requestParams).to.have.property('result_count').to.equal(snakeCaseParameters.result_count);
        expect(requestParams).to.have.property('result_page').to.equal(snakeCaseParameters.result_page);
        expect(requestParams).to.have.property('result_id').to.equal(snakeCaseParameters.result_id);
        expect(requestParams).to.have.property('result_position_on_page').to.equal(snakeCaseParameters.result_position_on_page);
        expect(requestParams).to.have.property('num_results_per_page').to.equal(snakeCaseParameters.num_results_per_page);
        expect(requestParams).to.have.property('selected_filters').to.deep.equal(snakeCaseParameters.selected_filters);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackBrowseResultClick(snakeCaseParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('item_id').to.equal(requiredParameters.itemId);
        expect(requestParams).to.have.property('filter_name').to.equal(requiredParameters.filterName);
        expect(requestParams).to.have.property('filter_value').to.equal(requiredParameters.filterValue);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackBrowseResultClick(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response and section should be defaulted when required parameters are provided', (done) => {
      const clonedParameters = cloneDeep(requiredParameters);
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('section').to.equal('Products');

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      delete clonedParameters.section;

      expect(tracker.trackBrowseResultClick(clonedParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and user identifier are provided', (done) => {
      const userId = 'bd2d9d1f097614c4b4de';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackBrowseResultClick(requiredParameters, {
        ...userParameters,
        userId,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and segments are provided', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackBrowseResultClick(requiredParameters, {
        ...userParameters,
        segments,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and test cells are provided', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property(`ef-${Object.keys(testCells)[0]}`).to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackBrowseResultClick(requiredParameters, {
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and origin referrer are provided', (done) => {
      const originReferrer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultClick(requiredParameters, {
        originReferrer,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and security token are provided', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultClick(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user ip are provided', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultClick(requiredParameters, {
        userIp,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user agent are provided', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultClick(requiredParameters, {
        userAgent,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultClick(requiredParameters, {
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultClick(requiredParameters, {
        ...userParameters,
        referer,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required and optional parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('section').to.equal(optionalParameters.section);
        expect(requestParams).to.have.property('result_count').to.equal(optionalParameters.resultCount);
        expect(requestParams).to.have.property('result_page').to.equal(optionalParameters.resultPage);
        expect(requestParams).to.have.property('result_id').to.equal(optionalParameters.resultId);
        expect(requestParams).to.have.property('result_position_on_page').to.equal(optionalParameters.resultPositionOnPage);
        expect(requestParams).to.have.property('num_results_per_page').to.equal(optionalParameters.numResultsPerPage);
        expect(requestParams).to.have.property('selected_filters').to.deep.equal(optionalParameters.selectedFilters);
        expect(requestParams).to.have.property('variation_id').to.deep.equal(optionalParameters.variationId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackBrowseResultClick(
        Object.assign(requiredParameters, optionalParameters),
        userParameters,
      )).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and non-existent item id are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const parameters = {
        ...requiredParameters,
        ...optionalParameters,
        item_id: 'non-existent-item-id',
      };

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('section').to.equal(parameters.section);
        expect(requestParams).to.have.property('result_count').to.equal(parameters.resultCount);
        expect(requestParams).to.have.property('result_page').to.equal(parameters.resultPage);
        expect(requestParams).to.have.property('result_id').to.equal(parameters.resultId);
        expect(requestParams).to.have.property('result_position_on_page').to.equal(parameters.resultPositionOnPage);
        expect(requestParams).to.have.property('num_results_per_page').to.equal(parameters.numResultsPerPage);
        expect(requestParams).to.have.property('selected_filters').to.deep.equal(parameters.selectedFilters);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultClick(parameters, userParameters)).to.equal(true);
    });

    it('Should throw an error when invalid parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackBrowseResultClick([], userParameters)).to.be.an('error');
    });

    it('Should throw an error when no parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackBrowseResultClick(null, userParameters)).to.be.an('error');
    });

    if (!skipNetworkTimeoutTests) {
      it('Should throw an error when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({ apiKey: testApiKey });

        tracker.on('error', () => { done(); });

        expect(tracker.trackBrowseResultClick(requiredParameters, userParameters, { timeout: 10 })).to.equal(true);
      });

      it('Should throw an error when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: { timeout: 20 },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackBrowseResultClick(requiredParameters, userParameters)).to.equal(true);
      });
    }

    it('Should not encode body parameters', (done) => {
      const specialCharacters = '+[]&';
      const userId = `user-id ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultClick(requiredParameters, { ...userParameters, userId })).to.equal(true);
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const userId = `user-id ${breakingSpaces} user-id`;
      const userIdExpected = 'user-id     user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userIdExpected);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackBrowseResultClick(requiredParameters, { ...userParameters, userId })).to.equal(true);
    });
  });

  describe('trackGenericResultClick', () => {
    // Note: `variation_id` parameter not being passed as none are defined for this item_id in catalog
    const requiredParameters = {
      itemId: 'product0dbae320-3950-11ea-9251-8dee6d0eb3cd-new',
    };
    const optionalParameters = {
      itemName: 'Example Product Name',
      variationId: 'product-variation',
      section: 'Products',
    };

    it('Backwards Compatibility - Should respond with a valid response when snake cased parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const snakeCaseParameters = {
        item_id: 'product0dbae320-3950-11ea-9251-8dee6d0eb3cd-new',
        item_name: 'Example Product Name',
        variation_id: 'product-variation',
      };

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('item_id').to.equal(snakeCaseParameters.item_id);
        expect(requestParams).to.have.property('item_name').to.equal(snakeCaseParameters.item_name);
        expect(requestParams).to.have.property('variation_id').to.equal(snakeCaseParameters.variation_id);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackGenericResultClick(snakeCaseParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('key');
        expect(requestParams).to.have.property('i');
        expect(requestParams).to.have.property('s');
        expect(requestParams).to.have.property('c').to.equal(clientVersion);
        expect(requestParams).to.have.property('_dt');
        expect(requestParams).to.have.property('beacon').to.equal(true);
        expect(requestParams).to.have.property('item_id').to.equal(requiredParameters.itemId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackGenericResultClick(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response and section should be defaulted when required parameters are provided', (done) => {
      const clonedParameters = cloneDeep(requiredParameters);
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('section').to.equal('Products');

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      delete clonedParameters.section;

      expect(tracker.trackGenericResultClick(clonedParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and user identifier are provided', (done) => {
      const userId = 'bd2d9d1f097614c4b4de';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackGenericResultClick(requiredParameters, {
        ...userParameters,
        userId,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and segments are provided', (done) => {
      const segments = ['foo', 'bar'];
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('us').to.deep.equal(segments);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackGenericResultClick(requiredParameters, {
        ...userParameters,
        segments,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and test cells are provided', (done) => {
      const testCells = { foo: 'bar' };
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams)
          .to.have.property(`ef-${Object.keys(testCells)[0]}`)
          .to.equal(Object.values(testCells)[0]);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackGenericResultClick(requiredParameters, {
        ...userParameters,
        testCells,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and origin referrer are provided', (done) => {
      const originReferrer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('origin_referrer').to.equal(originReferrer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackGenericResultClick(requiredParameters, {
        originReferrer,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and security token are provided', (done) => {
      const securityToken = '5219c4c62f24e9b39ef92979';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        securityToken,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('x-cnstrc-token').to.equal(securityToken);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackGenericResultClick(requiredParameters, userParameters)).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user ip are provided', (done) => {
      const userIp = '127.0.0.1';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('X-Forwarded-For').to.equal(userIp);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackGenericResultClick(requiredParameters, {
        userIp,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response when term, required parameters and user agent are provided', (done) => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('User-Agent').to.equal(userAgent);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackGenericResultClick(requiredParameters, {
        userAgent,
        ...userParameters,
      })).to.equal(true);
    });

    it('Should respond with a valid response with accept language', (done) => {
      const acceptLanguage = 'en-US';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Accept-Language').to.equal(acceptLanguage);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackGenericResultClick(requiredParameters, {
        ...userParameters,
        acceptLanguage,
      })).to.equal(true);
    });

    it('Should respond with a valid response with referer', (done) => {
      const referer = 'https://localhost';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestedHeaders = helpers.extractHeadersFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestedHeaders).to.have.property('Referer').to.equal(referer);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackGenericResultClick(requiredParameters, {
        ...userParameters,
        referer,
      })).to.equal(true);
    });

    it('Should respond with a valid response when required and optional parameters are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('section').to.equal(optionalParameters.section);
        expect(requestParams).to.have.property('item_id').to.equal(requiredParameters.itemId);
        expect(requestParams).to.have.property('item_name').to.equal(optionalParameters.itemName);
        expect(requestParams).to.have.property('variation_id').to.equal(optionalParameters.variationId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message');

        done();
      });

      expect(tracker.trackGenericResultClick(
        {...requiredParameters, ...optionalParameters},
        userParameters,
      )).to.equal(true);
    });

    it('Should respond with a valid response when required parameters and non-existent item id are provided', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });
      const parameters = {
        ...requiredParameters,
        ...optionalParameters,
        itemId: 'non-existent-item-id',
      };

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('section').to.equal(parameters.section);
        expect(requestParams).to.have.property('item_id').to.equal(parameters.itemId);
        expect(requestParams).to.have.property('item_name').to.deep.equal(parameters.itemName);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackGenericResultClick(parameters, userParameters)).to.equal(true);
    });

    it('Should throw an error when invalid parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackGenericResultClick([], userParameters)).to.be.an('error');
    });

    it('Should throw an error when no parameters are provided', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.trackGenericResultClick(null, userParameters)).to.be.an('error');
    });

    if (!skipNetworkTimeoutTests) {
      it('Should throw an error when network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({ apiKey: testApiKey });

        tracker.on('error', () => { done(); });

        expect(tracker.trackGenericResultClick(requiredParameters, userParameters, { timeout: 10 })).to.equal(true);
      });

      it('Should throw an error when global network request timeout is provided and reached', (done) => {
        const { tracker } = new ConstructorIO({
          apiKey: testApiKey,
          networkParameters: { timeout: 20 },
        });

        tracker.on('error', () => { done(); });

        expect(tracker.trackGenericResultClick(requiredParameters, userParameters)).to.equal(true);
      });
    }

    it('Should not encode body parameters', (done) => {
      const specialCharacters = '+[]&';
      const userId = `user-id ${specialCharacters}`;
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userId);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackGenericResultClick(requiredParameters, { ...userParameters, userId })).to.equal(true);
    });

    it('Should properly transform non-breaking spaces in parameters', (done) => {
      const breakingSpaces = '   ';
      const userId = `user-id ${breakingSpaces} user-id`;
      const userIdExpected = 'user-id     user-id';
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.on('success', (responseParams) => {
        const requestParams = helpers.extractBodyParamsFromFetch(fetchSpy);

        // Request
        expect(fetchSpy).to.have.been.called;
        expect(requestParams).to.have.property('ui').to.equal(userIdExpected);

        // Response
        expect(responseParams).to.have.property('method').to.equal('POST');
        expect(responseParams).to.have.property('message').to.equal('ok');

        done();
      });

      expect(tracker.trackGenericResultClick(requiredParameters, { ...userParameters, userId })).to.equal(true);
    });
  });

  describe('on', () => {
    it('Should throw an error when providing an invalid messageType parameter', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.on('invalid')).to.be.an('error');
    });

    it('Should throw an error when providing no messageType parameter', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.on(null, () => {})).to.be.an('error');
    });

    it('Should throw an error when providing an invalid callback parameter', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.on('success', {})).to.be.an('error');
    });

    it('Should throw an error when providing no callback parameter', () => {
      const { tracker } = new ConstructorIO({ apiKey: testApiKey });

      expect(tracker.on('success', null)).to.be.an('error');
    });

    it('Should receive a success message when making a request to a valid endpoint', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
      });

      tracker.trackSessionStart(userParameters);

      tracker.on('success', (response) => {
        expect(response).to.have.property('url');
        expect(response).to.have.property('method');
        expect(response).to.have.property('message').to.equal('ok');
        done();
      });
    });

    it('Should receive an error message when making a request to an endpoint that does not return valid JSON', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        serviceUrl: 'http://constructor.io',
      });

      tracker.trackSessionStart(userParameters);

      tracker.on('error', (response) => {
        expect(response).to.have.property('url');
        expect(response).to.have.property('method');
        expect(response).to.have.property('message');
        done();
      });
    });

    it('Should receive an error message when making a request to an invalid endpoint', (done) => {
      const { tracker } = new ConstructorIO({
        apiKey: testApiKey,
        fetch: fetchSpy,
        serviceUrl: 'invalid',
      });

      tracker.trackSessionStart(userParameters);

      tracker.on('error', (response) => {
        expect(response).to.have.property('url');
        expect(response).to.have.property('method');
        expect(response).to.have.property('message');
        done();
      });
    });
  });
});
