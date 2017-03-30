const _ = require('lodash');
const Card = require('../models/card');

const Cards = function Cards (cards) {
  const self = this;

  self.cards = [];

  // add all cards in init array
  _.forEach(cards, c => {
    let card;
    if (c instanceof Card) {
      card = c;
    } else if (c.hasOwnProperty('value')) {
      card = new Card(c);
    } else {
      console.warning('Invalid card', c);
    }
    self.cards.push(card);
  });

  /**
     * Reset the collection
     * @param cards Optional replacement list of cards
     * @returns {Array} Array of the old, replaced cards
     */
  self.reset = cards => {
    if (_.isUndefined(cards)) {
      cards = [];
    }
    const oldCards = self.cards;
    self.cards = cards;
    return oldCards;
  };

  /**
     * Shuffle the cards
     * @returns {Cards} The shuffled collection
     */
  self.shuffle = () => {
    self.cards = _.shuffle(self.cards);
    return self;
  };

  /**
     * Add card to collection
     * @param card
     * @returns {*}
     */
  self.addCard = card => {
    self.cards.push(card);
    return card;
  };

  /**
     * Remove a card from the collection
     * @param card
     * @returns {*}
     */
  self.removeCard = card => {
    if (!_.isUndefined(card)) {
      self.cards = _.without(self.cards, card);
    }
    return card;
  };

  /**
     * Pick cards from the collection
     * @param index (int|Array) Index of a single card, of Array of multiple indexes to remove and return
     * @returns {Card|Cards} Instance of a single card, or instance of Cards if multiple indexes picked
     */
  self.pickCards = function (index) {
    if (_.isUndefined(index)) index = 0;
    if (_.isArray(index)) {
      // get multiple cards
      const pickedCards = new Cards();
      // first get all cards
      _.forEach(index, _.bind(i => {
        const c = self.cards[i];
        if (_.isUndefined(c)) {
          throw new Error('Invalid card index');
        }
        //                cards.push();
        pickedCards.addCard(c);
      }, this));
      // then remove them
      self.cards = _.without.apply(this, _.union([self.cards], pickedCards.cards));
      //            _.forEach(pickedCards, function(card) {
      //                self.cards.removeCard(card);
      //            }, this);
      console.log('picked cards:');
      console.log(_.map(pickedCards.cards, 'id'));
      console.log(_.map(pickedCards.cards, 'value'));
      console.log('remaining cards:');
      console.log(_.map(self.cards, 'id'));
      console.log(_.map(self.cards, 'value'));
      return pickedCards;
    } else {
      const card = self.cards[index];
      self.removeCard(card);
      return card;
    }
  };

  /**
     * Get all cards in collection
     * @returns {Array}
     */
  self.getCards = () => self.cards;

  /**
     * Get amount of cards in collection
     * @returns {Number}
     */
  self.numCards = function () {
    return this.cards.length;
  };
};

/**
 * Expose `Cards()`
 */
exports = module.exports = Cards;
