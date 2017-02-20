var Popping = require('./app/controllers/popping.js');

module.exports = function(app) {
  var popping = new Popping();

  // Join Channels
  app.joinChannels(popping.config.channelsToJoin);

  // Add commands
  app.cmd('pop', '', popping.config.channels, popping.config.channelsToExclude, popping.pop);
};
