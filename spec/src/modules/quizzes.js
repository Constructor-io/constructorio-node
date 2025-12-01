/* eslint-disable no-unused-expressions, import/no-unresolved */
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const ConstructorIO = require('../../../test/constructorio'); // eslint-disable-line import/extensions
const helpers = require('../../mocha.helpers');

const nodeFetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const quizApiKey = process.env.TEST_REQUEST_API_KEY;
const clientId = '2b23dd74-5672-4379-878c-9182938d2710';
const sessionId = '2';
const clientVersion = 'cio-mocha';
const skipNetworkTimeoutTests = process.env.SKIP_NETWORK_TIMEOUT_TESTS === 'true';
const quizSessionId = 'session-id';

describe('ConstructorIO - Quizzes', () => {
  const validQuizId = 'test-quiz';
  const validAnswers = [[1], [1, 2], ['seen']];
  let fetchSpy;

  beforeEach(() => {
    global.CLIENT_VERSION = clientVersion;
    fetchSpy = sinon.spy(nodeFetch);
  });

  afterEach(() => {
    delete global.CLIENT_VERSION;

    fetchSpy = null;
  });

  describe('getQuizNextQuestion', () => {
    it('Should return a result provided a valid apiKey and quizId', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizNextQuestion(validQuizId, {}, { clientId, sessionId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('quiz_version_id').to.be.an('string');
        expect(res).to.have.property('quiz_session_id').to.be.an('string');
        expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
        expect(res).to.have.property('next_question').to.be.an('object');
        expect(res.next_question.id).to.equal(1);
        expect(res.next_question.options[0].id).to.equal(1);
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('i');
        expect(requestedUrlParams).to.have.property('s');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        expect(requestedUrlParams).to.have.property('_dt');
      });
    });

    it('Should return a result provided a valid apiKey, quizId and section', () => {
      const section = 'Products';
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizNextQuestion(validQuizId, { section }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('quiz_version_id').to.be.an('string');
        expect(res).to.have.property('quiz_session_id').to.be.an('string');
        expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
        expect(res).to.have.property('next_question').to.be.an('object');
        expect(res.next_question.id).to.equal(1);
        expect(res.next_question.options[0].id).to.equal(1);
        expect(requestedUrlParams).to.have.property('section').to.equal(section);
      });
    });

    it('Should return a result provided a valid apiKey, quizId, quizVersionId, and quizSessionId', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizNextQuestion(validQuizId).then((initialResponse) => {
        const { quiz_version_id: quizVersionId } = initialResponse;

        return quizzes.getQuizNextQuestion(validQuizId, { quizSessionId, quizVersionId }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('quiz_version_id').to.be.an('string').to.equal(quizVersionId);
          expect(res).to.have.property('quiz_session_id').to.be.an('string');
          expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
          expect(res).to.have.property('next_question').to.be.an('object');
          expect(res.next_question.id).to.equal(1);
          expect(res.next_question.options[0].id).to.equal(1);
          expect(requestedUrlParams).to.have.property('quiz_version_id').to.equal(quizVersionId);
          expect(requestedUrlParams).to.have.property('quiz_session_id').to.equal(quizSessionId);
        });
      });
    });

    it('Should return a result provided a valid apiKey, quizId and user id', () => {
      const userId = 'user-id';
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizNextQuestion(validQuizId, {}, { userId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('quiz_version_id').to.be.an('string');
        expect(res).to.have.property('quiz_session_id').to.be.an('string');
        expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
        expect(res).to.have.property('next_question').to.be.an('object');
        expect(res.next_question.id).to.equal(1);
        expect(res.next_question.options[0].id).to.equal(1);
        expect(requestedUrlParams).to.have.property('ui').to.equal(userId);
      });
    });

    it('Should return a result provided a valid apiKey, quizId and segments', () => {
      const segments = ['foo', 'bar'];
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizNextQuestion(validQuizId, {}, { segments }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('quiz_version_id').to.be.an('string');
        expect(res).to.have.property('quiz_session_id').to.be.an('string');
        expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
        expect(res).to.have.property('next_question').to.be.an('object');
        expect(res.next_question.id).to.equal(1);
        expect(res.next_question.options[0].id).to.equal(1);
        expect(requestedUrlParams).to.have.property('us').to.deep.equal(segments);
      });
    });

    it('Should return result given answers parameter', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizNextQuestion(validQuizId, { answers: validAnswers }).then((res) => {
        expect(res).to.have.property('quiz_version_id').to.be.an('string');
        expect(res).to.have.property('quiz_session_id').to.be.an('string');
        expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
        expect(res).to.have.property('next_question').to.be.an('object');
        expect(res.next_question.id).to.equal(4);
      });
    });

    it('Should skip tracking', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizNextQuestion(validQuizId, { answers: validAnswers, skipTracking: true }).then(() => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(requestedUrlParams).to.have.property('skip_tracking').to.equal('true');
      });
    });

    it('Should be rejected if an invalid quizId is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return expect(quizzes.getQuizNextQuestion('invalidQuizId', {})).to.eventually.be.rejected;
    });

    it('Should be rejected if no quizId is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return expect(quizzes.getQuizNextQuestion(null, {})).to.eventually.be.rejected;
    });

    it('Should be rejected if an invalid quizVersionId is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return expect(quizzes.getQuizNextQuestion(validQuizId, { quizVersionId: 'foo' })).to.eventually.be.rejected;
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', () => {
        const { quizzes } = new ConstructorIO({
          apiKey: quizApiKey,
          fetch: fetchSpy,
        });

        return expect(quizzes.getQuizNextQuestion(validQuizId, {}, {}, { timeout: 20 })).to.eventually.be.rejectedWith('The operation was aborted.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { quizzes } = new ConstructorIO({
          apiKey: quizApiKey,
          fetch: fetchSpy,
          networkParameters: { timeout: 20 },
        });

        return expect(quizzes.getQuizNextQuestion(validQuizId, {})).to.eventually.be.rejectedWith('The operation was aborted.');
      });
    }

    it('Should be rejected if an invalid apiKey is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: 'invalidKey',
        fetch: fetchSpy,
      });

      return expect(quizzes.getQuizNextQuestion(validQuizId, {})).to.eventually.be.rejected;
    });

    it('Should include requestUrl in the promise for getQuizNextQuestion', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      const promise = quizzes.getQuizNextQuestion(validQuizId, {}, { clientId, sessionId });
      expect(promise).to.have.property('requestUrl').that.is.a('string');
    });
  });

  describe('getQuizResults', () => {
    it('Should return result given valid API key and answers parameter', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizResults(validQuizId, { answers: validAnswers }, { clientId, sessionId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res).to.have.property('quiz_version_id').to.be.an('string');
        expect(res).to.have.property('quiz_session_id').to.be.an('string');
        expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
        expect(fetchSpy).to.have.been.called;
        expect(requestedUrlParams).to.have.property('key');
        expect(requestedUrlParams).to.have.property('i');
        expect(requestedUrlParams).to.have.property('s');
        expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
        expect(requestedUrlParams).to.have.property('_dt');
      });
    });

    it('Should return a result given valid API key, answers and page parameters', () => {
      const page = '2';
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizResults(validQuizId, { answers: validAnswers, page }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res).to.have.property('quiz_version_id').to.be.an('string');
        expect(res).to.have.property('quiz_session_id').to.be.an('string');
        expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
        expect(requestedUrlParams).to.have.property('page').to.equal(page);
      });
    });

    it('Should return a result given valid API key, answers and resultsPerPage parameters', () => {
      const resultsPerPage = '2';
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizResults(validQuizId, { answers: validAnswers, resultsPerPage }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res).to.have.property('quiz_version_id').to.be.an('string');
        expect(res).to.have.property('quiz_session_id').to.be.an('string');
        expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
        expect(requestedUrlParams).to.have.property('num_results_per_page').to.equal(resultsPerPage);
      });
    });

    it('Should return a result given valid API key, answers and filters parameters', () => {
      const filters = { Color: ['Blue'] };
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizResults(validQuizId, { answers: validAnswers, filters }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res).to.have.property('quiz_version_id').to.be.an('string');
        expect(res).to.have.property('quiz_session_id').to.be.an('string');
        expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
        expect(requestedUrlParams.filters).to.have.property('Color').to.equal(Object.values(filters)[0][0]);
      });
    });

    it('Should return a result given valid API key, answers and section parameters', () => {
      const section = 'Products';
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizResults(validQuizId, { answers: validAnswers, section }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res).to.have.property('quiz_version_id').to.be.an('string');
        expect(res).to.have.property('quiz_session_id').to.be.an('string');
        expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
        expect(requestedUrlParams).to.have.property('section').to.equal(section);
      });
    });

    it('Should return a result provided a valid apiKey, quizId, quizVersionId, and quizSessionId', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizResults(validQuizId, { answers: validAnswers }).then((initialResponse) => {
        const { quiz_version_id: quizVersionId } = initialResponse;

        // eslint-disable-next-line max-len
        return quizzes.getQuizResults(validQuizId, { answers: validAnswers, quizVersionId, quizSessionId }).then((res) => {
          const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

          expect(res).to.have.property('request').to.be.an('object');
          expect(res).to.have.property('response').to.be.an('object');
          expect(res).to.have.property('result_id').to.be.an('string');
          expect(res.response).to.have.property('results').to.be.an('array');
          expect(res).to.have.property('quiz_version_id').to.equal(quizVersionId);
          expect(res).to.have.property('quiz_session_id').to.equal(quizSessionId);
          expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
          expect(requestedUrlParams).to.have.property('quiz_version_id').to.equal(quizVersionId);
          expect(requestedUrlParams).to.have.property('quiz_session_id').to.equal(quizSessionId);
        });
      });
    });

    it('Should return a result provided a valid apiKey, quizId and user id', () => {
      const userId = 'user-id';
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizResults(validQuizId, { answers: validAnswers }, { userId }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res).to.have.property('quiz_version_id').to.be.an('string');
        expect(res).to.have.property('quiz_session_id').to.be.an('string');
        expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
        expect(requestedUrlParams).to.have.property('ui').to.equal(userId);
      });
    });

    it('Should return a result provided a valid apiKey, quizId and segments', () => {
      const segments = ['foo', 'bar'];
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizResults(validQuizId, { answers: validAnswers }, { segments }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(res).to.have.property('request').to.be.an('object');
        expect(res).to.have.property('response').to.be.an('object');
        expect(res).to.have.property('result_id').to.be.an('string');
        expect(res.response).to.have.property('results').to.be.an('array');
        expect(res).to.have.property('quiz_version_id').to.be.an('string');
        expect(res).to.have.property('quiz_session_id').to.be.an('string');
        expect(res).to.have.property('quiz_id').to.be.an('string').to.equal(validQuizId);
        expect(requestedUrlParams).to.have.property('us').to.deep.equal(segments);
      });
    });

    it('Should be rejected if no quizId is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return expect(quizzes.getQuizResults(null, { answers: validAnswers })).to.eventually.be.rejected;
    });

    it('Should be rejected if an invalid quizId is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return expect(quizzes.getQuizResults('invalidQuizId', { answers: validAnswers })).to.eventually.be.rejected;
    });

    it('Should be rejected if an invalid quizVersionId is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return expect(quizzes.getQuizResults(validQuizId, { answers: validAnswers, quizVersionId: 'foo' })).to.eventually.be.rejected;
    });

    it('Should be rejected if an invalid apiKey is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: 'invalidKey',
        fetch: fetchSpy,
      });

      return expect(quizzes.getQuizResults(validQuizId, { answers: validAnswers })).to.eventually.be.rejected;
    });

    it('Should be rejected if answers are not provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return expect(quizzes.getQuizResults(validQuizId, {})).to.eventually.be.rejected;
    });

    it('Should be rejected if empty answers are provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return expect(quizzes.getQuizResults(validQuizId, { answers: [] })).to.eventually.be.rejected;
    });

    if (!skipNetworkTimeoutTests) {
      it('Should be rejected when network request timeout is provided and reached', () => {
        const { quizzes } = new ConstructorIO({
          apiKey: quizApiKey,
          fetch: fetchSpy,
        });

        return expect(quizzes.getQuizResults(validQuizId, { answers: validAnswers }, {}, { timeout: 20 })).to.eventually.be.rejectedWith('The operation was aborted.');
      });

      it('Should be rejected when global network request timeout is provided and reached', () => {
        const { quizzes } = new ConstructorIO({
          apiKey: quizApiKey,
          fetch: fetchSpy,
          networkParameters: { timeout: 20 },
        });

        return expect(quizzes.getQuizResults(validQuizId, { answers: validAnswers })).to.eventually.be.rejectedWith('The operation was aborted.');
      });
    }

    it('Should include requestUrl in the promise for getQuizResults', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      const promise = quizzes.getQuizResults(validQuizId, { answers: validAnswers });
      expect(promise).to.have.property('requestUrl').that.is.a('string');
    });
  });
});
