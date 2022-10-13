/* eslint-disable no-unused-expressions, import/no-unresolved */
const jsdom = require('mocha-jsdom');
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const nodeFetch = require('node-fetch').default;
const helpers = require('../../mocha.helpers');
const ConstructorIO = require('../../../test/constructorio'); // eslint-disable-line import/extensions

const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const quizApiKey = process.env.TEST_API_KEY;
const validClientId = '2b23dd74-5672-4379-878c-9182938d2710';
const validSessionId = '2';
const clientVersion = 'cio-mocha';

describe('ConstructorIO - Quizzes', () => {
  const validQuizId = 'test-quiz';
  const validAnswers = [[1], [1, 2], ['seen']];
  let fetchSpy;

  jsdom({ url: 'http://localhost' });

  beforeEach(() => {
    global.CLIENT_VERSION = clientVersion;
    fetchSpy = sinon.spy(nodeFetch);

  });

  afterEach(() => {
    delete global.CLIENT_VERSION;

    fetchSpy = null;
  });

  describe('getNextQuestion', () => {

    it('Should be rejected if an invalid quizId is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });
      return expect(quizzes.getNextQuestion('invalidQuizId', {})).to.eventually.be.rejected;
    });

    it('Should be rejected if an invalid apiKey is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: 'invalidKey',
        fetch: fetchSpy,
      });
      return expect(quizzes.getNextQuestion(validQuizId, {})).to.eventually.be.rejected;
    });

    it('Should return a result provided a valid apiKey and quizId', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });
      return quizzes.getNextQuestion(validQuizId, {}).then((res) => {
        expect(res).to.have.property('version_id').to.be.an('string');
        expect(res.next_question.id).to.equal(1);
        expect(res.next_question.options[0].id).to.equal(1);
      });
    });

    it('Should return result given answers parameter', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getNextQuestion(validQuizId, { a: validAnswers }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(requestedUrlParams).to.have.property('a').deep.to.equal(['1', '1,2', 'seen']);
        expect(res).to.have.property('version_id').to.be.an('string');
        expect(res.next_question.id).to.equal(4);
      });
    });

    it('Should return result with valid client + session identifiers', async () => {
      const clientSessionIdentifiers = {
        clientId: validClientId,
        sessionId: validSessionId,
      };
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      const res = await quizzes.getNextQuestion(validQuizId, { a: validAnswers }, clientSessionIdentifiers);
      const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
      expect(fetchSpy).to.have.been.called;
      expect(requestedUrlParams).to.have.property('key');
      expect(requestedUrlParams).to.have.property('i').to.equal(validClientId);
      expect(requestedUrlParams).to.have.property('s').to.equal(validSessionId);
      expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
      expect(res).to.have.property('version_id').to.be.an('string');
      expect(res.next_question.id).to.equal(4);
    });

    it('Should be rejected when network request timeout is provided and reached', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return expect(quizzes.getNextQuestion(validQuizId, {}, {}, { timeout: 20 })).to.eventually.be.rejectedWith('The user aborted a request.');
    });

    it('Should be rejected when global network request timeout is provided and reached', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
        networkParameters: { timeout: 20 },
      });

      return expect(quizzes.getNextQuestion(validQuizId, {})).to.eventually.be.rejectedWith('The user aborted a request.');
    });
  });

  describe('getQuizResults', () => {

    it('Should be rejected if an invalid quizId is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });
      return expect(quizzes.getQuizResults('invalidQuizId', { a: validAnswers })).to.eventually.be.rejected;
    });

    it('Should be rejected if an invalid apiKey is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: 'invalidKey',
        fetch: fetchSpy,
      });
      return expect(quizzes.getQuizResults(validQuizId, { a: validAnswers })).to.eventually.be.rejected;
    });

    it('Should be rejected if answers are not provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });
      return expect(quizzes.getQuizResults(validQuizId, { })).to.eventually.be.rejected;
    });

    it('Should be rejected if empty answers are provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });
      return expect(quizzes.getQuizResults(validQuizId, { a: [] })).to.eventually.be.rejected;
    });

    it('Should return result given answers parameter', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getQuizResults(validQuizId, { a: validAnswers }).then((res) => {
        const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);

        expect(requestedUrlParams).to.have.property('a').deep.to.equal(['1', '1,2', 'seen']);
        expect(res).to.have.property('result').to.be.an('object');
        expect(res.result).to.have.property('results_url').to.be.an('string');
        expect(res).to.have.property('version_id').to.be.an('string');
      });
    });

    it('Should return result with valid client + session identifiers', async () => {
      const clientSessionIdentifiers = {
        clientId: validClientId,
        sessionId: validSessionId,
      };
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      const res = await quizzes.getQuizResults(validQuizId, { a: validAnswers }, clientSessionIdentifiers);
      const requestedUrlParams = helpers.extractUrlParamsFromFetch(fetchSpy);
      expect(fetchSpy).to.have.been.called;
      expect(requestedUrlParams).to.have.property('key');
      expect(requestedUrlParams).to.have.property('i').to.equal(validClientId);
      expect(requestedUrlParams).to.have.property('s').to.equal(validSessionId);
      expect(requestedUrlParams).to.have.property('c').to.equal(clientVersion);
      expect(res).to.have.property('result').to.be.an('object');
      expect(res.result).to.have.property('results_url').to.be.an('string');
      expect(res).to.have.property('version_id').to.be.an('string');
    });

    it('Should be rejected when network request timeout is provided and reached', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return expect(quizzes.getQuizResults(validQuizId, { a: validAnswers }, { }, { timeout: 20 })).to.eventually.be.rejectedWith('The user aborted a request.');
    });

    it('Should be rejected when global network request timeout is provided and reached', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
        networkParameters: { timeout: 20 },
      });

      return expect(quizzes.getQuizResults(validQuizId, { a: validAnswers })).to.eventually.be.rejectedWith('The user aborted a request.');
    });
  });
});
