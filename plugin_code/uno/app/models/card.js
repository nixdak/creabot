var c = require('irc-colors');

var Card = function Card(card) {
  var self = this;

  self.type = card.type;
  self.color = card.color;
  self.value = card.value;

  switch (self.type) {
    case 'Number':
      self.onPlay = self.number;
      break;
    case 'Draw Two':
      self.onPlay = self.drawTwo;
      break;
    case 'Reverse':
      self.onPlay = self.reverse;
      break;
    case 'Skip':
      self.onPlay = self.skip;
      break;
    case 'Wild':
      self.onPlay = self.wild;
      break;
    case 'Wild Draw Four':
      self.onPlay = self.wildDrawFour;
      break;
  }

  self.isPlayable = function (currentCard) {
    console.log('Current type: ' + currentCard.type);
    console.log('Current color: ' + currentCard.color);
    console.log('Self type: ' + self.type);
    console.log('Self color: ' + self.color);
    switch (currentCard.type) {
      case 'Wild', 'Wild Draw Four':
        return (self.color === 'WILD' || self.color === currentCard.color); 
      case 'Number':
        return self.color === 'WILD' || (self.color === currentCard.color || self.value === currentCard.value);
      case 'Skip', 'Reverse', 'Draw Two':
        return (self.color === 'WILD') || (self.color === currentCard.color || self.type === currentCard.type); 
    }
  } 

  self.number = function () {
    return true;
  };

  self.drawTwo = function () {
    
  };

  self.reverse = function () {
    // If only two players
    // Skip
    // Else
    // Reverse game players
  };

  self.skip = function () {

  };

  self.wild = function () {
    // Color is handled by the play function so just return true
    return true;
  };

  self.wildDrawFour = function () {
    // Color setting is handled else where, so make next player draw four cards
  };

  self.toString = function () {
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
        cardString = 'Wild';
        break;
      case 'Wild Draw Four':
        cardString = 'Wild Draw Four';
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
  }
}

exports = module.exports = Card;
