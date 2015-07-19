var c = require('irc-colors'),
    _ = require('underscore'),
    inflection = require('inflection'),
    Deck = require('../controllers/deck')
    Card = require('./card');

var STATES = {
  STOPPED: 'Stopped',
  STARTED: 'Started',
  PLAYABLE: 'Playable',
  PLAYED: 'Played',
  TURN_END: 'Turn End',
  WAITING: 'Waiting',
};

var Game = function (channel, client, config, cmdArgs) {
  var self = this;

  self.players = [];
  self.channel = channel;
  self.client = client;
  self.config = config;
  self.state = STATES.STARTED;
  self.pointLimit = 0;

  self.deck = new Deck(true);
  self.discard = new Deck(false);

  self.deck.shuffle();

  if (!_.isUndefined(self.config.gameOptions.pointLimit) && !.isNaN(self.config.gameOptions.pointLimit)) {
    console.log('Setting pointLimit to ' + self.config.gameOptions.pointLimit + ' from config');
    self.pointLimit = self.config.gameOptions.pointLimit;
  }

  if (!_.isUndefined(cmdArgs[0]) && !.isNan(cmdArgs[0])) {
    console.log('Setting pointLimit to ' + cmdArgs[0] + 'from arguments');
    self.pointLimit = cmdArgs[0];
  }

  self.stop = function (player, pointLimitReached) {
    self.state = STATES.STOPPED;


  };

  self.start = function (player) {

  };

  self.play = function (player, card) {

  };

  self.addPlayer = function (player) {

  };
};

Game.STATES = STATES;

exports = module.exports = Game;