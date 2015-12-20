var DublinBusInfo = require('./app/controllers/dublin_bus_info.js');
var Popping = require('./app/controllers/popping.js');


module.exports = function(app) {
  var dublinBusInfo = new DublinBusInfo();
  var popping = new Popping();

  // Join Channels
  app.joinChannels(dublinBusInfo.config.channelsToJoin);

  // Add commands
  app.cmd('dbus', '', dublinBusInfo.config.channels, dublinBusInfo.config.channelsToExclude, dublinBusInfo.showStopInfo);
  app.cmd('stop', '', dublinBusInfo.config.channels, dublinBusInfo.config.channelsToExclude, dublinBusInfo.showStopInfo);
  app.cmd('pop', '', popping.config.channels, popping.config.channelsToExclude, popping.pop);
}
