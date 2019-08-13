/* eslint-disable prefer-destructuring, no-unused-expressions */

const expect = require('chai').expect;
const Constructorio = require('../lib/constructorio');

const testConfig = {
  apiToken: 'YSOxV00F0Kk2R0KnPQN8',
  apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
};

// Helper method - create one way synonym with a random parent phrase and child phrases
function addTestOneWaySynonym(phrase) {
  const constructorio = new Constructorio(testConfig);

  return new Promise((resolve, reject) => {
    constructorio.addOneWaySynonym({
      phrase,
      child_phrases: [
        { phrase: `${Math.random().toString(36).substring(2, 15)}` },
        { phrase: `${Math.random().toString(36).substring(2, 15)}` },
      ],
    }, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    });
  });
}

// Helper method - remove one way synonym for specified parent phrase
function removeTestOneWaySynonym(phrase) {
  const constructorio = new Constructorio(testConfig);

  return new Promise((resolve, reject) => {
    constructorio.removeOneWaySynonym({
      phrase,
    }, (err, response) => {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    });
  });
}

describe.only('ConstructorIO - One Way Synonyms', () => {
  // Introduce latency to avoid throttling issues
  beforeEach((done) => {
    setTimeout(() => {
      done();
    }, 200);
  });

  describe('addOneWaySynonym', () => {
    const oneWaySynonymPhrase = 'cheese';

    after((done) => {
      // Clean up test one way synonyms
      removeTestOneWaySynonym(oneWaySynonymPhrase).then(done).catch(done);
    });

    it('should add a one way synonym', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addOneWaySynonym({
        phrase: oneWaySynonymPhrase,
        child_phrases: [
          { phrase: 'parmesan' },
          { phrase: 'gouda' },
          { phrase: 'mozzarella' },
        ],
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying a phrase that already exists', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addOneWaySynonym({
        phrase: oneWaySynonymPhrase,
        child_phrases: [
          { phrase: 'parmesan' },
          { phrase: 'gouda' },
          { phrase: 'mozzarella' },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'A one way synonym with the parent phrase "cheese" already exists.');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying child phrases of incorrect type', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addOneWaySynonym({
        phrase: oneWaySynonymPhrase,
        child_phrases: 'pizza',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'child_phrases must be a list');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when not supplying a child phrases property', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.addOneWaySynonym({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'child_phrases is a required field of type list');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.addOneWaySynonym({
        phrase: oneWaySynonymPhrase,
        child_phrases: [
          { phrase: 'parmesan' },
          { phrase: 'gouda' },
          { phrase: 'mozzarella' },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('modifyOneWaySynonym', () => {
    const oneWaySynonymPhrase = 'bread';

    before((done) => {
      // Create test one way synonyms for use in tests
      setTimeout(() => {
        addTestOneWaySynonym(oneWaySynonymPhrase).then(done).catch(done);
      }, 100);
    });

    after((done) => {
      // Clean up test one way synonyms
      removeTestOneWaySynonym(oneWaySynonymPhrase).then(done).catch(done);
    });

    it('should modify a one way synonym', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifyOneWaySynonym({
        phrase: oneWaySynonymPhrase,
        child_phrases: [
          { phrase: 'loaf' },
          { phrase: 'buns' },
          { phrase: 'toast' },
        ],
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying an invalid phrase', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifyOneWaySynonym({
        phrase: 1,
        child_phrases: [
          { phrase: 'loaf' },
          { phrase: 'buns' },
          { phrase: 'toast' },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no one way synonym with "1" as a parent phrase');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying child phrases of incorrect type', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifyOneWaySynonym({
        phrase: oneWaySynonymPhrase,
        child_phrases: 'foo',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'child_phrases must be a list');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when not supplying a child phrases property', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifyOneWaySynonym({
        phrase: oneWaySynonymPhrase,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'child_phrases is a required field of type list');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when not supplying a phrase parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.modifyOneWaySynonym({
        child_phrases: [
          { phrase: 'loaf' },
          { phrase: 'buns' },
          { phrase: 'toast' },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no one way synonym with "undefined" as a parent phrase');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.modifyOneWaySynonym({
        phrase: oneWaySynonymPhrase,
        child_phrases: [
          { phrase: 'loaf' },
          { phrase: 'buns' },
          { phrase: 'toast' },
        ],
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('getOneWaySynonyms', () => {
    const oneWaySynonymPhrases = ['spices', 'utensils', 'snacks'];

    before((done) => {
      const addPromiseList = oneWaySynonymPhrases.map(addTestOneWaySynonym);

      // Create test one way synonyms for use in tests
      Promise.all(addPromiseList).then(() => done()).catch(() => done());
    });

    after((done) => {
      const removePromiseList = oneWaySynonymPhrases.map(removeTestOneWaySynonym);

      // Clean up test one way synonyms
      Promise.all(removePromiseList).then(() => done()).catch(() => done());
    });

    it('should retrieve a listing of all one way synonyms', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getOneWaySynonyms({}, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('one_way_synonym_relations').to.be.an('array').length(3);
        done();
      });
    });

    it('should retrieve a listing of one way synonyms when supplying a phrase property', (done) => {
      const constructorio = new Constructorio(testConfig);

      // Note: Result set is not being checked for match as groups can take many seconds to be indexed / returned
      constructorio.getOneWaySynonyms({
        phrase: 'spices',
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('one_way_synonym_relations').to.be.an('array');
        done();
      });
    });

    it('should return no results when supplying a non-existent phrase property', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getOneWaySynonyms({
        phrase: 'mallorca',
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('one_way_synonym_relations').an('array').length(0);
        done();
      });
    });

    it('should retrieve a listing of one way synonyms when supplying num results per page property', (done) => {
      const constructorio = new Constructorio(testConfig);

      // Note: Result set is not being checked for match as groups can take many seconds to be indexed / returned
      constructorio.getOneWaySynonyms({
        num_results_per_page: 1,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('one_way_synonym_relations').an('array');
        done();
      });
    });

    it('should return an error when supplying an invalid num results per page property', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getOneWaySynonyms({
        num_results_per_page: 'abc',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'num_results_per_page must be an integer');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return no results when supplying an invalid num results per page and page combination', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getOneWaySynonyms({
        num_results_per_page: 1,
        page: 7,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('one_way_synonym_relations').an('array').length(0);
        done();
      });
    });

    it('should return an error when supplying an invalid page parameter', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getOneWaySynonyms({
        page: 'abc',
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'page must be an integer');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.getOneWaySynonyms({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('getOneWaySynonym', () => {
    const oneWaySynonymPhrase = 'condiments';

    before((done) => {
      // Create test one way synonyms for use in tests
      addTestOneWaySynonym(oneWaySynonymPhrase).then(done).catch(done);
    });

    after((done) => {
      // Clean up test one way synonyms
      removeTestOneWaySynonym(oneWaySynonymPhrase).then(done).catch(done);
    });

    it('should retrieve a list of one way synonyms when supplying a valid phrase', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getOneWaySynonym({
        phrase: oneWaySynonymPhrase,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('one_way_synonym_relations').an('array').length(1);
        done();
      });
    });

    it('should return no results when supplying a non-existent phrase', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getOneWaySynonym({
        phrase: 1,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('one_way_synonym_relations').an('array').length(0);
        done();
      });
    });

    it('should return no results when not supplying a phrase', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getOneWaySynonym({}, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('one_way_synonym_relations').an('array').length(0);
        done();
      });
    });

    it('should return an error when supplying an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.getOneWaySynonym({
        phrase: oneWaySynonymPhrase,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('removeOneWaySynonyms', () => {
    const oneWaySynonymPhrases = ['spices', 'utensils', 'snacks'];

    before((done) => {
      const addPromiseList = oneWaySynonymPhrases.map(addTestOneWaySynonym);

      // Create test one way synonyms for use in tests
      Promise.all(addPromiseList).then(() => done()).catch(() => done());
    });

    after((done) => {
      const removePromiseList = oneWaySynonymPhrases.map(removeTestOneWaySynonym);

      // Clean up test one way synonyms
      Promise.all(removePromiseList).then(() => done()).catch(() => done());
    });

    it('should start removal of all one way synonyms', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeOneWaySynonyms({}, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('message', 'We\'ve started deleting all of your synonym groups. This may take some time to complete.');
        done();
      });
    });

    it('should notify that all one way synonyms have already been deleted', (done) => {
      const constructorio = new Constructorio(testConfig);

      // It can take some time for the system to remove all items
      setTimeout(() => {
        constructorio.removeOneWaySynonyms({}, (err, response) => {
          expect(err).to.be.undefined;
          expect(response).to.be.an('object');
          expect(response).to.have.property('message', 'It appears there aren\'t any items to delete');
          done();
        });
      }, 3000);
    });

    it('should return an error when removing one way synonyms with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.removeOneWaySynonyms({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('removeOneWaySynonym', () => {
    const oneWaySynonymPhrase = 'berries';

    before((done) => {
      // Create test one way synonyms for use in tests
      addTestOneWaySynonym(oneWaySynonymPhrase).then(() => done()).catch(() => done());
    });

    after((done) => {
      // Clean up test one way synonyms
      removeTestOneWaySynonym(oneWaySynonymPhrase).then(() => done()).catch(() => done());
    });

    it('should remove a one way synonym when supplying a valid phrase', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeOneWaySynonym({
        phrase: oneWaySynonymPhrase,
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying a valid one way synonym that has already been removed', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeOneWaySynonym({
        phrase: oneWaySynonymPhrase,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no one way synonym with "berries" as a parent phrase');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when supplying a phrase of invalid type', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeOneWaySynonym({
        phrase: 1,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no one way synonym with "1" as a parent phrase');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when not supplying a phrase', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.removeOneWaySynonym({}, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'There is no one way synonym with "undefined" as a parent phrase');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error when adding a one way synonym with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });

      constructorio.removeOneWaySynonym({
        phrase: oneWaySynonymPhrase,
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });
});
