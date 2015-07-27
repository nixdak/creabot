var c = require('irc-colors');

var Card = function Card(card) {
  var self = this;

  self.type = card.type;
  self.color = card.color;
  self.value = card.value;

  switch (self.type) {
    case "Number":
      self.onPlay = self.addPoints;
      break;
    case "Draw Two":
      self.onPlay = self.drawTwo;
      break;
    case "Reverse":
      self.onPlay = self.reverse;
      break;
    case "Skip":
      self.onPlay = self.skip;
      break;
    case "Wild":
      self.onPlay = self.wild;
      break;
    case "Wild Draw Four":
      self.onPlay = self.wildDrawFour;
      break;
  }

  self.addPoints = function () {

  };

  self.drawTwo = function () {

  };

  self.reverse = function () {

  };

  self.skip = function () {

  };

  self.wild = function () {

  };

  self.wildDrawFour = function () {

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
        cardString = self.color + ' Wild';
        break;
      case 'Wild Draw Four':
        cardStrign = self.color + ' Wild Draw Four';
        break;
    }

    switch (self.color) {
      case 'yellow':
        cardString = c.bold.yellow(cardString);
        break;
      case 'green':
        cardString = c.bold.green(cardString);
        break;
      case 'blue':
        cardString = c.bold.blue(cardString);
        break;
      case 'red':
        cardString = c.bold.red(cardString);
        break;
      case 'wild':
        cardString = c.bold.brown(cardString);
        break;
    }
  }
}

exports = module.exports = Card;