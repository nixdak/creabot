const _ = require('lodash');
const Game = require('./game');
const Player = require('../models/player');
const challenges = require('../../config/challenges.json');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.json')[env];

const Countdown = function Countdown () {
  const self = this;
  self.game;
  self.config = config;
  self.challenges = challenges;
  self.challengesFile = 'plugin_code/countdown/config/challenges.json';

  self.accept = (client, message, cmdArgs) => {
    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      const channel = message.args[0];

      const games = _.filter(
        self.challenges,
        challenge => challenge.challenged.toLowerCase() === message.nick.toLowerCase()
      );
      const challengers = _.map(games, ({ challenge }) => challenge.challenger);
      const letterTimes = _.map(games, ({ letter }) => letter);
      const numberTimes = _.map(games, ({ number }) => number);
      const conundrumTimes = _.map(games, ({ conundrum }) => conundrum);

      if (cmdArgs === '') {
        if (challengers.length === 1) {
          const challenger = new Player(challengers[0]);
          const challenged = new Player(message.nick);
          const letterTime = letterTimes[0];
          const numberTime = numberTimes[0];
          const conundrumTime = conundrumTimes[0];
          self.game = new Game(
            channel,
            client,
            self.config,
            challenger,
            challenged,
            letterTime,
            numberTime,
            conundrumTime
          );
          self.game.addPlayer(challenged);
        } else {
          self.list(client, message, cmdArgs);
        }
      } else if (!_.includes(challengers, cmdArgs.toLowerCase())) {
        client.say(channel, `You haven't been challenged by ${cmdArgs}. Challenging...`);
        self.challenge(client, message, cmdArgs);
      } else {
        const challenger = new Player(cmdArgs);
        const challenged = new Player(message.nick);
        const letterTime = letterTimes[0];
        const numberTime = numberTimes[0];
        const conundrumTime = conundrumTimes[0];
        self.game = new Game(
          channel,
          client,
          self.config,
          challenger,
          challenged,
          letterTime,
          numberTime,
          conundrumTime
        );
        client.say(
          channel,
          `letters: ${letterTime * 60} numbers: ${numberTime * 60} conundrum: ${conundrumTime * 60}`
        );
        self.game.addPlayer(challenged);
      }
    } else {
      client.say('Sorry, challenges cannot currently be accepted');
    }
  };

  self.buzz = (client, { args, nick }, cmdArgs) => {
    if (!_.isUndefined(self.game) && self.game.state === Game.STATES.CONUNDRUM) {
      if (_.isUndefined(cmdArgs)) {
        client.say(args[0], 'Please supply a word to the buzz function');
        return false;
      } else {
        self.game.playConundrum(nick, cmdArgs);
      }
    } else {
      client.say(args[0], 'Sorry, the !buzz command is not available right now');
    }
  };

  self.challenge = (client, message, cmdArgs) => {
    const channel = message.args[0];
    const args = cmdArgs.split(' ', 6);
    const validNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    let letterTime = self.config.roundOptions.lettersRoundMinutes;
    let numberTime = self.config.roundOptions.numbersRoundMinutes;
    let conundrumTime = self.config.roundOptions.conundrumRoundMinutes;

    if (args[0] === '') {
      client.say(channel, 'Please supply a nick with this command');
    } else if (client.nick.toLowerCase() === args[0].toLowerCase()) {
      client.say(channel, "You can't challenge the bot");
    } else if (message.nick.toLowerCase() === args[0].toLowerCase()) {
      client.say(channel, "You can't challenge yourself");
    } else if (
      !_.isUndefined(
        _.find(self.challenges, {
          challenger: args[0].toLowerCase(),
          challenged: message.nick.toLowerCase(),
        })
      )
    ) {
      self.accept(client, message, args[0]); // move accept in here
    } else if (
      !_.includes(self.challenges, {
        challenger: message.nick.toLowerCase(),
        challenged: args[0].toLowerCase(),
      })
    ) {
      for (let i = 1; i < args.length; i++) {
        const arg = args[i].split(':');
        if (_.reject(arg[1], number => _.includes(validNumbers, number) === true).length !== 0) {
          client.say(channel, `The ${arg[0]} isnt valid`);
          if (arg[0].toLowerCase() === 'letters') {
            letterTime = self.config.roundOptions.lettersRoundMinutes;
          } else if (arg[0].toLowerCase() === 'numbers') {
            numberTime = self.config.roundOptions.numbersRoundMinutes;
          } else if (arg[0].toLowerCase() === 'conundrum') {
            conundrumTime = self.config.roundOptions.conundrumRoundMinutes;
          }
        } else {
          if (arg[0].toLowerCase() === 'letters') {
            letterTime = arg[1] / 60;
          } else if (arg[0].toLowerCase() === 'numbers') {
            numberTime = arg[1] / 60;
          } else if (arg[0].toLowerCase() === 'conundrum') {
            conundrumTime = arg[1] / 60;
          }
        }
      }
      self.challenges.push({
        challenger: message.nick,
        challenged: args[0],
        letter    : letterTime,
        number    : numberTime,
        conundrum : conundrumTime,
      });
      fs.writeFile(self.challengesFile, JSON.stringify(self.challenges, null, 2));
      client.say(channel, `${message.nick}: has challenged ${args[0]}`);
      client.say(
        channel,
        `${args[0]}: To accept ${message.nick}'s challenge, simply !accept ${message.nick}`
      );
    } else {
      client.say(channel, `${message.nick}: You have already challenged ${args[0]}.`);
    }
  };

  self.join = (client, { nick, user, host, args }, cmdArgs) => {
    if (!_.isUndefined(self.game) && self.game.state === Game.STATES.WAITING) {
      const player = new Player(nick, user, host);
      self.game.addPlayer(player);
      self.challenges = _.reject(
        self.challenges,
        ({ challenger, challenged }) =>
          challenger === self.game.challenger.nick && challenged === self.game.challenged.nick
      );
      fs.writeFile(self.challengesFile, JSON.stringify(self.challenges, null, 2));
    } else {
      client.say(args[0], 'Unable to join at the moment.');
    }
  };

  self.list = (client, { args, nick }, cmdArgs) => {
    if (self.challenges.length === 0) {
      client.say(args[0], 'No challenges have been issued.');
    } else {
      let challengesSent = _.filter(self.challenges, ({ challenger }) => challenger === nick);
      let challengesReceived = _.filter(self.challenges, ({ challenged }) => challenged === nick);

      if (challengesSent.length < 1) {
        client.say(args[0], `${nick}: You have issued no challenges.`);
      } else {
        challengesSent = _.map(challengesSent, ({ challenged }) => challenged);
        client.say(
          args[0],
          `${nick}: You have issued challenges to the following players: ${challengesSent.join(
            ', '
          )}.`
        );
      }

      if (challengesReceived.length < 1) {
        client.say(args[0], `${nick}: You have received no challenges.`);
      } else {
        challengesReceived = _.map(challengesReceived, ({ challenger }) => challenger);
        client.say(
          args[0],
          `${nick}: You have been challenged by the following players: ${challengesReceived.join(
            ', '
          )}.`
        );
      }
    }
  };

  self.lock = (client, { nick, args }, cmdArgs) => {
    if (
      !_.isUndefined(self.game) &&
      (self.game.state === Game.STATES.PLAY_LETTERS || self.game.state === Game.STATES.PLAY_NUMBERS)
    ) {
      self.game.lock(nick);
    } else {
      client.say(args[0], 'The lock command is not available right now.');
    }
  };

  self.play = (client, message, cmdArgs) => {
    if (!_.isUndefined(self.game) && self.game.state === Game.STATES.PLAY_LETTERS) {
      if (cmdArgs === '') {
        client.say(message.args[0], 'Please supply arguments to the !cd command.');
        return false;
      }
      const args = cmdArgs.split(' ').join('');
      self.game.playLetters(message.nick, args);
    } else if (!_.isUndefined(self.game) && self.game.state === Game.STATES.PLAY_NUMBERS) {
      if (_.isUndefined(cmdArgs)) {
        client.say(message.args[0], 'Please supply arguments to the !cd command.');
        return false;
      }

      self.game.playNumbers(message.nick, cmdArgs);
    } else {
      client.say(message.args[0], 'The !cd command is not available at the moment');
    }
  };

  self.select = (client, message, cmdArgs) => {
    if (!_.isUndefined(self.game) && self.game.state === Game.STATES.LETTERS) {
      cmdArgs = cmdArgs.toLowerCase();
      if (cmdArgs === '') {
        client.say(message.args[0], 'Please supply arguments to the !cd command');
        return false;
      }
      const args = cmdArgs.replace(/\s/g, '').split('');
      self.game.letters(message.nick, args);
    } else if (!_.isUndefined(self.game) && self.game.state === Game.STATES.NUMBERS) {
      cmdArgs = cmdArgs.toLowerCase();
      if (cmdArgs === '') {
        client.say(message.args[0], 'Please supply arguments to the !cd command');
        return false;
      }
      const args = cmdArgs.replace(/\s/g, '').split('');
      self.game.numbers(message.nick, args);
    } else {
      client.say(message.args[0], 'The select command is not available at the moment');
    }
  };

  self.stop = (client, message, cmdArgs) => {
    const channel = message.args[0];

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(message.args[0], 'No game running to stop.');
    } else if (
      self.game.challenger.nick === message.nick || self.game.challenged.nick === message.nick
    ) {
      self.game.stop(message.nick, false);
    } else {
      client.say(channel, 'Only the players can stop the game');
    }
  };

  self.wiki = (client, { args, nick }, cmdArgs) => {
    if (client.nick.toLowerCase() === args[0].toLowerCase()) {
      client.say(nick, 'https://github.com/butlerx/butlerbot/wiki/Countdown');
    } else {
      client.say(args[0], `${nick}: https://github.com/butlerx/butlerbot/wiki/Countdown`);
    }
  };
};

exports = module.exports = Countdown;
