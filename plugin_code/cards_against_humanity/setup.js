var CardsAgainstHumanity = require('./app/controllers/cards_against_humanity_controller.js');

module.exports = function(app) {
    var cardsAgainstHumanity = new CardsAgainstHumanity();

    // Join Channels
    app.joinChannels(cardsAgainstHumanity.config.pluginOptions.channelsToJoin);

    // Register commands
    app.cmd('cards', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.cards);
    app.cmd('discard', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.discard);
    app.cmd('j', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.join);
    app.cmd('join', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.join);
    app.cmd('list', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.list);
    app.cmd('p', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.pick);
    app.cmd('pause', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.pause);
    app.cmd('pick', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.pick);
    app.cmd('play', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.play);
    app.cmd('players', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.list);
    app.cmd('points', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.points);
    app.cmd('quit', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.quit);
    app.cmd('resume', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.resume);
    app.cmd('status', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.status);
    app.cmd('start', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.start)
    app.cmd('stop', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.stop);
    app.cmd('w', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.winner);
    app.cmd('winner', '', cardsAgainstHumanity.config.pluginOptions.channels, cardsAgainstHumanity.config.pluginOptions.channelsToExclude, cardsAgainstHumanity.winner);
}
