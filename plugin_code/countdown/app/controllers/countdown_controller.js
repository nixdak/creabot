var _ = require('underscore'),
    Game = require('./game'),
    Player = require('../models/player'),
    challenges = require('../../config/challenges.json'),
    fs = require('fs'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env];


var Countdown = function Countdown() {
  var self = this;
  self.game;
  self.config = config;
  self.challenges = challenges;
  self.challengesFile = 'plugin_code/countdown/config/challenges.json'

  self.accept = function (client, message, cmdArgs) {
    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      var channel = message.args[0];

      var games = _.filter(self.challenges, function (challenge) { return challenge.challenged.toLowerCase() === message.nick.toLowerCase(); });
      var challengers = _.map(games, function (challenge) { return challenge.challenger; });
      var letterTimes = _.map(games, function (challenge) { return challenge.letter; });
      var numberTimes = _.map(games, function (challenge) { return challenge.number; });
      var conundrumTimes = _.map(games, function (challenge) { return challenge.conundrum; });

      if (cmdArgs === '') {
        if (challengers.length === 1) {
          var challenger = new Player(challengers[0]);
          var challenged = new Player(message.nick);
          var letterTime = letterTimes[0];
          var numberTime = numberTimes[0];
          var conundrumTime = conundrumTimes[0];
          self.game = new Game(channel, client, self.config, challenger, challenged, letterTime, numberTime, conundrumTime);
          self.game.addPlayer(challenged);
        } else {
          self.list(client, message, cmdArgs);
        }
      } else if (!_.contains(challengers, cmdArgs.toLowerCase())) {
        client.say(channel, 'You haven\'t been challenged by ' + cmdArgs + '. Challenging...');
        self.challenge(client, message, cmdArgs);
      } else {
        var challenger = new Player(cmdArgs);
        var challenged = new Player(message.nick);
        var letterTime = letterTimes[0];
        var numberTime = numberTimes[0];
        var conundrumTime = conundrumTimes[0];
        self.game = new Game(channel, client, self.config, challenger, challenged, letterTime, numberTime, conundrumTime);
        client.say(channel, 'letters: ' + letterTime*60 + ' numbers: ' + numberTime*60 + ' conundrum: ' + conundrumTime*60);
        self.game.addPlayer(challenged);
      }
    } else {
      client.say('Sorry, challenges cannot currently be accepted');
    }
  };

  self.buzz = function (client, message, cmdArgs) {
    if (!_.isUndefined(self.game) && self.game.state === Game.STATES.CONUNDRUM) {
      if (_.isUndefined(cmdArgs)) {
        client.say(message.args[0], 'Please supply a word to the buzz function');
        return false;
      } else {
        self.game.playConundrum(message.nick, cmdArgs);
      }
    } else {
      client.say(message.args[0], 'Sorry, the !buzz command is not available right now');
    }
  };

  self.challenge = function (client, message, cmdArgs) {
    var channel = message.args[0];
    var args = cmdArgs.split(" ", 6);
    var valid_numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    var letterTime = self.config.roundOptions.lettersRoundMinutes;
    var numberTime = self.config.roundOptions.numbersRoundMinutes;
    var conundrumTime = self.config.roundOptions.conundrumRoundMinutes;

    if (args[0] === '') {
      client.say(channel, 'Please supply a nick with this command');
    } else if (client.nick.toLowerCase() === args[0].toLowerCase()) {
      client.say(channel, 'You can\'t challenge the bot');
    } else if (message.nick.toLowerCase() === args[0].toLowerCase()){
      client.say(channel, 'You can\'t challenge yourself');
    } else if (!_.isUndefined(_.findWhere(self.challenges, { challenger: args[0].toLowerCase(), challenged: message.nick.toLowerCase() }))) {
      self.accept(client, message, args[0])//move accept in here
    } else if (!_.contains(self.challenges, { challenger: message.nick.toLowerCase(), challenged: args[0].toLowerCase() })) {
      for (var i = 1; i < args.length; i++) {
        var arg = args[i].split(':');
        if (_.reject(arg[1], function (number) { return _.contains(valid_numbers, number) === true; }).length !== 0){
          client.say(channel, 'The ' + arg[0] + ' isnt valid')
          if (arg[0].toLowerCase() === 'letters') {
            letterTime = self.config.roundOptions.lettersRoundMinutes;
          } else if (arg[0].toLowerCase() === 'numbers') {
            numberTime = self.config.roundOptions.numbersRoundMinutes;
          } else if (arg[0].toLowerCase() === 'conundrum') {
            conundrumTime = self.config.roundOptions.conundrumRoundMinutes;
          }
        }else {
          if (arg[0].toLowerCase() === 'letters') {
            letterTime = arg[1]/60;
          } else if (arg[0].toLowerCase() === 'numbers') {
            numberTime = arg[1]/60;
          } else if (arg[0].toLowerCase() === 'conundrum') {
            conundrumTime = arg[1]/60;
          }
        }
      }
      self.challenges.push({ challenger: message.nick, challenged: args[0], letter: letterTime, number: numberTime, conundrum: conundrumTime});
      fs.writeFile(self.challengesFile, JSON.stringify(self.challenges, null, 2));
      client.say(channel, message.nick + ': has challenged ' + args[0]);
      client.say(channel, args[0] + ': To accept ' + message.nick + '\'s challenge, simply !accept ' + message.nick);
    } else {
      client.say(channel, message.nick + ': You have already challenged ' + args[0] + '.');
    }
  };

  self.join = function (client, message, cmdArgs) {
    if (!_.isUndefined(self.game) && self.game.state === Game.STATES.WAITING) {
      var player = new Player(message.nick, message.user, message.host);
      self.game.addPlayer(player);
      self.challenges = _.reject(self.challenges, function(challenge) {
        return challenge.challenger === self.game.challenger.nick && challenge.challenged === self.game.challenged.nick;
      });
      fs.writeFile(self.challengesFile, JSON.stringify(self.challenges, null, 2));
    } else {
      client.say(message.args[0], 'Unable to join at the moment.');
    }
  };

  self.list = function (client, message, cmdArgs) {
    if (self.challenges.length === 0) {
      client.say(message.args[0], 'No challenges have been issued.');
    } else {
      var challenges_sent = _.filter(self.challenges, function (challenge) { return challenge.challenger === message.nick; });
      var challenges_received = _.filter(self.challenges, function (challenge) { return challenge.challenged === message.nick; });

      if (challenges_sent.length < 1 ) {
        client.say(message.args[0], message.nick + ': You have issued no challenges.');
      } else {
        challenges_sent = _.map(challenges_sent, function (challenge) { return challenge.challenged; });
        client.say(message.args[0], message.nick + ': You have issued challenges to the following players: ' + challenges_sent.join(', ') + '.');
      }

      if (challenges_received.length < 1) {
        client.say (message.args[0], message.nick + ': You have received no challenges.');
      } else {
        challenges_received = _.map(challenges_received, function (challenge) { return challenge.challenger; });
        client.say(message.args[0], message.nick + ': You have been challenged by the following players: ' + challenges_received.join(', ') + '.');
      }
    }
  };

  self.lock = function (client, message, cmdArgs) {
    if (!_.isUndefined(self.game) && (self.game.state === Game.STATES.PLAY_LETTERS || self.game.state === Game.STATES.PLAY_NUMBERS)) {
      self.game.lock(message.nick);
    } else {
      client.say(message.args[0], 'The lock command is not available right now.');
    }
  };

  self.play = function (client, message, cmdArgs) {
    if (!_.isUndefined(self.game) && self.game.state === Game.STATES.PLAY_LETTERS) {
      var args;

      if (cmdArgs === '') {
        client.say(message.args[0], 'Please supply arguments to the !cd command.');
        return false;
      }

      args = cmdArgs.split(' ').join('');

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

  self.select = function (client, message, cmdArgs) {
    if (!_.isUndefined(self.game) && self.game.state === Game.STATES.LETTERS) {
      var args;
      cmdArgs = cmdArgs.toLowerCase();

      if (cmdArgs === '') {
        client.say(message.args[0], 'Please supply arguments to the !cd command');
        return false;
      }

      args = cmdArgs.replace(/\s/g, '').split('');

      self.game.letters(message.nick, args);
    } else if (!_.isUndefined(self.game) && self.game.state === Game.STATES.NUMBERS) {
      var args;
      cmdArgs = cmdArgs.toLowerCase();

      if (cmdArgs === '') {
        client.say(message.args[0], 'Please supply arguments to the !cd command');
        return false;
      }

      args = cmdArgs.replace(/\s/g, '').split('');

      self.game.numbers(message.nick, args);
    } else {
      client.say(message.args[0], 'The select command is not available at the moment');
    }
  };

  self.stop = function (client, message, cmdArgs) {
    var channel = message.args[0],
        nick = message.nick,
        hostname = message.host;

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(message.args[0], 'No game running to stop.');
    } else if (self.game.challenger.nick === message.nick || self.game.challenged.nick === message.nick) {
      self.game.stop(message.nick, false);
    } else {
      client.say(channel, 'Only the players can stop the game');
    }
  };

  self.wiki = function (client, message, cmdArgs){
    if (client.nick.toLowerCase() === message.args[0].toLowerCase()) {
      client.say(message.nick, 'https://github.com/butlerx/butlerbot/wiki/Countdown');
    } else {
      client.say(message.args[0], message.nick + ': https://github.com/butlerx/butlerbot/wiki/Countdown');
    }
  };
};

exports = module.exports = Countdown;
