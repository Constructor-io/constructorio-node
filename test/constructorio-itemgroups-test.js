/* eslint-disable prefer-destructuring, no-unused-expressions */

const expect = require('chai').expect;
const deepfreeze = require('deepfreeze');
const uuidv1 = require('uuid/v1');
const Constructorio = require('../lib/constructorio');

const testConfig = {
  apiToken: 'YSOxV00F0Kk2R0KnPQN8',
  apiKey: 'ZqXaOfXuBWD4s3XzCI1q',
};

function createProductItemGroup() {
  const uuid = uuidv1();
  return {
    id: `Group${uuid}`,
    name: `GroupName${uuid}`,
  };
}

function createProductItemGroupToTest(done) {
  const constructorio = new Constructorio(testConfig);
  const data = {
    item_groups: [
      {
        id: 'SoupGroup',
        name: 'Soup Group',
      },
    ],
  };
  constructorio.addOrUpdateItemGroups(deepfreeze(data), done);
}

describe('ConstructorIO - Item Groups', () => {
  describe('addItemGroups', () => {
    it('should return status when adding an item group', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        item_groups: [
          createProductItemGroup(),
        ],
      };

      constructorio.addItemGroups(deepfreeze(data), (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.deep.eq({
          item_groups: { inserted: 1, processed: 1, updated: 0 },
        });
        done();
      });
    });
  });

  describe('addOrUpdateItemGroups', () => {
    it('should return status when upserting an item group', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        item_groups: [
          createProductItemGroup(),
          createProductItemGroup(),
        ],
      };

      constructorio.addOrUpdateItemGroups(deepfreeze(data), (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.deep.eq({
          item_groups: { inserted: 2, processed: 2, updated: 0 },
        });
        done();
      });
    });
  });

  describe('getItemGroup', () => {
    before(createProductItemGroupToTest);
    it('should return an item group', (done) => {
      const constructorio = new Constructorio(testConfig);

      constructorio.getItemGroup({ group_id: 'SoupGroup' }, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.deep.eq({
          item_groups: [
            {
              children: [],
              id: 'SoupGroup',
              name: 'Soup Group',
            },
          ],
          total_count: 1,
        });
        done();
      });
    });
  });

  describe('modifyItemGroup', () => {
    before(createProductItemGroupToTest);
    it('should return the modified response when modifying an item group', (done) => {
      const constructorio = new Constructorio(testConfig);
      const data = {
        id: 'SoupGroup',
        name: 'No Soup Group For You',
      };

      constructorio.modifyItemGroup(deepfreeze(data), (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.deep.eq({
          id: 'SoupGroup',
          name: 'No Soup Group For You',
          parent_id: null,
          path: '/',
        });
        done();
      });
    });
  });

  describe('removeItemGroups', () => {
    it('should return status when deleting all item groups', (done) => {
      const constructorio = new Constructorio(testConfig);
      constructorio.removeItemGroups(undefined, (err, response) => {
        expect(err).to.be.undefined;
        expect(response).to.deep.eq({
          message: 'We\'ve started deleting all of your groups. This may take some time to complete.',
        });
        done();
      });
    });
  });
});
