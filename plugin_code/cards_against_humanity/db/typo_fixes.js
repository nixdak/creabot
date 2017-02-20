const models = require('../models');

const cardFixes = [];

cardFixes.forEach(({ correctText, wrongText }) => {
  models.Card.update({ text: correctText }, { where: { text: wrongText } });
});
