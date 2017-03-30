const _ = require('lodash');
const models = require('../models');

const cardFixes = [];

_.forEach(cardFixes, ({ correctText, wrongText }) => {
  models.Card.update({ text: correctText }, { where: { text: wrongText } });
});
