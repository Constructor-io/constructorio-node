const assert = require('assert');
const Constructorio = require('../lib/constructorio');

describe('constructorio', () => {
  describe('config', () => {
    it('sets the API token', () => {
      const apiToken = 'a-test-api-key';
      const constructorio = new Constructorio({ apiToken });

      assert.equal(constructorio.config.apiToken, apiToken);
    });
    it('sets the autocomplete key', () => {
      const autocompleteKey = 'a-test-autocomplete-key';
      const constructorio = new Constructorio({ autocompleteKey });

      assert.equal(constructorio.config.autocompleteKey, autocompleteKey);
    });
  });

  describe('verify', () => {
    it('verifies authentication', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'apiToken',
        autocompleteKey: 'autocompleteKey',
      });

      constructorio.verify((err, response) => {
        assert.equal(err, undefined);
        assert.equal(response.message, 'successful authentication');
        done();
      });
    });
  });

  describe('add', () => {
    it('adds an item', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'apiToken',
        autocompleteKey: 'autocompleteKey',
      });

      constructorio.add({
        item_name: 'power drill',
        autocomplete_section: 'standard',
      }, (err, response) => {
        assert.equal(err, undefined);
        assert.equal(response, '');
        done();
      });
    });

    it('adds an item with metadata', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'apiToken',
        autocompleteKey: 'autocompleteKey',
      });

      constructorio.add({
        item_name: 'power drill 2',
        autocomplete_section: 'Products',
        url: 'http://url.com',
        metadata: {
          key1: 'value1',
          key2: 'value2',
        },
      }, (err, response) => {
        assert.equal(err, undefined);
        assert.equal(response, '');
        done();
      });
    });

    it('receives an error when adding item with wrong autocomplete key', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'apiToken',
        autocompleteKey: 'bad-autocompleteKey',
      });

      constructorio.add({
        item_name: 'power drill',
        autocomplete_section: 'standard',
      }, (err, response) => {
        assert.equal(err.message, 'You have supplied an invalid autocomplete key. Look up your valid autocomplete key in your admin dashboard.');
        assert.equal(response, undefined);
        done();
      });
    });
  });

  describe('add batch', () => {
    it('adds multiple items in a batch', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'apiToken',
        autocompleteKey: 'autocompleteKey',
      });

      constructorio.add_batch({
        items: [{ item_name: 'reciprocating saw' }],
        autocomplete_section: 'standard',
      }, (err, response) => {
        assert.equal(err, undefined);
        assert.equal(response, '');
        done();
      });
    });
  });

  describe('add batch with metadata', () => {
    it('adds multiple items in a batch', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'apiToken',
        autocompleteKey: 'autocompleteKey',
      });

      constructorio.add_batch({
        items: [
          { item_name: 'reciprocating saw 1', url: 'http://url.com', metadata: { key1: 'value1', key2: 'value2' } },
          { item_name: 'reciprocating saw 2', url: 'http://url.com', metadata: { keyA: 'valueA', keyB: 'valueB' } },
        ],
        autocomplete_section: 'Products',
      }, (err, response) => {
        assert.equal(err, undefined);
        assert.equal(response, '');
        done();
      });
    });
  });

  describe('add or update', () => {
    it('adds/updates an item', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'apiToken',
        autocompleteKey: 'autocompleteKey',
      });

      constructorio.add_or_update({
        item_name: 'power drill',
        autocomplete_section: 'standard',
      }, (err, response) => {
        assert.equal(err, undefined);
        assert.equal(response, '');
        done();
      });
    });
  });

  describe('add or update batch', () => {
    it('adds/updates multiple items in a batch', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'apiToken',
        autocompleteKey: 'autocompleteKey',
      });

      constructorio.add_or_update_batch({
        items: [{ item_name: 'reciprocating saw' }],
        autocomplete_section: 'standard',
      }, (err, response) => {
        assert.equal(err, undefined);
        assert.equal(response, '');
        done();
      });
    });
  });

  describe('remove', () => {
    it('removes an item', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'apiToken',
        autocompleteKey: 'autocompleteKey',
      });

      constructorio.remove({
        item_name: 'power drill',
        autocomplete_section: 'standard',
      }, (err, response) => {
        assert.equal(err, undefined);
        assert.equal(response, '');
        done();
      });
    });
  });

  describe('remove batch', () => {
    it('removes multiple items in a batch', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'apiToken',
        autocompleteKey: 'autocompleteKey',
      });

      constructorio.remove_batch({
        items: [{ item_name: 'reciprocating saw' }],
        autocomplete_section: 'standard',
      }, (err, response) => {
        assert.equal(err, undefined);
        assert.equal(response, '');
        done();
      });
    });
  });

  describe('modify', () => {
    it('modifies an item', (done) => {
      const constructorio = new Constructorio({
        apiToken: 'apiToken',
        autocompleteKey: 'autocompleteKey',
      });

      constructorio.modify({
        item_name: 'power drill',
        suggested_score: 100,
        autocomplete_section: 'standard',
      }, (err, response) => {
        assert.equal(err, undefined);
        assert.equal(response, '');
        done();
      });
    });
  });

});
