/* eslint-disable prefer-destructuring, no-unused-expressions */

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
      url: 'https://constructor.io',
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
  // Introduce latency to avoid throttling issues
  beforeEach((done) => {
    setTimeout(() => {
      done();
    }, 100);
  });

  describe('addRedirectRule', () => {
    const addedRedirectRuleIds = [];

    after((done) => {
      const removePromiseList = [];

      addedRedirectRuleIds.forEach((redirectRuleId) => {
        removePromiseList.push(removeTestRedirectRule(redirectRuleId));
      });

      // Remove test redirect rules for use in tests
      Promise.all(removePromiseList).then(() => {
        done();
      }).catch(done);
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

    it('should return error when adding a redirect rule with an invalid matches type', (done) => {
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

    it('should return error when adding a redirect rule without a matches parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addRedirectRule({
        url: 'https://constructor.io',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'matches is a required field of type list');
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
            pattern: 'constructor',
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
            pattern: 'constructor',
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
            pattern: 'constructor',
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
            pattern: 'constructor',
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
            pattern: 'constructor',
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'metadata must be a dictionary');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when getting a redirect rule with an invalid key/token', (done) => {
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
      const addPromiseList = [addTestRedirectRule(), addTestRedirectRule(), addTestRedirectRule()];

      // Create test redirect rules for use in tests
      Promise.all(addPromiseList).then((results) => {
        results.forEach((result) => addedRedirectRuleIds.push(result.id));
        done();
      }).catch(done);
    });

    after((done) => {
      const removePromiseList = [];

      addedRedirectRuleIds.forEach((redirectRuleId) => {
        removePromiseList.push(removeTestRedirectRule(redirectRuleId));
      });

      // Remove test redirect rules for use in tests
      Promise.all(removePromiseList).then(() => {
        done();
      }).catch(done);
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

    it('should retrieve a listing of one redirect rules when supplying num results per page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        num_results_per_page: 1,
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
        num_results_per_page: 'abc',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'num_results_per_page must be an integer');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should retrieve a listing of one redirect rules when supplying page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        page: 1,
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
        page: 'abc',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'page must be an integer');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should retrieve an empty listing of redirect rules when supplying invalid num results per page and page parameters', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        page: 99,
        num_results_per_page: 1,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('redirect_rules').an('array').length(0);
        done();
      });
    });

    it('should retrieve listing of redirect rules when supplying a valid query parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        query: 'constructor',
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('redirect_rules').an('array');
        done();
      });
    });

    it('should retrieve an empty listing of redirect rules when supplying a non-existent query parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        query: 'not-a-valid-query',
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('redirect_rules').an('array').length(0);
        done();
      });
    });

    it('should retrieve listing of redirect rules when supplying a status', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        status: 'current',
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('redirect_rules').an('array');
        done();
      });
    });

    it('should retrieve an empty listing of redirect rules when supplying an invalid status', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getRedirectRules({
        status: 'not-a-valid-status',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Invalid value for parameter: "status"');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when getting a listing of redirect rules with an invalid key/token', (done) => {
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
      // Create test redirect rule for use in tests
      addTestRedirectRule().then((response) => {
        addedRedirectRuleId = response.id;
        done();
      }).catch(done);
    });

    after((done) => {
      // Clean up - remove redirct rule created for tests
      removeTestRedirectRule(addedRedirectRuleId).then(() => {
        done();
      }).catch(done);
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

    it('should return error when retrieving a redircet rule with non-existent redirect rule id', (done) => {
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

    it('should return error when getting redirect rule listing with an invalid key/token', (done) => {
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

  describe('modifyRedirectRule', () => {
    let addedRedirectRuleId = null;

    before((done) => {
      // Create test redirect rule for use in tests
      addTestRedirectRule().then((response) => {
        addedRedirectRuleId = response.id;
        done();
      }).catch(done);
    });

    after((done) => {
      // Clean up - remove redirct rule created for tests
      removeTestRedirectRule(addedRedirectRuleId).then(() => {
        done();
      }).catch(done);
    });

    it('should return a redirect rule when completely updating a redirect rule with valid properties', (done) => {
      const constructorio = new Constructorio(testConfig);
      const updatedUrl = 'https://construct.or';

      constructorio.modifyRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        url: updatedUrl,
        matches: [
          {
            match_type: 'EXACT',
            pattern: 'mallorca',
          },
          {
            match_type: 'EXACT',
            pattern: 'spain',
          },
        ],
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('start_time');
        expect(response).to.have.property('end_time');
        expect(response).to.have.property('url', updatedUrl);
        expect(response).to.have.property('matches').that.is.an('array').length(2);
        expect(response).to.have.property('id').that.is.a('number', addedRedirectRuleId);
        done();
      });
    });

    it('should return error when completely updating a redirect rule with an invalid match type', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifyRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
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

    it('should return error when completely updating a redirect rule without a url parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifyRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
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

    it('should return error when completely updating a redirect rule without a match type', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifyRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        url: 'https://constructor.io',
        matches: [
          {
            pattern: 'constructor',
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'matches[0].match_type is a required field of type string');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when completely updating a redirect rule without a pattern', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifyRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
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

    it('should return error when completely updating a redirect rule with an invalid start time', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifyRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        start_time: 10,
        url: 'https://constructor.io',
        matches: [
          {
            match_type: 'EXACT',
            pattern: 'constructor',
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'start_time must be a datetime string');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when completely updating a redirect rule with an invalid end time', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifyRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        end_time: 10,
        url: 'https://constructor.io',
        matches: [
          {
            match_type: 'EXACT',
            pattern: 'constructor',
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'end_time must be a datetime string');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when completely updating a redirect rule with an invalid user segments parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifyRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        user_segments: 'abc',
        url: 'https://constructor.io',
        matches: [
          {
            match_type: 'EXACT',
            pattern: 'constructor',
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'user_segments must be a list');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when completely updating a redirect rule with invalid metadata', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifyRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        metadata: 'abc',
        url: 'https://constructor.io',
        matches: [
          {
            match_type: 'EXACT',
            pattern: 'constructor',
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'metadata must be a dictionary');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when getting redirect rule listing with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.modifyRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        url: 'https://constructor.io',
        matches: [
          {
            match_type: 'EXACT',
            pattern: 'mallorca',
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('updateRedirectRule', () => {
    let addedRedirectRuleId = null;

    before((done) => {
      // Create test redirect rule for use in tests
      addTestRedirectRule().then((response) => {
        addedRedirectRuleId = response.id;
        done();
      }).catch(done);
    });

    after((done) => {
      // Clean up - remove redirct rule created for tests
      removeTestRedirectRule(addedRedirectRuleId).then(() => {
        done();
      }).catch(done);
    });

    it('should return a redirect rule when setting the url of a redirect rule (partial update) with valid properties', (done) => {
      const constructorio = new Constructorio(testConfig);
      const updatedUrl = 'https://construct.or';

      constructorio.updateRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        url: updatedUrl,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('start_time');
        expect(response).to.have.property('end_time');
        expect(response).to.have.property('url', updatedUrl);
        expect(response).to.have.property('matches').that.is.an('array').length(1);
        expect(response).to.have.property('id').that.is.a('number', addedRedirectRuleId);
        done();
      });
    });

    it('should return a redirect rule when setting the matches of a redirect rule (partial update) with valid properties', (done) => {
      const constructorio = new Constructorio(testConfig);
      const updatedMatches = [
        {
          match_type: 'EXACT',
          pattern: 'mallorca',
        },
        {
          match_type: 'EXACT',
          pattern: 'spain',
        },
      ];

      constructorio.updateRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        matches: updatedMatches,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.have.property('matches').that.is.an('array', updatedMatches).length(2);
        done();
      });
    });

    it('should return a redirect rule when setting the start time of a redirect rule (partial update) with valid properties', (done) => {
      const constructorio = new Constructorio(testConfig);
      const updatedStartTime = (new Date()).toISOString();

      constructorio.updateRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        start_time: updatedStartTime,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.have.property('start_time');
        done();
      });
    });

    it('should return a redirect rule when setting the end time of a redirect rule (partial update) with valid properties', (done) => {
      const constructorio = new Constructorio(testConfig);
      const updatedEndTime = (new Date()).toISOString();

      constructorio.updateRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        end_time: updatedEndTime,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.have.property('end_time');
        done();
      });
    });

    it('should return a redirect rule when setting the user segments of a redirect rule (partial update) with valid properties', (done) => {
      const constructorio = new Constructorio(testConfig);
      const updatedUserSegments = ['foo', 'bar'];

      constructorio.updateRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        user_segments: updatedUserSegments,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.have.property('user_segments');
        done();
      });
    });

    it('should return a redirect rule when setting the metadata of a redirect rule (partial update) with valid properties', (done) => {
      const constructorio = new Constructorio(testConfig);
      const updatedMetadata = { foo: 'bar' };

      constructorio.updateRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        metadata: updatedMetadata,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.have.property('metadata');
        done();
      });
    });

    it('should return error when partially updating a redirect rule with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.updateRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        url: 'https://constructor.io',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when setting the matches of a redirect rule without a matches type', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.updateRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        matches: [
          {
            pattern: 'constructor',
          },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'matches[0].match_type is a required field of type string');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when setting the matches of a redirect rule without a pattern', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.updateRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
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

    it('should return error when setting an invalid start time of a redirect rule', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.updateRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        start_time: 10,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'start_time must be a datetime string');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when setting a redirect rule with an an invalid start time', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.updateRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        end_time: 10,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'end_time must be a datetime string');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when setting a redirect rule with an an invalid user settings parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.updateRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        user_segments: 'abc',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'user_segments must be a list');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when setting a redirect rule with an an invalid metadata', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.updateRedirectRule({
        redirect_rule_id: addedRedirectRuleId,
        metadata: 'abc',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'metadata must be a dictionary');
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('removeRedirectRule', () => {
    let addedRedirectRuleId = null;

    before((done) => {
      // Create test redirect rule for use in tests
      addTestRedirectRule().then((response) => {
        addedRedirectRuleId = response.id;
        done();
      }).catch(done);
    });

    it('should remove a redirect rule for supplied valid redirect rule id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeRedirectRule({
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

    it('should return error when removing a redirect rule with non-existent redirect rule id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeRedirectRule({
        redirect_rule_id: 0,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'Redirect rule with id 0 not found.');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when removing a redirect rule listing with an invalid key/token', (done) => {
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
});
