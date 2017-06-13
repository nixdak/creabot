'use strict';

const Popping = require('./app/controllers/popping.js');

module.exports = app => {
  const popping = new Popping();

  // Join Channels
  app.joinChannels(popping.config.channelsToJoin);

  // Add commands
  app.cmd('pop', '', popping.config.channels, popping.config.channelsToExclude, popping.pop);
};
