var Helpdesk = require('./app/controllers/Helpdesk.js');

module.exports = function(app) {
  var helpdesk = new Helpdesk();

  // Join Channels
  app.joinChannels(helpdesk.config.channelsToJoin);

  // Add commands
  app.cmd('help', '', helpdesk.config.channels, helpdesk.config.channelsToExclude, helpdesk.help);
  app.cmd('list', '', helpdesk.config.channels, helpdesk.config.channelsToExclude, helpdesk.list);

  // PM commands
  app.msg('email', '', helpdesk.email);
  app.msg('help', '', helpdesk.help);
  app.msg('list', '', helpdesk.list);
};
