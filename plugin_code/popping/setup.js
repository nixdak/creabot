var Popping = require('./app/controllers/popping.js');

module.exports = function(app) {
    var popping = new Popping();

    // Join Channels
    app.joinChannels(popping.config.pluginOptions.channelsToJoin);

    // Add commands
    app.cmd('pop', '', popping.config.pluginOptions.channels, popping.config.pluginOptions.channelsToExclude, popping.pop);
}
