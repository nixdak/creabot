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
}

exports = module.exports = Card;