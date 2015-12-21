var c = require('irc-colors'),
  inflection = require('inflection');

var Card = function Card(card) {
  var self = this;

  self.type = card.type;
  self.color = card.color;
  self.value = card.value;

  self.onPlay = function(game) {
    switch (self.type) {
      case 'Number':
        self.number(game);
        break;
      case 'Draw Two':
        self.drawTwo(game);
        break;
      case 'Reverse':
        self.reverse(game);
        break;
      case 'Skip':
        self.skip(game);
        break;
      case 'Wild':
        self.wild(game);
        break;
      case 'Wild Draw Four':
        self.wildDrawFour(game);
        break;
    }
  };

  self.isPlayable = function(currentCard) {
    switch (currentCard.type) {
      case 'Wild':
      case 'Wild Draw Four':
        return (self.color === 'WILD' || currentCard.color === 'WILD' || self.color === currentCard.color);
      case 'Number':
        return self.color === 'WILD' || (self.color === currentCard.color || self.value === currentCard.value);
      case 'Skip':
      case 'Reverse':
      case 'Draw Two':
        return (self.color === 'WILD') || (self.color === currentCard.color || self.type === currentCard.type);
    }
  };

  self.number = function(game) {
    game.firstCard = false;
    return true;
  };

  self.drawTwo = function(game) {
    if (game.firstCard === true) {
      game.firstCard = false;
      return true;
    } else game.firstCard = false;
    // Next player draws
    var nextPlayer = game.firstCard === true ? game.currentPlayer : game.nextPlayer();
    game.deal(nextPlayer, 2, true);
    game.say(nextPlayer.nick + ' has picked up two cards and has ' + nextPlayer.hand.numCards() + ' left');
    self.skip(game);
  };

  self.reverse = function(game) {
    // If only two players
    if (game.players.length === 2) {
      // Skip
      self.skip(game);
      return true;
    }
    if (game.firstCard === true) {
      game.firstCard = false;
      return true;
    } else game.firstCard = false;
    //reverse game order
    game.players = game.players.reverse();
  };

  self.skip = function(game) {
    if (game.firstCard === true) {
      game.firstCard = false;
      return true;
    } else game.firstCard = false;
    var nextPlayer = game.firstCard === true ? game.currentPlayer : game.nextPlayer();
    nextPlayer.skipped = true;
    game.say(nextPlayer.nick + ' has been skipped!');
  };

  self.wild = function(game) {
    // Color is handled by the play function so just return true
    game.firstCard = false;
    return true;
  };

  self.wildDrawFour = function(game) {
    if (game.firstCard === true) {
      game.firstCard = false;
      return true;
    } else game.firstCard = false;
    // Color setting is handled else where, so make next player draw four cards and skip them
    var nextPlayer = game.firstCard === true ? game.currentPlayer : game.nextPlayer();

    // Next player draw
    game.deal(nextPlayer, 4, true);
    game.say(nextPlayer.nick + ' has picked up four cards and has ' + nextPlayer.hand.numCards() + ' left');
    self.skip(game);
  };

  self.toString = function() {
    var cardString = '';

    switch (self.type) {
      case 'Number':
        cardString = self.color + ' ' + self.value;
        break;
      case 'Skip':
        cardString = self.color + ' Skip';
        break;
      case 'Reverse':
        cardString = self.color + ' Reverse';
        break;
      case 'Draw Two':
        cardString = self.color + ' Draw Two';
        break;
      case 'Wild':
        if (self.color !== 'WILD') {
          cardString += self.color + ' ';
        }
        cardString += 'Wild';
        break;
      case 'Wild Draw Four':
        if (self.color !== 'WILD') {
          cardString += self.color + ' ';
        }

        cardString += 'Wild Draw Four';
        break;
    }

    switch (self.color) {
      case 'YELLOW':
        cardString = c.bold.yellow(cardString);
        break;
      case 'GREEN':
        cardString = c.bold.green(cardString);
        break;
      case 'BLUE':
        cardString = c.bold.blue(cardString);
        break;
      case 'RED':
        cardString = c.bold.red(cardString);
        break;
      case 'WILD':
        cardString = c.bold.rainbow(cardString);
        break;
    }

    return cardString;
  };
};

exports = module.exports = Card;
