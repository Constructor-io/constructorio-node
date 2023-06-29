/* eslint-disable object-curly-newline, no-underscore-dangle */
const qs = require('qs');
const helpers = require('../utils/helpers');

// Create URL from supplied quizId and parameters
// eslint-disable-next-line max-params
function createQuizUrl(quizId, parameters, userParameters, options, path) {
  const {
    apiKey,
    version,
  } = options;
  const {
    sessionId,
    clientId,
    userId,
    segments,
  } = userParameters;
  const serviceUrl = 'https://quizzes.cnstrc.com';
  let queryParams = { c: version };
  let answersParamString = '';

  queryParams.key = apiKey;
  queryParams.i = clientId;
  queryParams.s = sessionId;

  // Pull user segments from options
  if (segments && segments.length) {
    queryParams.us = segments;
  }

  // Pull user id from options and ensure string
  if (userId) {
    queryParams.ui = String(userId);
  }

  // Validate quiz id is provided
  if (!quizId || typeof quizId !== 'string') {
    throw new Error('quizId is a required parameter of type string');
  }

  if (path === 'results' && (typeof parameters.answers !== 'object' || !Array.isArray(parameters.answers) || parameters.answers.length === 0)) {
    throw new Error('answers is a required parameter of type array');
  }

  if (parameters) {
    const { section, answers, quizVersionId, quizSessionId } = parameters;

    // Pull section from parameters
    if (section) {
      queryParams.section = section;
    }

    // Pull quiz_version_id from parameters
    if (quizVersionId) {
      queryParams.quiz_version_id = quizVersionId;
    }

    // Pull quiz_session_id from parameters
    if (quizSessionId) {
      queryParams.quiz_session_id = quizSessionId;
    }

    // Pull answers from parameters and transform
    if (answers) {
      answers.forEach((ans) => {
        answersParamString += `&${qs.stringify({ a: ans }, { arrayFormat: 'comma' })}`;
      });
    }
  }

  queryParams._dt = Date.now();
  queryParams = helpers.cleanParams(queryParams);

  const queryString = qs.stringify(queryParams, { indices: false });

  return `${serviceUrl}/v1/quizzes/${encodeURIComponent(quizId)}/${encodeURIComponent(path)}/?${queryString}${answersParamString}`;
}

/**
 * Interface to quiz related API calls
 *
 * @module quizzes
 * @inner
 * @returns {object}
 */
class Quizzes {
  constructor(options) {
    this.options = options || {};
  }

  /**
   * Retrieve quiz question from API
   *
   * @function getQuizNextQuestion
   * @description Retrieve quiz question from Constructor.io API
   * @param {string} quizId - The identifier of the quiz
   * @param {string} parameters - Additional parameters to refine result set
   * @param {array} parameters.answers - An array of answers in the format [[1,2],[1]]
   * @param {string} [parameters.section] - Product catalog section
   * @param {string} [parameters.quizVersionId] - Version identifier for the quiz. Version ID will be returned with the first request and it should be passed with subsequent requests. More information can be found [here]{@link https://docs.constructor.io/rest_api/quiz/using_quizzes/#quiz-versioning}
   * @param {string} [parameters.quizSessionId] - Session identifier for the quiz. Session ID will be returned with the first request and it should be passed with subsequent requests. More information can be found [here]{@link https://docs.constructor.io/rest_api/quiz/using_quizzes/#quiz-sessions}
   * @param {object} [userParameters] - Parameters relevant to the user request
   * @param {number} [userParameters.sessionId] - Session ID, utilized to personalize results
   * @param {string} [userParameters.clientId] - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.userIp] - Origin user IP, from client
   * @param {string} [userParameters.userAgent] - Origin user agent, from client
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/quiz/using_quizzes/#answering-a-quiz
   * @example
   * constructorio.quizzes.getQuizNextQuestion('quizId', {
   *    answers: [[1,2],[1]],
   *    section: '123',
   *    quizVersionId: '123'
   * });
   */
  getQuizNextQuestion(quizId, parameters, userParameters = {}, networkParameters = {}) {
    const headers = {};
    let requestUrl;
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createQuizUrl(quizId, parameters, userParameters, this.options, 'next');
    } catch (e) {
      return Promise.reject(e);
    }

