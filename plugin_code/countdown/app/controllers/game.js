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
  self.challenger = challenger;
  self.challenged = challenged;
  self.vowel_array = ['A', 'E', 'I', 'O', 'U'];

  console.log(self.channel);

  console.log('Loading dictionary');

  self.dictionary = require('../../config/dictionary.json')['words'];
  self.countdown_words = _.filter(self.dictionary, function (word) { return word.length <= 9; });
  self.conundrum_words = _.shuffle(_.filter(self.countdown_words, function (word) { return word.length === 9; }));

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
    challenged: {},
    challenger: {}
  };

  /*
   * Stop the game
   */
  self.stop = function (player, gameEnded) {
    console.log('Stopping the game');

    if (self.challenger.nick === player || self.challenged.nick === player) {
      self.say(player + ' stopped the game.');
    } else {
      return false;
    }

    if (self.round > 1 && gameEnded !== true) {
      self.showPoints();
    }
    if (self.state === STATES.conundrum && gameEnded !== true){
      self.say('No one got the conundrum. The answer was ' + self.table.conundrum);
    }

    self.state = STATES.STOPPED;
    if (gameEnded !== true) {
      self.say('Game has been stopped.');
    }

    // Clear timeouts
    clearTimeout(self.stopTimeout);
    clearInterval(self.roundTimer);

    // Remove listeners
    self.client.removeListener('part', self.playerPartHandler);
    self.client.removeListener('quit', self.playerQuitHandler);
    self.client.removeListener('kick' + self.channel, self.playerKickHandler);
    self.client.removeListener('nick', self.playerNickChangeHandler);

    self.unsetModerated([self.challenged.nick]);

    if (!_.isUndefined(self.challenger)) {
      self.unsetModerated([self.challenger.nick]);
    }
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

    // check that there's enough players in the game and end if we have waited the
    if (self.challenger.isJoined === false) {
      self.say('Waiting for ' + self.challenger.nick + '. Stopping in ' +
        self.config.roundOptions.roundMinutes + ' ' + inflection.inflect('minute', self.config.roundOptions.roundMinutes) +
        ' if they don\'t join.'
      );

      self.state = STATES.WAITING;
      self.idleWaitCount++;
      // stop game if not enough pleyers in however many minutes in the config
      self.stopTimeout = setTimeout(self.stop, 60 * 1000 * config.gameOptions.roundMinutes);
      return false;
    }

    self.round++;
    console.log('Starting round ', self.round);
    self.challenger.hasPlayed = false;
    self.challenger.isLocked = false;
    self.challenged.hasPlayed = false;
    self.challenged.isLocked = false;

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
    clearInterval(self.roundTimer);
    if (self.state === STATES.PLAY_LETTERS) {
      self.state = STATES.LETTERS_ROUND_END;

      console.log(self.challenger.hasPlayed);
      console.log(self.challenged.hasPlayed);

      if (!self.challenger.hasPlayed) {
        self.say(self.challenger.nick + ' has idled. ' + self.challenged.nick + ' wins by default. Stopping the game.');
        self.stop();
      } else if (!self.challenged.hasPlayed) {
        self.say(self.challenged.nick + ' has idled. ' + self.challenger.nick + ' wins by default. Stopping the game.');
        self.stop();
      } else {
        console.log('In the round end else statement');
        self.letterRoundEnd();
        self.nextRound();
      }
    } else if (self.state === STATES.PLAY_NUMBERS) {
      self.state = STATES.NUMBERS_ROUND_END;

      if (self.challenger.hasPlayed && self.challenged.hasPlayed) {
        self.numberRoundEnd();
        self.nextRound();
      } else {
        if (!self.challenger.hasPlayed) {
          self.say(self.challenger.nick + ' has idled. ' + self.challenged.nick + ' wins by default. Stopping the game.');
          self.stop();
        } else {
          self.say(self.challenged.nick + ' has idled. ' + self.challenger.nick + ' wins by default. Stopping the game.');
          self.stop();
        }
      }
    } else if (self.state === STATES.CONUNDRUM) {
      if (self.challenged.points !== self.challenger.points){
        self.showWinner();
      }else{
        self.nextRound();
      }
    }
  };

  self.letterRoundEnd = function() {
    // Show selections
    console.log('In letterRoundEnd')
    self.say(self.challenger.nick + ' has played: ' + self.answers.challenger.word);
    self.say(self.challenged.nick + ' has played: ' + self.answers.challenged.word);

    if (self.answers.challenger.valid === false) {
      console.log('Challenger word invalid');
      self.say(self.challenger.nick + ': Your word was invalid.');
    }

    if (self.answers.challenged.valid === false) {
      console.log('Challenged word invalid');
      self.say(self.challenged.nick + ': Your word was invalid');
    }

    // If challenger played a longer valid word
    if (self.answers.challenger.word.length > self.answers.challenged.word.length && self.answers.challenger.valid === true) {
      if (self.answers.challenger.word.length === 9) {
        self.say(self.challenger.nick + ' has won this round and scored 18 points.');
        self.challenger.points += 18;
      } else {
        self.say(self.challenger.nick + ' has won this round and scored ' + self.answers.challenger.word.length + ' ' +
          inflection.inflect('points', self.answers.challenger.word.length));
        self.challenger.points += self.answers.challenger.word.length;
      }
    }
    // If the challenged played a longer valid word
    else if ((self.answers.challenged.word.length > self.answers.challenger.word.length && self.answers.challenged.valid === true)) {
      if (self.answers.challenged.word.length === 9) {
        self.say(self.challenged.nick + ' has won this round and scored 18 points.');
        self.challenged.points += 18;
      } else {
        self.say(self.challenged.nick + ' has won this round and scored ' + self.answers.challenged.word.length + ' ' +
          inflection.inflect('points', self.answers.challenged.word.length));
        self.challenged.points += self.answers.challenged.word.length;
      }
    }
    // Both players played a valid word of the same length
    else if (self.answers.challenger.word.length === self.answers.challenged.word.length &&
        (self.answers.challenger.valid === true && self.answers.challenged.valid === true)) {
      self.say('This round was a tie, both players have scored ' + self.answers.challenged.word.length + ' ' +
        inflection.inflect('points', self.answers.challenged.word.length));
      self.challenged.points += self.answers.challenged.word.length;
      self.challenger.points += self.answers.challenger.word.length;
    }
    //if challenger is not valid and challenged is and they have same length
    else if (self.answers.challenger.word.length === self.answers.challenged.word.length &&
        (self.answers.challenger.valid !== true && self.answers.challenged.valid === true)) {
      self.say(self.challenged.nick + ' has won this round and scored ' + self.answers.challenged.word.length + ' ' +
        inflection.inflect('points', self.answers.challenged.word.length));
      self.challenged.points += self.answers.challenged.word.length;
    }
    //if challenged is not valid and challenger is and they have same length
    else if (self.answers.challenger.word.length === self.answers.challenged.word.length &&
        (self.answers.challenged.valid !== true && self.answers.challenger.valid === true)) {
      self.say(self.challenger.nick + ' has won this round and scored ' + self.answers.challenger.word.length + ' ' +
        inflection.inflect('points', self.answers.challenger.word.length));
      self.challenger.points += self.answers.challenger.word.length;
    }
    // Neither player played a valid word
    else {
      self.say('Neither player played a valid word and have scored 0 points');
    }

    for (var letter = self.table.letters.pop(); !_.isUndefined(letter); letter = self.table.letters.pop()) {
      if (_.contains(self.vowel_array, letter)) {
        self.vowels.push(letter);
      } else {
        self.consonants.push(letter);
      }
    }

    self.answers = {
      challenger: {},
      challenged: {}
    };

    self.vowels = _.shuffle(_.shuffle(self.vowels));
    self.consonants = _.shuffle(_.shuffle(self.consonants));

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
    self.say(self.selector.nick + ': Choose the letters for this round with a command similar to: !select ccvcvccvv');
    self.say(self.selector.nick + ': Where c is a consonant and v is a vowel.');
  };

  /*
   * Process letter selection by player
   */
  self.letters = function(player, letters) {
    if (self.selector.nick === player) {
      if (letters.length !== 9) {
        self.say('You must provide a selection of 9 consonants or vowels.');
        return false;
      }

      if (_.reject(letters, function(letter) { return letter === 'c' || letter === 'v'}).length !== 0) {
        self.say('Your selection should consist only of the letters c and v');
        return false;
      }

      letters.forEach(function (letter) {
        if ('c' === letter.toLowerCase()) {
          self.table.letters.push(self.consonants.shift().toUpperCase());
        } else if ('v' === letter.toLowerCase()) {
          self.table.letters.push(self.vowels.shift().toUpperCase());
        }
      });

      clearInterval(self.roundTimer);
      self.say('Letters for this round: ' + self.table.letters.join(' '));
      self.say(self.config.roundOptions.roundMinutes + ' ' + inflection.inflect('minute', self.config.roundOptions.roundMinutes) +
        ' on the clock'
      );

      self.pm(self.challenger.nick, 'Letters for this round: ' + self.table.letters.join(' '));
      self.pm(self.challenger.nick, self.config.roundOptions.roundMinutes + ' ' +
        inflection.inflect('minute', self.config.roundOptions.roundMinutes) + ' on the clock'
      );
      self.pm(self.challenger.nick, 'Play a word with !cd [word]');

      self.pm(self.challenged.nick, 'Letters for this round: ' + self.table.letters.join(' '));
      self.pm(self.challenged.nick, 'Play a word with !cd [word]');
      self.pm(self.challenged.nick, self.config.roundOptions.roundMinutes + ' ' +
        inflection.inflect('minute', self.config.roundOptions.roundMinutes) + ' on the clock'
      );

      self.state = STATES.PLAY_LETTERS;
      clearInterval(self.roundTimer);
      self.roundStarted = new Date();
      self.roundTimer = setInterval(self.roundTimerCheck, 10 * 1000);

    } else {
      self.say(player.nick + ': It isn\'t your turn to choose the letters');
    }
  };

  self.playLetters = function (player, word) {
    word = word.toUpperCase();
    if (self.challenger.nick === player || self.challenged.nick === player) {

      if ((self.challenger.nick === player && self.challenger.isLocked === true) || 
          (self.challenged.nick === player && self.challenger.isLocked === true)) {
        self.pm(player, "You cannot play anymore words as you have locked in your answer for this round");
        return false;
      }

      // If letter is too long/short and uses letters not available to the player
      if (word.length <= 2 || word.length > 9) {
        self.pm(player, 'Your word must be between 3 and 9 letters long and only use the characters available for this round.');
        return false;
      }

      // Make sure the player didn't reuse any letters
      var letters = _.clone(self.table.letters);
      var valid = true;

      for (var i = 0; i < word.length; i++) {
        if (_.contains(letters, word[i].toUpperCase())) {
          console.log(letters);
          letters.splice(_.indexOf(letters, word[i]), 1);
        } else {
          valid = false;
          break;
        }
      }

      if (valid !== true) {
        self.pm(player, 'Your word must not reuse any letters more than they appear, and must only use letters that have been slected for this round');
        return false;
      } else {
        if (self.challenger.nick === player) {
          self.answers.challenger = { word: word, valid: _.contains(self.countdown_words, word.toUpperCase()) };
          self.challenger.hasPlayed = true;
        } else if (self.challenged.nick === player) {
          self.answers.challenged = { word: word, valid: _.contains(self.countdown_words, word.toUpperCase()) };
          self.challenged.hasPlayed = true;
        }
      }

      self.pm(player, 'You played: ' + word + '. Good luck.');
      console.log(self.answers);
    }
  };

  /*
   * Do setup for a numbers round
   */
  self.numbersRound = function () {
    self.state = STATES.NUMBERS;
    self.say('Round ' + self.round + ': Numbers');

    self.setSelector();

    self.say(self.selector.nick + ' will choose the Numbers for this round.');
    self.say(self.selector.nick + ': Choose the Numbers for this round with a command similar to: !select lslsss');
    self.say(self.selector.nick + ': Where l is a large number and s is a small number.');
  };

  /*
   * Process number selection by player
   */
  self.number = function(player, numbers) {
    if (self.selector.nick === player) {
      if (numbers.length !== 6) {
        self.say('You must provide a selection of 6 numbers.');
        return false;
      }
    }

    if (_.reject(numbers, function(number) { return number === 'l' || number === 's'}).length !== 0) {
      self.say('Your selection should consist only of the letters l and s');
      return false;
    }

    if (_.filter(numbers, function(number) { return number === 'l' }).length > 4) {
      self.say('Your selection should have a maximum of 4 large numbers');
      return false;
    }

    numbers.forEach(function (number) {
      if ('l' === number.toLowerCase()) {
        self.table.numbers.push(self.large.shift());
      } else if ('s' === number.toLowerCase()) {
        self.table.numbers.push(self.small.shift());
      }
    });

    clearInterval(self.roundTimer);
  }

  /*
   * Do setup for a conundrum round
   */
  self.conundrumRound = function () {
    if(0 <= (self.challenged.points - self.challenger.points) && (self.challenged.points - self.challenger.points) <= 10){
      self.say('Round ' + self.round + ': Crucial Conundrum');
    }else if (0 <= (self.challenger.points - self.challenged.points) && (self.challenger.points - self.challenged.points) <= 10) {
      self.say('Round ' + self.round + ': Crucial Conundrum');
    }else{
      self.say('Round ' + self.round + ': Conundrum');
    }

    self.table.conundrum = self.conundrum_words.shift();

    self.say('Fingers on buzzers for today\'s countdown conundrum');
    self.say('Use !buzz word to guess the conundrum.');
    self.say('Conundrum: ' + _.shuffle(self.table.conundrum).join(''));

    self.state = STATES.CONUNDRUM;
    clearInterval(self.roundTimer);
    self.roundStarted = new Date();
    self.roundTimer = setInterval(self.roundTimerCheck, 10 * 1000);
  };

  self.playConundrum = function(player, word) {
    if (self.challenged.nick === player || self.challenger.nick === player) {
      word = word.toUpperCase();
      if (self.challenged.nick === player) {
        if(!self.challenged.hasBuzzed){
            if (self.table.conundrum === word) {
                self.say(player + ' has correctly guessed the countdown conundrum and scored 10 points');
                self.challenged.points += 10;
                self.nextRound();
            }else{
                self.say(player + ' has incorrectly guessed the countdown conundrum');
                self.challenged.hasBuzzed = true;
            }
        } else self.say(player + ' has already Buzzed');
      }else{
        if(!self.challenger.hasBuzzed){
            if (self.table.conundrum === word) {
                self.say(self.challenger.nick + ' has correctly guessed the countdown conundrum and scored 10 points');
                self.challenger.points += 10;
                self.nextRound();
            }else{
                self.say(self.challenger.nick + ' has incorrectly guessed the countdown conundrum');
                self.challenger.hasBuzzed = true;
            }
        } else self.say(self.challenger.nick + ' has already Buzzed');
      }
    }
  }

  self.roundTimerCheck = function() {
    // Check the time
    var now = new Date();
    var timeLimit = 60 * 1000 * self.config.roundOptions.roundMinutes;
    var roundElapsed = (now.getTime() - self.roundStarted.getTime());

    console.log('Round elapsed: ' + roundElapsed, now.getTime(), self.roundStarted.getTime());

    if (roundElapsed >= timeLimit) {
      self.say('DO DO DO D-D-DOOOO');
      self.roundEnd();
      // Do something
    } else if (roundElapsed >= timeLimit - (10 * 1000) && roundElapsed < timeLimit) {
      self.say('10 seconds left!');
      self.pm(self.challenger.nick, '10 seconds left');
      self.pm(self.challenged.nick, '10 seconds left');
    } else if (roundElapsed >= timeLimit - (20 * 1000) && roundElapsed < timeLimit - (10 * 1000)) {
      self.say('20 seconds left!');
      self.pm(self.challenger.nick, '20 seconds left');
      self.pm(self.challenged.nick, '20 seconds left');
    } else if (roundElapsed >= timeLimit - (30 * 1000) && roundElapsed < timeLimit - (20 * 1000)) {
      self.say('30 seconds left!');
      self.pm(self.challenger.nick, '30 seconds left');
      self.pm(self.challenged.nick, '30 seconds left');
    } else if (roundElapsed >= timeLimit - (60 * 1000) && roundElapsed < timeLimit - (50 * 1000)) {
      self.say('1 minute left!');
      self.pm(self.challenger.nick, '1 minute left');
      self.pm(self.challenged.nick, '1 minute left');
    }
  };

  /**
   * Add a player to the game
   * @param player Player object containing new player's data
   * @returns The new player or false if invalid player
   */
  self.addPlayer = function (player) {
    console.log('Adding player: ' + player.nick);
    if (self.challenger.nick === player.nick) {
      self.challenger.joined = true;
      console.log('Adding challenger');
    } else if (self.challenged.nick === player.nick) {
      self.challenged.joined = true;
      console.log('Adding challenged')
    } else {
      self.say('Sorry, but you cannot join this game');
      return false;
    }

    self.say(player.nick + ' has joined the game.');
    self.setVoice(player.nick);

    self.nextRound();

    return player;
  };

  self.lock = function (player) {
    if (self.challenger.nick === player) {
      if (self.challenger.isLocked !== true) {
        self.say(player + ' has locked in their answer');
        self.challenger.isLocked === true;
      }
    } else if (self.challenged.nick === player) {
      if (self.challenger.isLocked !== true) {
        self.say(player + ' has locked in their answer');
        self.challenged.isLocked === true;
      }
    }

    if (self.challenger.isLocked && self.challenged.isLocked) {
      self.say('Both players have locked their answers. Ending the round');
      self.roundEnd();
    }
  };

  self.showPoints = function () {
    if (self.round === 0 ) {
      self.say('The game hasn\'t begun yet');
    } else {
      self.say('Round: ' + self.round + '.');
      self.say(self.challenged.nick + ' has ' + self.challenged.points + ' points while ' +
        self.challenger.nick + ' has ' + self.challenger.points + ' points.'
      );
    }
  };

  /**
   * Helper function for the handlers below
   */
  self.findAndRemoveIfPlaying = function (nick) {
    if (self.challenger.nick === nick || self.challenged.nick === nick) {

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
    if (self.challenger.nick === oldnick) {
      self.challenger.nick === newnick;
      return true;
    } else if (self.challenged.nick === oldnick) {
      self.challenged.nick === newnick;
      return true;
    }

    return false;
  };

  self.say = function (string) {
    self.client.say(self.channel, string);
  };

  self.pm = function (nick, string) {
    self.client.say(nick, string);
  };

  self.setModerated = function () {
    self.client.send('MODE ' + self.channel + ' +m');
  };

  self.setVoice = function (nick) {
    self.client.send('MODE ' + self.channel + ' +v ' + nick);
  };

  self.unsetModerated = function (nicks) {
    self.client.send('MODE ' + self.channel + ' -m');

    nicks.forEach(function (nick) {
      self.client.send('MODE ' + self.channel + ' -v ' + nick);
    });
  };

  // client listeners
  client.addListener('part', self.playerPartHandler);
  client.addListener('quit', self.playerQuitHandler);
  client.addListener('kick'+ channel, self.playerKickHandler);
  client.addListener('nick', self.playerNickChangeHandler);

};

Game.STATES = STATES;

exports = module.exports = Game;
