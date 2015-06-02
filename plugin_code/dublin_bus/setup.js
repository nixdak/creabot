var DublinBusInfo = require('./controllers/dublin_bus_info.js');

module.exports = function(app) {
    var dublinBusInfo = new DublinBusInfo();

    app.joinChannels(dublinBusInfo.config.channelsToJoin);
    app.cmd('dbus', '', dublinBusInfo.config.channels, dublinBusInfo.showStopInfo);
}
