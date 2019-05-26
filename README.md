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
  autocomplete_section: "Products"
}, function(error, response) {
    console.log(response);
});
```

To remove an item from your index:

```javascript
constructorio.removeItem({
  item_name: "power_drill",
  autocomplete_section: "Products"
}, function(error, response) {
    console.log(response);  
});
```

To modify an item in your index:

```javascript
constructorio.modifyItem({
  item_name: "power_drill",
  autocomplete_section: "Products",
  url: "http://www.mysite.com/power_drill",
}, function(error, response) {
  console.log(response);
});
```

You can also track behavioral data to improve the rankings of your search and autosuggest results:

```javascript
// track the number of results for a given search
constructorio.trackSearch({
  term: "xyz",
  num_results: 302
});

// track when a user clicks on a search result
constructorio.trackClickThrough({
  term: "xyz", 
  item: "Alphabet soup",
  autocomplete_section: "products_autocomplete"
});

// track when a user adds an item to their cart
constructorio.trackConversion({
  term: "xyz",
  item: "Alphabet soup",
  autocomplete_section: "products_autocomplete"
});
```