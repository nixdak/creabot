var c = require('irc-colors'),
    _ = require('underscore'),
    fs = require('fs'),
    inflection = require('inflection');

var STATES = {
  STOPPED: 'Stopped',
  STARTED: 'Started',
  LETTERS: 'Letters',
  NUMBERS: 'Numbers',
  CONUNDRUM: 'Conundrum',
  PLAYED: 'Played',
  PLAY_LETTERS: 'Play letters',
  PLAY_NUMBERS: 'Play numbers',
  LETTERS_ROUND_END: 'Letters round end',
  NUMBERS_ROUND_END: 'Numbers round end',
  WAITING: 'Waiting',
  SELECTING: 'Selecting'
};

var Game = function Game(channel, client, config, challenger, challenged) {
  var self = this;

  self.round = 0; // Round number
  self.channel = channel;
  self.client = client;
  self.config = config;
  self.state = STATES.STARTED;
  self.idleWaitCount = 0;
  self.challenger_nick = challenger;
  self.challenged_nick = challenged;

  console.log(self.channel);

  console.log('Loading dictionary');

  self.dictionary = require('../../config/dictionary.json')['words'];
  self.countdown_words = _.filter(self.dictionary, function (word) { return word.length <= 9; });
  self.conundrum_words = _.filter(self.countdown_words, function (word) { return word.length === 9; });

  console.log('loading alphabet');

  // Load vowels
  self.vowels = [];

  for (var letter in self.config.letterOptions.vowels) {
    for (var i = 0; i < self.config.letterOptions.vowels[letter]; i++) {
      self.vowels.push(letter);
    }
  }

  self.consonants = [];

  // Load consonants
  for (var letter in self.config.letterOptions.consonants) {
    for (var i = 0; i < self.config.letterOptions.consonants[letter]; i++) {
      self.consonants.push(letter);
    }
  }

  self.vowels = _.shuffle(_.shuffle(self.vowels));
  self.consonants = _.shuffle(_.shuffle(self.consonants));

  // Selections
  self.table = {
    letters: [],
    numbers: [],
    conundrum: null
  };

  // Answers
  self.answers = {
    letters: {},
    numbers: {}
  }

  /*
   * Stop the game
   */
  self.stop = function (player, gameEnded) {
    self.state = STATES.STOPPED;

    if (self.challenger_nick === player || self.challenged_nick === player) {
      self.say(player + ' stopped the game.');
    }

    if (self.round > 1) {
      self.showPoints();
    }

    if (gameEnded !== true) {
      self.say('Game has been stopped.')
    }

    // Clear timeouts
    clearTimeout(self.stopTimeout);
    clearTimeout(self.roundTimeout);

    // Remove listeners
    self.client.removeListener('part', self.playerPartHandler);
    self.client.removeListener('quit', self.playerQuitHandler);
    self.client.removeListener('kick' + self.channel, self.playerKickHandler);
    self.client.removeListener('nick', self.playerNickChangeHandler);

    self.client.unsetModerated(self.channel, [self.challenger.nick, self.challenged.nick]);
  };

  /*
   * Show the winner and stop the game
   */
  self.showWinner = function () {
    if (self.challenger.points > self.challenged.points) {
      self.say(self.challenger.nick + ' has won the game with ' + self.challenger.points + ' ' +
        inflection.inflect('point', self.challenger.points) + '!' + ' Congratulations!');
    } else if (self.challenged.points > self.challenger.points) {
      self.say(self.challenged.nick + ' has won the game with ' + self.challenged.points + ' ' +
        inflection.inflect('point', self.challenged.points) + '!' + ' Congratulations!');
    } else {
      self.say('The game has ended in a tie! Perhaps there\'ll be a rematch?');
    }

    self.stop(null, true);
  };

  /**
   * Start next round
   */
  self.nextRound = function () {
    clearTimeout(self.stopTimeout);
    // If it is the conundrum round and this method is called, the game is over
    if (self.config.roundOptions.conundrum === self.round) {
      self.showWinner();
    }

    // check that there's enough players in the game and end if we have waited the 
    if (_.isUndefined(self.challenger)) {
      self.say('Waiting for ' + self.challenger_nick + '. Stopping in one minute if they don\'t join.');

      self.state = STATES.WAITING;
      self.idleWaitCount++;
      // stop game if not enough pleyers in however many minutes in the config
      self.stopTimeout = setTimeout(self.stop, 60 * 1000 * config.gameOptions.roundMinutes);
      return false;
    }

    self.round++;
    console.log('Starting round ', self.round);

    if (self.config.roundOptions.letters.indexOf(self.round) !== -1) {
      console.log('Letters round');
      self.lettersRound();
    } else if (self.config.roundOptions.numbers.indexOf(self.round) !== -1) {
      console.log('Numbers round');
      self.numbersRound();
    } else {
      console.log('Conundrum round');
      self.conundrumRound();
    }
  };

  /*
   * Do round end
   * Check words are in dictionary
   * Declare round winner
   * Start next round
   */
  self.roundEnd = function() {
    if (self.state === STATES.PLAY_LETTERS) {
      self.state = STATES.LETTERS_ROUND_END;
      self.letterRoundEnd();
      self.nextRound();
    } else if (self.state === STATES.PLAY_NUMBERS) {
      self.state = STATES.NUMBERS_ROUND_END;
      self.numberRoundEnd();
      self.nextRound();
    } else {

    }
  };

  self.letterRoundEnd = function() {
    // Show selections
    self.say(self.challenger.nick + ' has played: ' + self.table.answers.challenger.word);
    self.say(self.challenged.nick + ' has played: ' + self.table.answers.challenged.word);

    if (!self.table.answers.challenger.valid) {
      self.say(self.challenger.nick + ': Your word was invalid.');
    }

    if (!self.table.answers.challenged.valid) {
      self.say(self.challenger.nick + ': Your word was invalid');
    }

    // If challenger played a longer valid word
    if (self.table.answers.challenger.word.length > self.table.answers.challegned.word.length && self.table.answers.challenger.valid) {
      if (self.table.answers.challenger.word.legnth === 9) {
        self.say(self.challenger.nick + ' has won this round and scored 18 points.');
        self.challenger.points += 18;
      } else {
        self.say(self.challenger.nick + ' has won this round and scored ' + self.table.answers.challenger.word.length + 
          inflection.inflect('points', self.table.answers.challenger.word.length));
        self.challenger.points += self.table.answers.challenger.word.length;
      }
    }
    // If the challenged played a longer valid word
    else if ((self.table.answers.challenged.word.length > self.table.answers.challegner.word.length && self.table.answers.challenged.valid)) {
      if (self.table.answers.challenged.word.legnth === 9) {
        self.say(self.challenged.nick + ' has won this round and scored 18 points.');
        self.challenged.points += 18;
      } else {
        self.say(self.challenged.nick + ' has won this round and scored ' + self.table.answers.challenged.word.length + 
          inflection.inflect('points', self.table.answers.challenged.word.length));
        self.challenged.points += self.table.answers.challenged.word.length;
      }
    } 
    // Both players played a valid word of the same length
    else if (self.table.answers.challenger.word.length === self.table.answers.challegned.word.length &&
        (self.table.answers.challenger.valid && self.table.answers.challenged.valid)) {
      self.say('This round was a tie, both players have scored ' + self.table.answers.challegned.word.length +
        inflection.inflect('points', self.table.answers.challegned.word.length));
      self.challenged.points += self.table.answers.challegned.word.length;
      self.challenger.points += self.table.answers.challegner.word.length;
    }
    // Neither player played a valid word
    else {
      self.say('Neither player played a valid word and have scored 0 points');
    }

    self.showPoints();
  };

  self.setSelector = function() {
    if (self.round === 1) {
      // Set the selector as the player who accepted the challenge
      self.challenged.selectRound = true;
      self.challenger.selectRound = false;
    }
    else {
      self.challenged.selectRound = !self.challenged.selectRound;
      self.challenger.selectRound = !self.challenger.selectRound;
    }

    self.selector = self.challenged.selectRound ? self.challenged : self.challenger;
  };

  /*
   * Do setup for a letters round
   */
  self.lettersRound = function () {
    self.state = STATES.LETTERS;
    self.say('Round ' + self.round + ': Letters');

    self.setSelector();

    self.say(self.selector.nick + ' will choose the letters for this round.');
    self.say(self.selector.nick + ': Choose the letters for this round with a command similar to: !letters ccvcvccvv');
    self.say(self.selector.nick + ': Where c is a consonant and v is a vowel.');

    clearInterval(self.roundTimer);
    self.roundStarted = new Date();
    self.roundTimer = setInterval(self.roundTimerCheck, 5 * 1000);
  };

  /*
   * Process letter selection by player
   */
  self.letters = function(player, letters) {
    if (self.selector.nick === player) {
      if (letters.length !== 9) {
        self.say("You must provide a selection of 9 consonants or vowels.");
        return false;
      }

      letters.forEach(function (letter) {
        if ('c' === letter.toLowerCase()) {
          self.table.letters.push(self.consonants.shift().toUpperCase());
        } else if ('v' === letter.toLowerCase()) {
          self.table.letters.push(self.vowels.shift().toUpperCase());
        }

        clearInterval(self.roundTimer);
        self.say('Letters for this round: ' + self.table.letters.join(' '));
        self.pm(self.challenger.nick, 'Letters for this round: ' + self.table.letters.join(' '));
        self.pm(self.challenged.nick, 'Letters for this round: ' + self.table.letters.join(' '));
        selp.pm(self.challenger.nick, 'Play a word with !cd [word]');
        selp.pm(self.challenged.nick, 'Play a word with !cd [word]');

        self.state = STATES.PLAY_LETTERS;
        clearInterval(self.roundTimer);
        self.roundStarted = new Date();
        self.roundTimer = setInterval(self.roundTimerCheck, 5 * 1000);

      });
    } else {
      self.say(player.nick + ': It isn\'t your turn to choose the letters');
    }
  };

  self.validateWord = function (word) {
    if (word.length <= 2 || word.length > 9) {
      return false;
    }

    var letters = _.clone(self.table.letters);

    for (var i = 0; i < word.length; i++) {
      if (_.contains(letters, word[0].toUpperCase())) {
        letters = _.without(letters, word);
      } else {
        return false;
      }
    }

    return true;
  };

  self.playLetters = function (player, word) {
    // If letter is too long/short and uses letters not available to the player
    if (!self.validateWord(word)) {
      self.pm(player.nick, 'Your word must be between 3 and 9 letters long and only use the characters available for this round.');
    } else {
      if (self.challenger.nick === player) {
        if (!_.isUndefined(self.answers.challenger) && self.answers.challenger.word.length > word.length) {
          self.pm(player.nick, 'The word you are playing is shorter than your previously played word');
        }

        self.answers.challenger = { word: word, valid: _.contains(self.countdown_words, word.toUpperCase()) }; 
      } else if (self.challenger.nick === player) {
        if (!_.isUndefined(self.answers.challenged) && self.answers.challenged.word.length > word.length) {
          self.pm(player.nick, 'The word you are playing is shorter than your previously played word');
        }

        self.answers.challenged = { word: word, valid: _.contains(self.countdown_words, word.toUpperCase()) };
      }
    }

    self.pm(player, 'You played: ' + word + '. Good luck.');
  };

  /*
   * Do setup for a numbers round
   */
  self.numbersRound = function () {
    self.state = STATES.LETTERS;
    self.say('Round ' + self.round + ': Numbers');

    self.setSelector();

    self.say(self.selector.nick + ' will choose the letters for this round.');
    self.say(self.selector.nick + ': Choose the letters for this round with a command similar to: !letters ccvcvccvv');
    self.say(self.selector.nick + ': Where c is a consonant and v is a vowel.');

    clearInterval(self.roundTimer);
    self.selectionStarted = new Date();
    self.selectionTimer = setInterval(self.roundTimerCheck, 5 * 1000);
  };
 
  /*
   * Do setup for a conundrum round
   */
  self.conundrumRound = function () {
    // Place holder until I figure out how I'm doing the conundrum
    self.nextRound();
  };

  self.roundTimerCheck = function() {
    // Check the time
    var now = new Date();
    var timeLimit = 60 * 1000 * self.config.roundOptions.roundMinutes;
    var roundElapsed = (now.getTime() - self.roundStarted.getTime());

    console.log('Round elapsed: ' + roundElapsed, now.getTime(), self.roundStarted.getTime());

    if (roundElapsed >= timeLimit) {
      self.say('Time is up!');
      self.roundEnd();
      // Do something
    } else if (roundElapsed >= timeLimit - (10 * 1000) && roundElapsed < timeLimit) {
      self.say('10 seconds left!');
    } else if (roundElapsed >= timeLimit - (30 * 1000) && roundElapsed < timeLimit - (20 * 1000)) {
      self.say('30 seconds left!');
    } else if (roundElapsed >= timeLimit - (60 * 1000) && roundElapsed < timeLimit - (50 * 1000)) {
      self.say('1 minute left!');
    }
  };

  /**
   * Add a player to the game
   * @param player Player object containing new player's data
   * @returns The new player or false if invalid player
   */
  self.addPlayer = function (player) {
    console.log('Adding player')
    if (player.nick === self.challenger_nick) { 
      self.challenger = player;
      console.log('Adding challenger');
    } else if (player.nick === self.challenged_nick) {
      self.challenged = player;
      console.log('Adding challenged')
    } else {
      self.say('Sorry, but you cannot join this game');
      return false;
    }

    self.say(player.nick + ' has joined the game.');
    self.client.setVoice(self.channel, player.nick);

    self.nextRound();

    return player;
  };

  /**
   * Helper function for the handlers below
   */
  self.findAndRemoveIfPlaying = function (nick) {
    var player = self.getPlayer({nick: nick});

    if (!_.isUndefined(player)) {
      self.removePlayer(player);
    }
  };

  /**
   * Handle player parts
   * @param channel
   * @param nick
   * @param reason
   * @param message
   */
  self.playerPartHandler = function (channel, nick, reason, message) {
    console.log('Player ' + nick + ' left');
    self.findAndRemoveIfPlaying(nick);
  };

  /**
   * Handle player kicks
   * @param nick
   * @param by
   * @param reason
   * @param message
   */
  self.playerKickHandler = function (nick, by, reason, message) {
    console.log('Player ' + nick + ' was kicked by ' + by);
    self.findAndRemoveIfPlaying(nick);
  };

  /**
   * Handle player kicks
   * @param nick
   * @param reason
   * @param channel
   * @param message
   */
  self.playerQuitHandler = function (nick, reason, channel, message) {
    console.log('Player ' + nick + ' left');
    self.findAndRemoveIfPlaying(nick);
  };

  /**
   * Handle player nick changes
   * @param oldnick
   * @param newnick
   * @param channels
   * @param message
   */
  self.playerNickChangeHandler = function (oldnick, newnick, channels, message) {
    console.log('Player changed nick from ' + oldnick + ' to ' + newnick);
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

  // client listeners
  client.addListener('part', self.playerPartHandler);
  client.addListener('quit', self.playerQuitHandler);
  client.addListener('kick'+channel, self.playerKickHandler);
  client.addListener('nick', self.playerNickChangeHandler);

  self.say('Game setup complete');
};

Game.STATES = STATES;

exports = module.exports = Game;
