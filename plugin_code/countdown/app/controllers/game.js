const _ = require('lodash');
const inflection = require('inflection');
const mathjs = require('mathjs');

const STATES = {
  STOPPED          : 'Stopped',
  STARTED          : 'Started',
  LETTERS          : 'Letters',
  NUMBERS          : 'Numbers',
  CONUNDRUM        : 'Conundrum',
  PLAYED           : 'Played',
  PLAY_LETTERS     : 'Play letters',
  PLAY_NUMBERS     : 'Play numbers',
  LETTERS_ROUND_END: 'Letters round end',
  NUMBERS_ROUND_END: 'Numbers round end',
  WAITING          : 'Waiting',
  SELECTING        : 'Selecting',
};

const Game = function Game (
  channel,
  client,
  config,
  challenger,
  challenged,
  lettersTime,
  numbersTime,
  conundrumsTime
) {
  const self = this;

  self.round = 0; // Round number
  self.channel = channel;
  self.client = client;
  self.config = config;
  self.state = STATES.STARTED;
  self.idleWaitCount = 0;
  self.challenger = challenger;
  self.challenged = challenged;
  self.lettersTime = lettersTime;
  self.numbersTime = numbersTime;
  self.conundrumsTime = conundrumsTime;
  self.vowel_array = ['A', 'E', 'I', 'O', 'U'];
  self.valid_numbers_characters = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
    ' ',
    '+',
    '-',
    '*',
    '/',
    '(',
    ')',
  ];
  self.conundrumAns = false;

  console.log(self.channel);
  console.log(
    `letters: ${self.lettersTime} numbers: ${self.numbersTime} conundrum: ${self.conundrumsTime}`
  );

  console.log('Loading dictionary');

  self.dictionary = require('../../config/dictionary.json')['words'];
  self.conundrums = require('../../config/conundrums.json')['words'];
  self.countdown_words = _.filter(self.dictionary, ({ length }) => length <= 9);
  self.conundrum_words = _.shuffle(_.invokeMap(self.conundrums, word => word.toUpperCase()));

  console.log('loading alphabet');

  // Load vowels
  self.vowels = [];

  for (const letter in self.config.letterOptions.vowels) {
    for (let i = 0; i < self.config.letterOptions.vowels[letter]; i++) {
      self.vowels.push(letter);
    }
  }

  self.consonants = [];

  // Load consonants
  for (const letter in self.config.letterOptions.consonants) {
    for (let i = 0; i < self.config.letterOptions.consonants[letter]; i++) {
      self.consonants.push(letter);
    }
  }

  self.vowels = _.shuffle(_.shuffle(self.vowels));
  self.consonants = _.shuffle(_.shuffle(self.consonants));

  console.log('Loading numbers');

  self.small = _.shuffle(_.shuffle(self.config.numberOptions.small));
  self.large = _.shuffle(_.shuffle(self.config.numberOptions.large));

  // Selections
  self.table = {
    letters  : [],
    numbers  : [],
    target   : 0,
    conundrum: null,
  };

  // Discards
  self.discards = {
    consonants: [],
    vowels    : [],
  };

  // Answers
  self.answers = {
    challenged: {},
    challenger: {},
  };

  /*
   * Stop the game
   */
  self.stop = (player, gameEnded) => {
    console.log('Stopping the game');

    // If a particular player ended the game output say so
    if (self.challenger.nick === player || self.challenged.nick === player) {
      self.say(`${player} stopped the game.`);
    }

    if (self.round > 1 && gameEnded !== true) {
      self.say(
        `${self.challenged.nick} has ${self.challenged.points} points while ${self.challenger.nick} has ${self.challenger.points} points.`
      );
    }

    if (self.state === STATES.conundrum && gameEnded !== true) {
      self.say(`No one got the conundrum. The answer was ${self.table.conundrum}`);
    }

    self.state = STATES.STOPPED;

    if (gameEnded !== true) {
      self.say('Game has been stopped.');
    }

    self.setTopic('No game running!');

    // Clear timeouts
    clearTimeout(self.stopTimeout);
    clearTimeout(self.conundrumTimeout);
    clearInterval(self.roundTimer);

    // Remove listeners
    self.client.removeListener('part', self.playerPartHandler);
    self.client.removeListener('quit', self.playerQuitHandler);
    self.client.removeListener(`kick${self.channel}`, self.playerKickHandler);
    self.client.removeListener('nick', self.playerNickChangeHandler);
  };

  /*
   * Show the winner and stop the game
   */
  self.showWinner = () => {
    if (self.challenger.points > self.challenged.points) {
      self.say(
        `${self.challenger.nick} has won the game with ${self.challenger.points} ${inflection.inflect(
          'point',
          self.challenger.points
        )}! While ${self.challenged.nick} got ${self.challenged.points} ${inflection.inflect(
          'point',
          self.challenged.points
        )}! Congratulations!`
      );
    } else if (self.challenged.points > self.challenger.points) {
      self.say(
        `${self.challenged.nick} has won the game with ${self.challenged.points} ${inflection.inflect(
          'point',
          self.challenged.points
        )}! While ${self.challenger.nick} got ${self.challenger.points} ${inflection.inflect(
          'point',
          self.challenger.points
        )}! Congratulations!`
      );
    } else {
      self.say("The game has ended in a tie! Perhaps there'll be a rematch?");
    }
    self.stop(null, true);
  };

  /**
   * Start next round
   */
  self.nextRound = () => {
    clearTimeout(self.stopTimeout);

    // check that there's enough players in the game and end if we have waited the
    if (self.challenger.hasJoined === false) {
      self.say(
        `Waiting for ${self.challenger.nick}. Stopping in ${self.config.gameOptions.minutesBeforeStart} ${inflection.inflect(
          'minute',
          self.config.gameOptions.minutesBeforeStart
        )} if they don't join.`
      );

      self.state = STATES.WAITING;
      // stop game if not enough pleyers in however many minutes in the config
      self.stopTimeout = setTimeout(
        self.stop,
        60 * 1000 * self.config.gameOptions.minutesBeforeStart
      );
      return false;
    }

    if (
      self.challenger.idleCount === self.config.gameOptions.maxIdleCount &&
      self.challenged.idleCount === self.config.gameOptions.maxIdleCount
    ) {
      self.say('Both players have idled too many times. Neither player wins');
      self.stop();
      return false;
    } else if (self.challenger.idleCount === self.config.gameOptions.maxIdleCount) {
      self.say(
        `${self.challenger.nick} has idled too many times. ${self.challenged.nick} has won by default.`
      );
      self.stop();
      return false;
    } else if (self.challenged.idleCount === self.config.gameOptions.maxIdleCount) {
      self.say(
        `${self.challenged.nick} has idled too many times. ${self.challenger.nick} has won by default.`
      );
      self.stop();
      return false;
    }

    self.round++;
    self.showPoints();
    console.log('Starting round ', self.round);
    self.challenger.hasPlayed = false;
    self.challenger.isLocked = false;
    self.challenged.hasPlayed = false;
    self.challenged.isLocked = false;

    if (_.includes(self.config.roundOptions.letters, self.round)) {
      console.log('Letters round');
      self.lettersRound();
    } else if (_.includes(self.config.roundOptions.numbers, self.round)) {
      console.log('Numbers round');
      self.numbersRound();
    } else {
      console.log('Conundrum round');
      self.say(
        `Starting conundrum in ${self.config.roundOptions.secondsBeforeConundrum} ${inflection.inflect(
          'second',
          self.config.roundOptions.secondsBeforeConundrum
        )}`
      );
      self.conundrumTimeout = setTimeout(
        self.conundrumRound,
        self.config.roundOptions.secondsBeforeConundrum * 1000
      );
    }
  };

  /*
   * Do round end
   * Check words are in dictionary
   * Declare round winner
   * Start next round
   */
  self.roundEnd = () => {
    clearInterval(self.roundTimer);

    console.log(self.challenger.hasPlayed);
    console.log(self.challenged.hasPlayed);

    if (
      self.challenger.hasPlayed !== true &&
      self.state !== STATES.CONUNDRUM &&
      self.challenger.isLocked !== true
    ) {
      self.say(`${self.challenger.nick} has idled.`);
      self.challenger.idleCount++;
    }

    if (
      self.challenged.hasPlayed !== true &&
      self.state !== STATES.CONUNDRUM &&
      self.challenged.isLocked !== true
    ) {
      self.say(`${self.challenged.nick} has idled.`);
      self.challenged.idleCount++;
    }

    if (self.state === STATES.PLAY_LETTERS) {
      self.state = STATES.LETTERS_ROUND_END;

      if (self.challenger.hasPlayed !== true) {
        self.answers.challenger = { word: self.table.letters.join(''), valid: false };
      }

      if (self.challenged.hasPlayed !== true) {
        self.answers.challenged = { word: self.table.letters.join(''), valid: false };
      }

      self.letterRoundEnd();
      self.nextRound();
    } else if (self.state === STATES.PLAY_NUMBERS) {
      self.state = STATES.NUMBERS_ROUND_END;

      if (self.challenger.hasPlayed !== true) {
        self.answers.challenger = { value: self.table.target + 20 };
      }

      if (self.challenged.hasPlayed !== true) {
        self.answers.challenged = { value: self.table.target + 20 };
      }

      self.numberRoundEnd();
      self.nextRound();
    } else if (self.state === STATES.CONUNDRUM) {
      if (self.conundrumAns !== true) {
        self.say(`No one got the conundrum. The answer was ${self.table.conundrum}`);
        self.conundrumAns = false;
      }
      if (self.challenged.points !== self.challenger.points) {
        self.showWinner();
      } else {
        self.nextRound();
      }
    }
  };

  self.letterRoundEnd = () => {
    // Show selections
    console.log('In letterRoundEnd');

    if (self.challenger.hasPlayed === true) {
      self.say(`${self.challenger.nick} has played: ${self.answers.challenger.word}`);
    }

    if (self.challenged.hasPlayed === true) {
      self.say(`${self.challenged.nick} has played: ${self.answers.challenged.word}`);
    }

    // If both words are valid
    if (self.answers.challenger.valid === true && self.answers.challenged.valid === true) {
      // If both words are the same length
      if (self.answers.challenger.word.length === self.answers.challenged.word.length) {
        // If word is 9 characters
        if (self.answers.challenger.word.length === 9) {
          self.say('Both players have scored 18 points this round.');
          self.challenger.points += 18;
          self.challenged.points += 18;
        } else {
          // If word is less than 9 characters
          self.say(
            `Both players have scored ${self.answers.challenger.word.length} points this round.`
          );
          self.challenger.points += self.answers.challenger.word.length;
          self.challenged.points += self.answers.challenged.word.length;
        }
      } else if (self.answers.challenger.word.length > self.answers.challenged.word.length) {
        // If challenger word is longer
        // If word is 9 characters
        if (self.answers.challenger.word.length === 9) {
          self.say(`${self.challenger.nick} has won this round and scored 18 points/`);
          self.challenger.points += 18;
        } else {
          // If word is less than 9 characters
          self.say(
            `${self.challenger.nick} has won this round and scored ${self.answers.challenger.word.length} points.`
          );
          self.challenger.points += self.answers.challenger.word.length;
        }
      } else if (self.answers.challenged.word.length > self.answers.challenger.word.length) {
        // If challenged word is longer
        // If word is 9 characters
        if (self.answers.challenged.word.length === 9) {
          self.say(`${self.challenged.nick} has won this round and scored 18 points.`);
          self.challenged.points += 18;
        } else {
          // If word is less than 9 characters
          self.say(
            `${self.challenged.nick} has won this round and scored ${self.answers.challenged.word.length} points.`
          );
          self.challenged.points += self.answers.challenged.word.length;
        }
      }
    } else if (self.answers.challenger.valid === true) {
      // If challenger word is valid
      if (self.challenged.hasPlayed === true && self.answers.challenged.valid === false) {
        console.log('Challenged word invalid');
        self.say(`${self.challenged.nick}: Your word was invalid`);
      }

      // If word is 9 characters
      if (self.answers.challenger.word.length === 9) {
        self.say(`${self.challenger.nick} has won this round and scored 18 points.`);
        self.challenger.points += 18;
      } else {
        // If word is less than 9 characters
        self.say(
          `${self.challenger.nick} has won this round and scored ${self.answers.challenger.word.length} points.`
        );
        self.challenger.points += self.answers.challenger.word.length;
      }
    } else if (self.answers.challenged.valid === true) {
      // If challenged word is valid
      if (self.challenger.hasPlayed === true && self.answers.challenger.valid === false) {
        console.log('Challenger word invalid');
        self.say(`${self.challenger.nick}: Your word was invalid.`);
      }

      // If word is 9 characters
      if (self.answers.challenged.word.length === 9) {
        self.say(`${self.challenged.nick} has won this round and scored 18 points/`);
        self.challenged.points += 18;
      } else {
        // If word is less than 9 characters
        self.say(
          `${self.challenged.nick} has won this round and scored ${self.answers.challenged.word.length} points.`
        );
        self.challenged.points += self.answers.challenged.word.length;
      }
    } else {
      // If neither word is valid
      self.say('Neither player played a valid word and have scored 0 points');
    }

    for (
      let letter = self.table.letters.pop();
      !_.isUndefined(letter);
      letter = self.table.letters.pop()
    ) {
      if (_.includes(self.vowel_array, letter)) {
        self.discards.vowels.push(letter);
      } else {
        self.discards.consonants.push(letter);
      }
    }

    self.answers = {
      challenger: {},
      challenged: {},
    };
  };

  self.numberRoundEnd = () => {
    const challengerDifference = Math.max(self.table.target, self.answers.challenger.value) -
      Math.min(self.table.target, self.answers.challenger.value);
    const challengedDifference = Math.max(self.table.target, self.answers.challenged.value) -
      Math.min(self.table.target, self.answers.challenged.value);

    if (challengedDifference > 10 && challengerDifference > 10) {
      self.say('No player has gotten within 10 of the target and no points have been awarded');
    } else if (challengerDifference < challengedDifference) {
      if (self.answers.challenger.value === self.table.target) {
        self.say(
          `${self.challenger.nick} has hit the target of ${self.table.target} with ${self.answers.challenger.expression} and receives 10 points.`
        );
        self.challenger.points += 10;
      } else if (challengerDifference <= 5) {
        self.say(
          `${self.challenger.nick} has gotten within ${challengerDifference} of the target with ${self.answers.challenger.expression} = ${self.answers.challenger.value} and receives 7 points.`
        );
        self.challenger.points += 7;
      } else if (challengerDifference <= 10) {
        self.say(
          `${self.challenger.nick} has gotten within ${challengerDifference} of the target with ${self.answers.challenger.expression} = ${self.answers.challenger.value} and receives 5 points.`
        );
        self.challenger.points += 5;
      }
    } else if (challengedDifference < challengerDifference) {
      if (self.answers.challenged.value === self.table.target) {
        self.say(
          `${self.challenged.nick} has hit the target of ${self.table.target} with ${self.answers.challenged.expression} and receives 10 points.`
        );
        self.challenged.points += 10;
      } else if (challengedDifference <= 5) {
        self.say(
          `${self.challenged.nick} has gotten within ${challengedDifference} of the target with ${self.answers.challenged.expression} = ${self.answers.challenged.value} and receives 7 points.`
        );
        self.challenged.points += 7;
      } else if (challengedDifference <= 10) {
        self.say(
          `${self.challenged.nick} has gotten within ${challengedDifference} of the target with ${self.answers.challenged.expression} = ${self.answers.challenged.value} and receives 5 points.`
        );
        self.challenged.points += 5;
      }
    } else if (challengedDifference === challengerDifference) {
      if (
        self.answers.challenger.value === self.table.target &&
        self.answers.challenged.value === self.table.target
      ) {
        self.say(
          `${self.challenged.nick} hit the target of ${self.table.target} with ${self.answers.challenged.expression}`
        );
        self.say(
          `${self.challenger.nick} hit the target of ${self.table.target} with ${self.answers.challenger.expression}`
        );
        self.say('Both players have hit the target and scored 10 points.');
        self.challenger.points += 10;
        self.challenged.points += 10;
      } else if (challengedDifference <= 5 && challengerDifference <= 5) {
        self.say(
          `${self.challenged.nick} has gotten within ${challengedDifference} of the target with ${self.answers.challenged.expression} = ${self.answers.challenged.value} and receives 7 points.`
        );
        self.say(
          `${self.challenger.nick} has gotten within ${challengerDifference} of the target with ${self.answers.challenger.expression} = ${self.answers.challenger.value} and receives 7 points.`
        );
        self.challenged.points += 7;
        self.challenger.points += 7;
      } else if (challengedDifference <= 10 && challengerDifference <= 10) {
        self.say(
          `${self.challenged.nick} has gotten within ${challengedDifference} of the target with ${self.answers.challenged.expression} = ${self.answers.challenged.value} and receives 5 points.`
        );
        self.say(
          `${self.challenger.nick} has gotten within ${challengerDifference} of the target with ${self.answers.challenger.expression} = ${self.answers.challenger.value} and receives 5 points.`
        );
        self.challenged.points += 5;
        self.challenger.points += 5;
      }
    }

    for (
      let number = self.table.numbers.pop();
      !_.isUndefined(number);
      number = self.table.numbers.pop()
    ) {
      if (_.includes(self.config.numberOptions.small, number)) {
        self.small.push(number);
      } else {
        self.large.push(number);
      }
    }

    self.answers = {
      challenger: {},
      challenged: {},
    };

    self.small = _.shuffle(_.shuffle(self.small));
    self.large = _.shuffle(_.shuffle(self.large));
  };

  self.setSelector = () => {
    if (self.round === 1) {
      // Set the selector as the player who accepted the challenge
      self.challenged.selectRound = true;
      self.challenger.selectRound = false;
    } else {
      self.challenged.selectRound = !self.challenged.selectRound;
      self.challenger.selectRound = !self.challenger.selectRound;
    }

    self.selector = self.challenged.selectRound ? self.challenged : self.challenger;
  };

  /*
   * Do setup for a letters round
   */
  self.lettersRound = () => {
    self.state = STATES.LETTERS;
    self.say(`Round ${self.round}: Letters`);

    self.setSelector();

    self.say(`${self.selector.nick} will choose the letters for this round.`);
    self.say(
      `${self.selector.nick}: Choose the letters for this round with a command similar to: !cd ccvcvccvv`
    );
    self.say(`${self.selector.nick}: Where c is a consonant and v is a vowel.`);
  };

  /*
   * Process letter selection by player
   */
  self.letters = (player, letters) => {
    if (self.selector.nick === player) {
      if (letters.length !== 9) {
        self.say('You must provide a selection of 9 consonants or vowels.');
        return false;
      }

      if (_.reject(letters, letter => letter === 'c' || letter === 'v').length !== 0) {
        self.say('Your selection should consist only of the letters c and v');
        return false;
      }
      // check minimum Vowels
      if (
        _.reject(letters, letter => letter === 'c').length < self.config.roundOptions.minimumVowels
      ) {
        self.say(`You must have ${self.config.roundOptions.minimumVowels} or more vowels`);
        return false;
      }
      // check minimum constant
      if (
        _.reject(letters, letter => letter === 'v').length <
        self.config.roundOptions.minimumConstant
      ) {
        self.say(`You must have ${self.config.roundOptions.minimumConstant} or more constant`);
        return false;
      }

      if (self.vowels.length < 9) {
        self.vowels.concat = self.vowels.concat(_.shuffle(self.discards.vowels));
        self.discards.vowels = [];
      }

      if (self.consonants.length < 9) {
        self.consonants = self.consonants.concat(_.shuffle(self.discards.consonants));
        self.discards.consonants = [];
      }

      _.forEach(letters, letter => {
        if (letter.toLowerCase() === 'c') {
          self.table.letters.push(self.consonants.shift().toUpperCase());
        } else if (letter.toLowerCase() === 'v') {
          self.table.letters.push(self.vowels.shift().toUpperCase());
        }
      });

      clearInterval(self.roundTimer);
      self.say(`Letters for this round: ${self.table.letters.join(' ')}`);
      if (!_.isUndefined(self.lettersTime)) {
        self.say(
          `${self.lettersTime * 60} ${inflection.inflect(
            'second',
            self.lettersTime * 60
          )} on the clock`
        );
      } else {
        self.say(
          `${self.config.roundOptions.lettersRoundMinutes} ${inflection.inflect(
            'minute',
            self.config.roundOptions.roundMinutes
          )} on the clock`
        );
      }

      self.pm(self.challenger.nick, `Letters for this round: ${self.table.letters.join(' ')}`);
      if (!_.isUndefined(self.lettersTime)) {
        self.pm(
          self.challenger.nick,
          `${self.lettersTime * 60} ${inflection.inflect(
            'second',
            self.lettersTime * 60
          )} on the clock`
        );
      } else {
        self.pm(
          self.challenger.nick,
          `${self.config.roundOptions.lettersRoundMinutes} ${inflection.inflect(
            'minute',
            self.config.roundOptions.roundMinutes
          )} on the clock`
        );
      }
      self.pm(self.challenger.nick, 'Play a word with !cd [word]');

      self.pm(self.challenged.nick, `Letters for this round: ${self.table.letters.join(' ')}`);
      self.pm(self.challenged.nick, 'Play a word with !cd [word]');
      if (!_.isUndefined(self.lettersTime)) {
        self.pm(
          self.challenged.nick,
          `${self.lettersTime * 60} ${inflection.inflect(
            'second',
            self.lettersTime * 60
          )} on the clock`
        );
      } else {
        self.pm(
          self.challenged.nick,
          `${self.config.roundOptions.lettersRoundMinutes} ${inflection.inflect(
            'minute',
            self.config.roundOptions.roundMinutes
          )} on the clock`
        );
      }

      self.state = STATES.PLAY_LETTERS;
      clearInterval(self.roundTimer);
      self.roundStarted = new Date();
      self.roundTimer = setInterval(self.roundTimerCheck, 10 * 1000);
    }
  };

  self.playLetters = (player, word) => {
    word = word.toUpperCase();
    if (self.challenger.nick === player || self.challenged.nick === player) {
      if (
        self.challenger.nick === player && self.challenger.isLocked === true ||
        self.challenged.nick === player && self.challenged.isLocked === true
      ) {
        self.pm(
          player,
          'You cannot play anymore words as you have locked in your answer for this round'
        );
        return false;
      }

      // If letter is too long/short and uses letters not available to the player
      if (word.length <= 2 || word.length > 9) {
        self.pm(
          player,
          'Your word must be between 3 and 9 letters long and only use the characters available for this round.'
        );
        return false;
      }

      // Make sure the player didn't reuse any letters
      const letters = _.clone(self.table.letters);
      let valid = true;

      for (let i = 0; i < word.length; i++) {
        if (_.includes(letters, word[i].toUpperCase())) {
          console.log(letters);
          letters.splice(_.indexOf(letters, word[i]), 1);
        } else {
          valid = false;
          break;
        }
      }

      if (valid !== true) {
        self.pm(
          player,
          'Your word must not reuse any letters more than they appear, and must only use letters that have been slected for this round'
        );
        return false;
      } else {
        if (self.challenger.nick === player) {
          self.answers.challenger = {
            word,
            valid: _.includes(self.countdown_words, word.toUpperCase()),
          };
          self.challenger.hasPlayed = true;
        } else if (self.challenged.nick === player) {
          self.answers.challenged = {
            word,
            valid: _.includes(self.countdown_words, word.toUpperCase()),
          };
          self.challenged.hasPlayed = true;
        }
      }

      self.pm(player, `You played: ${word}. Good luck.`);
      console.log(self.answers);
    }
  };

  /*
   * Do setup for a numbers round
   */
  self.numbersRound = () => {
    self.state = STATES.NUMBERS;
    self.say(`Round ${self.round}: Numbers`);

    self.setSelector();

    self.say(`${self.selector.nick} will choose the Numbers for this round.`);
    self.say(
      `${self.selector.nick}: Choose the Numbers for this round with a command similar to: !cd lslsss`
    );
    self.say(`${self.selector.nick}: Where l is a large number and s is a small number.`);
  };

  /*
   * Process number selection by player
   */
  self.numbers = (player, numbers) => {
    if (self.selector.nick === player) {
      if (numbers.length !== 6) {
        self.say('You must provide a selection of 6 numbers.');
        return false;
      }

      if (_.reject(numbers, number => number === 'l' || number === 's').length !== 0) {
        self.say('Your selection should consist only of the letters l and s');
        return false;
      }

      if (_.filter(numbers, number => number === 'l').length > 4) {
        self.say('Your selection should have a maximum of 4 large numbers');
        return false;
      }

      _.forEach(numbers, number => {
        if (number.toLowerCase() === 'l') {
          self.table.numbers.push(self.large.shift());
        } else if (number.toLowerCase() === 's') {
          self.table.numbers.push(self.small.shift());
        }
      });

      self.table.target = Math.floor(Math.random() * 899) + 100;

      clearInterval(self.roundTimer);
      self.say(
        `Numbers for this round: ${self.table.numbers.join(
          ' '
        )} and the target is: ${self.table.target}`
      );
      if (!_.isUndefined(self.numbersTime)) {
        self.say(
          `${self.numbersTime * 60} ${inflection.inflect(
            'second',
            self.numbersTime * 60
          )} on the clock`
        );
      } else {
        self.say(
          `${self.config.roundOptions.numbersRoundMinutes} ${inflection.inflect(
            'minute',
            self.config.roundOptions.numbersRoundMinutes
          )} on the clock`
        );
      }

      self.pm(
        self.challenger.nick,
        `Numbers for this round: ${self.table.numbers.join(
          ' '
        )} and the target is: ${self.table.target}`
      );
      if (!_.isUndefined(self.numbersTime)) {
        self.pm(
          self.challenger.nick,
          `${self.numbersTime * 60} ${inflection.inflect(
            'second',
            self.numbersTime * 60
          )} on the clock`
        );
      } else {
        self.pm(
          self.challenger.nick,
          `${self.config.roundOptions.numbersRoundMinutes} ${inflection.inflect(
            'minute',
            self.config.roundOptions.numbersRoundMinutes
          )} on the clock`
        );
      }
      self.pm(self.challenger.nick, 'Play an equation with !cd [equation]');

      self.pm(
        self.challenged.nick,
        `Numbers for this round: ${self.table.numbers.join(
          ' '
        )} and the target is: ${self.table.target}`
      );
      if (!_.isUndefined(self.numbersTime)) {
        self.pm(
          self.challenged.nick,
          `${self.numbersTime * 60} ${inflection.inflect(
            'second',
            self.numbersTime * 60
          )} on the clock`
        );
      } else {
        self.pm(
          self.challenged.nick,
          `${self.config.roundOptions.numbersRoundMinutes} ${inflection.inflect(
            'minute',
            self.config.roundOptions.numbersRoundMinutes
          )} on the clock`
        );
      }
      self.pm(self.challenged.nick, 'Play an equation with !cd [equation]');

      self.state = STATES.PLAY_NUMBERS;
      clearInterval(self.roundTimer);
      self.roundStarted = new Date();
      self.roundTimer = setInterval(self.roundTimerCheck, 10 * 1000);
    }
  };

  self.playNumbers = (player, expression) => {
    console.log(`Expression: ${expression}`);
    if (self.challenger.nick === player || self.challenged.nick === player) {
      // If the expression uses no numbers
      const playerNumbers = expression.match(/\d+/g);

      if (playerNumbers === null) {
        self.pm(player, 'Your expression does not contain any numbers');
        return false;
      }

      // If the expression uses invalid characters
      if (
        _.reject(
          expression,
          number => _.includes(self.valid_numbers_characters, number) === true
        ).length !== 0
      ) {
        self.pm(player, 'Your expression contains illegal characters');
        return false;
      }

      // If the expression uses numbers that are not in the selected numbers or reuses numbers
      const numbers = _.clone(self.table.numbers);
      let valid = true;

      for (let i = 0; i < playerNumbers.length; i++) {
        if (_.includes(numbers, playerNumbers[i])) {
          console.log(numbers);
          numbers.splice(_.indexOf(numbers, playerNumbers[i]), 1);
        } else {
          valid = false;
          break;
        }
      }

      if (valid !== true) {
        self.pm(
          player,
          'Your expression must only use selected numbers and must not reuse numbers more times than they appear'
        );
        return false;
      }

      try {
        mathjs.eval(expression);
      } catch (ex) {
        self.pm(player, 'Your expression has some invalid syntax, please check and resubmit.');
        return false;
      }

      // If the expression isn't a whole number or isn't positive
      if (mathjs.eval(expression) <= 0) {
        self.pm(
          player,
          `Your expression results in a negative number. Your expression result is:${mathjs.eval(
            expression
          )}`
        );
        return false;
      }

      if (mathjs.eval(expression) % 1 !== 0) {
        self.pm(
          player,
          `Your expression does not result in a whole number. Your expression result is: ${mathjs.eval(
            expression
          )}`
        );
        return false;
      }

      if (self.challenger.nick === player) {
        self.answers.challenger = { expression, value: mathjs.eval(expression) };
        self.challenger.hasPlayed = true;
      } else if (self.challenged.nick === player) {
        self.answers.challenged = { expression, value: mathjs.eval(expression) };
        self.challenged.hasPlayed = true;
      }

      self.pm(
        player,
        `You have submitted ${expression}. Your result is ${mathjs.eval(expression)}`
      );
    }
  };

  /*
   * Do setup for a conundrum round
   */
  self.conundrumRound = () => {
    self.say(`Round ${self.round}: Conundrum`);

    self.table.conundrum = self.conundrum_words.shift();

    self.challenger.hasBuzzed = false;
    self.challenged.hasBuzzed = false;

    if (
      Math.max(self.challenger.points, self.challenged.points) -
        Math.min(self.challenger.points, self.challenged.points) <=
      10
    ) {
      self.say("Fingers on buzzers for today's crucial countdown conundrum");
    } else {
      self.say("Fingers on buzzers for today's countdown conundrum");
    }
    self.say('Use !buzz word to guess the conundrum.');
    self.say(`Conundrum: ${_.shuffle(self.table.conundrum).join(' ')}`);

    self.state = STATES.CONUNDRUM;
    clearInterval(self.roundTimer);
    self.roundStarted = new Date();
    self.roundTimer = setInterval(self.roundTimerCheck, 10 * 1000);
  };

  self.playConundrum = (player, word) => {
    if (self.challenged.nick === player || self.challenger.nick === player) {
      word = word.toUpperCase();
      if (self.challenged.nick === player) {
        if (self.challenged.hasBuzzed === false) {
          if (self.table.conundrum === word) {
            self.say(
              `${player} has correctly guessed the countdown conundrum and scored 10 points`
            );
            self.challenged.points += 10;
            self.conundrumAns = true;
            self.roundEnd();
          } else {
            // Make sure the player didn't reuse any letters
            const letters = _.clone(self.table.conundrum.split(''));
            let valid = true;

            for (let i = 0; i < word.length; i++) {
              if (_.includes(letters, word[i].toUpperCase())) {
                console.log(letters);
                letters.splice(_.indexOf(letters, word[i]), 1);
              } else {
                valid = false;
                break;
              }
            }

            if (valid === true && _.includes(self.conundrum_words, word)) {
              self.say(
                `${player} has correctly guessed the countdown conundrum and scored 10 points`
              );
              self.challenged.points += 10;
              self.conundrumAns = true;
              self.roundEnd();
            } else {
              self.say(`${player} has incorrectly guessed the countdown conundrum`);
              self.challenged.hasBuzzed = true;
            }
          }
        } else          { self.say(`${player} has already Buzzed`); }
      } else {
        if (self.challenger.hasBuzzed === false) {
          if (self.table.conundrum === word) {
            self.say(
              `${player} has correctly guessed the countdown conundrum and scored 10 points`
            );
            self.challenger.points += 10;
            self.conundrumAns = true;
            self.roundEnd();
          } else {
            // Make sure the player didn't reuse any letters
            const letters = _.clone(self.table.conundrum.split(''));
            let valid = true;

            for (let i = 0; i < word.length; i++) {
              if (_.includes(letters, word[i].toUpperCase())) {
                console.log(letters);
                letters.splice(_.indexOf(letters, word[i]), 1);
              } else {
                valid = false;
                break;
              }
            }

            if (valid === true && _.includes(self.conundrum_words, word)) {
              self.say(
                `${player} has correctly guessed the countdown conundrum and scored 10 points`
              );
              self.challenger.points += 10;
              self.conundrumAns = true;
              self.roundEnd();
            } else {
              self.say(`${player} has incorrectly guessed the countdown conundrum`);
              self.challenger.hasBuzzed = true;
            }
          }
        } else {
          self.say(`${self.challenger.nick} has already Buzzed`);
        }

        if (self.challenger.hasBuzzed && self.challenged.hasBuzzed) {
          self.say('Both players have buzzed. Ending the round');
          self.roundEnd();
        }
      }
    }
  };

  self.roundTimerCheck = () => {
    // Check the time
    const now = new Date();

    let timeLimit;

    if (self.state === STATES.PLAY_LETTERS) {
      if (!_.isUndefined(self.lettersTime)) {
        timeLimit = 60 * 1000 * self.lettersTime;
      } else if (!_.isUndefined(self.config.roundOptions.lettersRoundMinutes)) {
        timeLimit = 60 * 1000 * self.config.roundOptions.lettersRoundMinutes;
      } else {
        timeLimit = 60 * 1000 * 2;
      }
    } else if (self.state === STATES.PLAY_NUMBERS) {
      if (!_.isUndefined(self.numbersTime)) {
        timeLimit = 60 * 1000 * self.numbersTime;
      } else if (!_.isUndefined(self.config.roundOptions.numbersRoundMinutes)) {
        timeLimit = 60 * 1000 * self.config.roundOptions.numbersRoundMinutes;
      } else {
        timeLimit = 60 * 1000 * 5;
      }
    } else if (self.state === STATES.CONUNDRUM) {
      if (!_.isUndefined(self.conundrumsTime)) {
        timeLimit = 60 * 1000 * self.conundrumsTime;
      } else if (!_.isUndefined(self.config.roundOptions.conundrumRoundMinutes)) {
        timeLimit = 60 * 1000 * self.config.roundOptions.conundrumRoundMinutes;
      } else {
        timeLimit = 60 * 1000 * 2;
      }
    }

    const roundElapsed = now.getTime() - self.roundStarted.getTime();

    console.log(`Round elapsed: ${roundElapsed}`, now.getTime(), self.roundStarted.getTime());

    if (roundElapsed >= timeLimit) {
      self.say('DO DO DO D-D-DOOOO');
      self.roundEnd();
      // Do something
    } else if (roundElapsed >= timeLimit - 10 * 1000 && roundElapsed < timeLimit) {
      self.say('10 seconds left!');
      self.pm(self.challenger.nick, '10 seconds left');
      self.pm(self.challenged.nick, '10 seconds left');
    } else if (roundElapsed >= timeLimit - 20 * 1000 && roundElapsed < timeLimit - 10 * 1000) {
      self.say('20 seconds left!');
      self.pm(self.challenger.nick, '20 seconds left');
      self.pm(self.challenged.nick, '20 seconds left');
    } else if (roundElapsed >= timeLimit - 30 * 1000 && roundElapsed < timeLimit - 20 * 1000) {
      self.say('30 seconds left!');
      self.pm(self.challenger.nick, '30 seconds left');
      self.pm(self.challenged.nick, '30 seconds left');
    } else if (roundElapsed >= timeLimit - 60 * 1000 && roundElapsed < timeLimit - 50 * 1000) {
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
  self.addPlayer = player => {
    console.log(`Adding player: ${player.nickx}`);
    if (self.challenger.nick === player.nick) {
      self.challenger.hasJoined = true;
      console.log('Adding challenger');
    } else if (self.challenged.nick === player.nick) {
      self.challenged.hasJoined = true;
      console.log('Adding challenged');
    } else {
      self.say('Sorry, but you cannot join this game');
      return false;
    }

    self.say(`${player.nick} has joined the game.`);

    self.nextRound();

    return player;
  };

  self.lock = player => {
    if (self.challenger.nick === player) {
      if (self.challenger.isLocked !== true) {
        self.say(`${player} has locked in their answer`);
        self.challenger.isLocked = true;
      }
    } else if (self.challenged.nick === player) {
      if (self.challenged.isLocked !== true) {
        self.say(`${player} has locked in their answer`);
        self.challenged.isLocked = true;
      }
    }

    if (self.challenger.isLocked && self.challenged.isLocked) {
      self.say('Both players have locked their answers. Ending the round');
      self.roundEnd();
    }
  };

  /*
   * Set the channel topic
   */
  self.setTopic = topic => {
    // ignore if not configured to set topic
    if (_.isUndefined(config.gameOptions.setTopic) || !config.gameOptions.setTopic) {
      return false;
    }

    // construct new topic
    let newTopic = topic;
    if (_.isUndefined(config.gameOptions.topicBase)) {
      newTopic = `${topic} ${config.gameOptions.topicBase}`;
    }

    // set it
    client.send('TOPIC', channel, newTopic);
  };

  self.showPoints = () => {
    if (self.round === 0) {
      self.say("The game hasn't begun yet");
    } else {
      self.setTopic(
        `Round ${self.round}: ${self.challenged.nick} has ${self.challenged.points} points while ${self.challenger.nick} has ${self.challenger.points} points.`
      );
    }
  };

  /**
   * Helper function for the handlers below
   */
  self.findAndRemoveIfPlaying = nick => {
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
  self.playerPartHandler = (channel, nick, reason, message) => {
    console.log(`Player ${nick} left`);
    self.findAndRemoveIfPlaying(nick);
  };

  /**
   * Handle player kicks
   * @param nick
   * @param by
   * @param reason
   * @param message
   */
  self.playerKickHandler = (nick, by, reason, message) => {
    console.log(`Player ${nick} was kicked by ${by}`);
    self.findAndRemoveIfPlaying(nick);
  };

  /**
   * Handle player kicks
   * @param nick
   * @param reason
   * @param channel
   * @param message
   */
  self.playerQuitHandler = (nick, reason, channel, message) => {
    console.log(`Player ${nick} left`);
    self.findAndRemoveIfPlaying(nick);
  };

  /**
   * Handle player nick changes
   * @param oldnick
   * @param newnick
   * @param channels
   * @param message
   */
  self.playerNickChangeHandler = (oldnick, newnick, channels, message) => {
    if (self.challenger.nick === oldnick) {
      self.challenger.nick = newnick;
      return true;
    } else if (self.challenged.nick === oldnick) {
      self.challenged.nick = newnick;
      return true;
    }

    return false;
  };

  self.say = string => {
    self.client.say(self.channel, string);
  };

  self.pm = (nick, string) => {
    self.client.say(nick, string);
  };

  // client listeners
  client.addListener('part', self.playerPartHandler);
  client.addListener('quit', self.playerQuitHandler);
  client.addListener(`kick${channel}`, self.playerKickHandler);
  client.addListener('nick', self.playerNickChangeHandler);
};

Game.STATES = STATES;

exports = module.exports = Game;
