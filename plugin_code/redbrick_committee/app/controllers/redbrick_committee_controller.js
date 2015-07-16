var _ = require('underscore'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env],
    committee = require('../../config/committee.json');

var RedbrickCommittee = function RedbrickCommittee() {
  var self = this;

  self.config = config;
  self.committee = committee;

  self.showCommitteeInfo = function(client, message, cmdArgs) {
    var nick = message.nick;

    self.showChair(message.args[0]);
    self.showSecretary(message.args[0]);
    self.showTreasurer(message.args[0]);
    self.showPRO(message.args[0]);
    self.showEvents(message.args[0]);
    self.showFYR(message.args[0]);
    self.showWebmaster(message.args[0]);
    self.showHelpdesk(message.args[0]);
    self.showAdmins(message.args[0]);
  };

  self.showChair = function (channel) {
    var chairperson = _.find(self.committee, { role: 'Chairperson' });
    if (!_.isUndefined(chairperson)) {
      chair_string = chairperson.name + ' (' + chairperson.nick + ')';
      client.say(channel, 'Chairperson: ' + chair_string);
    }
  };

  self.showSecretary = function (channel) {
    var secretary = _.find(self.committee, { role: 'Secretary' });
    if (!_.isUndefined(secretary)) {
      secretary_string = secretary.name + ' (' + secretary.nick + ')';
      client.say(nick, 'Secretary: ' + secretary_string);
    }
  };

  self.showTreasurer = function (channel) {
    var treasurer = _.find(self.committee, { role: 'Treasurer' });
    if (!_.isUndefined(treasurer)) {
      treasurer_string = treasurer.name + ' (' + treasurer.nick + ')';
      client.say(nick, 'Treasurer: ' + treasurer_string);
    }
  };

  self.showPRO = function (channel) {
    var pro = _.find(self.committee, { role: 'Public Relations Officer' });
    if (!_.isUndefined(pro)) {
      pro_string = pro.name + ' (' + pro.nick + ')';
      client.say(nick, 'Public Relations Officer: ' + pro_string);
    }
  };

  self.showEvents = function(channel) {
    var events = _.find(self.committee, { role: 'Events Officer' });
    if (!_.isUndefined(events)) {
      events_string = events.name + ' (' + events.nick + ')';
      client.say(nick, 'Events Officer: ' + events_string);
    }
  };

  self.showFYR = function(channel) {
    var first_year_rep = _.find(self.committee, { role: 'First Year Representative' });
    if (!_.isUndefined(first_year_rep)) {
      fyr_string = first_year_rep.name + ' (' + first_year_rep.nick + ')';
      client.say(nick, 'First Year Representative: ' + fyr_string);
    }
  };

  self.showWebmaster = function (channel) {
    var webmaster = _.find(self.committee, { role: 'Webmaster' });
    if (!_.isUndefined(webmaster)) {
      webmaster_string = webmaster.name + ' (' + webmaster.nick + ')';
      client.say(nick, 'Webmaster: ' + webmaster_string);
    }
  };

  self.showHelpdesk = function (channel) {
    var helpdesk = _.filter(self.committee, { role: 'Helpdesk' });
    if (!_.isUndefined(helpdesk)) {
      var helpdesk_string = _.map(helpdesk, function (member) { return member.name + ' (' + member.nick + ')' }).join(', ');
      client.say(nick, 'Helpdesk: ' + helpdesk_string);
    }
  };

  self.admins = function (channel) {
    var admins = _.filter(self.committee, { role: 'System Administrator' });
    if (!_.isUndefined(admins)) {
      var admins_string = _.map(admins, function (member) { return member.name + ' (' + member.nick + ')' }).join(', ');
      client.say(nick, 'System Administrators: ' + admins_string);
    }
  };

  self.reload = function () {

  };
};

exports = module.exports = RedbrickCommittee;
