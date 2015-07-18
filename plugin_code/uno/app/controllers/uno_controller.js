var _ = require('underscore'),
    Game = require('../models/game'),
    Player = require('../models/Player'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env];

var Uno = function Uno () {
  var self = this;

  self.challenge = function (client, message, cmdArgs) {

  };

  self.draw = function (client, message, cmdArgs) {

  };

  self.end = function (client, message, cmdArgs) {

  };

  self.join = function (client, message, cmdArgs) {

  };

  self.quit = function (client, message, cmdArgs) {

  };

  self.score = function (client, message, cmdArgs) {

  };

  self.start = function (client, message, cmdArgs) {

  };

  self.stop = function (client, message, cmdArgs) {

  };

  self.uno = function (client, message, cmdArgs) {

  };
}; 

exports = module.exports = Uno;