const _ = require('lodash');
const Game = require('../models/game');
const Player = require('../models/player');
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.json')[env];

const Uno = function Uno () {
  const self = this;
  self.config = config;

  self.cards = (client, { nick }, cmdArgs) => {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.PLAYABLE) {
      return false;
    }

    const player = self.game.getPlayer({ nick });
    self.game.showCards(player);
  };

  self.challenge = (client, { nick }, cmdArgs) => {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.PLAYABLE) {
      return false;
    }

    self.game.challenge(nick);
  };

  self.draw = (client, { nick }, cmdArgs) => {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.PLAYABLE) {
      return false;
    }

    self.game.draw(nick);
  };

  self.end = (client, { nick }, cmdArgs) => {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.PLAYABLE) {
      return false;
    }

    self.game.endTurn(nick);
  };

  self.join = (client, { args, nick, user, host }, cmdArgs) => {
    const channel = args[0];

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (
      !_.isUndefined(self.game) &&
      self.game.state !== Game.STATES.STOPPED &&
      self.game.state !== Game.STATES.FINISHED &&
      self.game.state !== Game.STATES.WAITING
    ) {
      client.say(channel, `${nick}: Cannot join games that are already in progress.`);
      return false;
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.FINISHED) {
      self.game = new Game(args[0], client, self.config, cmdArgs);
    }

    const player = new Player(nick, user, host);
    self.game.addPlayer(player);
  };

  self.quit = (client, { nick }, cmdArgs) => {
    if (_.isUndefined(self.game) || self.game.state === Game.STATES.FINISHED) {
      return false;
    }

    self.game.removePlayer(nick);
  };

  self.score = (client, message, cmdArgs) => {
    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      return false;
    }

    self.game.showScores();
  };

  self.start = (client, { nick }, cmdArgs) => {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.WAITING) {
      return false;
    }

    self.game.start(nick);
  };

  self.stop = (client, { nick }, cmdArgs) => {
    if (_.isUndefined(self.game) || self.game.state === Game.STATES.FINISHED) {
      return false;
    }

    if (_.isUndefined(self.game.getPlayer({ nick }))) {
      return false;
    }

    self.game.stop(nick);
  };

  self.play = (client, { nick }, cmdArgs) => {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.PLAYABLE) {
      return false;
    }
    cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    self.game.play(nick, cmdArgs[0], cmdArgs[1]);
  };

  self.uno = (client, { nick }, cmdArgs) => {
    if (_.isUndefined(self.game) || self.game.state !== Game.STATES.PLAYABLE) {
      return false;
    }
    cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    self.game.uno(nick, cmdArgs[0], cmdArgs[1]);
  };

  self.status = (client, { args }, cmdArgs) => {
    const channel = args[0];
    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(channel, 'No game running. Start the game by typing !j.');
    } else {
      self.game.showStatus();
    }
  };

  self.wiki = (client, { args, nick }, cmdArgs) => {
    if (client.nick.toLowerCase() === args[0].toLowerCase()) {
      client.say(nick, 'https://github.com/butlerx/butlerbot/wiki/Uno');
    } else {
      client.say(args[0], `${nick}: https://github.com/butlerx/butlerbot/wiki/Uno`);
    }
  };
};

exports = module.exports = Uno;
