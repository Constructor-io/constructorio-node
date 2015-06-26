var assert = require('assert'),
    Constructorio = require('../lib/constructorio');

describe('client', function() {
  it('encodes parameters', function() {
    var constructorio = new Constructorio({})

    assert.equal(constructorio.client._serializeParams({foo: [1, 2], bar: {baz: ['a', 'b']}}), 'foo%5B%5D=1&foo%5B%5D=2&bar%5Bbaz%5D%5B%5D=a&bar%5Bbaz%5D%5B%5D=b')
  })

  it('creates URLs correctly', function() {
    var constructorio = new Constructorio({
      autocompleteKey: 'a-test-autocomplete-key',
    })

    assert.equal(constructorio.client._makeUrl('test'), 'https://ac.cnstrc.com/v1/test?autocomplete_key=a-test-autocomplete-key')
  })
})
