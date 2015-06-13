var _ = require('underscore');

var Player = function Player(nick, user, hostname) {
  var self = this;

  self.id = _.uniqueId('player');
  self.nick = nick;
  self.user = user;
  self.hostname = hostname;
  self.hasPlayed = false;
  self.points = 0;
  self.isActive = true;
  self.selectRound = false;
  self.hasSelected = false;
  self.hasBuzzed = false;
  self.isLocked = false;
};

module.exports = exports = Player;