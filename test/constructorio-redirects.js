/* eslint-disable prefer-destructuring, no-unused-expressions, no-console, max-nested-callbacks */

const expect = require('chai').expect;
const Constructorio = require('../lib/constructorio');

const testConfig = {
  apiToken: 'YSOxV00F0Kk2R0KnPQN8',
  apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
};

// Helper method - create redirect rule with random properties
function addTestRedirectRule() {
  const constructorio = new Constructorio(testConfig);

  return new Promise((resolve, reject) => {
    constructorio.addRedirectRule({
      synonyms: [
        `${Math.random().toString(36).substring(2, 15)}`,
        `${Math.random().toString(36).substring(2, 15)}`,
      ],
    }, (err, response) => {
      if (err) {
        return reject(err);
      }

      return resolve(response);
    });
  });
}

// Helper method - remove redirect rule for specified id
function removeTestRedirectRule(id) {
  const constructorio = new Constructorio(testConfig);

  return new Promise((resolve, reject) => {
    constructorio.removeRedirectRule({
      redirect_rule_id: id,
    }, (err, response) => {
      if (err) {
        return reject(err);
      }

      return resolve(response);
    });
  });
}

describe('ConstructorIO - Redirect Rules', () => {
  describe('addRedirectRule', () => {
    let addedRedirectRuleId = null;

    after((done) => {
      // Clean up - remove synonym group created for tests
      removeTestRedirectRule(addedRedirectRuleId).then(() => {
        done();
      }).catch((err) => {
        console.warn('Created test redirect rule within `addRedirectRule` could not be removed');
        console.warn(err);
        done();
      });
    });

    it('should return a redirect rule id when adding a redirect rule with valid properties', (done) => {
      const constructorio = new Constructorio(testConfig);
      const url = 'https://constructor.io';

      constructorio.addRedirectRule({
        url,
        matches: [
          {
            match_type: 'EXACT',
            pattern: 'constructor',
          },
        ],
      }, (err, response) => {
        addedRedirectRuleId = response.id;

        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('start_time');
        expect(response).to.have.property('end_time');
        expect(response).to.have.property('url', url);
        expect(response).to.have.property('matches').that.is.an('array').length(1);
        expect(response).to.have.property('id').that.is.a('number');
        done();
      });
    });
  });

  describe('getRedirectRules', () => {});

  describe('getRedirectRule', () => {});

  describe('setRedirectRule', () => {});

  describe('modifyRedirectRule', () => {});

  describe('removeRedirectRule', () => {});
});
