var Uno = require('./app/controllers/uno_controller.js');

module.exports = function(app) {
  var uno = new Uno();

  // Join channels
  app.joinChannels(uno.config.pluginOptions.channelsToJoin);

  // Public commands
  app.cmd('draw', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.draw);
  app.cmd('j', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.join);
  app.cmd('join', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.join);
  app.cmd('quit', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.quit);
  app.cmd('uno', '', uno.config.pluginOptions.channels, uno.config.pluginOptions.channelsToExclude, uno.uno);

  // Private commands
  app.msg('draw', '', uno.draw);
  app.msg('uno', '', uno.draw);
};