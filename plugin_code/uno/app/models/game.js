var c = require('irc-colors'),
    _ = require('underscore'),
    inflection = require('inflection'),
    Deck = require('../controllers/deck'),
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

  if (!_.isUndefined(cmdArgs[0]) && !isNaN(cmdArgs[0])) {
    console.log('Setting pointLimit to ' + cmdArgs[0] + 'from arguments');
    self.pointLimit = cmdArgs[0];
  }

  self.stop = function (nick, pointLimitReached) {
    self.state = STATES.FINISHED;
    console.log('In game.stop()');

    // Clear timeouts and intervals
    clearTimeout(self.startTimeout);
    clearInterval(self.turnTimeout);

    player = self.getPlayer({ nick: nick });

    if (!_.isUndefined(player) && !_.isNull(player)) {
      self.say(player.nick + ' stopped the game.');
    }

    if (pointLimitReached !== true) {
      self.say('Game has been stopped.');
    }

    self.setTopic('No game running! !j To start a new one.');

    // Remove listeners
    client.removeListener('part', self.playerPartHandler);
    client.removeListener('quit', self.playerQuitHandler);
    client.removeListener('kick' + self.channel, self.playerKickHandler);
    client.removeListener('nick', self.playerNickChangeHandler);

    // Delete Game properties
    delete self.players;
    delete self.channel;
    delete self.client;
    delete self.config;
    delete self.pointLimit;
    delete self.deck;
    delete self.discard;
    console.log('Game stopped');
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

  self.setPlayer = function () {
    self.currentPlayer = self.nextPlayer();
  };

  self.turnTimer = function() {
    // check the time
    var now = new Date();

    var seconds = Math.max(60, (60 * self.config.gameOptions.turnMinutes) -
                              (self.currentPlayer.idleTurns * self.config.gameOptions.idleRoundTimerDecrement));
    var timeLimit = seconds * 1000;
    var roundElapsed = (now.getTime() - self.roundStarted.getTime());

    console.log('Round elapsed:', roundElapsed, now.getTime(), self.roundStarted.getTime());

    if (roundElapsed >= timeLimit) {
      self.say('Time is up!');
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

  self.showRoundInfo = function() {
    var seconds = Math.max(60, ((60 * self.config.gameOptions.turnMinutes) -
      (self.currentPlayer.idleTurns * self.config.gameOptions.idleRoundTimerDecrement)));

    self.say('TURN ' + self.turn + ': ' + self.currentPlayer.nick + '\'s turn. ' + seconds + ' seconds on the clock');
    self.setTopic('TURN ' + self.turn + ': ' + self.currentPlayer.nick + '\'s turn.');
  };

  self.nextTurn = function() {
    console.log('In game.nextTurn()');
    self.state = STATES.TURN_END;

    var winner = _.filter(self.players, function (player) { return player.hand.numCards() === 0})[0];

    if (!_.isUndefined(winner)) {
      console.log('Doing winner');
      self.say(winner.nick + ' has played all their cards and won the game! Congratulations!');
      self.stop(null, true);
      return false;
    }

    if (self.players.length == 1) {
      self.say('Only one player left. ' + self.players[0].nick + ' wins the game!');
      self.stop(null, null);
      return false;
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
      player.uno = false;
    });

    self.showRoundInfo();

    if (self.firstCard === true) {
      self.say('The first card is: ' + self.discard.getCurrentCard().toString());
      self.discard.getCurrentCard().onPlay(self);
    }

    self.showCards(self.currentPlayer);
    self.pm(self.currentPlayer.nick, 'The current card is: ' + self.discard.getCurrentCard().toString());

    self.roundStarted = new Date();
    self.turnTimeout = setInterval(self.turnTimer, 10 * 1000);
  };

  self.idled = function () {
    self.currentPlayer.idleTurns += 1;
    console.log(self.currentPlayer.nick + ' has idled ' + self.currentPlayer.idleTurns);

    if (self.currentPlayer.idleTurns < self.config.gameOptions.maxIdleTurns) {
      self.say(self.currentPlayer.nick + ' has idled. Drawing a card and ending their turn.');
      self.draw(self.currentPlayer.nick, true);
    } else {
      self.say(self.currentPlayer.nick + ' has idled ' + self.config.gameOptions.maxIdleTurns + ' ' +
        inflection.inflect('time', self.config.gameOptions.maxIdleTurns) + '. Removing them from the game.'
      );
      self.removePlayer(self.currentPlayer.nick);
    }

    if (!_.isUndefined(self.players)) {
      self.endTurn();
    }
  };

  self.endTurn = function (nick, idle) {
    if (!_.isUndefined(nick) && self.currentPlayer.nick !== nick) {
      self.pm(nick, 'It is not your turn');
      return false;
    }

    if (self.currentPlayer.hasPlayed === false && self.currentPlayer.hasDrawn === false) {
      self.pm(self.currentPlayer.nick, 'You must at least draw a card before you can end your turn');
      return false;
    }

    if (self.currentPlayer.hasPlayed === false && idle !== true ) {
      self.say(self.currentPlayer.nick + ' has ended their turn without playing.');
    }

    if (self.currentPlayer.uno === false && self.currentPlayer.hand.numCards() === 1) {
      self.currentPlayer.challengable = true;
    }

    if (idle !== true) {
      self.currentPlayer.idleTurns = 0;
    }

    self.nextTurn();
  };

  self.start = function (nick) {
    console.log('In game.start()');
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

  self.playCard = function (player, card, color) {
    var playString = '';

    self.discard.addCard(card);

    playString += player.nick + ' has played ' + card.toString() + '! ';

    if (card.color === 'WILD') {
      playString += player.nick + ' has changed the color to ' + color + '. ';
      card.color = color.toUpperCase();
    }

    playString += player.nick + ' has ' + player.hand.numCards() + ' ' + inflection.inflect('card', player.hand.numCards()) + ' left';

    self.say(playString);

    card.onPlay(self);
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

    if (player.hasDrawn && card !== player.hand.numCards() - 1){
      self.pm(player.nick, 'You must use the card you drew');
      return false;
    }

    var pickedCard = player.hand.pickCard(card);
    var playString = '';

    self.discard.addCard(pickedCard);

    playString += player.nick + ' has played ' + pickedCard.toString() + '! ';

    pickedCard.onPlay(self);

    if (pickedCard.color === 'WILD') {
      playString += player.nick + ' has changed the color to ';
      switch (color.toUpperCase()) {
        case 'YELLOW':
          playString +=  c.bold.yellow(color) + '. ';
          break;
        case 'GREEN':
          playString +=  c.bold.green(color) + '. ';
          break;
        case 'BLUE':
          playString +=  c.bold.blue(color) + '. ';
          break;
        case 'RED':
          playString +=  c.bold.red(color) + '. ';
          break;
      }
      pickedCard.color = color.toUpperCase();
    }

    clearInterval(self.turnTimeout);

    self.say(playString);

    player.hasPlayed = true;

    _.each(self.players, function (player) { player.challengeable = false; });
    self.endTurn();
  };

  self.draw = function (nick, idle) {
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

    _.each(self.players, function (player) { player.challengeable = false; });

    self.say(self.currentPlayer.nick + ' has drawn a card and has ' + self.currentPlayer.hand.numCards() + ' left.');

    var drawnCard = self.currentPlayer.hand.getCard(self.currentPlayer.hand.numCards() - 1);

    if (idle) {
      clearInterval(self.turnTimeout);
      self.endTurn(nick, idle);
    } else if (drawnCard.isPlayable(self.discard.getCurrentCard()) === false) {
      self.pm(self.currentPlayer.nick, 'You have no playable cards. Ending your turn.');
      clearInterval(self.turnTimeout);
      self.endTurn();
    }
  };

  self.uno = function (nick, card, color) {
    if (self.currentPlayer.nick !== nick) {
      self.pm(nick, 'It is not your turn');
      return false;
    }

    if (self.currentPlayer.hand.numCards() === 2) {
      self.currentPlayer.uno = true;
      self.say(self.currentPlayer.nick + ' has declared UNO!');
      if (!_.isUndefined(card)){
        self.play(nick, card, color);
      }
    }

  };

  self.challenge = function (nick) {
    var player = self.getPlayer({ nick: nick });

    if (_.isUndefined(player) === true) {
      return false;
    }

    if (player.hasChallenged === true) {
      return false;
    }

    if (self.turn === 1) {
      return false;
    }

    var challengeablePlayer = self.getPlayer({ challengeable: true });

    if (!_.isUndefined(challengeablePlayer)) {
      self.say(player.nick + ' has successfully challenged ' + challengeablePlayer.nick + '. ' + challengeablePlayer.nick + ' has drawn 2 cards.');
      self.deal(challengeablePlayer, 2, true);
      challengeablePlayer = false;
    } else {
      self.say(player.nick + ' has unsuccessfully challeneged  and has picked up 2 cards.');
      self.deal(player, 2, true);
    }

    player.hasChallenged = true;
  };

  self.showStatus = function (){
    if (self.state === STATES.PLAYABLE) {
      self.say('It is currently ' + currentPlayer.nick + ' go!');
    } else {
      self.say(self.players.length + ' people are playing. ' + _.pluck(players, 'nick').join(', '));
    }
  };


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
    console.log(player.nick + ' removed.');
    self.say(player.nick + ' has left the game.');
    self.players.splice(self.players.indexOf(player), 1);

    // If the player is the current player, move to the next turn
    if (!_.isUndefined(self.currentPlayer) && self.currentPlayer === player) {
      self.nextTurn();
    } else if (self.players.length < 2 && self.state !== STATES.FINISHED && self.state !== STATES.STOPPED && self.state !== STATES.WAITING) {
      self.stop();
    } else if (self.players.length === 0) {
      self.stop();
    }
  };

  self.setTopic = function (topic) {
    // ignore if not configured to set topic
    if (_.isUndefined(self.config.gameOptions.setTopic) || self.config.gameOptions.setTopic === false) {
      return false;
    }

    // construct new topic
    var newTopic = topic;
    if (typeof self.config.gameOptions.topicBase !== 'undefined') {
      newTopic = topic + ' ' + self.config.gameOptions.topicBase;
    }

    // set it
    client.send('TOPIC', channel, newTopic);
  };

  self.getPlayer = function (search) {
    return _.findWhere(self.players, search);
  };

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
  };

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

  self.setTopic(c.bold.lime('A game is running. Type !j to get in on the fun! and !start when ready to play.'));
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
