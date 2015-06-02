var CardsAgainstHumanity = require('./app/controllers/cards_against_humanity_controller.js');

module.exports = function(app) {
    var cardsAgainstHumanity = new CardsAgainstHumanity();

    // Join Channels
    app.joinChannels(cardsAgainstHumanity.config.channelsToJoin);

    // Register commands
    app.cmd('cards', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.cards);
    app.cmd('discard', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.discard);
    app.cmd('j', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.join);
    app.cmd('join', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.join);
    app.cmd('list', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.list);
    app.cmd('p', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.pick);
    app.cmd('pause', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.pause);
    app.cmd('pick', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.pick);
    app.cmd('play', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.play);
    app.cmd('players', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.list);
    app.cmd('points', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.points);
    app.cmd('quit', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.quit);
    app.cmd('resume', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.resume);
    app.cmd('status', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.status);
    app.cmd('start', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.start)
    app.cmd('stop', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.stop);
    app.cmd('w', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.winner);
    app.cmd('winner', '', cardsAgainstHumanity.config.channels, cardsAgainstHumanity.config.channelsToExclude, cardsAgainstHumanity.winner);
}
