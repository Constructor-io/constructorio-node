const nodeFetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = nodeFetch;
