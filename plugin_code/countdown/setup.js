var Countdown = require('./app/controllers/countdown_controller.js');

module.exports = function(app) {
  var countdown = new Countdown();

  // Join channels
  app.joinChannels(countdown.config.pluginOptions.channelsToJoin);

  // Public commands
  app.cmd('accept', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.accept);
  //app.cmd('buzz', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.buzz);
  app.cmd('challenge', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.challenge);
  app.cmd('j', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.join);
  app.cmd('join', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.join);
  app.cmd('list', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.list);
  //app.cmd('lock', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.list);
  //app.cmd('players', '', countdown.config.pluginOptions.channels, contdown.config.pluginOptions.channelsToExclude, countdown.players);
  app.cmd('quit', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.stop);
  app.cmd('select', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.select);
  //app.cmd('start', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.start);
  //app.cmd('status', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.status);
  app.cmd('stop', '', countdown.config.pluginOptions.channels, countdown.config.pluginOptions.channelsToExclude, countdown.stop);

  // Private commands
  app.cmd('cd', '', countdown.play);
};