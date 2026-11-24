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
  addHTTPSToString,
  maskPiiInUrl,
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
          deepKeys: {
            userId: 'test',
            deeperKeys: {
              userName: 'name',
            },
          },
        };
        const snakeCasedObj = toSnakeCaseKeys(camelCasedObj);

        expect(snakeCasedObj).to.deep.equal({
          origin_referrer: 'https://test.com/search/pizza?a=bread&b=pizza burrito',
          user_id: 'boink doink yoink',
          section: 'Products',
          deep_keys: {
            userId: 'test',
            deeperKeys: {
              userName: 'name',
            },
          },
        });
      });

      it('Should not convert nested arrays', () => {
        const camelCasedObj = {
          test: 'a',
          testArray: ['a', 'v'],
          testObject: { aC: 'b' },
        };
        const snakeCasedObj = toSnakeCaseKeys(camelCasedObj, true);

        expect(snakeCasedObj).to.deep.equal({
          test: 'a',
          test_array: ['a', 'v'],
          test_object: { a_c: 'b' },
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

    describe('addHTTPSToString', () => {
      it('Should return the url without any modification', () => {
        const testUrl = 'https://www.constructor.io';

        expect(addHTTPSToString(testUrl)).to.equal(testUrl);
      });

      it('Should return url with no protocol with https at the beginning', () => {
        const testUrl = 'www.constructor.io';
        const expectedUrl = 'https://www.constructor.io';

        expect(addHTTPSToString(testUrl)).to.equal(expectedUrl);
      });

      it('Should return url with an http protocol with https at the beginning', () => {
        const testUrl = 'http://www.constructor.io';
        const expectedUrl = 'https://www.constructor.io';

        expect(addHTTPSToString(testUrl)).to.equal(expectedUrl);
      });

      it('Should return null if param is not a string', () => {
        const testUrl = {};

        expect(addHTTPSToString(testUrl)).to.equal(null);
      });
    });

    describe('maskPiiInUrl', () => {
      it('Should mask an email in a query parameter of the url', () => {
        expect(maskPiiInUrl('https://example.org/?email=test@test.com')).to.equal('https://example.org/?email=%3Cemail_omitted%3E');
      });

      it('Should keep the other query parameters when masking', () => {
        const url = 'https://www.example.org/checkout/success?order=123&order_billemail=test%40test.com';

        expect(maskPiiInUrl(url)).to.equal('https://www.example.org/checkout/success?order=123&order_billemail=%3Cemail_omitted%3E');
      });

      it('Should mask an email in a path segment of the url', () => {
        expect(maskPiiInUrl('https://example.org/users/test@test.com/orders')).to.equal('https://example.org/users/%3Cemail_omitted%3E/orders');
      });

      it('Should mask a phone number and a credit card number in query parameters', () => {
        const url = 'https://example.org/?phone=%2B12345678901&card=4111111111111111';

        expect(maskPiiInUrl(url)).to.equal('https://example.org/?phone=%3Cphone_omitted%3E&card=%3Ccredit_omitted%3E');
      });

      it('Should mask the whole value when it is not a url and contains PII', () => {
        expect(maskPiiInUrl('test@test.com')).to.equal('<email_omitted>');
      });

      it('Should mask the query even when a path segment cannot be decoded', () => {
        expect(maskPiiInUrl('https://example.org/%E0%A4%A?email=test@test.com')).to.equal('https://example.org/%E0%A4%A?email=%3Cemail_omitted%3E');
      });

      it('Should mask an email inside a link nested in a query parameter', () => {
        const url = 'https://example.org/login?return_to=https%3A%2F%2Fexample.org%2F%3Femail%3Dtest%40test.com';

        expect(maskPiiInUrl(url)).to.equal('https://example.org/login?return_to=https%3A%2F%2Fexample.org%2F%3Femail%3D%253Cemail_omitted%253E');
      });

      it('Should mask an email inside a longer query value and keep the rest of the text', () => {
        expect(maskPiiInUrl('https://example.org/search?q=my%20email%20test%40test.com')).to.equal('https://example.org/search?q=my%20email%20%3Cemail_omitted%3E');
      });

      it('Should mask an email or a phone number that has a raw plus sign', () => {
        const url = 'https://example.org/?a=1&email=jane+shop@test.com&phone=+12345678901';

        expect(maskPiiInUrl(url)).to.equal('https://example.org/?a=1&email=%3Cemail_omitted%3E&phone=%3Cphone_omitted%3E');
      });

      it('Should keep the other parts of the url exactly as they were when masking', () => {
        const url = 'https://EXAMPLE.org:443/a%20b?q=a%20b&r=c+d&flag&x=%E0%A4%A&email=test@test.com#top';

        expect(maskPiiInUrl(url)).to.equal('https://EXAMPLE.org:443/a%20b?q=a%20b&r=c+d&flag&x=%E0%A4%A&email=%3Cemail_omitted%3E#top');
      });

      it('Should not throw on a nested link with a line break in its hash', () => {
        const url = 'https://site.com/?u=https%3A%2F%2Fa.com%2F%23x%0Ay';

        expect(maskPiiInUrl(url)).to.equal(url);
      });

      it('Should mask an email in a query value that cannot be decoded', () => {
        expect(maskPiiInUrl('https://site.com/?email=test@test.com%E0%A4%A')).to.equal('https://site.com/?email=%3Cemail_omitted%3E%E0%A4%A');
      });

      it('Should not throw on deeply nested links and still mask an email at the bottom', () => {
        const url = `${'a://x?u='.repeat(20000)}test@test.com`;

        expect(maskPiiInUrl(url)).to.not.include('test@test.com');
      });

      it('Should return the url unchanged when it has no PII', () => {
        [
          'https://gemini.google.com/',
          'https://www.google.com/search?q=red+shoes&oq=red%20shoes&flag',
          'https://EXAMPLE.org:443/a%20b?x=%E0%A4%A#top',
          'android-app://com.google.android.gm/',
          'not a url',
        ].forEach((url) => {
          expect(maskPiiInUrl(url)).to.equal(url);
        });
      });
    });
  }
});