    // Append security token as 'x-cnstrc-token' if available
    if (this.options.securityToken && typeof this.options.securityToken === 'string') {
      headers['x-cnstrc-token'] = this.options.securityToken;
    }

    // Append user IP as 'X-Forwarded-For' if available
    if (userParameters.userIp && typeof userParameters.userIp === 'string') {
      headers['X-Forwarded-For'] = userParameters.userIp;
    }

    // Append user agent as 'User-Agent' if available
    if (userParameters.userAgent && typeof userParameters.userAgent === 'string') {
      headers['User-Agent'] = userParameters.userAgent;
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, { headers, signal })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return helpers.throwHttpErrorFromResponse(new Error(), response);
      })
      .then((json) => {
        if (json.quiz_version_id) {
          return json;
        }

        throw new Error('getQuizNextQuestion response data is malformed');
      });
  }

  /**
   * Retrieves filter expression and recommendation URL from given answers
   *
   * @function getQuizResults
   * @description Retrieve quiz recommendation and filter expression from Constructor.io API
   * @param {string} quizId - The identifier of the quiz
   * @param {string} parameters - Additional parameters to refine result set
   * @param {array} parameters.answers - An array of answers in the format [[1,2],[1]]
   * @param {string} [parameters.section] - Product catalog section
   * @param {string} [parameters.quizVersionId] - Version identifier for the quiz. Version ID will be returned with the first request and it should be passed with subsequent requests. More information can be found [here]{@link https://docs.constructor.io/rest_api/quiz/using_quizzes/#quiz-versioning}
   * @param {string} [parameters.quizSessionId] - Session identifier for the quiz. Session ID will be returned with the first request and it should be passed with subsequent requests. More information can be found [here]{@link https://docs.constructor.io/rest_api/quiz/using_quizzes/#quiz-sessions}
   * @param {object} [userParameters] - Parameters relevant to the user request
   * @param {number} [userParameters.sessionId] - Session ID, utilized to personalize results
   * @param {string} [userParameters.clientId] - Client ID, utilized to personalize results
   * @param {string} [userParameters.userId] - User ID, utilized to personalize results
   * @param {string} [userParameters.segments] - User segments
   * @param {object} [userParameters.testCells] - User test cells
   * @param {string} [userParameters.userIp] - Origin user IP, from client
   * @param {string} [userParameters.userAgent] - Origin user agent, from client
   * @param {object} [networkParameters] - Parameters relevant to the network request
   * @param {number} [networkParameters.timeout] - Request timeout (in milliseconds)
   * @returns {Promise}
   * @see https://docs.constructor.io/rest_api/quiz/using_quizzes/#completing-the-quiz
   * @example
   * constructorio.quizzes.getQuizResults('quizId', {
   *    answers: [[1,2],[1]],
   *    section: '123',
   *    quizVersionId: '123'
   * });
   */
  getQuizResults(quizId, parameters, userParameters = {}, networkParameters = {}) {
    let requestUrl;
    const headers = {};
    const { fetch } = this.options;
    const controller = new AbortController();
    const { signal } = controller;

    try {
      requestUrl = createQuizUrl(quizId, parameters, userParameters, this.options, 'results');
    } catch (e) {
      return Promise.reject(e);
    }

    // Append security token as 'x-cnstrc-token' if available
    if (this.options.securityToken && typeof this.options.securityToken === 'string') {
      headers['x-cnstrc-token'] = this.options.securityToken;
    }

    // Append user IP as 'X-Forwarded-For' if available
    if (userParameters.userIp && typeof userParameters.userIp === 'string') {
      headers['X-Forwarded-For'] = userParameters.userIp;
    }

    // Append user agent as 'User-Agent' if available
    if (userParameters.userAgent && typeof userParameters.userAgent === 'string') {
      headers['User-Agent'] = userParameters.userAgent;
    }

    // Handle network timeout if specified
    helpers.applyNetworkTimeout(this.options, networkParameters, controller);

    return fetch(requestUrl, { headers, signal })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return helpers.throwHttpErrorFromResponse(new Error(), response);
      })
      .then((json) => {
        if (json.quiz_version_id) {
          return json;
        }

        throw new Error('getQuizResults response data is malformed');
      });
  }
}

module.exports = Quizzes;
