const assert = require('assert');
const config = require('../config/config');
const _ = require('underscore');

describe('Cards', () => {
  describe('value', () => {
    it('should not be blank', () => {
      _.each(config.cards, ({ value }) => {
        assert.notEqual(value, '');
      });
    });

    it('should not be duplicated', () => {
      if (
        _.difference(config.cards, _.uniq(config.cards, false, ({ value }) => value)).length !== 0
      ) {
        console.log(
          _.map(
            _.difference(config.cards, _.uniq(config.cards, false, ({ value }) => value)),
            ({ value }) => value
          )
        );
      }

      assert.equal(
        0,
        _.difference(config.cards, _.uniq(config.cards, false, ({ value }) => value)).length
      );
    });
  });
});
