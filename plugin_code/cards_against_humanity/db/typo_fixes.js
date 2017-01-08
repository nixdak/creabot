const models = require('../models');

const card_fixes = [];

card_fixes.forEach(({ correct_text, wrong_text }) => {
  models.Card.update({ text: correct_text }, { where: { text: wrong_text } });
});
