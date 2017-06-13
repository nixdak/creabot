'use strict';

const DublinBusInfo = require('./app/controllers/dublin_bus_info.js');

module.exports = app => {
  const dublinBusInfo = new DublinBusInfo();

  // Join Channels
  app.joinChannels(dublinBusInfo.config.channelsToJoin);

  // Add commands
  app.cmd(
    'dbus',
    '',
    dublinBusInfo.config.channels,
    dublinBusInfo.config.channelsToExclude,
    dublinBusInfo.showStopInfo
  );
  app.cmd(
    'stop',
    '',
    dublinBusInfo.config.channels,
    dublinBusInfo.config.channelsToExclude,
    dublinBusInfo.showStopInfo
  );
};
