var c = require('irc-colors'),
    _ = require('underscore'),
    inflection = require('inflection'),
    Deck = require('../controllers/deck')
    Card = require('./card');

var STATES = {
  STOPPED: 'Stopped',
  STARTED: 'Started',
  PLAYABLE: 'Playable',
  TURN_END: 'Turn End',
  FINISHED: 'Game Finished',
  WAITING: 'Waiting'
};

var Game = function (channel, client, config, cmdArgs) {
  var self = this;

  self.players = [];
  self.channel = channel;
  self.client = client;
  self.config = config;
  self.state = STATES.STOPPED;
  self.pointLimit = 0;
  self.deck = new Deck(true);
  self.discard = new Deck(false);
  self.firstCard = true;
  self.turn = 0;
  self.colors = ['YELLOW', 'GREEN', 'BLUE', 'RED'];

  self.deck.shuffle();

  if (!_.isUndefined(self.config.gameOptions.pointLimit) && !isNaN(self.config.gameOptions.pointLimit)) {
    console.log('Setting pointLimit to ' + self.config.gameOptions.pointLimit + ' from config');
    self.pointLimit = self.config.gameOptions.pointLimit;
  }

  if (!_.isUndefined(cmdArgs[0]) && !isNan(cmdArgs[0])) {
    console.log('Setting pointLimit to ' + cmdArgs[0] + 'from arguments');
    self.pointLimit = cmdArgs[0];
  }

  self.stop = function (nick, pointLimitReached) {

    self.state = STATES.FINISHED;

    player = self.getPlayer({ nick: nick });

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
    clearInterval(self.turnTimeout);

    // Delete Game properties
    delete self.players;
    delete self.channel;
    delete self.client;
    delete self.config;
    delete self.pointLimit;
    delete self.deck;
    delete self.discard;
  };

  self.startTimeoutFunction = function () {
    clearTimeout(self.startTimeout);
    self.say('PING! ' + _.map(self.players, function (player) { return player.nick; }).join(', '));
    self.say('The current game took too long to start and has been cancelled. If you are still active, please join again to start a new game.');
    self.stop();
  };

  self.deal = function (player, number, showCard) {
    for (var i = 0; i < number; i++) {
      if (self.deck.numCards() === 0) {
        self.deck = self.discard;
        self.discard = new Deck(false);
        self.discard.addCard(self.deck.getCurrentCard());
        self.deck.shuffle();
      }

      var card = self.deck.deal();

      if (showCard === true) {
        self.pm(player.nick, 'You drew ' + c.bold.white('[' + player.hand.numCards() + '] ') + card.toString());
      }

      player.hand.addCard(card);
    }
  };

  self.nextPlayer = function() {
    if (_.isUndefined(self.currentPlayer)) {
      return self.players[0];
    }

    if (self.players.length === 2) {
      currentPlayerIndex = self.players.indexOf(self.currentPlayer);
      nextPlayerIndex = (currentPlayerIndex + 1) % self.players.length;

      nextPlayer = self.players[nextPlayerIndex].skipped === false ? self.players[nextPlayerIndex] : self.currentPlayer;
      return nextPlayer;
    }

    for (var i = (self.players.indexOf(self.currentPlayer) + 1) % self.players.length; i !== self.players.indexOf(self.currentPlayer); i = (i + 1) % self.players.length) {
      if (self.players[i].skipped === false) {
        return self.players[i];
      }
    }
  };

  self.lastPlayer = function() {
    if (self.players.length === 2) {
      currentPlayerIndex = self.players.indexOf(self.currentPlayer);
      lestPlayerIndex = (currentPlayerIndex - 1) % self.players.length;

      lestPlayer = self.players[lastPlayerIndex].skipped === false ? self.players[lastPlayerIndex] : self.currentPlayer;
      return lastPlayer;
    }

    for (var i = (self.players.indexOf(self.currentPlayer) - 1) % self.players.length; i !== self.players.indexOf(self.currentPlayer); i = (i + 1) % self.players.length) {
      if (self.players[i].skipped === false) {
        return self.players[i];
      }
    }
  };

  self.setPlayer = function () {
    self.currentPlayer = self.nextPlayer();
    self.currentPlayer.uno = false;
  };

  self.turnTimer = function() {
    // check the time
    var now = new Date();
    var timeLimit = (60 * config.gameOptions.turnMinutes - self.currentPlayer.roundShorten )* 1000 ;
    var roundElapsed = (now.getTime() - self.roundStarted.getTime());

    console.log('Round elapsed:', roundElapsed, now.getTime(), self.roundStarted.getTime());

    if (roundElapsed >= timeLimit) {
      console.log('The round timed out');
      self.say('Time is up!');
      // Temporary deal with idle players by removing them
      self.idled();
    } else if (roundElapsed >= timeLimit - (10 * 1000) && roundElapsed < timeLimit) {
      // 10s ... 0s left
      self.say('10 seconds left!');
      self.pm(self.currentPlayer.nick, '10 seconds left');
    } else if (roundElapsed >= timeLimit - (30 * 1000) && roundElapsed < timeLimit - (20 * 1000)) {
      // 30s ... 20s left
      self.say('30 seconds left!');
      self.pm(self.currentPlayer.nick, '30 seconds left');
    } else if (roundElapsed >= timeLimit - (60 * 1000) && roundElapsed < timeLimit - (50 * 1000)) {
      // 60s ... 50s left
      self.say('Hurry up, 1 minute left!');
      self.pm(self.currentPlayer.nick, 'Hurry up, 1 minute left!');
    }
  };

  self.showCards = function (player) {
    var cardString = 'Your cards are:';
    if (!_.isUndefined(player)) {
      _.each(player.hand.getCards(), function (card, index) {
        cardString += c.bold(' [' + index + '] ') + card.toString();
      });

      self.pm(player.nick, cardString);
    }
  };

  self.nextTurn = function() {
    self.state = STATES.TURN_END;
    if (!_.isUndefined(self.turnTimeout)) {
      clearTimeout(self.turnTimeout);
    }

    var winner = _.filter(self.players, function (player) { return player.hand.numCards() === 0})[0];

    if (!_.isUndefined(winner)) {
      self.say(winner.nick + ' has played all their cards and won the game! Congratulations!');
      self.stop(null, true);
      return false
    }

    self.state = STATES.PLAYABLE;
    self.setPlayer();

    if (self.turn === 0) {
      self.discard.addCard(self.deck.deal());
    }

    self.turn += 1;
    // Unset flags
    _.each(self.players, function (player) {
      player.skipped = false;
      player.hasPlayed = false;
      player.hasDrawn = false;
    });

    self.say('TURN ' + self.turn + ': ' + self.currentPlayer.nick + '\'s turn.');

    if (self.firstCard === true) {
      self.firstCard = false;
      self.say('The first card is: ' + self.discard.getCurrentCard().toString());
      self.discard.getCurrentCard().onPlay(self);
    }

    self.showCards(self.currentPlayer);
    self.pm(self.currentPlayer.nick, 'The current card is: ' + self.discard.getCurrentCard().toString());

    self.roundStarted = new Date();
    self.turnTimeout = setInterval(self.turnTimer, 10 * 1000);
  };

  self.idled = function () {
    var currentPlayer = self.currentPlayer;
    currentPlayer.idleTurns += 1;
    currentPlayer.roundShorten += 40;

    if (currentPlayer.idleTurns < self.config.gameOptions.maxIdleTurns) {
      self.say(currentPlayer.nick + ' has idled. Drawing a card and ending their turn.');
      self.draw(currentPlayer.nick);
    } else {
      self.say(currentPlayer.nick + ' has idled ' + self.config.gameOptions.maxIdleTurns + ' ' +
        inflection.inflect('time', self.config.gameOptions.maxIdleTurns) + '. Removing them from the game.'
      );
      self.removePlayer(currentPlayer.nick);
    }

    if (!_.isUndefined(self.players)) {
      self.nextTurn();
    }
  };

  self.endTurn = function (nick, idled) {
    if (!_.isUndefined(nick) && self.currentPlayer.nick !== nick) {
      self.pm(nick, 'It is not your turn');
      return false;
    }

    if (self.currentPlayer.hasPlayed === false && self.currentPlayer.hasDrawn === false) {
      self.pm(self.currentPlayer.nick, 'You must at least draw a card before you can end your turn');
      return false;
    }

    if (self.currentPlayer.hasPlayed === false) {
      self.say(self.currentPlayer.nick + ' has ended their turn without playing.');
    }

    self.currentPlayer.idleTurns = 0;
    self.currentPlayer.roundShorten = 0;
    self.nextTurn();
  };

  self.start = function (nick) {
    clearTimeout(self.startTimeout);

    if (_.isUndefined(self.getPlayer({nick: nick}))) {
      self.say(nick + ': Only players may start the game. !j to get in on the fun.');
      return false;
    }

    if (self.players.length < 2) {
      self.say(nick + ': There must be at least 2 players to start a game.');
      return false;
    }

    self.state = STATES.STARTED;

    _.each(self.players, function (player) {
      self.deal(player, 7);
    });

    self.nextTurn();
  };

  self.play = function (nick, card, color) {
    var player = self.getPlayer({ nick: nick });

    if (_.isUndefined(player)) {
      console.log('Player is undefined');
      return false;
    }

    if (player !== self.currentPlayer) {
      self.pm(player.nick, 'It is not your turn.');
      return false;
    }

    if (isNaN(card)) {
      self.pm(player.nick, 'Please enter a valid numeric index');
      return false;
    }

    card = parseInt(card);

    if (card < 0 || card >= player.hand.numCards()) {
      self.pm(player.nick, 'Please enter a valid index');
      return false;
    }

    if (player.hand.checkPlayable(card, self.discard.getCurrentCard()) === false) {
      self.pm(player.nick, 'That card is not playable. Please select another card.');
      return false;
    }

    if (player.hand.getCard(card).color === 'WILD' && _.isUndefined(color)) {
      self.pm(player.nick, 'Please provide a color for this card!');
      return false;
    }

    if (player.hand.getCard(card).color === 'WILD' && !_.contains(self.colors, color.toUpperCase())) {
      self.pm(player.nick, 'Please provide a valid color for this card. [Red, Blue, Green, Yellow]');
      return false;
    }

    if (player.hasDrawn && card !== numCards - 1){
      self.pm(player.nick, 'You Must use the card you drew');
      return false;
    }

    var pickedCard = player.hand.pickCard(card);

    self.discard.addCard(pickedCard);

    self.say(player.nick + ' has played ' + pickedCard.toString() + '!');

    pickedCard.onPlay(self);

    if (pickedCard.color === 'WILD') {
      self.say(player.nick + ' has changed the color to ' + color);
      pickedCard.color = color.toUpperCase();
    }

    self.say(player.nick + ' has ' + player.hand.numCards() + ' ' + inflection.inflect('card', player.hand.numCards()) + ' left!');

    player.hasPlayed = true;
    self.endTurn();
  };

  self.draw = function (nick) {
    if (self.currentPlayer.nick !== nick) {
      self.pm(nick, 'It is not your turn.');
      return false;
    }

    if (self.currentPlayer.hasDrawn === true) {
      self.pm(nick, 'You can only draw once per turn.');
      return false;
    }

    self.deal(self.currentPlayer, 1, true);
    self.currentPlayer.hasDrawn = true;

    self.say(self.currentPlayer.nick + ' has drawn a card and has ' + self.currentPlayer.hand.numCards() + ' left.');

    var playable = _.filter(self.currentPlayer.hand.getCards(), function (card) {return card.isPlayable(self.discard.getCurrentCard())});

    if (playable.length === 0) {
      self.pm(self.currentPlayer, 'You have no playable cards. Ending your turn.');
      self.endTurn();
    }
  };

  self.uno = function (nick) {
    if (self.currentPlayer.nick !== nick) {
      self.pm(nick, 'It is not your turn.');
      return false;
    }
    self.currentPlayer.uno = true;
  };

  self.challenge = function (nick) {
    if(self.turn === 1){
      self.say("You cant challenge now");
    }
    self.previousPlayer = self.lastPlayer();
    self.say(nick + ' has challenged ' + self.previousPlayer.nick);
    if(self.previousPlayer.uno === true){
      self.say(self.previousPlayer.nick + ' said Uno');
      return false;
    }
    if(self.previousPlayer.hand.numCards() === 1){
      self.say(self.previousPlayer.nick + ' didn\'t say Uno and must draw 2 cards');
      self.draw(previousPlayer.nick);
      self.draw(previousPlayer.nick);
    }
    self.previousPlayer.uno = false;
  };

  self.showStatus = function (){
    if (self.state === STATES.PLAYABLE) {
      self.say('It is currently ' + currentPlayer.nick + ' go!');
    } else {
      self.say(self.Player.length + ' people are playing. ' + _.pluck(players, 'nick').join(', ')))
    }
  }

  self.addPlayer = function (player) {
    var alreadyPlayer = self.getPlayer({ nick: player.nick, user: player.user, hostname: player.hostname });

    if (!_.isUndefined(alreadyPlayer)) {
      return false;
    }

    self.players.push(player);
    self.state = STATES.WAITING;
    self.say(player.nick + ' has joined the game!');

    if (self.state === STATES.WAITING && self.players.length === 10) {
      self.start();
    }
  };

  self.removePlayer = function (nick) {
    var player = self.getPlayer({ nick: nick });

    if (_.isUndefined(player)) {
      return false;
    }

    // Add cards back into the deck
    _.each(player.hand.getCards(), function (card) {
      self.deck.addCard(card);
    });

    self.deck.shuffle();

    // Next turn
    self.say(player.nick + ' has left the game.');

    self.players.splice(self.players.indexOf(player), 1);

    if (self.currentPlayer === player && self.players.length >= 2) {
      self.nextTurn();
    } else {
      if(self.state === STATES.PLAYABLE ) {
        self.stop();
      }
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
      self.removePlayer(player.nick);
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
