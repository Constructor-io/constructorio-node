/* eslint-disable prefer-destructuring, no-unused-expressions */

const expect = require('chai').expect;
const deepfreeze = require('deepfreeze');
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

describe('ConstructorIO - Items', () => {
  describe('addItem', () => {
    it('should return nothing when adding an item', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = createProductItem();
      data.autocomplete_section = 'Products';

      constructorio.addItem(deepfreeze(data), (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });

    it('should return nothing when adding an item with metadata', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = createProductItem();
      data.autocomplete_section = 'Products';
      data.url = 'http://url.com';
      data.metadata = {
        key1: 'value1',
        key2: 'value2',
      };

      constructorio.addItem(deepfreeze(data), (err, response) => {
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

      constructorio.addItem(deepfreeze(data), (err, response) => {
        expect(err.message).to.match(/You have supplied an invalid/);
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('addItemBatch', () => {
    it('should return nothing when adding multiple items', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        items: [
          createProductItem(),
          createProductItem(),
          createProductItem(),
        ],
        autocomplete_section: 'Products',
      };

      constructorio.addItemBatch(deepfreeze(data), (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('addOrUpdateItem', () => {
    it('should return nothing when upserting an item', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = createProductItem();
      data.autocomplete_section = 'Products';

      constructorio.addOrUpdateItem(deepfreeze(data), (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('addOrUpdateItemBatch', () => {
    it('should return nothing when upserting multiple items', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        items: [
          createProductItem(),
          createProductItem(),
          createProductItem(),
        ],
        autocomplete_section: 'Products',
      };

      constructorio.addOrUpdateItemBatch(deepfreeze(data), (err, response) => {
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

      constructorio.removeItem(deepfreeze(data), (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('removeItemBatch', () => {
    it('should return nothing when removing multiple items', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        items: [
          createProductItem(),
          createProductItem(),
          createProductItem(),
        ],
        autocomplete_section: 'Products',
      };

      constructorio.removeItemBatch(deepfreeze(data), (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  describe('modifyItem', () => {
    it('should return nothing when modifying an item in an autocomplete section', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = createProductItem();
      data.autocomplete_section = 'Products';
      constructorio.addItem(data, () => {
        data.suggested_score = 12;
        data.url = 'http://url.com';
        data.new_item_name = `${data.item_name}-new`;

        constructorio.modifyItem(deepfreeze(data), (err, response) => {
          expect(err).to.be.undefined;
          expect(response).to.be.undefined;
          done();
        });
      });
    });
  });

  describe('getItem', () => {
    it('should return 20 items given only an autocomplete section', (done) => {
      const constructorio = new Constructorio(testConfig);
      constructorio.getItem({
        section: 'Products',
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response.items.length).to.eq(20);
        done();
      });
    });

    it('should return items given an autocomplete section and paging options', (done) => {
      const constructorio = new Constructorio(testConfig);
      constructorio.getItem({
        section: 'Products',
        num_results_per_page: 25,
        page: 1
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response.items.length).to.eq(25);
        done();
      });
    });

    it('should return an item given a specific item id', (done) => {
      const constructorio = new Constructorio(testConfig);
      constructorio.getItem({
        section: 'Products',
        item_id: 'product052c94d0-93cc-11e9-945b-f3beea83fd15-new'
      }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response.id).to.eq('product052c94d0-93cc-11e9-945b-f3beea83fd15-new');
        done();
      });
    });
  });
});
