var assert = require('assert')
var config = require('../config/config')
var _ = require('underscore')

describe('Cards', function () {
  describe('value', function () {
    it('should not be blank', function () {
      _.each(config.cards, function (card) {
        assert.notEqual(card.value, "");
      })
    });

    it('should not be duplicated', function() {
      if (_.difference(config.cards, _.uniq(config.cards, false, function (card) { return card.value; })).length !== 0) {
        console.log(_.map(
          _.difference(config.cards, _.uniq(config.cards, false, function (card) { return card.value; })),
          function (card) { return card.value; }
        ));
      }

      assert.equal(0, _.difference(config.cards, _.uniq(config.cards, false, function (card) { return card.value; })).length);
    });
  })
})
