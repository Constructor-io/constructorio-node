/* eslint-disable prefer-destructuring, no-unused-expressions, no-console, max-nested-callbacks */

const expect = require('chai').expect;
const Constructorio = require('../lib/constructorio');

const testConfig = {
  apiToken: 'YSOxV00F0Kk2R0KnPQN8',
  apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
};

// Helper method - create synonym group with random synonyms
function addTestSynonymGroup() {
  const constructorio = new Constructorio(testConfig);

  return new Promise((resolve, reject) => {
    constructorio.addSynonymGroup({
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

// Helper method - remove synonym group for specified id
function removeTestSynonymGroup(id) {
  const constructorio = new Constructorio(testConfig);

  return new Promise((resolve, reject) => {
    constructorio.removeSynonymGroup({
      group_id: id,
    }, (err, response) => {
      if (err) {
        return reject(err);
      }

      return resolve(response);
    });
  });
}

describe('ConstructorIO - Synonym Groups', () => {
  describe('addSynonymGroup', () => {
    let addedSynonymGroupId = null;

    after((done) => {
      // Clean up - remove synonym group created for tests
      removeTestSynonymGroup(addedSynonymGroupId).then(done).catch((err) => {
        console.warn('Created test synonym group within `addSynonymGroup` could not be removed');
        console.warn(err);
        done();
      });
    });

    it('should return a group id when adding a group with synonyms', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addSynonymGroup({
        synonyms: ['0% milk', 'skim milk', 'nonfat milk'],
      }, (err, response) => {
        addedSynonymGroupId = response.group_id;

        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('group_id').that.is.a('number');
        done();
      });
    });

    it('should return an error when adding a group with the same synonyms', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addSynonymGroup({
        synonyms: ['0% milk', 'skim milk', 'nonfat milk'],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'An identical or superset synonym group already exists.');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when adding a group with no synonyms', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addSynonymGroup({
        synonyms: [],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'This method requires at least one synonym passed in JSON. See the docs for more details.');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when adding a group with synonyms of incorrect type', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addSynonymGroup({
        synonyms: 'abc',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'You must supply the "synonyms" parameter, and it must be of type "array".');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when adding a group without synonyms property', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addSynonymGroup({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'You must supply the "synonyms" parameter, and it must be of type "array".');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when adding a group with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.addSynonymGroup({
        synonyms: ['0% milk', 'skim milk', 'nonfat milk'],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('modifySynonymGroup', () => {
    let addedSynonymGroupId = null;

    before((done) => {
      // Introduce latency to avoid throttling issues
      setTimeout(() => {
        // Create test synonym group for use in tests
        addTestSynonymGroup().then((response) => {
          addedSynonymGroupId = response.group_id;
          done();
        }).catch((err) => {
          console.warn('Test synonym group within `modifySynonymGroup` could not be created');
          console.warn(err);
          done();
        });
      }, 3000);
    });

    after((done) => {
      // Clean up - remove synonym group created for tests
      removeTestSynonymGroup(addedSynonymGroupId).then(() => {
        done();
      }).catch((err) => {
        console.warn('Created test synonym group within `modifySynonymGroup` could not be removed');
        console.warn(err);
        done();
      });
    });

    it('should modify a group when supplying a valid group id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifySynonymGroup({
        group_id: addedSynonymGroupId,
        synonyms: ['foo', 'bar', 'baz'],
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying an invalid group id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifySynonymGroup({
        group_id: 1,
        synonyms: ['foo', 'bar', 'baz'],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no synonym group with this id associated with your autocomplete_key');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying synonyms of incorrect type', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifySynonymGroup({
        group_id: addedSynonymGroupId,
        synonyms: 'foo',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'You must supply the "synonyms" parameter, and it must be of type "array".');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when modifying a group without synonyms property', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifySynonymGroup({
        group_id: addedSynonymGroupId,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'You must supply the "synonyms" parameter, and it must be of type "array".');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when modifying a group without group id property', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifySynonymGroup({
        synonyms: ['foo', 'bar', 'baz'],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no synonym group with this id associated with your autocomplete_key');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when modifying a group with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.modifySynonymGroup({
        group_id: addedSynonymGroupId,
        synonyms: ['foo', 'bar', 'baz'],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('getSynonymGroups', () => {
    const addedSynonymGroupIds = [];
    let firstPhrase = '';

    before((done) => {
      // Introduce latency to avoid throttling issues
      setTimeout(() => {
        const addPromiseList = [addTestSynonymGroup(), addTestSynonymGroup(), addTestSynonymGroup()];

        // Create test synonym groups for use in tests
        Promise.all(addPromiseList).then((results) => {
          results.forEach(result => addedSynonymGroupIds.push(result.group_id));
          done();
        }).catch((err) => {
          console.warn('Test synonym groups within `getSynonymGroups` could not be created');
          console.warn(err);
          done();
        });
      }, 3000);
    });

    after((done) => {
      const removePromiseList = [];

      addedSynonymGroupIds.forEach((groupId) => {
        removePromiseList.push(removeTestSynonymGroup(groupId));
      });

      // Remove test synonym groups for use in tests
      Promise.all(removePromiseList).then(() => {
        done();
      }).catch((err) => {
        console.warn('Test synonym groups within `getSynonymGroups` could not be created');
        console.warn(err);
        done();
      });
    });

    it('should retrieve a listing of all groups', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSynonymGroups({}, (err, response) => {
        firstPhrase = response.synonym_groups
          && response.synonym_groups[0]
          && response.synonym_groups[0].synonyms
          && response.synonym_groups[0].synonyms[0];

        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('synonym_groups').an('array').length(3);
        done();
      });
    });

    it('should retrieve a listing of one group when supplying phrase parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      // Note: Result set is not being checked for match as phrase can take many seconds to be indexed / returned
      constructorio.getSynonymGroups({
        phrase: firstPhrase,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('synonym_groups').an('array');
        done();
      });
    });

    it('should return error when retrieving a listing of groups with non-existent phrase parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSynonymGroups({
        phrase: 'mallorca',
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('synonym_groups').an('array').length(0);
        done();
      });
    });

    it('should retrieve a listing of one group when supplying num results per page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      // Note: Result set is not being checked for match as phrase can take many seconds to be indexed / returned
      constructorio.getSynonymGroups({
        num_results_per_page: 1,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('synonym_groups').an('array');
        done();
      });
    });

    it('should return error when retrieving a listing of groups with invalid num results per page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSynonymGroups({
        num_results_per_page: 'abc',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'num_results_per_page must be an integer');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return no results when retrieving a listing of groups with invalid num results per page and page combination', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSynonymGroups({
        num_results_per_page: 1,
        page: 7,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('synonym_groups').an('array').length(0);
        done();
      });
    });

    it('should return error when retrieving a listing of groups with invalid page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSynonymGroups({
        page: 'abc',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'page must be an integer');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when getting group listing with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.getSynonymGroups({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('getSynonymGroup', () => {
    let addedSynonymGroupId = null;

    before((done) => {
      // Introduce latency to avoid throttling issues
      setTimeout(() => {
        // Create test synonym group for use in tests
        addTestSynonymGroup().then((response) => {
          addedSynonymGroupId = response.group_id;
          done();
        }).catch((err) => {
          console.warn('Test synonym group within `getSynonymGroup` could not be created');
          console.warn(err);
          done();
        });
      }, 3000);
    });

    after((done) => {
      // Clean up - remove synonym group created for tests
      removeTestSynonymGroup(addedSynonymGroupId).then(() => {
        done();
      }).catch((err) => {
        console.warn('Created test synonym group within `getSynonymGroup` could not be removed');
        console.warn(err);
        done();
      });
    });

    it('should retrieve a group for supplied valid group id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSynonymGroup({
        group_id: addedSynonymGroupId,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('synonym_groups').an('array').length(1);
        done();
      });
    });

    it('should return error when retrieving a group with non-existent group id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSynonymGroup({
        group_id: 1,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no synonym group with this id associated with your autocomplete_key');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when retrieving a group without supplying a group id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getSynonymGroup({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no synonym group with this id associated with your autocomplete_key');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when getting group listing with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.getSynonymGroup({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('removeSynonymGroups', () => {
    const addedSynonymGroupIds = [];

    before((done) => {
      // Introduce latency to avoid throttling issues
      setTimeout(() => {
        const addPromiseList = [addTestSynonymGroup(), addTestSynonymGroup(), addTestSynonymGroup()];

        // Create test synonym groups for use in tests
        Promise.all(addPromiseList).then((results) => {
          results.forEach(result => addedSynonymGroupIds.push(result.group_id));
          done();
        }).catch((err) => {
          console.warn('Test synonym groups within `getSynonymGroups` could not be created');
          console.warn(err);
          done();
        });
      }, 3000);
    });

    it('should start removal of all groups', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeSynonymGroups({}, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('message', 'We\'ve started deleting all of your synonym groups. This may take some time to complete.');
        done();
      });
    });

    it('should notify that all groups have already been deleted', (done) => {
      const constructorio = new Constructorio(testConfig);

      // It can take some time for the system to remove all items
      setTimeout(() => {
        constructorio.removeSynonymGroups({}, (err, response) => {
          expect(err).to.be.undefined;
          expect(response).to.be.an('object');
          expect(response).to.have.property('message', 'It appears there aren\'t any items to delete');
          done();
        });
      }, 3000);
    });

    it('should return error when removing groups with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.removeSynonymGroups({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('removeSynonymGroup', () => {
    let addedSynonymGroupId = null;

    before((done) => {
      // Introduce latency to avoid throttling issues
      setTimeout(() => {
        // Create test synonym group for use in tests
        addTestSynonymGroup().then((response) => {
          addedSynonymGroupId = response.group_id;
          done();
        }).catch((err) => {
          console.warn('Test synonym group within `removeSynonymGroup` could not be created');
          console.warn(err);
          done();
        });
      }, 3000);
    });

    it('should remove a group when supplying a valid group id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeSynonymGroup({
        group_id: addedSynonymGroupId,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying a valid group id that has already been removed', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeSynonymGroup({
        group_id: addedSynonymGroupId,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no synonym group with this id associated with your autocomplete_key');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying an invalid group id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeSynonymGroup({
        group_id: 1,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no synonym group with this id associated with your autocomplete_key');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying a group id of invalid type', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeSynonymGroup({
        group_id: 'abc',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no synonym group with this id associated with your autocomplete_key');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when not supplying a group id', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeSynonymGroup({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no synonym group with this id associated with your autocomplete_key');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when adding a group with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.removeSynonymGroup({
        group_id: addedSynonymGroupId,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });
});
