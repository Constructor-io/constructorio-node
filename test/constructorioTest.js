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

  describe('add', function() {
    it('adds an item', function(done) {
      var constructorio = new Constructorio({
        apiToken: "apiToken",
        autocompleteKey: "autocompleteKey",
        protocol: "http",
        host: "ac.cnstrc.com",
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
  })

  describe('remove', function() {
    it('removes an item', function(done) {
      var constructorio = new Constructorio({
        apiToken: "apiToken",
        autocompleteKey: "autocompleteKey",
        protocol: "http",
        host: "ac.cnstrc.com",
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

  describe('modify', function() {
    it('modifies an item', function(done) {
      var constructorio = new Constructorio({
        apiToken: "apiToken",
        autocompleteKey: "autocompleteKey",
        protocol: "http",
        host: "ac.cnstrc.com",
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
