/* eslint-disable import/no-unresolved, no-unused-expressions */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const {
  ourEncodeURIComponent,
  cleanParams,
  throwHttpErrorFromResponse,
  isNil,
  applyNetworkTimeout,
  createAuthHeader,
} = require('../../../test/utils/helpers'); // eslint-disable-line import/extensions

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const bundled = process.env.BUNDLED === 'true';

describe('ConstructorIO - Utils - Helpers', () => {
  if (!bundled) {
    describe('ourEncodeURIComponent', () => {
      it('Should encode `+` appropriately (%2B)', () => {
        const string = 'boink+doink';
        const encodedString = ourEncodeURIComponent(string);

        expect(encodedString).to.equal('boink%2Bdoink');
      });

      it('Should encode `!` appropriately (%21)', () => {
        const string = 'boink!doink';
        const encodedString = ourEncodeURIComponent(string);

        expect(encodedString).to.equal('boink%21doink');
      });

      it('Should encode special characters', () => {
        const string = "jáck's boink/yoink & doinks";
        const encodedString = ourEncodeURIComponent(string);

        expect(encodedString).to.equal('j%C3%A1ck%27s%20boink%2Fyoink%20%26%20doinks');
      });

      it('Should encode non-breaking space characters as spaces (%20)', () => {
        const string = 'boink doink yoink'; // contains non-breaking spaces
        const encodedString = ourEncodeURIComponent(string);

        expect(encodedString).to.equal('boink%20doink%20yoink');
      });

      it('Should return null if it is not a string', () => {
        const notAString = 123;
        expect(ourEncodeURIComponent(notAString)).to.equal(null);
      });
    });

    describe('cleanParams', () => {
      it('Should clean up parameters', () => {
        const params = {
          origin_referrer: 'https://test.com/search/pizza?a=bread&b=pizza+burrito',
          filters: {
            size: 'large',
            color: 'green',
          },
          userId: 'boink doink yoink', // contains non-breaking spaces
          section: 'Products',
        };
        const cleanedParams = cleanParams(params);

        expect(cleanedParams).to.deep.equal({
          origin_referrer: 'https://test.com/search/pizza?a=bread&b=pizza+burrito',
          filters: {
            size: 'large',
            color: 'green',
          },
          userId: 'boink doink yoink',
          section: 'Products',
        });
      });
    });

    describe('throwHttpErrorFromResponse', () => {
      it('Should throw an error based on the information from the response', async () => {
        const errorMessage = 'Error Message';
        const responseData = {
          status: 400,
          statusText: 'Bad Request',
          url: 'https://constructor.io',
          headers: {
            'x-forwarded-for': '192.168.0.1',
          },
        };

        try {
          await throwHttpErrorFromResponse(new Error(), {
            json: () => new Promise((resolve) => {
              resolve({
                message: errorMessage,
              });
            }),
            ...responseData,
          });
        } catch (e) {
          expect(e.message).to.equal(errorMessage);
          expect(e.status).to.equal(responseData.status);
          expect(e.statusText).to.equal(responseData.statusText);
          expect(e.url).to.equal(responseData.url);
          expect(e.headers).to.deep.equal(responseData.headers);
        }
      });
    });

    describe('isNil', () => {
      it('Should return true if the value is null', () => {
        expect(isNil(null)).to.equal(true);
      });

      it('Should return false if the value is not null', () => {
        expect(isNil({})).to.equal(false);
      });
    });

    describe('createAuthHeader', () => {
      it('Should create an authorization header object', () => {
        const options = { apiToken: 'api-token' };
        const authHeader = createAuthHeader(options);

        expect(authHeader).to.deep.equal({
          Authorization: 'Basic YXBpLXRva2VuOg==',
        });
      });
    });

    describe('applyNetworkTimeout', () => {
      it('Should send an abort signal to the controller using the networkParameter timeout', (done) => {
        const controller = new AbortController();

        expect(controller.signal.aborted).to.equal(false);
        applyNetworkTimeout(null, { timeout: 50 }, controller);

        setTimeout(() => {
          expect(controller.signal.aborted).to.equal(true);
          done();
        }, 100);
      });

      it('Should send an abort signal to the controller using the options timeout', (done) => {
        const controller = new AbortController();

        expect(controller.signal.aborted).to.equal(false);
        applyNetworkTimeout({ networkParameters: { timeout: 50 } }, null, controller);

        setTimeout(() => {
          expect(controller.signal.aborted).to.equal(true);
          done();
        }, 100);
      });

      it('Should prefer timeout value from options (first parameter) over global timeout from networkParameters (second parameter)', (done) => {
        const controller = new AbortController();

        expect(controller.signal.aborted).to.equal(false);
        applyNetworkTimeout({ networkParameters: { timeout: 50 } }, { timeout: 100 }, controller);

        setTimeout(() => {
          expect(controller.signal.aborted).to.equal(true);
          done();
        }, 75);
      });
    });
  }
});
