var Deck = require('../controllers/deck.js');

var Player = function(nick, user, hostname) {
  var self = this;

  self.nick = nick;
  self.user = user;
  self.hostname = hostname;
  self.points = 0;
  self.idleTurns = 0;
  self.hand = new Deck(false);
  self.skipped = false;
  self.hasPlayed = false;
  self.hasDrawn = false;
  self.hasChallenged = false;
  self.uno = false;
  self.challengable = false;
};

exports = module.exports = Player;
