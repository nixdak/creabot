const _ = require('lodash');
const Game = require('./game');
const Player = require('../models/player');
const config = require('../../config/config');
const dbModels = require('../../models');

const CardsAgainstHumanity = function CardsAgainstHumanity () {
  const self = this;
  self.game;
  self.config = config;

  /**
     * Start a game
     * @param client
     * @param message
     * @param cmdArgs
     */
  self.start = (client, message, cmdArgs) => {
    // check if game running on the channel
    const channel = message.args[0];

    const nick = message.nick;
    const user = message.user;
    const hostname = message.host;

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (!_.isUndefined(self.game) && self.game.state !== Game.STATES.STOPPED) {
      // game exists
      client.say(channel, 'A game is already running. Type !join to join the game.');
    } else {
      // init game
      const player = new Player(nick, user, hostname);
      const newGame = new Game(channel, client, self.config, cmdArgs, dbModels);
      self.game = newGame;
      self.game.addPlayer(player);
    }
  };

  /**
     * Stop a game
     * @param client
     * @param message
     * @param cmdArgs
     */
  self.stop = (client, message, cmdArgs) => {
    const channel = message.args[0];
    const nick = message.nick;
    const hostname = message.host;

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(channel, 'No game running. Start the game by typing !start.');
    } else {
      const player = self.game.getPlayer({ nick, hostname });
      if (!_.isUndefined(player)) {
        self.game.stop(self.game.getPlayer({ nick, hostname }));
        self.game = undefined;
      }
    }
  };

  /**
     * Pause a game
     * @param client
     * @param message
     * @param cmdArgs
     */
  self.pause = (client, message, cmdArgs) => {
    const channel = message.args[0];
    const nick = message.nick;
    const hostname = message.host;

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(channel, 'No game running. Start the game by typing !start.');
    } else {
      const player = self.game.getPlayer({ nick, hostname });
      if (!_.isUndefined(player)) {
        self.game.pause();
      }
    }
  };

  /**
     * Resume a game
     * @param client
     * @param message
     * @param cmdArgs
     */
  self.resume = (client, message, cmdArgs) => {
    const channel = message.args[0];
    const nick = message.nick;
    const hostname = message.host;

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(channel, 'No game running. Start the game by typing !start.');
    } else {
      const player = self.game.getPlayer({ nick, hostname });
      if (!_.isUndefined(player)) {
        self.game.resume();
      }
    }
  };

  /**
     * Add player to game
     * @param client
     * @param message
     * @param cmdArgs
     */
  self.join = (client, message, cmdArgs) => {
    const nick = message.nick;
    const user = message.user;
    const hostname = message.host;

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      self.start(client, message, cmdArgs);
    } else {
      const player = new Player(nick, user, hostname);
      self.game.addPlayer(player);
    }
  };

  /**
     * Remove player from game
     * @param client
     * @param message
     * @param cmdArgs
     */
  self.quit = (client, message, cmdArgs) => {
    const channel = message.args[0];
    const nick = message.nick;
    const hostname = message.host;

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(channel, 'No game running. Start the game by typing !start.');
    } else {
      self.game.removePlayer(self.game.getPlayer({ nick, hostname }));
    }
  };

  /**
     * Get players cards
     * @param client
     * @param message
     * @param cmdArgs
     */
  self.cards = (client, message, cmdArgs) => {
    const channel = message.args[0];
    const nick = message.nick;
    const hostname = message.host;

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(channel, 'No game running. Start the game by typing !start.');
    } else {
      const player = self.game.getPlayer({ nick, hostname });
      self.game.showCards(player);
    }
  };

  /**
     * Play cards
     * @param client
     * @param message
     * @param cmdArgs
     */
  self.play = (client, message, cmdArgs) => {
    // check if everyone has played and end the round
    const channel = message.args[0];
    const nick = message.nick;
    const hostname = message.host;

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(channel, 'No game running. Start the game by typing !start.');
    } else {
      const player = self.game.getPlayer({ nick, hostname });
      if (!_.isUndefined(player)) {
        self.game.playCard(cmdArgs, player);
      }
    }
  };

  /**
     * List players in the game
     * @param client
     * @param message
     * @param cmdArgs
     */
  self.list = (client, { args }, cmdArgs) => {
    const channel = args[0];

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(channel, 'No game running. Start the game by typing !start.');
    } else {
      self.game.listPlayers();
    }
  };

  /**
     * Select the winner
     * @param client
     * @param message
     * @param cmdArgs
     */
  self.winner = (client, message, cmdArgs) => {
    const channel = message.args[0];
    const nick = message.nick;
    const hostname = message.host;

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(channel, 'No game running. Start the game by typing !start.');
    } else {
      const player = self.game.getPlayer({ nick, hostname });
      if (!_.isUndefined(player)) {
        self.game.selectWinner(cmdArgs[0], player);
      }
    }
  };

  /**
     * Show top players in current game
     * @param client
     * @param message
     * @param cmdArgs
     */
  self.points = (client, { args, host }, cmdArgs) => {
    const channel = args[0];

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(channel, 'No game running. Start the game by typing !start.');
    } else {
      self.game.showPoints();
    }
  };

  /**
     * Show top players in current game
     * @param client
     * @param message
     * @param cmdArgs
     */
  self.status = (client, { args }, cmdArgs) => {
    const channel = args[0];

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(channel, 'No game running. Start the game by typing !start.');
    } else {
      self.game.showStatus();
    }
  };

  self.pick = (client, message, cmdArgs) => {
    // check if everyone has played and end the round
    const channel = message.args[0];

    const nick = message.nick;
    const hostname = message.host;

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(channel, 'No game running. Start the game by typing !start.');
    } else {
      const player = self.game.getPlayer({ nick, hostname });

      if (!_.isUndefined(player)) {
        if (self.game.state === Game.STATES.PLAYED && channel === self.game.channel) {
          self.game.selectWinner(cmdArgs[0], player);
        } else if (self.game.state === Game.STATES.PLAYABLE) {
          self.game.playCard(cmdArgs, player);
        } else {
          client.say(channel, '!pick command not available in current state.');
        }
      }
    }
  };

  self.discard = (client, message, cmdArgs) => {
    const channel = message.args[0];
    const nick = message.nick;
    const hostname = message.host;

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (_.isUndefined(self.game) || self.game.state === Game.STATES.STOPPED) {
      client.say(channel, 'No game running. Start the game by typing !start');
    } else {
      const player = self.game.getPlayer({ nick, hostname });

      if (self.game.state === Game.STATES.PLAYABLE) {
        self.game.discard(cmdArgs, player);
      } else {
        client.say(channel, '!discard command not available in current state');
      }
    }
  };

  self.wiki = (client, { args, nick }, cmdArgs) => {
    if (client.nick.toLowerCase() === args[0].toLowerCase()) {
      client.say(nick, 'https://github.com/butlerx/butlerbot/wiki/Cards-Against-Humanity');
    } else {
      client.say(
        args[0],
        `${nick}: https://github.com/butlerx/butlerbot/wiki/Cards-Against-Humanity`
      );
    }
  };
};

exports = module.exports = CardsAgainstHumanity;
