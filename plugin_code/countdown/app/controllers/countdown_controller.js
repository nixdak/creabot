var _ = require('underscore'),
    Game = require('./game'),
    Player = require('../models/player'),
    env = process.env.NODE_ENV || 'development';
    config = require('../../config/config.json')[env];

var Countdown = function Countdown() {
  var self = this;
  self.game;
  self.config = config;

  self.accept = function (client, message, cmdArgs) {

  };

  self.buzz = function (client, message, cmdArgs) {
    
  };

  self.challenge = function (client, message, cmdArgs) {

  };

  self.join = function (client, message, cmdArgs) {

  };

  self.letters = function (client, message, cmdArgs) {

  };

  self.list = function (client, message, cmdArgs) {

  };

  self.lock = function (client, message, cmdArgs) {

  };

  self.numbers = function (client, message, cmdArgs) {

  };

  self.players = function (client, message, cmdArgs) {

  };

  self.start = function (client, message, cmdArgs) {

  };

  self.status = function (client, message, cmdArgs) {

  };

  self.stop = function (client, message, cmdArgs) {

  };

  self.quit = function (client, message, cmdArgs) {

  };
};

exports = module.exports = Countdown;