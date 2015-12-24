var CardsAgainstHumanity = require('./app/controllers/cards_against_humanity_controller.js');

module.exports = function(app) {
  var cardsAgainstHumanity = new CardsAgainstHumanity();

  // Join Channels
  app.joinChannels(cardsAgainstHumanity.config.pluginOptions.channelsToJoin);

  // Public commands
  app.cmd('cards', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.cards);
  app.cmd('cah', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.pick);
  app.cmd('discard', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.discard);
  app.cmd('j', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.join);
  app.cmd('join', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.join);
  app.cmd('list', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.list);
  app.cmd('pause', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.pause);
  app.cmd('players', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.list);
  app.cmd('points', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.points);
  app.cmd('quit', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.quit);
  app.cmd('resume', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.resume);
  app.cmd('status', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.status);
  app.cmd('start', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.start);
  app.cmd('stop', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.stop);
  app.cmd('wiki', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.wiki);

  // Private commands
  app.msg('cah', '', cardsAgainstHumanity.pick);
  app.msg('cahwiki', '', cardsAgainstHumanity.wiki);
};
