var Bookclub = require('./app/controllers/Bookclub.js');

module.exports = function(app) {
  var bookclub = new Bookclub();

  // Join Channels
  app.joinChannels(bookclub.config.channelsToJoin);

  // Add commands
  app.cmd('suggest', '', bookclub.config.channels, bookclub.config.channelsToExclude, bookclub.suggest);
  app.cmd('current', '', bookclub.config.channels, bookclub.config.channelsToExclude, bookclub.thisMonth);
};
