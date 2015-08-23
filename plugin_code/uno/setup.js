var Uno = require('./app/controllers/uno_controller.js');

module.exports = function(app) {
  var uno = new Uno();

  // Join channels
  app.joinChannels(uno.config.pluginOptions.channelsToJoin);

  // Public commands
  app.cmd('cards', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.cards);
  app.cmd('challenge', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.challenge);
  app.cmd('j', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.join);
  app.cmd('join', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.join);
  app.cmd('quit', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.quit);
  app.cmd('score', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.score);
  app.cmd('start', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.start);
  app.cmd('stop', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.stop);
  app.cmd('uno', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.uno);

  // Private commands
  app.msg('udraw', '', uno.draw);
  app.msg('uend', '', uno.end);
  app.msg('uplay', '', uno.play);
};