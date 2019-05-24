/* eslint-disable prefer-destructuring, no-unused-expressions */

const expect = require('chai').expect;
const uuidv1 = require('uuid/v1');
const Constructorio = require('../lib/constructorio');

const testConfig = {
  apiToken: 'YSOxV00F0Kk2R0KnPQN8',
  apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
};

function createProductItem() {
  const uuid = uuidv1();
  return {
    item_name: `Product${uuid}`,
    url: `https://constructor.io/products/Product${uuid}`,
  };
}

describe('constructorio', () => {
  describe('new', () => {
    it('should set the API token and key', () => {
      const constructorio = new Constructorio(testConfig);

      expect(constructorio.config.apiToken).to.eq(testConfig.apiToken);
      expect(constructorio.config.apiKey).to.eq(testConfig.apiKey);
    });
  });

  describe('verify', () => {
    it('should return successful authentication when given a valid key/token pair', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.verify((err, response) => {
        expect(err).to.be.undefined;
        expect(response.message).to.match(/successful authentication/);
        done();
      });
    });
  });

  describe('addItem', () => {
    it('should return nothing when adding an item to an autocomplete section', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = createProductItem();
      data.autocomplete_section = 'Products';

      constructorio.addItem(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return nothing when adding an item with metadata to an autocomplete section', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = createProductItem();
      data.autocomplete_section = 'Products';
      data.url = 'http://url.com';
      data.metadata = {
        key1: 'value1',
        key2: 'value2',
      };

      constructorio.addItem(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return error when adding an item with an invalid key/token', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'bad-token',
        apiKey: 'bad-key',
      });
      const data = createProductItem();
      data.autocomplete_section = 'Products';

      constructorio.addItem(data, (err, response) => {
        expect(err.message).to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('addItemBatch', () => {
    it('should return nothing when adding multiple items to an autocomplete section', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        items: [
          createProductItem(),
          createProductItem(),
          createProductItem(),
        ],
        autocomplete_section: 'Products',
      };

      constructorio.addItemBatch(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('addOrUpdateItem', () => {
    it('should return nothing when upserting an item to an autocomplete section', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = createProductItem();
      data.autocomplete_section = 'Products';

      constructorio.addOrUpdateItem(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('addOrUpdateItemBatch', () => {
    it('should return nothing when upserting multiple items to an autocomplete section', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        items: [
          createProductItem(),
          createProductItem(),
          createProductItem(),
        ],
        autocomplete_section: 'Products',
      };

      constructorio.addOrUpdateItemBatch(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('removeItem', () => {
    it('should return nothing when removing an item from an autocomplete section', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = createProductItem();
      data.autocomplete_section = 'Products';

      constructorio.removeItem(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('removeItemBatch', () => {
    it('should return nothing when removing multiple items to an autocomplete section', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        items: [
          createProductItem(),
          createProductItem(),
          createProductItem(),
        ],
        autocomplete_section: 'Products',
      };

      constructorio.removeItemBatch(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  // describe('modify', () => {
  //   it('modifies an item', (done) => {
  //     const constructorio = new Constructorio({
  //       apiToken: 'apiToken',
  //       autocompleteKey: 'autocompleteKey',
  //     });

  //     constructorio.modify({
  //       item_name: 'power drill',
  //       suggested_score: 100,
  //       autocomplete_section: 'standard',
  //     }, (err, response) => {
  //       assert.equal(err, undefined);
  //       assert.equal(response, '');
  //       done();
  //     });
  //   });
  // });

});
