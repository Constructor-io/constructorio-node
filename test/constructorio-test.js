/* eslint-disable prefer-destructuring, no-unused-expressions */

const expect = require('chai').expect;
const uuidv1 = require('uuid/v1');
const Constructorio = require('../lib/constructorio');

function createProductItem() {
  const uuid = uuidv1();
  return {
    item_name: `Product${uuid}`,
    url: `https://constructor.io/products/Product${uuid}`,
  };
}

describe('constructorio', () => {
  describe('config', () => {
    it('should set the API token', () => {
      const apiToken = 'a-test-api-key';
      const constructorio = new Constructorio({ apiToken });
      expect(constructorio.config.apiToken).to.eq(apiToken);
    });

    it('should set the API key', () => {
      const apiKey = 'a-test-autocomplete-key';
      const constructorio = new Constructorio({ apiKey });
      expect(constructorio.config.apiKey).to.eq(apiKey);
    });
  });

  describe('verify', () => {
    it('should return success with a valid key/token pair', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'YSOxV00F0Kk2R0KnPQN8',
        apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
      });

      constructorio.verify((err, response) => {
        expect(err).to.be.undefined;
        expect(response.message).to.eq('successful authentication');
        done();
      });
    });
  });

  describe('addItem', () => {
    it('should add an item to the autocomplete section', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'YSOxV00F0Kk2R0KnPQN8',
        apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
      });
      const data = createProductItem();
      data.autocomplete_section = 'Products';

      constructorio.addItem(data, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.be.undefined;
        done();
      });
    });
  });

  //   it('adds an item with metadata', (done) => {
  //     const constructorio = new Constructorio({
  //       apiToken: 'apiToken',
  //       autocompleteKey: 'autocompleteKey',
  //     });

  //     constructorio.add({
  //       item_name: 'power drill 2',
  //       autocomplete_section: 'Products',
  //       url: 'http://url.com',
  //       metadata: {
  //         key1: 'value1',
  //         key2: 'value2',
  //       },
  //     }, (err, response) => {
  //       assert.equal(err, undefined);
  //       assert.equal(response, '');
  //       done();
  //     });
  //   });

  //   it('receives an error when adding item with wrong autocomplete key', (done) => {
  //     const constructorio = new Constructorio({
  //       apiToken: 'apiToken',
  //       autocompleteKey: 'bad-autocompleteKey',
  //     });

  //     constructorio.add({
  //       item_name: 'power drill',
  //       autocomplete_section: 'standard',
  //     }, (err, response) => {
  //       assert.equal(err.message, 'You have supplied an invalid autocomplete key. Look up your valid autocomplete key in your admin dashboard.');
  //       assert.equal(response, undefined);
  //       done();
  //     });
  //   });
  // });

  // describe('add batch', () => {
  //   it('adds multiple items in a batch', (done) => {
  //     const constructorio = new Constructorio({
  //       apiToken: 'apiToken',
  //       autocompleteKey: 'autocompleteKey',
  //     });

  //     constructorio.add_batch({
  //       items: [{ item_name: 'reciprocating saw' }],
  //       autocomplete_section: 'standard',
  //     }, (err, response) => {
  //       assert.equal(err, undefined);
  //       assert.equal(response, '');
  //       done();
  //     });
  //   });
  // });

  // describe('add batch with metadata', () => {
  //   it('adds multiple items in a batch', (done) => {
  //     const constructorio = new Constructorio({
  //       apiToken: 'apiToken',
  //       autocompleteKey: 'autocompleteKey',
  //     });

  //     constructorio.add_batch({
  //       items: [
  //         { item_name: 'reciprocating saw 1', url: 'http://url.com', metadata: { key1: 'value1', key2: 'value2' } },
  //         { item_name: 'reciprocating saw 2', url: 'http://url.com', metadata: { keyA: 'valueA', keyB: 'valueB' } },
  //       ],
  //       autocomplete_section: 'Products',
  //     }, (err, response) => {
  //       assert.equal(err, undefined);
  //       assert.equal(response, '');
  //       done();
  //     });
  //   });
  // });

  // describe('add or update', () => {
  //   it('adds/updates an item', (done) => {
  //     const constructorio = new Constructorio({
  //       apiToken: 'apiToken',
  //       autocompleteKey: 'autocompleteKey',
  //     });

  //     constructorio.add_or_update({
  //       item_name: 'power drill',
  //       autocomplete_section: 'standard',
  //     }, (err, response) => {
  //       assert.equal(err, undefined);
  //       assert.equal(response, '');
  //       done();
  //     });
  //   });
  // });

  // describe('add or update batch', () => {
  //   it('adds/updates multiple items in a batch', (done) => {
  //     const constructorio = new Constructorio({
  //       apiToken: 'apiToken',
  //       autocompleteKey: 'autocompleteKey',
  //     });

  //     constructorio.add_or_update_batch({
  //       items: [{ item_name: 'reciprocating saw' }],
  //       autocomplete_section: 'standard',
  //     }, (err, response) => {
  //       assert.equal(err, undefined);
  //       assert.equal(response, '');
  //       done();
  //     });
  //   });
  // });

  // describe('remove', () => {
  //   it('removes an item', (done) => {
  //     const constructorio = new Constructorio({
  //       apiToken: 'apiToken',
  //       autocompleteKey: 'autocompleteKey',
  //     });

  //     constructorio.remove({
  //       item_name: 'power drill',
  //       autocomplete_section: 'standard',
  //     }, (err, response) => {
  //       assert.equal(err, undefined);
  //       assert.equal(response, '');
  //       done();
  //     });
  //   });
  // });

  // describe('remove batch', () => {
  //   it('removes multiple items in a batch', (done) => {
  //     const constructorio = new Constructorio({
  //       apiToken: 'apiToken',
  //       autocompleteKey: 'autocompleteKey',
  //     });

  //     constructorio.remove_batch({
  //       items: [{ item_name: 'reciprocating saw' }],
  //       autocomplete_section: 'standard',
  //     }, (err, response) => {
  //       assert.equal(err, undefined);
  //       assert.equal(response, '');
  //       done();
  //     });
  //   });
  // });

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
