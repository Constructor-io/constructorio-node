# Constructor.io Node Client

[![npm](https://img.shields.io/npm/v/@constructor-io/constructorio-node)](https://www.npmjs.com/package/@constructor-io/constructorio-node)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Constructor-io/constructorio-node/blob/master/LICENSE)

A Node.js client for [Constructor.io](http://constructor.io/). [Constructor.io](http://constructor.io/) provides search as a service that optimizes results using artificial intelligence (including natural language processing, re-ranking to optimize for conversions, and user personalization).

> This client is intended for use in server side integrations.  If you want a JavaScript client for client side (i.e. front end) integrations please use [@constructor-io/constructorio-client-javascript](https://github.com/Constructor-io/constructorio-client-javascript)

## Documentation
Full API documentation is available on [Github Pages](https://constructor-io.github.io/constructorio-node)

Updating from v3 to v4? Be sure to read the [upgrade guide](https://github.com/Constructor-io/constructorio-node/wiki/Migration-Guide---V3-to-V4) for an explanation of changes made to the Catalog module

## 1. Review the Requirements

Requesting results from your Node.js back-end can be useful in order to control result rendering logic on your server, or augment/hydrate results with data from another system. However, a back-end integration has additional requirements compared to a front-end integration. Please review the [Additional Information For Backend Integrations](https://github.com/Constructor-io/constructorio-node/wiki/Additional-Information-For-Backend-Integrations) article within the wiki for more detail.

## 2. Install

This package can be installed via npm: `npm i @constructor-io/constructorio-node`. Once installed, simply import or require the package into your repository.

**Important**: this library should only be used in a server-side context.

## 3. Retrieve an API key and token

You can find this in your [Constructor.io dashboard](https://constructor.io/dashboard). Contact sales if you'd like to sign up, or support if you believe your company already has an account.

## 4. Implement the Client

Once imported, an instance of the client can be created as follows:

```javascript
const ConstructorIOClient = require('@constructor-io/constructorio-node');

var constructorio = new ConstructorIOClient({
    apiKey: 'YOUR API KEY',
});
```

## 5. Retrieve Results

After instantiating an instance of the client, four modules will be exposed as properties to help retrieve data from Constructor.io: `search`, `browse`, `autocomplete`, `recommendations`, `catalog` and `tracker`.

## Development / npm commands

```bash
npm run lint          # run lint on source code and tests
npm run test          # run tests
npm run coverage      # run tests and serves coverage reports from localhost:8081
npm run docs          # output documentation to `./docs` directory
```
