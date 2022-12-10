/* eslint-disable import/no-unresolved, no-unused-expressions */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const {
  cleanParams,
  throwHttpErrorFromResponse,
  isNil,
  createAuthHeader,
  applyNetworkTimeout,
  combineCustomHeaders,
  toSnakeCase,
  toSnakeCaseKeys,
} = require('../../../test/utils/helpers'); // eslint-disable-line import/extensions

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const bundled = process.env.BUNDLED === 'true';

describe('ConstructorIO - Utils - Helpers', () => {
  if (!bundled) {
    describe('cleanParams', () => {
      it('Should clean up parameters', () => {
        const params = {
          origin_referrer: 'https://test.com/search/pizza?a=bread&b=pizza burrito',
          filters: {
            size: 'large',
            color: 'green',
          },
          userId: 'boink doink yoink', // contains non-breaking spaces
          section: 'Products',
        };
        const cleanedParams = cleanParams(params);

        expect(cleanedParams).to.deep.equal({
          origin_referrer: 'https://test.com/search/pizza?a=bread&b=pizza burrito',
          filters: {
            size: 'large',
            color: 'green',
          },
          userId: 'boink doink yoink', // contains non-breaking spaces
          section: 'Products',
        });
      });
    });

    describe('toSnakeCase', () => {
      it('Should convert to camel case', () => {
        const camelCasedStr = 'helloThisIsMyWorld';
        const snakeCasedStr = toSnakeCase(camelCasedStr);

        expect(snakeCasedStr).to.equal('hello_this_is_my_world');
      });

      it('Should not modify snake case', () => {
        const camelCasedStr = 'a_lovely_day';
        const snakeCasedStr = toSnakeCase(camelCasedStr);

        expect(snakeCasedStr).to.equal('a_lovely_day');
      });
    });

    describe('toSnakeCaseKeys', () => {
      it('Should convert shallow keys', () => {
        const camelCasedObj = {
          originReferrer: 'https://test.com/search/pizza?a=bread&b=pizza burrito',
          userId: 'boink doink yoink',
          section: 'Products',
        };
        const snakeCasedObj = toSnakeCaseKeys(camelCasedObj);

        expect(snakeCasedObj).to.deep.equal({
          origin_referrer: 'https://test.com/search/pizza?a=bread&b=pizza burrito',
          user_id: 'boink doink yoink',
          section: 'Products',
        });
      });

      it('Should convert deeply nested keys', () => {
        const camelCasedObj = {
          originReferrer: 'https://test.com/search/pizza?a=bread&b=pizza burrito',
          userId: 'boink doink yoink',
          filters: {
            colorScheme: {
              redGreenBlue: 'abc_gef_hij',
            },
          },
          section: 'Products',
        };
        const snakeCasedObj = toSnakeCaseKeys(camelCasedObj, true);

        expect(snakeCasedObj).to.deep.equal({
          origin_referrer: 'https://test.com/search/pizza?a=bread&b=pizza burrito',
          user_id: 'boink doink yoink',
          filters: {
            color_scheme: {
              red_green_blue: 'abc_gef_hij',
            },
          },
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

      it('Should prefer timeout value from networkParameters (second parameter) over global options (first parameter)', (done) => {
        const controller = new AbortController();

        expect(controller.signal.aborted).to.equal(false);
        applyNetworkTimeout({ networkParameters: { timeout: 100 } }, { timeout: 50 }, controller);

        setTimeout(() => {
          expect(controller.signal.aborted).to.equal(true);
          done();
        }, 75);
      });
    });

    describe('combineCustomHeaders', () => {
      const globalOptions = {
        networkParameters: {
          headers: {
            foo: 'bar',
          },
        },
      };
      const methodOptions = {
        headers: {
          foo: 'baz',
        },
      };

      it('Should return headers when only global options headers are defined', () => {
        expect(combineCustomHeaders(globalOptions)).to.deep.equal(globalOptions.networkParameters.headers);
      });

      it('Should return headers when only local method options headers are defined', () => {
        expect(combineCustomHeaders({}, methodOptions)).to.deep.equal(methodOptions.headers);
      });

      it('Should prefer local method headers when both global and local method options headers are defined', () => {
        expect(combineCustomHeaders(globalOptions, methodOptions)).to.deep.equal(methodOptions.headers);
      });
    });
  }
});
