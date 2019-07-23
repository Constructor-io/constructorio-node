/* eslint-disable prefer-destructuring, no-unused-expressions */

const expect = require('chai').expect;
const deepfreeze = require('deepfreeze');
const uuidv1 = require('uuid/v1');
const Constructorio = require('../lib/constructorio');

const testConfig = {
  apiToken: 'YSOxV00F0Kk2R0KnPQN8',
  apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
};

describe('ConstructorIO - Synonym Groups', () => {
  describe('addSynonymGroup', () => {
    it('should return a group id when adding a group with synonyms', (done) => {
      const constructorio = new Constructorio(testConfig);
      constructorio.addSynonymGroup({
        synonyms: ['0% milk', 'skim milk', 'nonfat milk']
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.an('object');
        expect(response).to.have.property('group_id').that.is.a('number');
        done();
      });
    });

    it('should return an error when adding a group with the same synonyms', (done) => {
      const constructorio = new Constructorio(testConfig);
      constructorio.addSynonymGroup({
        synonyms: ['0% milk', 'skim milk', 'nonfat milk']
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'An identical or superset synonym group already exists.');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error id when adding a group with no synonyms', (done) => {
      const constructorio = new Constructorio(testConfig);
      constructorio.addSynonymGroup({
        synonyms: []
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'This method requires at least one synonym passed in JSON. See the docs for more details.');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error id when adding a group with synonyms of incorrect type', (done) => {
      const constructorio = new Constructorio(testConfig);
      constructorio.addSynonymGroup({
        synonyms: 'abc'
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message', 'You must supply the "synonyms" parameter, and it must be of type "array".');
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return an error id when adding a group without synonyms property', (done) => {
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
        synonyms: ['0% milk', 'skim milk', 'nonfat milk']
      }, (err, response) => {
        expect(err).to.be.an('object');
        expect(err).to.have.property('message').to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });
});
