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
      url: `https://constructor.io`,
      matches: [
        {
          match_type: 'EXACT',
          pattern: `${Math.random().toString(36).substring(2, 15)}`,
        },
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
    let addedRedirectRuleIds = [];

    after((done) => {
      const removePromiseList = [];

      addedRedirectRuleIds.forEach((redirectRuleId) => {
        removePromiseList.push(removeTestRedirectRule(redirectRuleId));
      });

      // Remove test redirect rules for use in tests
      Promise.all(removePromiseList).then(() => {
        done();
      }).catch((err) => {
        console.warn('Test redirect rules within `addRedirectRule` could not be created');
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
        addedRedirectRuleIds.push(response.id);

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

    it('should return a redirect rule id when adding multiple redirect rules with valid properties', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addRedirectRule({
        url: 'https://constructor.io',
        matches: [
          {
            match_type: 'EXACT',
            pattern: 'constructor',
          },
          {
            match_type: 'PHRASE',
            pattern: 'io',
          },
        ],
      }, (err, response) => {
        addedRedirectRuleIds.push(response.id);

        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('matches').that.is.an('array').length(2);
        done();
      });
    });

    it('should return error when adding a redirect rule with an invalid match type', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addRedirectRule({
        url: 'https://constructor.io',
        matches: [
          {
            match_type: 'NONSENSE',
            pattern: 'constructor',
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Invalid value for parameter: "matches[0].match_type"');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when adding a redirect rule without a url parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addRedirectRule({
        matches: [
          {
            match_type: 'EXACT',
            pattern: 'constructor',
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'url is a required field of type string');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when adding a redirect rule without a match type', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addRedirectRule({
        url: 'https://constructor.io',
        matches: [
          {
            pattern: 'constructor'
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'matches[0].match_type is a required field of type string');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when adding a redirect rule without a pattern', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addRedirectRule({
        url: 'https://constructor.io',
        matches: [
          {
            match_type: 'EXACT',
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'matches[0].pattern is a required field of type string');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when adding a redirect rule with an invalid start time', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addRedirectRule({
        start_time: 10,
        url: 'https://constructor.io',
        matches: [
          {
            match_type: 'EXACT',
            pattern: 'constructor'
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'start_time must be a datetime string');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when adding a redirect rule with an invalid end time', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addRedirectRule({
        end_time: 10,
        url: 'https://constructor.io',
        matches: [
          {
            match_type: 'EXACT',
            pattern: 'constructor'
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'end_time must be a datetime string');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when adding a redirect rule with an invalid user segments parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addRedirectRule({
        user_segments: 'abc',
        url: 'https://constructor.io',
        matches: [
          {
            match_type: 'EXACT',
            pattern: 'constructor'
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'user_segments must be a list');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when adding a redirect rule with invalid metadata', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addRedirectRule({
        metadata: 'abc',
        url: 'https://constructor.io',
        matches: [
          {
            match_type: 'EXACT',
            pattern: 'constructor'
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'metadata must be a dictionary');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when getting group listing with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.addRedirectRule({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('getRedirectRules', () => {
    const addedRedirectRuleIds = [];

    before((done) => {
      // Introduce latency to avoid throttling issues
      setTimeout(() => {
        const addPromiseList = [addTestRedirectRule(), addTestRedirectRule(), addTestRedirectRule()];

        // Create test redirect rules for use in tests
        Promise.all(addPromiseList).then((results) => {
          results.forEach(result => addedRedirectRuleIds.push(result.id));
          done();
        }).catch((err) => {
          console.warn('Test redirect rules within `getRedirectRules` could not be created');
          console.warn(err);
          done();
        });
      }, 3000);
    });

    after((done) => {
      const removePromiseList = [];

      addedRedirectRuleIds.forEach((redirectRuleId) => {
        removePromiseList.push(removeTestRedirectRule(redirectRuleId));
      });

      // Remove test redirect rules for use in tests
      Promise.all(removePromiseList).then(() => {
        done();
      }).catch((err) => {
        console.warn('Test redirect rules within `getRedirectRules` could not be created');
        console.warn(err);
        done();
      });
    });

    it('should retrieve a listing of redirect rules', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({}, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('redirect_rules').an('array');
        done();
      });
    });

    it('should retrieve a listing of one redirect rules when specifying num results per page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        num_results_per_page: 1
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('redirect_rules').an('array').length(1);
        done();
      });
    });

    it('should an error when retrieving a listing of redirect rules with invalid num results per page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        num_results_per_page: 'abc'
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'num_results_per_page must be an integer');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should retrieve a listing of one redirect rules when specifying page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        page: 1
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('redirect_rules').an('array');
        done();
      });
    });

    it('should an error when retrieving a listing of redirect rules with invalid page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        page: 'abc'
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'page must be an integer');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should retrieve an empty listing of redirect rules when specifying invalid num results per page and page parameters', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        page: 99,
        num_results_per_page: 1
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('redirect_rules').an('array').length(0);
        done();
      });
    });

    it('should retrieve listing of redirect rules when specifying a valid query parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        query: 'constructor'
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('redirect_rules').an('array');
        done();
      });
    });

    it('should retrieve an empty listing of redirect rules when specifying a non-existent query parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        query: 'not-a-valid-query'
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('redirect_rules').an('array').length(0);
        done();
      });
    });

    it('should retrieve listing of redirect rules when specifying a status', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        status: 'current'
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('redirect_rules').an('array');
        done();
      });
    });

    it('should retrieve an empty listing of redirect rules when specifying an invalid status', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        status: 'not-a-valid-status'
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Invalid value for parameter: "status"');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when getting group listing with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.getRedirectRules({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('getRedirectRule', () => {
    let addedRedirectRuleId = null;

    before((done) => {
      // Introduce latency to avoid throttling issues
      setTimeout(() => {
        // Create test redirect rule for use in tests
        addTestRedirectRule().then((response) => {
          addedRedirectRuleId = response.id;
          done();
        }).catch((err) => {
          console.warn('Test synonym group within `getRedirectRule` could not be created');
          console.warn(err);
          done();
        });
      }, 3000);
    });

    after((done) => {
      // Clean up - remove redirct rule created for tests
      removeTestRedirectRule(addedRedirectRuleId).then(() => {
        done();
      }).catch((err) => {
        console.warn('Created test synonym group within `getRedirectRule` could not be removed');
        console.warn(err);
        done();
      });
    });

    it('should retrieve a redirect rule for supplied valid redirect rule id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('start_time');
        expect(response).to.have.property('end_time');
        expect(response).to.have.property('url');
        expect(response).to.have.property('matches').that.is.an('array').length(1);
        expect(response).to.have.property('id').that.is.a('number');
        done();
      });
    });

    it('should return error when retrieving a group with non-existent redirect rule id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRule({
        redirect_rule_id: 0,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Redirect rule with id 0 not found.');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when getting group listing with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.getRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('setRedirectRule', () => {});

  describe('modifyRedirectRule', () => {});

  describe('removeRedirectRule', () => {});
});
