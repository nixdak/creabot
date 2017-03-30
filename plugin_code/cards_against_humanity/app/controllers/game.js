const c = require('irc-colors');
const _ = require('lodash');
const util = require('util');
const inflection = require('inflection');
const Cards = require('../controllers/cards');

/**
 * Available states for game
 * @type {{STOPPED: string, STARTED: string, PLAYABLE: string, PLAYED: string, ROUND_END: string, WAITING: string}}
 */
const STATES = {
  STOPPED  : 'Stopped',
  STARTED  : 'Started',
  PLAYABLE : 'Playable',
  PLAYED   : 'Played',
  ROUND_END: 'RoundEnd',
  WAITING  : 'Waiting',
  PAUSED   : 'Paused',
};

/**
 * A single game object that handles all operations in a game
 * @param channel The channel the game is running on
 * @param client The IRC client object
 * @param config Configuration variables
 * @param cmdArgs !start command arguments
 * @param dbModels sequelize database Models
 * @constructor
 */
const Game = function Game (channel, client, config, cmdArgs, dbModels) {
  const self = this;

  // properties
  self.waitCount = 0; // number of times waited until enough players
  self.round = 0; // round number
  self.players = []; // list of players
  self.playersToAdd = []; // list of players to add after deferring because the game doesn't exist in the database yet
  self.channel = channel; // the channel this game is running on
  self.client = client; // reference to the irc client
  self.config = config; // configuration data
  self.state = STATES.STARTED; // game state storage
  self.pauseState = []; // pause state storage
  self.notifyUsersPending = false;
  self.pointLimit = 0; // point limit for the game, defaults to 0 (== no limit)
  self.dbModels = dbModels;

  /*
   *
   *  Database functions
   *
   */

  self.createGameDatabaseRecord = () => {
    if (self.config.gameOptions.database === true) {
      // Adding game to database
      self.dbModels.Game.create({ num_rounds: self.round }).then(game => {
        self.dbGame = game;
        _.forEach(self.playersToAdd, player => {
          self.addPlayer(player);
        });
      });
    }
  };

  self.updateGameDatabaseRecordGameOver = (limitReached, { gameOptions }) => {
    if (gameOptions.database === true) {
      if (limitReached) {
        // Get winning player
        const winner = self.getPlayer({ points: self.pointLimit });

        // Get player from database and update the game
        self.dbModels.Player.findOne({ where: { nick: winner.nick } }).then(({ id }) => {
          self.dbGame.update({ ended_at: new Date(), num_rounds: self.round, winner_id: id });
          self.updateGameDatabaseRecordGameOver(true);
        });
      } else {
        self.dbGame.update({ ended_at: new Date(), num_rounds: self.round, winner_id: null });
      }
    }
  };

  self.updatePointsDatabaseTable = () => {
    if (self.config.gameOptions.database === true) {
      _.forEach(self.players, ({ nick, isActive, points }) => {
        self.dbModels.Player.findOne({ where: { nick: nick } }).then(({ id }) => {
          self.updateOrCreateInstance(
            self.dbModels.Points,
            { where: { player_id: id, game_id: self.dbGame.id } },
            { player_id: id, game_id: self.dbGame.id, is_active: isActive, points: points },
            { points: points }
          );
        });
      });
    }
  };

  self.updateOrCreateInstance = (model, query, createFields, updateFields) => {
    model.findOne(query).then(instance => {
      if (instance === null && createFields !== null) {
        model.create(createFields);
      } else if (instance !== null && updateFields !== null) {
        instance.update(updateFields);
      }
    });
  };

  self.recordRound = cardValue => {
    if (self.config.gameOptions.database === true) {
      self.dbModels.Card.findOne({ where: { text: cardValue } }).then(instance => {
        instance.update({ times_played: instance.times_played + 1 }).then(({ id }) => {
          self.createRound(id);
        });
      });
    }
  };

  self.createCardCombo = ({ nick }, cards) => {
    if (self.config.gameOptions.database === true) {
      self.dbModels.Player.findOne({ where: { nick: nick } }).then(({ id }) => {
        self.updateCardComboTable(id, cards);
      });
    }
  };

  self.updateCardComboTable = (id, playerCards) => {
    if (self.config.gameOptions.database === true) {
      const round = self.dbCurrentRound;
      let cardString = [];

      self.dbModels.Card
        .findAll({
          where: {
            text: {
              in: _.map(playerCards, ({ value }) => value),
            },
          },
        })
        .then(cards => {
          if (playerCards.length === 1) {
            cardString = cards[0].id;
          } else {
            _.forEach(playerCards, ({ value }) => {
              _.forEach(cards, card => {
                if (value === card.text) {
                  cardString.push(card.id);
                }
              });
            });

            cardString = cardString.join(',');
          }

          self.updateOrCreateInstance(
            self.dbModels.CardCombo,
            { where: { game_id: self.dbGame.id, player_id: id, questionID: round.questionID } },
            {
              game_id   : self.dbGame.id,
              player_id : id,
              questionID: round.questionID,
              answer_ids: cardString,
              winner    : false,
            },
            null
          );

          // Finally update each of the cards times played count
          _.forEach(cards, card => {
            card.update({ times_played: card.times_played + 1 });
          });
        });
    }
  };

  self.createRound = questionID => {
    if (self.config.gameOptions.database === true) {
      self.dbModels.Round
        .create({
          game_id           : self.dbGame.id,
          round_number      : self.round,
          num_active_players: _.filter(self.players, ({ isActive }) => isActive).length,
          total_players     : self.players.length,
          questionID,
        })
        .then(round => {
          self.dbCurrentRound = round;
        });
    }
  };

  self.setWinnerDatabase = (round, { nick }) => {
    if (self.config.gameOptions.database === true) {
      self.dbModels.Player.findOne({ where: { nick: nick } }).then(({ id }) => {
        round.update({ winner_id: id });
      });
    }
  };

  self.createPlayerDatabaseRecord = ({ nick }) => {
    if (self.config.gameOptions.database === true) {
      self.updateOrCreateInstance(
        self.dbModels.Player,
        { where: { nick: nick } },
        { nick: nick, last_game_id: self.dbGame.id },
        { last_game_id: self.dbGame.id }
      );
    }
  };

  self.updatePlayerDatabaseRecord = ({ nick }) => {
    if (self.config.gameOptions.database === true) {
      self.updateOrCreateInstance(
        self.dbModels.Player,
        { where: { nick: nick } },
        { nick: nick, last_game_id: self.dbGame.id },
        { last_game_id: self.dbGame.id }
      );
    }
  };

  // Game code starts here

  // Add game to database if database is enabled
  self.createGameDatabaseRecord();

  console.log('Loaded', config.cards.length, 'cards:');
  const questions = _.filter(config.cards, ({ type }) => type.toLowerCase() === 'question');
  console.log(questions.length, 'questions');

  const answers = _.filter(config.cards, ({ type }) => type.toLowerCase() === 'answer');
  console.log(answers.length, 'answers');

  // init decks
  self.decks = {
    question: new Cards(questions),
    answer  : new Cards(answers),
  };
  // init discard piles
  self.discards = {
    question: new Cards(),
    answer  : new Cards(),
  };
  // init table slots
  self.table = {
    question: null,
    answer  : [],
  };
  // shuffle decks
  self.decks.question.shuffle();
  self.decks.answer.shuffle();

  // parse point limit from configuration file
  if (!_.isUndefined(config.gameOptions.pointLimit) && !isNaN(config.gameOptions.pointLimit)) {
    console.log(`Set game point limit to ${config.gameOptions.pointLimit} from config`);
    self.pointLimit = parseInt(config.gameOptions.pointLimit);
  }
  // parse point limit from command arguments
  if (!_.isUndefined(cmdArgs[0]) && !isNaN(cmdArgs[0])) {
    console.log(`Set game point limit to ${cmdArgs[0]} from arguments`);
    self.pointLimit = parseInt(cmdArgs[0]);
  }

  /**
   * Stop game
   */
  self.stop = (player, pointLimitReached) => {
    self.state = STATES.STOPPED;

    if (!_.isUndefined(player) && !_.isNil(player)) {
      self.say(`${player.nick} stopped the game.`);
    }

    if (self.round > 1) {
      // show points if played more than one round
      self.showPoints();
    }

    if (pointLimitReached !== true) {
      self.say('Game has been stopped.');
      self.updateGameDatabaseRecordGameOver(false, self.config);
    } else {
      self.updateGameDatabaseRecordGameOver(true, self.config);
    }

    // Update points table
    self.updatePointsDatabaseTable();

    // clear all timers
    clearTimeout(self.startTimeout);
    clearTimeout(self.stopTimeout);
    clearTimeout(self.turnTimer);
    clearTimeout(self.winnerTimer);

    // Remove listeners
    client.removeListener('part', self.playerPartHandler);
    client.removeListener('quit', self.playerQuitHandler);
    client.removeListener(`kick${self.channel}`, self.playerKickHandler);
    client.removeListener('nick', self.playerNickChangeHandler);
    client.removeListener(`names${self.channel}`, self.notifyUsersHandler);

    // Destroy game properties
    delete self.players;
    delete self.config;
    delete self.client;
    delete self.channel;
    delete self.round;
    delete self.decks;
    delete self.discards;
    delete self.table;

    // set topic
    self.setTopic(c.bold.yellow('No game is running. Type !start to begin one!'));
  };

  /**
     * Pause game
     */
  self.pause = () => {
    // check if game is already paused
    if (self.state === STATES.PAUSED) {
      self.say('Game is already paused. Type !resume to begin playing again.');
      return false;
    }

    // only allow pause if game is in PLAYABLE or PLAYED state
    if (self.state !== STATES.PLAYABLE && self.state !== STATES.PLAYED) {
      self.say('The game cannot be paused right now.');
      return false;
    }

    // store state and pause game
    const now = new Date();
    self.pauseState.state = self.state;
    self.pauseState.elapsed = now.getTime() - self.roundStarted.getTime();
    self.state = STATES.PAUSED;

    self.say('Game is now paused. Type !resume to begin playing again.');

    // clear turn timers
    clearTimeout(self.turnTimer);
    clearTimeout(self.winnerTimer);
  };

  /**
     * Resume game
     */
  self.resume = () => {
    // make sure game is paused
    if (self.state !== STATES.PAUSED) {
      self.say('The game is not paused.');
      return false;
    }

    // resume game
    const now = new Date();
    const newTime = new Date();
    newTime.setTime(now.getTime() - self.pauseState.elapsed);
    self.roundStarted = newTime;
    self.state = self.pauseState.state;

    self.say('Game has been resumed.');
    // resume timers
    if (self.state === STATES.PLAYED) {
      // check if czar quit during pause
      if (_.includes(self.players, self.czar)) {
        // no czar
        self.say('The czar quit the game during pause. I will pick the winner on this round.');
        // select winner
        self.selectWinner(Math.round(Math.random() * (self.table.answer.length - 1)));
      } else {
        self.winnerTimer = setInterval(self.winnerTimerCheck, 10 * 1000);
      }
    } else if (self.state === STATES.PLAYABLE) {
      self.turnTimer = setInterval(self.turnTimerCheck, 10 * 1000);
    }
  };

  /**
     * Start next round
     */
  self.nextRound = () => {
    clearTimeout(self.stopTimeout);
    // check if any player reached the point limit
    if (self.pointLimit > 0) {
      const winner = _.find(self.players, { points: self.pointLimit });
      if (winner) {
        self.say(
          `${winner.nick} has the limit of ${self.pointLimit} awesome ${inflection.inflect(
            'points',
            self.pointLimit
          )} and is the winner of the game! Congratulations!`
        );
        self.stop(null, true);
        return false;
      }
    }

    // check that there's enough players in the game
    if (_.filter(self.players, { isActive: true }).length < 3) {
      self.say(
        `Not enough players to start a round (need at least 3). Waiting for others to join. Stopping in ${config.gameOptions.roundMinutes} ${inflection.inflect(
          'minutes',
          config.gameOptions.roundMinutes
        )} if not enough players.`
      );
      self.state = STATES.WAITING;
      // stop game if not enough pleyers in however many minutes in the config
      self.stopTimeout = setTimeout(self.stop, 60 * 1000 * config.gameOptions.roundMinutes);
      return false;
    }

    self.updatePointsDatabaseTable();

    self.round++;
    self.dbGame.update({ num_rounds: self.round });
    console.log('Starting round ', self.round);

    self.setCzar();
    self.deal();
    self.say(`Round ${self.round}! ${self.czar.nick} is the card czar.`);
    self.playQuestion();

    // show cards for all players (except czar)
    _.forEach(self.players, player => {
      if (player.isCzar !== true && player.isActive === true) {
        self.showCards(player);
        self.pm(player.nick, 'Play cards with !cah');
      }
    });

    self.state = STATES.PLAYABLE;
  };

  /**
     * Set a new czar
     * @returns Player The player object who is the new czar
     */
  self.setCzar = () => {
    if (self.czar) {
      console.log(`Old czar: ${self.czar.nick}`);
      let nextCzar;

      _.forEach(self.players, ({ nick, isActive }) => {
        console.log(`${nick}: ${isActive}`);
      });

      for (
        let i = (self.players.indexOf(self.czar) + 1) % self.players.length;
        i !== self.players.indexOf(self.czar);
        i = (i + 1) % self.players.length
      ) {
        console.log(`${i}: ${self.players[i].nick}: ${self.players[i].isActive}`);
        if (self.players[i].isActive === true) {
          nextCzar = i;
          break;
        }
      }

      self.czar = self.players[nextCzar];
    } else {
      self.czar = _.filter(self.players, { isActive: true })[0];
    }

    console.log('New czar:', self.czar.nick);
    self.czar.isCzar = true;
    return self.czar;
  };

  /**
     * Deal cards to fill players' hands
     */
  self.deal = function (player, num) {
    if (_.isUndefined(player)) {
      _.forEach(self.players, _.bind(player => {
        if (player.isActive) {
          console.log(
            `${player.nick}(${player.hostname}) has ${player.cards.numCards()} cards. Dealing ${10 -
              player.cards.numCards()} cards`
          );
          for (let i = player.cards.numCards(); i < 10; i++) {
            self.checkDecks();
            const card = self.decks.answer.pickCards();
            player.cards.addCard(card);
            card.owner = player;
          }
        }
      }, this));
    } else {
      if (typeof num !== 'undefined') {
        for (let i = player.cards.numCards(); i < num; i++) {
          self.checkDecks();
          const card = self.decks.answer.pickCards();
          player.cards.addCard(card);
          card.owner = player;
        }
      }
    }
  };

  /**
     * Clean up table after round is complete
     */
  self.clean = function () {
    // move cards from table to discard
    self.discards.question.addCard(self.table.question);
    self.table.question = null;
    // var count = self.table.answer.length;
    _.forEach(self.table.answer, _.bind(function (cards) {
      _.forEach(cards.getCards(), _.bind(card => {
        card.owner = null;
        self.discards.answer.addCard(card);
        cards.removeCard(card);
      }, this));
    }, this));
    self.table.answer = [];

    // reset players
    const removedNicks = [];
    _.forEach(self.players, player => {
      player.hasPlayed = false;
      player.hasDiscarded = false;
      player.isCzar = false;
      // check if idled and remove
      if (player.inactiveRounds >= 1) {
        player.inactiveRounds = 0;
        self.removePlayer(player, { silent: true });
        removedNicks.push(player.nick);
      }
    });

    if (removedNicks.length > 0) {
      self.say(
        `Removed inactive ${inflection.inflect(
          'players',
          removedNicks.length
        )}: ${removedNicks.join(', ')}`
      );
    }
    // reset state
    self.state = STATES.STARTED;
  };

  /**
     * Play new question card on the table
     */
  self.playQuestion = () => {
    self.checkDecks();
    const card = self.decks.question.pickCards();
    // replace all instance of %s with underscores for prettier output
    let value = card.value.replace(/%s/g, '___');
    // check if special pick & draw rules
    if (card.pick > 1) {
      value += c.bold(` [PICK ${card.pick}]`);
    }
    if (card.draw > 0) {
      value += c.bold(` [DRAW ${card.draw}]`);
    }
    self.say(c.bold('CARD: ') + value);
    self.table.question = card;

    // Record card and round in the database
    self.recordRound(card.value);

    // PM Card to players
    _.forEach(_.filter(self.players, { isCzar: false, isActive: true }), ({ nick }) => {
      self.pm(nick, c.bold('CARD: ') + value);
    });

    // draw cards
    if (self.table.question.draw > 0) {
      _.forEach(_.filter(self.players, { isCzar: false, isActive: true }), player => {
        for (let i = 0; i < self.table.question.draw; i++) {
          self.checkDecks();
          const c = self.decks.answer.pickCards();
          player.cards.addCard(c);
          c.owner = player;
        }
      });
    }
    // start turn timer, check every 10 secs
    clearInterval(self.turnTimer);
    self.roundStarted = new Date();
    self.turnTimer = setInterval(self.turnTimerCheck, 10 * 1000);
  };

  /**
     * Play a answer card from players hand
     * @param cards card indexes in players hand
     * @param player Player who played the cards
     */
  self.playCard = (cards, player) => {
    // don't allow if game is paused
    if (self.state === STATES.PAUSED) {
      self.say('Game is currently paused.');
      return false;
    }

    console.log(`${player.nick} played cards`, cards.join(', '));
    // make sure different cards are played
    cards = _.uniq(cards);
    if (self.state !== STATES.PLAYABLE || player.cards.numCards() === 0) {
      self.say(`${player.nick}: Can't play at the moment.`);
    } else if (!_.isUndefined(player)) {
      if (player.isCzar === true) {
        self.say(
          `${player.nick}: You are the card czar. The czar does not play. The czar makes other people do their dirty work.`
        );
      } else {
        if (player.hasPlayed === true) {
          self.say(`${player.nick}: You have already played on this round.`);
        } else if (cards.length !== self.table.question.pick) {
          // invalid card count
          self.say(
            `${player.nick}: You must pick ${inflection.inflect(
              'cards',
              self.table.question.pick,
              '1 card',
              self.table.question.pick + ' different cards'
            )}.`
          );
        } else {
          // get played cards
          let playerCards;
          try {
            playerCards = player.cards.pickCards(cards);
          } catch (error) {
            self.pm(player.nick, 'Invalid card index');
            return false;
          }
          self.table.answer.push(playerCards);
          player.hasPlayed = true;
          player.inactiveRounds = 0;
          self.pm(
            player.nick,
            `You played: ${self.getFullEntry(self.table.question, playerCards.getCards())}`
          );

          // Update card combo table
          self.createCardCombo(player, playerCards.getCards());

          // show entries if all players have played
          if (self.checkAllPlayed()) {
            self.showEntries();
          }
        }
      }
    } else {
      console.warn('Invalid player tried to play a card');
    }
  };

  /**
     * Allow a player to discard a number of cards once per turn
     * @param cards Array of card indexes to discard
     * @param player The player who discarded
     */
  self.discard = (cards, player) => {
    if (self.state === STATES.PAUSED) {
      self.say('Game is currently paused');
      return false;
    }

    console.log(`${player.nick} discarded ${cards.join(', ')}`);
    cards = _.uniq(cards);

    if (self.state !== STATES.PLAYABLE || player.cards.numCards() === 0) {
      self.say(`${player.nick}: Can't discard at the moment.`);
    } else if (!_.isUndefined(player)) {
      if (player.isCzar === true) {
        self.say(
          `${player.nick}: You are the card czar. You cannot discard cards until you are a regular player.`
        );
      } else {
        if (player.hasDiscarded === true) {
          self.say(`${player.nick}: You may only discard once per turn.`);
        } else if (player.points < 1) {
          self.say(`${player.nick}: You must have at least one awesome point to discard.`);
        } else {
          let playerCards;

          if (cards.length === 0) {
            cards = [];
            for (let i = 0; i < player.cards.numCards(); i++) {
              cards[i] = i;
            }
          }

          try {
            playerCards = player.cards.pickCards(cards);
          } catch (error) {
            self.pm(player.nick, 'Invalid card index.');
            return false;
          }

          self.deal(player, player.cards.numCards() + playerCards.numCards());

          // Add the cards to the discard pile, and reduce points, and mark the player as having discarded
          _.forEach(playerCards.getCards(), card => {
            card.owner = null;
            self.discards.answer.addCard(card);
            playerCards.removeCard(card);
          });

          player.hasDiscarded = true;
          player.points--;

          self.pm(
            player.nick,
            `You have discarded, and have ${player.points} ${inflection.inflect(
              'points',
              player.points
            )} remaining`
          );
          self.showCards(player);
        }
      }
    } else {
      console.warn('Invalid player tried to discard cards');
    }
  };

  /**
     * Check the time that has elapsed since the beinning of the turn.
     * End the turn is time limit is up
     */
  self.turnTimerCheck = () => {
    // check the time
    const now = new Date();
    const timeLimit = 60 * 1000 * config.gameOptions.roundMinutes;
    const roundElapsed = now.getTime() - self.roundStarted.getTime();
    console.log('Round elapsed:', roundElapsed, now.getTime(), self.roundStarted.getTime());
    if (roundElapsed >= timeLimit) {
      console.log('The round timed out');
      self.say('Time is up!');
      self.markInactivePlayers();
      // show end of turn
      self.showEntries();
    } else if (roundElapsed >= timeLimit - 10 * 1000 && roundElapsed < timeLimit) {
      // 10s ... 0s left
      self.say('10 seconds left!');
    } else if (roundElapsed >= timeLimit - 30 * 1000 && roundElapsed < timeLimit - 20 * 1000) {
      // 30s ... 20s left
      self.say('30 seconds left!');
    } else if (roundElapsed >= timeLimit - 60 * 1000 && roundElapsed < timeLimit - 50 * 1000) {
      // 60s ... 50s left
      self.say('Hurry up, 1 minute left!');
      self.showStatus();
    }
  };

  /**
     * Show the entries
     */
  self.showEntries = function () {
    // clear round timer
    clearInterval(self.turnTimer);

    self.state = STATES.PLAYED;
    // Check if 2 or more entries...
    if (self.table.answer.length === 0) {
      self.say('No one played on this round.');
      // skip directly to next round
      self.clean();
      self.nextRound();
    } else if (self.table.answer.length === 1) {
      self.say('Only one player played and is the winner by default.');
      self.selectWinner(0);
    } else {
      self.say('Everyone has played. Here are the entries:');
      // shuffle the entries
      self.table.answer = _.shuffle(self.table.answer);
      _.forEach(self.table.answer, _.bind((cards, i) => {
        self.say(`${i}: ${self.getFullEntry(self.table.question, cards.getCards())}`);
      }, this));
      // check that czar still exists
      const currentCzar = _.find(this.players, { isCzar: true, isActive: true });
      if (_.isUndefined(currentCzar)) {
        // no czar, random winner (TODO: Voting?)
        self.say('The czar has fled the scene. So I will pick the winner on this round.');
        self.selectWinner(Math.round(Math.random() * (self.table.answer.length - 1)));
      } else {
        self.say(`${self.czar.nick}: Select the winner (!cah <entry number>)`);
        // start turn timer, check every 10 secs
        clearInterval(self.winnerTimer);
        self.roundStarted = new Date();
        self.winnerTimer = setInterval(self.winnerTimerCheck, 10 * 1000);
      }
    }
  };

  /**
     * Check the time that has elapsed since the beinning of the winner select.
     * End the turn is time limit is up
     */
  self.winnerTimerCheck = () => {
    // check the time
    const now = new Date();
    const timeLimit = 60 * 1000 * config.gameOptions.roundMinutes;
    const roundElapsed = now.getTime() - self.roundStarted.getTime();
    console.log(
      'Winner selection elapsed:',
      roundElapsed,
      now.getTime(),
      self.roundStarted.getTime()
    );
    if (roundElapsed >= timeLimit) {
      console.log('the czar is inactive, selecting winner');
      self.say('Time is up. I will pick the winner on this round.');
      // Check czar & remove player after 3 timeouts
      self.czar.inactiveRounds++;
      // select winner
      self.selectWinner(Math.round(Math.random() * (self.table.answer.length - 1)));
    } else if (roundElapsed >= timeLimit - 10 * 1000 && roundElapsed < timeLimit) {
      // 10s ... 0s left
      self.say(`${self.czar.nick}: 10 seconds left!`);
    } else if (roundElapsed >= timeLimit - 30 * 1000 && roundElapsed < timeLimit - 20 * 1000) {
      // 30s ... 20s left
      self.say(`${self.czar.nick}: 30 seconds left!`);
    } else if (roundElapsed >= timeLimit - 60 * 1000 && roundElapsed < timeLimit - 50 * 1000) {
      // 60s ... 50s left
      self.say(`${self.czar.nick}: Hurry up, 1 minute left!`);
    }
  };

  /**
     * Pick an entry that wins the round
     * @param index Index of the winning card in table list
     * @param player Player who said the command (use null for internal calls, to ignore checking)
     */
  self.selectWinner = (index, player) => {
    // don't allow if game is paused
    if (self.state === STATES.PAUSED) {
      self.say('Game is currently paused.');
      return false;
    }

    // clear winner timer
    clearInterval(self.winnerTimer);

    const winner = self.table.answer[index];
    if (self.state === STATES.PLAYED) {
      if (typeof player !== 'undefined' && player !== self.czar) {
        client.say(
          `${player.nick}: You are not the card czar. Only the card czar can select the winner`
        );
      } else if (typeof winner === 'undefined') {
        self.say('Invalid winner');
      } else {
        self.state = STATES.ROUND_END;
        const owner = winner.cards[0].owner;
        owner.points++;
        // announce winner
        self.say(
          `${c.bold('Winner is: ') + owner.nick} with "${self.getFullEntry(
            self.table.question,
            winner.getCards()
          )}" and gets one awesome point! ${owner.nick} has ${owner.points} awesome ${inflection.inflect(
            'point',
            owner.points
          )}.`
        );

        const round = self.dbCurrentRound;
        self.setWinnerDatabase(round, owner);

        self.clean();
        self.nextRound();
      }
    }
  };

  /**
     * Get formatted entry
     * @param question
     * @param answers
     * @returns {*|Object|ServerResponse}
     */
  self.getFullEntry = function ({ value }, answers) {
    const args = [value];
    _.forEach(answers, _.bind(({ value }) => {
      args.push(value);
    }, this));
    return util.format.apply(this, args);
  };

  /**
     * Check if all active players played on the current round
     * @returns Boolean true if all players have played
     */
  self.checkAllPlayed = () => {
    let allPlayed = false;
    if (self.getNotPlayed().length === 0) {
      allPlayed = true;
    }
    return allPlayed;
  };

  /**
     * Check if decks are empty & reset with discards
     */
  self.checkDecks = () => {
    // check answer deck
    if (self.decks.answer.numCards() === 0) {
      console.log('answer deck is empty. reset from discard.');
      self.decks.answer.reset(self.discards.answer.reset());
      self.decks.answer.shuffle();
    }
    // check question deck
    if (self.decks.question.numCards() === 0) {
      console.log('question deck is empty. reset from discard.');
      self.decks.question.reset(self.discards.question.reset());
      self.decks.question.shuffle();
    }
  };

  /**
     * Add a player to the game
     * @param player Player object containing new player's data
     * @returns The new player or false if invalid player
     */
  self.addPlayer = player => {
    if (config.gameOptions.database === true && _.isUndefined(self.dbGame)) {
      self.playersToAdd.push(player);
    } else if (_.isUndefined(self.getPlayer({ nick: player.nick, hostname: player.hostname, isActive: true }))) {
      // Returning players
      const oldPlayer = _.find(self.players, {
        nick    : player.nick,
        hostname: player.hostname,
        isActive: false,
      });
      if (!_.isUndefined(oldPlayer)) {
        if (oldPlayer.idleCount >= config.gameOptions.idleLimit) {
          self.say(`${player.nick}: You have idled too much and have been banned from this game.`);
          return false;
        }

        if (
          _.filter(self.players, { isActive: true }).length >= self.config.gameOptions.maxPlayers
        ) {
          self.say(
            `${player.nick}: You cannot join right now as the maximum number of players have joined the game`
          );
          return false;
        }
        oldPlayer.isActive = true;
      } else {
        if (
          _.filter(self.players, { isActive: true }).length >= self.config.gameOptions.maxPlayers
        ) {
          self.say(
            `${player.nick}: You cannot join right now as the maximum number of players have joined the game`
          );
          return false;
        }
        self.players.push(player);
        if (self.state !== STATES.WAITING) {
          self.players[self.players.length - 1].hasPlayed = true;
        }
      }

      self.say(`${player.nick} has joined the game`);

      // check if waiting for players
      if (self.state === STATES.WAITING && _.filter(self.players, { isActive: true }).length >= 3) {
        // enough players, start the game
        self.nextRound();
      }

      self.createPlayerDatabaseRecord(player);
      return player;
    }

    return false;
  };

  /**
     * Find player
     * @param search
     * @returns {*}
     */
  self.getPlayer = search => _.find(self.players, search);

  /**
     * Remove player from game
     * @param player
     * @param options Extra options
     * @returns The removed player or false if invalid player
     */
  self.removePlayer = (player, options) => {
    options = _.assignIn({}, options);
    if (!_.isUndefined(player) && player.isActive) {
      console.log(`removing${player.nick} from the game`);
      // get cards in hand
      const cards = player.cards.reset();
      // remove player
      player.isActive = false;
      // put player's cards to discard
      _.forEach(cards, card => {
        console.log('Add card ', card.text, 'to discard');
        self.discards.answer.addCard(card);
      });
      if (options.silent !== true) {
        self.say(`${player.nick} has left the game`);
      }

      if (_.filter(self.players, { isActive: true }).length === 0) {
        self.say('No Players left');
        self.stop();
        return false;
      }

      // check if remaining players have all player
      if (self.state === STATES.PLAYABLE && self.checkAllPlayed()) {
        self.showEntries();
      }

      // check czar
      if (self.state === STATES.PLAYED && self.czar === player) {
        self.say('The czar has fled the scene. So I will pick the winner on this round.');
        self.selectWinner(Math.round(Math.random() * (self.table.answer.length - 1)));
      }

      // check if everyone has left the game
      const activePlayers = _.filter(self.players, ({ isActive }) => isActive);
      if (activePlayers.length === 0) {
        self.stop();
      }

      return player;
    }
    return false;
  };

  /**
     * Get all player who have not played
     * @returns Array list of Players that have not played
     */
  self.getNotPlayed = () => _.filter(_.filter(self.players, (
      { cards } // check only players with cards (so players who joined in the middle of a round are ignored)
    ) => cards.numCards() > 0), { hasPlayed: false, isCzar: false, isActive: true });

  /**
     * Check for inactive players
     * @param options
     */
  self.markInactivePlayers = function (options) {
    _.forEach(self.getNotPlayed(), _.bind(player => {
      player.inactiveRounds++;
    }, this));
  };

  /**
     * Show players cards to player
     * @param player
     */
  self.showCards = function (player) {
    if (!_.isUndefined(player)) {
      let cardsZeroToSix = 'Your cards are:';
      let cardsSevenToTwelve = '';
      _.forEach(player.cards.getCards(), _.bind(({ value }, index) => {
        if (index < 7) {
          cardsZeroToSix += c.bold(' [' + index + '] ') + value;
        } else {
          cardsSevenToTwelve += `${c.bold('[' + index + '] ') + value} `;
        }
      }, this));

      self.pm(player.nick, cardsZeroToSix);
      self.pm(player.nick, cardsSevenToTwelve);
    }
  };

  /**
     * Show points for all players
     */
  self.showPoints = () => {
    const sortedPlayers = _.sortBy(self.players, ({ points }) => -points);
    let output = '';
    _.forEach(sortedPlayers, ({ nick, points }) => {
      output += `${nick} ${points} awesome ${inflection.inflect('point', points)}, `;
    });
    self.say(`The most horrible people: ${output.slice(0, -2)}`);
  };

  /**
     * Show status
     */
  self.showStatus = () => {
    // amount of player needed to start the game
    const timeLeft = config.gameOptions.secondsBeforeStart -
      Math.round((new Date().getTime() - self.startTime.getTime()) / 1000);

    // players who have not played yet
    const activePlayers = _.filter(self.players, ({ isActive }) => isActive);
    const playersNeeded = Math.max(0, 3 - activePlayers.length);

    const notPlayed = _.filter(activePlayers, { isCzar: false, hasPlayed: false, isActive: true });
    switch (self.state) {
      case STATES.PLAYABLE:
        self.say(
          `${c.bold('Status: ') + self.czar.nick} is the czar. Waiting for ${inflection.inflect(
            'players',
            _.map(notPlayed, 'nick').length
          )} to play: ${_.map(notPlayed, 'nick').join(', ')}`
        );
        break;
      case STATES.PLAYED:
        self.say(`${c.bold('Status: ')}Waiting for ${self.czar.nick} to select the winner.`);
        break;
      case STATES.ROUND_END:
        self.say(`${c.bold('Status: ')}Round has ended and next one is starting.`);
        break;
      case STATES.STARTED:
        self.say(
          `${c.bold('Status: ')}Game starts in ${timeLeft} ${inflection.inflect(
            'seconds',
            timeLeft
          )}. Need ${playersNeeded} more ${inflection.inflect('players', playersNeeded)} to start.`
        );
        break;
      case STATES.STOPPED:
        self.say(`${c.bold('Status: ')}Game has been stopped.`);
        break;
      case STATES.WAITING:
        self.say(
          `${c.bold(
            'Status: '
          )}Not enough players to start. Need ${playersNeeded} more ${inflection.inflect(
            'players',
            playersNeeded
          )} to start.`
        );
        break;
      case STATES.PAUSED:
        self.say(`${c.bold('Status: ')}Game is paused.`);
        break;
    }
  };

  /**
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

  /**
     * List all players in the current game
     */
  self.listPlayers = () => {
    const activePlayers = _.filter(self.players, ({ isActive }) => isActive);

    if (activePlayers.length > 0) {
      self.say(`Players currently in the game: ${_.map(activePlayers, 'nick').join(', ')}`);
    } else {
      self.say('No players currently in the game');
    }
  };

  /**
     * Helper function for the handlers below
     */
  self.findAndRemoveIfPlaying = nick => {
    const player = self.getPlayer({ nick });
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
    console.log(`Player changed nick from ${oldnick} to ${newnick}`);
    const player = self.getPlayer({ nick: oldnick });
    if (!_.isUndefined(player)) {
      player.nick = newnick;
    }
    self.updatePlayerDatabaseRecord(player);
  };

  /**
     * Notify users in channel that game has started
     */
  self.notifyUsers = () => {
    // request names
    client.send('NAMES', channel);

    // signal handler to send notifications
    self.notifyUsersPending = true;
  };

  /**
     * Handle names response to notify users
     * @param nicks
     */
  self.notifyUsersHandler = nicks => {
    // ignore if we haven't requested this
    if (self.notifyUsersPending === false) {
      return false;
    }

    // don't message nicks with these modes
    const exemptModes = ['~', '&'];

    // loop through and send messages
    _.forEach(nicks, (mode, nick) => {
      if (_.includes(exemptModes, mode) && nick !== config.botOptions.nick) {
        self.notice(
          nick,
          `${nick}: A new game of Cards Against Humanity just began in ${channel}. Head over and !join if you'd like to get in on the fun!`
        );
      }
    });

    // reset
    self.notifyUsersPending = false;
  };

  /**
     * Public message to the game channel
     * @param string
     */
  self.say = string => {
    self.client.say(self.channel, string);
  };

  self.pm = (nick, string) => {
    self.client.say(nick, string);
  };

  self.notice = (nick, string) => {
    self.client.notice(nick, string);
  };

  // set topic
  self.setTopic(c.bold.lime('A game is running. Type !join to get in on it!'));

  // announce the game on the channel
  self.say(
    `A new game of ${c.rainbow(
      'Cards Against Humanity'
    )}. The game starts in ${config.gameOptions.secondsBeforeStart} ${inflection.inflect(
      'seconds',
      config.gameOptions.secondsBeforeStart
    )}. Type !join to join the game any time.`
  );

  // notify users
  if (!_.isUndefined(config.gameOptions.notifyUsers) && config.gameOptions.notifyUsers) {
    self.notifyUsers();
  }

  // wait for players to join
  self.startTime = new Date();
  self.startTimeout = setTimeout(self.nextRound, config.gameOptions.secondsBeforeStart * 1000);

  // client listeners
  client.addListener('part', self.playerPartHandler);
  client.addListener('quit', self.playerQuitHandler);
  client.addListener(`kick${channel}`, self.playerKickHandler);
  client.addListener('nick', self.playerNickChangeHandler);
  client.addListener(`names${channel}`, self.notifyUsersHandler);
};

// export static state constant
Game.STATES = STATES;

exports = module.exports = Game;
