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
const validOptions = {
  apiKey: testApiKey,
  apiToken: testApiToken,
};
const skipNetworkTimeoutTests = process.env.SKIP_NETWORK_TIMEOUT_TESTS === 'true';

function createMockOneWaySynonymPhrase() {
  const uuid = uuidv4();

  return `phrase-${uuid}`;
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

  describe('One Way Synonyms', () => {
    describe('addOneWaySynonym', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      it('Should resolve when adding a one way synonym', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Checking Backwards Compatibility `child_phrases` - Should resolve when adding a one way synonym', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: createMockOneWaySynonymPhrase(),
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Should return error when adding a one way synonym that already exists', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejected;
      });

      it('Should return error when adding a one way synonym with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejected;
      });

      it('Should return error when adding a one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.addOneWaySynonym({
            phrase: createMockOneWaySynonymPhrase(),
            childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
          }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.addOneWaySynonym({
            phrase: createMockOneWaySynonymPhrase(),
            childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
          })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('modifyOneWaySynonym', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should resolve when modifying a one way synonym', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.modifyOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Checking Backwards Compatibility `child_phrases` - Should resolve when modifying a one way synonym', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.modifyOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          child_phrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should return an error when modifying a one way synonym that does not exist', () => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyOneWaySynonym({
          phrase: createMockOneWaySynonymPhrase(),
          childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejected;
      });

      it('Should return error when modifying an item with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejected;
      });

      it('Should return error when modifying an item with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.modifyOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.modifyOneWaySynonym({
            phrase: mockOneWaySynonymPhrase,
            childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
          }, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.modifyOneWaySynonym({
            phrase: mockOneWaySynonymPhrase,
            childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
          })).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('getOneWaySynonym', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should return a response when getting one way synonym with phrase', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getOneWaySynonym({ phrase: mockOneWaySynonymPhrase }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('one_way_synonym_relations').to.be.an('array').length(1);
          expect(res.one_way_synonym_relations[0]).to.have.property('parent_phrase').to.be.a('string').to.equal(mockOneWaySynonymPhrase);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Should return a response when getting one way synonym with phrase that does not exist', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getOneWaySynonym({ phrase: createMockOneWaySynonymPhrase() }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('one_way_synonym_relations').to.be.an('array').length(0);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting one way synonym with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getOneWaySynonym({ phrase: mockOneWaySynonymPhrase })).to.eventually.be.rejected;
      });

      it('Should return error when getting one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getOneWaySynonym({ phrase: mockOneWaySynonymPhrase })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.getOneWaySynonym(
            { phrase: mockOneWaySynonymPhrase },
            { timeout: 10 },
          )).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.getOneWaySynonym(
            { phrase: mockOneWaySynonymPhrase },
          )).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('getOneWaySynonyms', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should return a response when getting one way synonyms', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getOneWaySynonyms().then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('one_way_synonym_relations').to.be.an('array').length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Should return a response when getting one way synonyms with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getOneWaySynonyms({ numResultsPerPage: 10, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('one_way_synonym_relations').to.be.an('array').length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Backwards Compatibility `num_results_per_page` - Should return a response when getting one way synonyms with pagination parameters', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.getOneWaySynonyms({ num_results_per_page: 10, page: 1 }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('one_way_synonym_relations').to.be.an('array').length.gte(1);
          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          done();
        });
      });

      it('Should return error when getting one way synonyms with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getOneWaySynonyms()).to.eventually.be.rejected;
      });

      it('Should return error when getting one way synonyms with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.getOneWaySynonyms()).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.getOneWaySynonyms({}, { timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.getOneWaySynonyms()).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('removeOneWaySynonym', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should resolve when removing one way synonyms with phrase', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.removeOneWaySynonym({ phrase: mockOneWaySynonymPhrase }).then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Should return error when removing one way synonym with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeOneWaySynonym({ phrase: mockOneWaySynonymPhrase })).to.eventually.be.rejected;
      });

      it('Should return error when removing one way synonym with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeOneWaySynonym({ phrase: mockOneWaySynonymPhrase })).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.removeOneWaySynonym(
            { phrase: mockOneWaySynonymPhrase },
            { timeout: 10 },
          )).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.removeOneWaySynonym(
            { phrase: mockOneWaySynonymPhrase },
          )).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });

    describe('removeOneWaySynonyms', () => {
      const mockOneWaySynonymPhrase = createMockOneWaySynonymPhrase();

      before((done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.addOneWaySynonym({
          phrase: mockOneWaySynonymPhrase,
          childPhrases: [{ phrase: createMockOneWaySynonymPhrase() }],
        }).then(done);
      });

      it('Should resolve when removing one way synonyms', (done) => {
        const { catalog } = new ConstructorIO({
          ...validOptions,
          fetch: fetchSpy,
        });

        catalog.removeOneWaySynonyms().then(() => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(fetchSpy).to.have.been.called;
          expect(requestedUrlParams).to.have.property('key');
          expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
          done();
        });
      });

      it('Should return error when removing one way synonyms with an invalid API key', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiKey = 'abc123';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeOneWaySynonyms()).to.eventually.be.rejected;
      });

      it('Should return error when removing one way synonyms with an invalid API token', () => {
        const invalidOptions = cloneDeep(validOptions);

        invalidOptions.apiToken = 'foo987';

        const { catalog } = new ConstructorIO({
          ...invalidOptions,
          fetch: fetchSpy,
        });

        return expect(catalog.removeOneWaySynonyms()).to.eventually.be.rejected;
      });

      if (!skipNetworkTimeoutTests) {
        it('Should be rejected when network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO(validOptions);

          return expect(catalog.removeOneWaySynonyms({ timeout: 10 })).to.eventually.be.rejectedWith('The operation was aborted.');
        });

        it('Should be rejected when global network request timeout is provided and reached', () => {
          const { catalog } = new ConstructorIO({
            ...validOptions,
            networkParameters: { timeout: 20 },
          });

          return expect(catalog.removeOneWaySynonyms()).to.eventually.be.rejectedWith('The operation was aborted.');
        });
      }
    });
  });
});
