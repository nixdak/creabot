var RedbrickCommittee = require('./app/controllers/redbrick_committee_controller.js');

module.exports = function(app) {
    var redbrickCommittee = new RedbrickCommittee();

    // Join Channels
    app.joinChannels(redbrickCommittee.config.channelsToJoin);

    // Add commands
    app.cmd('cmt', '', redbrickCommittee.config.channels, redbrickCommittee.config.channelsToExclude, redbrickCommittee.showCommitteeInfo);
    app.cmd('reload', '', redbrickCommittee.config.channels, redbrickCommittee.config.channelsToExclude, redbrickCommittee.reload);
}