'use strict';

const Announce = require('./app/controllers/announce.js');

module.exports = app => {
  const redbrickCommittee = new Announce();

  // Join Channels
  app.joinChannels(redbrickCommittee.announce.channelsToJoin);
};
