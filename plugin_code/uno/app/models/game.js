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

    if (!_.isUndefined(player) && !_.isNull(player)) {
      self.say(player.nick + ' stopped the game.');
    }

    if (pointLimitReached !== true) {
      self.say('Game has been stopped.');
    }

    // Remove listeners
    client.removeListener('part', self.playerPartHandler);
    client.removeListener('quit', self.playerQuitHandler);
    client.removeListener('kick' + self.channel, self.playerKickHandler);
    client.removeListener('nick', self.playerNickChangeHandler);

    // Clear timeouts and intervals
    clearTimeout(self.startTimeout);

    // Delete Game properties
    delete self.players;
    delete self.channel;
    delete self.client;
    delete self.config;
    delete self.state;
    delete self.pointLimit;
    delete self.deck;
    delete self.discard;
  };

  self.startTimeoutFunction = function () {
    clearTimeout(self.startTimeout);
    self.say('PING! ' + _.map(self.players, function (player) { return player.nick; }).join(', '));
    self.say('The current game took too long to start and has been cancelled. If you are still active, please join again to start a new game.');
    self.stop();
  }

  self.deal = function (player, number) {
    for (int i = 0; i < number; i++) {
      if (self.deck.numCards() === 0) {
        self.deck = self.discard;
        self.discard = new Deck(false);
        self.deck.shuffle();
      }

      self.deck.deal(player.deck);
    }
  };

  self.setPlayer = function () {
    if (_.isUndefined(self.currentPlayer)) {
      self.currentPlayer = _.where(self.players, { isActive: true })[0];
      self.currentPlayer.turn = true;
      return true;
    }

    for (int i = (self.players.indexOf(self.currentPlayer) + 1) % self.players.length; i !== self.players.indexOf(self.currentPlayer); i = (i + 1) % self.players.length) {
      if (self.players[i].isActive === true) {
        self.currentPlayer = self.players[i];
        self.currentPlayer.turn = true;
      }
    }
  };

  self.nextTurn = function() {
    var winner = _.filter(self.players, function (player) { return player.deck.numCards() === 0})[0];

    if (!_.isUndefined(winner)) {
      self.say(winner.nick + ' has played all their cards and won the game! Congratulations!');
      self.stop(null, true);
      return false
    }
    self.setPlayer();
  };

  self.start = function (nick) {
    if (_.isUndefined(self.getPlayer({nick: nick}))) {
      self.say(nick + ': Only players may start the game. !j to get in on the fun.');
      return false;
    }

    self.state = STATES.STARTED;

    _.each(self.players, function (player) {
      self.deal(player, 7);
    });

    self.nextTurn();
  };

  self.play = function (player, card) {

  };

  self.addPlayer = function (player) {
    var alreadyPlayer = self.getPlayer({ nick: player.nick, user: player.user, hostname: player.hostname });

    if (_.isUndefined(alreadyPlayer)) {
      self.players.push(player);
    }

    self.say(player.nick + ' has joined the game!');

    if (self.state === STATES.WAITING && _.where(self.players, { isActive: true }).length === 10) {
      self.start();
    }
  };

  self.setTopic = function (topic) {
    // ignore if not configured to set topic
    if (_.isUndefined(config.gameOptions.setTopic) || config.gameOptions.setTopic === false) {
      return false;
    }

    // construct new topic
    var newTopic = topic;
    if (typeof config.gameOptions.topicBase !== 'undefined') {
      newTopic = topic + ' ' + config.gameOptions.topicBase;
    }

    // set it
    client.send('TOPIC', channel, newTopic);
  };

  self.getPlayer = function (search) {
    return _.findWhere(self.players, search);
  }

  self.findAndRemoveIfPlaying = function (nick) {
    var player = self.getPlayer({nick: nick});

    if (!_.isUndefined(player)) {
      self.removePlayer(player);
    }
  };

  self.playerPartHandler = function (channel, nick, reason, message) {
    console.log(nick + ' left. Removing from game.');
    self.findAndRemoveIfPlaying(nick);
  };

  self.playerKickHandler = function(nick, by, reason, message) {
    console.log(nick + ' was kicked. Removing from game.');
    self.findAndRemoveIfPlaying(nick);
  }

  self.playerQuitHandler = function (nick, reason, channel, message) {
    console.log(nick + ' has quit. Removing from game.');
    self.findAndRemoveIfPlaying(nick);
  };

  self.playerNickChangeHandler = function (oldnick, newnick, channel, message) {
    console.log(oldnick + ' has changed to ' + newnick + '. Updating player.');

    var player = self.getPlayer({nick: oldnick});

    if (!_.isUndefined(player)) {
      player.nick = newnick;
    }
  };

  self.say = function (string) {
    self.client.say(self.channel, string);
  };

  self.pm = function (nick, string) {
    self.client.say(nick, string);
  };

  self.setTopic(c.bold.lime('A game is running. Type !j to get in on the fun!'));
  self.say('A new game of ' + c.bold.yellow('U') + c.bold.green('N') + c.bold.blue('O') + c.bold.red('!') + ' has been started. Type !j to join' +
    ' and !start when ready.'
  );

  if (_.isUndefined(self.config.gameOptions.minutesBeforeStart)) {
    self.minutesBeforeStart = 10;
  } else {
    self.minutesBeforeStart = self.config.gameOptions.minutesBeforeStart;
  }

  self.startTime = new Date();
  self.startTimeout = setTimeout(self.startTimeoutFunction, self.minutesBeforeStart * 60 * 1000);

  self.client.addListener('part', self.playerPartHandler);
  self.client.addListener('kick'+self.channel, self.playerKickHandler);
  self.client.addListener('quit', self.playerQuitHandler);
  self.client.addListener('nick', self.playerNickChangeHandler);
};

Game.STATES = STATES;

exports = module.exports = Game;