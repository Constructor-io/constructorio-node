/* eslint-disable prefer-destructuring, no-unused-expressions */

const expect = require('chai').expect;
const Constructorio = require('../lib/constructorio');

const testConfig = {
  apiToken: process.env.TOKEN,
  apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
};

describe('ConstructorIO', () => {
  describe('new', () => {
    it('should set the API token and key', () => {
      const constructorio = new Constructorio(testConfig);

      expect(constructorio.config.apiToken).to.eq(testConfig.apiToken);
      expect(constructorio.config.apiKey).to.eq(testConfig.apiKey);
    });
  });

  describe('verify', () => {
    it('should return successful authentication when given a valid key/token pair', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.verify((err, response) => {
        expect(err).to.be.undefined;
        expect(response.message).to.match(/successful authentication/);
        done();
      });
    });
  });
});
