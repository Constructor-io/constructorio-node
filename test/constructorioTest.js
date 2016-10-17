var assert = require('assert'),
    Constructorio = require('../lib/constructorio');
    replay = require('replay');

describe('constructorio', function() {
  describe('config', function() {
    it('sets the API token', function() {
      var apiToken = 'a-test-api-key',
          constructorio = new Constructorio({ apiToken: apiToken })

      assert.equal(constructorio.config.apiToken, apiToken)
    })
    it('sets the autocomplete key', function() {
      var autocompleteKey = 'a-test-autocomplete-key',
          constructorio = new Constructorio({ autocompleteKey: autocompleteKey })

      assert.equal(constructorio.config.autocompleteKey, autocompleteKey)
    })
  })

  describe('verify', function() {
    it('verifies authentication', function(done) {
      var constructorio = new Constructorio({
        apiToken: "apiToken",
        autocompleteKey: "autocompleteKey"
      })

      constructorio.verify(function(err, response) {
        assert.equal(err, undefined);
        assert.equal(response.message, "successful authentication");
        done();
      });
    });
  })

  describe('add', function() {
    it('adds an item', function(done) {
      var constructorio = new Constructorio({
        apiToken: "apiToken",
        autocompleteKey: "autocompleteKey"
      })

      constructorio.add({
        item_name: "power drill",
        autocomplete_section: "standard",
      }, function(err, response) {
        assert.equal(err, undefined);
        assert.equal(response, "");
        done();
      });
    })

    it('receives an error when adding item with wrong autocomplete key', function(done) {
      var constructorio = new Constructorio({
        apiToken: "apiToken",
        autocompleteKey: "bad-autocompleteKey"
      })

      constructorio.add({
        item_name: "power drill",
        autocomplete_section: "standard",
      }, function(err, response) {
        assert.equal(err.message, "You have supplied an invalid autocomplete key. Look up your valid autocomplete key in your admin dashboard.");
        assert.equal(response, undefined);
        done();
      });
    })
  })

  describe('add batch', function() {
    it('adds multiple items in a batch', function(done) {
      var constructorio = new Constructorio({
        apiToken: "apiToken",
        autocompleteKey: "autocompleteKey"
      })

      constructorio.add_batch({
        items: [ { item_name: "reciprocating saw" } ],
        autocomplete_section: "standard",
      }, function(err, response) {
        assert.equal(err, undefined);
        assert.equal(response, "");
        done();
      });
    })
  })

  describe('add or update', function() {
    it('adds/updates an item', function(done) {
      var constructorio = new Constructorio({
        apiToken: "apiToken",
        autocompleteKey: "autocompleteKey"
      })

      constructorio.add_or_update({
        item_name: "power drill",
        autocomplete_section: "standard",
      }, function(err, response) {
        assert.equal(err, undefined);
        assert.equal(response, "");
        done();
      });
    })
  })

  describe('add or update batch', function() {
    it('adds/updates multiple items in a batch', function(done) {
      var constructorio = new Constructorio({
        apiToken: "apiToken",
        autocompleteKey: "autocompleteKey"
      })

      constructorio.add_or_update_batch({
        items: [ { item_name: "reciprocating saw" } ],
        autocomplete_section: "standard",
      }, function(err, response) {
        assert.equal(err, undefined);
        assert.equal(response, "");
        done();
      });
    })
  })

  describe('remove', function() {
    it('removes an item', function(done) {
      var constructorio = new Constructorio({
        apiToken: "apiToken",
        autocompleteKey: "autocompleteKey"
      })

      constructorio.remove({
        item_name: "power drill",
        autocomplete_section: "standard",
      }, function(err, response) {
        assert.equal(err, undefined);
        assert.equal(response, "");
        done();
      });
    })
  })

  describe('remove batch', function() {
    it('removes multiple items in a batch', function(done) {
      var constructorio = new Constructorio({
        apiToken: "apiToken",
        autocompleteKey: "autocompleteKey"
      })

      constructorio.remove_batch({
        items: [ { item_name: "reciprocating saw" } ],
        autocomplete_section: "standard",
      }, function(err, response) {
        assert.equal(err, undefined);
        assert.equal(response, "");
        done();
      });
    })
  })

  describe('modify', function() {
    it('modifies an item', function(done) {
      var constructorio = new Constructorio({
        apiToken: "apiToken",
        autocompleteKey: "autocompleteKey"
      })

      constructorio.modify({
        item_name: "power drill",
        suggested_score: 100,
        autocomplete_section: "standard",
      }, function(err, response) {
        assert.equal(err, undefined);
        assert.equal(response, "");
        done();
      });
    })
  })

})
