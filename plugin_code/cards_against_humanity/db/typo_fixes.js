var models = require('../models');

var card_fixes = [

];

card_fixes.forEach(function(typo_fix) {
  models.Card.update({text: typo_fix.correct_text}, {where: {text: typo_fix.wrong_text}});
});
