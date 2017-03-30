const _ = require('lodash');
const Card = require('../models/card');
const cards = require('../../config/cards.json');

const Deck = function Deck (deck) {
  const self = this;
  self.cards = [];

  if (deck === true) {
    _.forEach(cards, card => {
      self.cards.push(new Card(card));
    });
  } else {
    self.cards = [];
  }

  self.shuffle = () => {
    self.cards = _.shuffle(_.shuffle(self.cards));
  };

  self.deal = () => self.cards.pop();

  self.addCard = card => {
    self.cards.push(card);
  };

  self.removeCard = card => {
    if (_.isUndefined(card)) {
      return false;
    }

    self.cards = _.without(self.cards, card);
    return card;
  };

  self.checkPlayable = (index, currentCard) => self.cards[index].isPlayable(currentCard);

  self.getCard = index => self.cards[index];

  self.pickCard = index => {
    const card = self.cards[index];
    self.removeCard(card);
    return card;
  };

  self.getCurrentCard = () => self.cards[self.cards.length - 1];

  self.getCards = () => self.cards;

  self.numCards = () => self.cards.length;
};

exports = module.exports = Deck;
