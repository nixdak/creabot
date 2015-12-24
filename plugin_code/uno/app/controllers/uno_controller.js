var _ = require('underscore'),
    Game = require('../models/game'),
    Player = require('../models/player'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env];

var Uno = function Uno () {
  var self = this;
  self.config = config;

  self.cards = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.PLAYABLE) {
      return false;
    }

    var player = self.game.getPlayer({ nick: message.nick });
    self.game.showCards(player);
  };

  self.challenge = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.PLAYABLE) {
      return false;
    }

    self.game.challenge(message.nick);
  };

  self.draw = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.PLAYABLE) {
      return false;
    }

    self.game.draw(message.nick);
  };

  self.end = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.PLAYABLE) {
      return false;
    }

    self.game.endTurn(message.nick);
  };

  self.join = function (client, message, cmdArgs) {
    var channel = message.args[0];

    if (cmdArgs !== '') {
      cmdArgs = _.map(cmdArgs.match(/(\w+)\s?/gi), function (str) { return str.trim(); });
    }

    if (!_.isUndefined(self.game) && self.game.state !== Game.STATES.STOPPED && self.game.state !== Game.STATES.FINISHED && self.game.state !== Game.STATES.WAITING) {
      client.say(channel, message.nick + ': Cannot join games that are already in progress.');
      return false;
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.FINISHED) {
      self.game = new Game(message.args[0], client, self.config, cmdArgs);
    }

    var player = new Player(message.nick, message.user, message.host);
    self.game.addPlayer(player);
  };

  self.quit = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state === Game.STATES.FINISHED) {
      return false;
    }

    self.game.removePlayer(message.nick);
  };

  self.score = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      return false;
    }

    self.game.showScores();
  };

  self.start = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.WAITING) {
      return false;
    }

    self.game.start(message.nick);
  };

  self.stop = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state === Game.STATES.FINISHED) {
      return false;
    }

    if (_.isUndefined(self.game.getPlayer({nick: message.nick}))) {
      return false;
    }

    self.game.stop(message.nick);
  };

  self.play = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.PLAYABLE) {
      return false;
    }

    cmdArgs = _.map(cmdArgs.match(/(\w+)\s?/gi), function (str) { return str.trim(); });

    self.game.play(message.nick, cmdArgs[0], cmdArgs[1]);
  };

  self.uno = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.PLAYABLE) {
      return false;
    }
    cmdArgs = _.map(cmdArgs.match(/(\w+)\s?/gi), function (str) { return str.trim(); });
    self.game.uno(message.nick, cmdArgs[0], cmdArgs[1]);
  };

  self.status = function (client, message, cmdArgs){
    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
        client.say(channel, 'No game running. Start the game by typing !j.');
    } else {
        self.game.showStatus();
    }
  };

  self.wiki = function (client, message, cmdArgs){
    if (client.nick.toLowerCase() === message.args[0].toLowerCase()) {
      client.say(message.nick, 'https://github.com/butlerx/butlerbot/wiki/Uno');
    } else {
      client.say(message.args[0], message.nick + ': https://github.com/butlerx/butlerbot/wiki/Uno');
    }
  };
};

exports = module.exports = Uno;
