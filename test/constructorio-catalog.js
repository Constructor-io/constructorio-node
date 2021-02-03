/* eslint-disable prefer-destructuring, no-unused-expressions */

const expect = require('chai').expect;
const fs = require('fs');
const path = require('path');
const Constructorio = require('../lib/constructorio');

const testConfig = {
  apiToken: process.env.TOKEN,
  apiKey: 'key_dsE9a33xJ0tt0tCS',
};

describe('ConstructorIO - Catalog', () => {
  describe('updateCatalog', () => {
    it('should error if no files were submitted', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        section: 'Products',
      };

      constructorio.updateCatalog(data, (err, response) => {
        expect(err).to.exist;
        expect(err.message).to.eq('At least one file of "items", "variations", "item_groups" is required to be in form-data');
        expect(response).to.be.undefined;
        done();
      });
    }).timeout(30000);

    it('should update a catalog of items', (done) => {
      const constructorio = new Constructorio(testConfig);
      const filePath = path.join(process.cwd(), './test/csv/items.csv');
      const itemsStream = fs.createReadStream(filePath);
      const data = {
        items: itemsStream,
        section: 'Products',
      };

      constructorio.updateCatalog(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.exist;
        expect(response.task_id).to.exist;
        done();
      });
    }).timeout(30000);

    it('should update a catalog of variations', (done) => {
      const constructorio = new Constructorio(testConfig);
      const filePath = path.join(process.cwd(), './test/csv/variations.csv');
      const variationStream = fs.createReadStream(filePath);
      const data = {
        variations: variationStream,
        section: 'Products',
      };

      constructorio.updateCatalog(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.exist;
        expect(response.task_id).to.exist;
        done();
      });
    }).timeout(30000);

    it('should update a catalog of item groups', (done) => {
      const constructorio = new Constructorio(testConfig);
      const filePath = path.join(process.cwd(), './test/csv/item_groups.csv');
      const itemGroupsStream = fs.createReadStream(filePath);
      const data = {
        item_groups: itemGroupsStream,
        section: 'Products',
      };

      constructorio.updateCatalog(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.exist;
        expect(response.task_id).to.exist;
        done();
      });
    }).timeout(30000);
  });

  describe('replaceCatalog', () => {
    it('should error if no files were submitted', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        section: 'Products',
      };

      constructorio.replaceCatalog(data, (err, response) => {
        expect(err).to.exist;
        expect(err.message).to.eq('At least one file of "items", "variations", "item_groups" is required to be in form-data');
        expect(response).to.be.undefined;
        done();
      });
    }).timeout(30000);

    it('should replace a catalog of items', (done) => {
      const constructorio = new Constructorio(testConfig);
      const filePath = path.join(process.cwd(), './test/csv/items.csv');
      const itemsStream = fs.createReadStream(filePath);
      const data = {
        items: itemsStream,
        section: 'Products',
      };

      constructorio.replaceCatalog(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.exist;
        expect(response.task_id).to.exist;
        done();
      });
    }).timeout(30000);

    it('should replace a catalog of variations', (done) => {
      const constructorio = new Constructorio(testConfig);
      const filePath = path.join(process.cwd(), './test/csv/variations.csv');
      const variationStream = fs.createReadStream(filePath);
      const data = {
        variations: variationStream,
        section: 'Products',
      };

      constructorio.replaceCatalog(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.exist;
        expect(response.task_id).to.exist;
        done();
      });
    }).timeout(30000);

    it('should replace a catalog of item groups', (done) => {
      const constructorio = new Constructorio(testConfig);
      const filePath = path.join(process.cwd(), './test/csv/item_groups.csv');
      const itemGroupsStream = fs.createReadStream(filePath);
      const data = {
        item_groups: itemGroupsStream,
        section: 'Products',
      };

      constructorio.replaceCatalog(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.exist;
        expect(response.task_id).to.exist;
        done();
      });
    }).timeout(30000);
  });
});
