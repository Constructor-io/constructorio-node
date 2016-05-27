# Constructor.io

A Javascript package for the [Constructor.io API](http://constructor.io/docs).  Constructor.io provides a lightning-fast, typo-tolerant autocomplete service that ranks your users' queries by popularity to let them find what they're looking for as quickly as possible.

[![Build Status](https://travis-ci.org/Constructor-io/constructorio-javascript.svg?branch=master)](https://travis-ci.org/Constructor-io/constructorio-javascript)

## Installation

With npm:

    npm install constructorio

## Usage

Create a new instance with your API token and autocomplete key:

    var ConstructorIO = require('constructorio');
    var constructorio = new ConstructorIO({
      apiToken: "your API token", // available at https://constructor.io/dashboard
      autocompleteKey: "your autocomplete key",
    });

To add an item to your autocomplete index:

    constructorio.add(
      { item_name: "power_drill", autocomplete_section: "standard" },
      function(error, response) {
        console.log(response);
      }
    );

To remove an item from your autocomplete index:

    constructorio.remove(
      { item_name: "power_drill", autocomplete_section: "standard" },
      function(error, response) {
        console.log(response);
      }
    );

To modify an item in your autocomplete index:

    constructorio.modify(
      {
        item_name: "power_drill",
        autocomplete_section: "standard",
        url: "http://www.mysite.com/power_drill",
      },
      function(error, response) {
        console.log(response);
      }
    );

You can also track behavioral data to improve the rankings of your results.  There are three track_* methods for search, click_through, and conversion:

    // track how many results are returned for a given search
    constructorio.track_search({
      term: "xyz",
      num_results: 302
    });

    // track when a user clicks on a search result
    constructorio.track_click_through({
      term: "xyz", // the original search term
      item: "Alphabet soup", // the item the user clicked on
      autocomplete_section: "products_autocomplete"
    });

    // track when a user converts
    constructorio.track_conversion({
      term: "xyz",
      item: "Alphabet soup",
      autocomplete_section: "products_autocomplete"
    });

