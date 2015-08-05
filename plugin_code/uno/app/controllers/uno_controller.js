var _ = require('underscore'),
    Game = require('../models/game'),
    Player = require('../models/player'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env];

var Uno = function Uno () {
  var self = this;
  self.config = config;

  self.challenge = function (client, message, cmdArgs) {

  };

  self.draw = function (client, message, cmdArgs) {

  };

  self.end = function (client, message, cmdArgs) {

  };

  self.join = function (client, message, cmdArgs) {
    var channel = message.args[0];

    if (cmdArgs !== '') {
      cmdArgs = _.map(cmdArgs.match(/(\w+)\s?/gi), function (str) { return str.trim(); });
    } 

    if (!_.isUndefined(self.game) && self.game.state !== Game.STATES.STOPPED) {
      client.say(channel, message.nick + ': Cannot join games that are already in progress.');
      return false;
    }

    if (_.isUndefined(self.game)) {
      self.game = new Game(message.args[0], client, self.config, cmdArgs);
    }

    var player = new Player(message.nick, message.user, message.host);
    self.game.addPlayer(player);
  };

  self.quit = function (client, message, cmdArgs) {

  };

  self.score = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      return false;
    }

    self.game.showScores();
  };

  self.start = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.STOPPED) {
      return false;
    }

    self.game.start(message.nick);
  };

  self.stop = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.STOPPED) {
      return false;
    }

    self.game.stop(message.nick);
  };

  self.uno = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.PLAYABLE) {
      return false;
    }

    cmdArgs = _.map(cmdArgs.match(/(\w+)\s?/gi), function (str) { return str.trim(); });

    self.game.play(message.nick, cmdArgs[0], cmdArgs[1]);
  };
}; 

exports = module.exports = Uno;