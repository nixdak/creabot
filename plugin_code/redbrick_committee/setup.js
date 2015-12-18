var RedbrickCommittee = require('./app/controllers/redbrick_committee_controller.js');

module.exports = function(app) {
    var redbrickCommittee = new RedbrickCommittee();

    // Join Channels
    app.joinChannels(redbrickCommittee.config.channelsToJoin);

    // Add commands
    app.cmd('cmt', '', redbrickCommittee.config.channels, redbrickCommittee.config.channelsToExclude, redbrickCommittee.showCommitteeInfo);
    // app.cmd('chair', '', redbrickCommittee.config.channels, redbrickCommittee.config.channelsToExclude, redbrickCommittee.showChair);
    // app.cmd('treasurer', '', redbrickCommittee.config.channels, redbrickCommittee.config.channelsToExclude, redbrickCommittee.showTreasurer);
    // app.cmd('secretary', '', redbrickCommittee.config.channels, redbrickCommittee.config.channelsToExclude, redbrickCommittee.showSecretary);
    // app.cmd('pro', '', redbrickCommittee.config.channels, redbrickCommittee.config.channelsToExclude, redbrickCommittee.showPRO);
    // app.cmd('events', '', redbrickCommittee.config.channels, redbrickCommittee.config.channelsToExclude, redbrickCommittee.showEvents);
    // app.cmd('helpdesk', '', redbrickCommittee.config.channels, redbrickCommittee.config.channelsToExclude, redbrickCommittee.showHelpdesk);
    // app.cmd('admins', '', redbrickCommittee.config.channels, redbrickCommittee.config.channelsToExclude, redbrickCommittee.showAdmins);
    // app.cmd('webmaster', '', redbrickCommittee.config.channels, redbrickCommittee.config.channelsToExclude, redbrickCommittee.showWebmaster);
    // app.cmd('fyr', '', redbrickCommittee.config.channels, redbrickCommittee.config.channelsToExclude, redbrickCommittee.showFYR);
    app.cmd('reload', '', redbrickCommittee.config.channels, redbrickCommittee.config.channelsToExclude, redbrickCommittee.reload);
}
