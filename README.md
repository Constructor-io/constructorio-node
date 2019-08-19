# Constructor-IO JavaScript Client
[Constructor.io](http://constructor.io/) provides search as a service that optimizes results using artificial intelligence (including natural language processing, re-ranking to optimize for conversions, and user personalization).

# Documentation
For the most up-to-date documentation for this library, please visit our [API Documentation](https://docs.constructor.io/rest-api.html?javascript#introduction).

# Installation

With npm:

```bash
npm install constructorio
```

## Usage

Create a new instance with your API token and API key (available from the [Customer Dashboard](https://constructor.io/dashboard)):

```javascript
var ConstructorIO = require('constructorio');
var constructorio = new ConstructorIO({
  apiToken: "your API token", 
  apiKey: "your API key",
});
```

To add an item to your index:

```javascript
constructorio.addItem({
  item_name: "power_drill",
  section: "Products"
}, function(error, response) {
    console.log(response);
});
```

To remove an item from your index:

```javascript
constructorio.removeItem({
  item_name: "power_drill",
  section: "Products"
}, function(error, response) {
    console.log(response);  
});
```

To modify an item in your index:

```javascript
constructorio.modifyItem({
  item_name: "power_drill",
  section: "Products",
  url: "http://www.mysite.com/power_drill",
}, function(error, response) {
  console.log(response);
});
```

To get autocomplete results:

```javascript
const userParams = {
  i: 'user device identifier',
  s: 1
};

constructorio.getAutocompleteResults({
  query: 'powe',
  num_results: 4,
}, userParams, function(error, response) {
  console.log(response);  
});
```

To get search results:

```javascript
const userParams = {
  i: 'user device identifier',
  s: 1
};

constructorio.getSearchResults({
  query: 'power drill',
  section: 'Products',
  sort_by: 'relevance',
}, userParams, function(error, response) {
  console.log(response);  
});
```
