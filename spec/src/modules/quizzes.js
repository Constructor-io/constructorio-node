/* eslint-disable no-unused-expressions, import/no-unresolved */
const jsdom = require('mocha-jsdom');
const dotenv = require('dotenv');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const nodeFetch = require('node-fetch').default;
const ConstructorIO = require('../../../test/constructorio'); // eslint-disable-line import/extensions

const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(sinonChai);
dotenv.config();

const quizApiKey = process.env.QUIZ_API_KEY;
const clientVersion = 'cio-mocha';
const bundled = process.env.BUNDLED === 'true';
const bundledDescriptionSuffix = bundled ? ' - Bundled' : '';

describe.only(`ConstructorIO - Quizzes${bundledDescriptionSuffix}`, () => {
  const validQuizId = 'etchells-emporium-quiz';
  const validAnswers = [[1, 2], [1]];
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

  describe('getNextQuiz', () => {

    it('Should be rejected if an invalid quizId is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });
      return expect(quizzes.getNextQuiz('notaquizid', {})).to.eventually.be.rejected;
    });

    it('Should be rejected if an invalid index_key/apiKey is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: 'invalidKey',
        fetch: fetchSpy,
      });
      return expect(quizzes.getNextQuiz(validQuizId, {})).to.eventually.be.rejected;
    });

    it('Should return a result provided a valid index_key and quizId', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });
      return quizzes.getNextQuiz(validQuizId, {}).then((res) => {
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

      return quizzes.getNextQuiz(validQuizId, { a: validAnswers }).then((res) => {
        expect(res).to.have.property('version_id').to.be.an('string');
        expect(res.next_question.id).to.equal(3);
        expect(res.next_question.options[0].id).to.equal(1);
      });
    });

    it('Should be rejected when network request timeout is provided and reached', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return expect(quizzes.getNextQuiz(validQuizId, {}, { timeout: 20 })).to.eventually.be.rejectedWith('The user aborted a request.');
    });

    it('Should be rejected when global network request timeout is provided and reached', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
        networkParameters: { timeout: 20 },
      });

      return expect(quizzes.getNextQuiz(validQuizId, {})).to.eventually.be.rejectedWith('The user aborted a request.');
    });
  });

  describe('getFinalizeQuiz', () => {

    it('Should be rejected if an invalid quizId is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });
      return expect(quizzes.getFinalizeQuiz('notaquizid', { a: validAnswers })).to.eventually.be.rejected;
    });

    it('Should be rejected if an invalid index_key/apiKey is provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: 'invalidKey',
        fetch: fetchSpy,
      });
      return expect(quizzes.getFinalizeQuiz(validQuizId, { a: validAnswers })).to.eventually.be.rejected;
    });

    it('Should be rejected if answers are not provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });
      return expect(quizzes.getFinalizeQuiz(validQuizId, { })).to.eventually.be.rejected;
    });

    it('Should be rejected if empty answers are provided', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });
      return expect(quizzes.getFinalizeQuiz(validQuizId, { a: [] })).to.eventually.be.rejected;
    });

    it('Should return result given answers parameter', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return quizzes.getFinalizeQuiz(validQuizId, { a: validAnswers }).then((res) => {
        expect(res).to.have.property('result').to.be.an('object');
        expect(res.result).to.have.property('browse_url').to.be.an('string');
        expect(res).to.have.property('version_id').to.be.an('string');
      });
    });

    it('Should be rejected when network request timeout is provided and reached', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
      });

      return expect(quizzes.getFinalizeQuiz(validQuizId, { a: validAnswers }, { timeout: 20 })).to.eventually.be.rejectedWith('The user aborted a request.');
    });

    it('Should be rejected when global network request timeout is provided and reached', () => {
      const { quizzes } = new ConstructorIO({
        apiKey: quizApiKey,
        fetch: fetchSpy,
        networkParameters: { timeout: 20 },
      });

      return expect(quizzes.getFinalizeQuiz(validQuizId, { a: validAnswers })).to.eventually.be.rejectedWith('The user aborted a request.');
    });
  });
});
