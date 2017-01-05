var Countdown = require('./app/controllers/countdown_controller.js');

module.exports = function(app) {
  var countdown = new Countdown();

  // Join channels
  app.joinChannels(countdown.config.pluginOptions.channelsToJoin);

  // Public commands
  app.cmd('accept', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.accept);
  app.cmd('buzz', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.buzz);
  app.cmd('cd', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.select);
  app.cmd('challenge', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.challenge);
  app.cmd('j', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.join);
  app.cmd('join', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.join);
  app.cmd('list', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.list);
  app.cmd('lock', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.lock);
  app.cmd('quit', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.stop);
  app.cmd('stop', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.stop);
  app.cmd('wiki', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.wiki);

  // Private commands
  app.msg('cd', '', countdown.play);
  app.msg('lock', '', countdown.lock);
  app.msg('cdwiki', '', countdown.wiki);
};
