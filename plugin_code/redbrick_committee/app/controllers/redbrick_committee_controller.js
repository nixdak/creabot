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

    // Show chairperson
    var chairperson = _.find(self.committee, { role: 'Chairperson' });
    if (!_.isUndefined(chairperson)) {
      client.say(nick, 'Chairperson: %s (%s)', chairperson.name, chairperson.nick);
    }

    // Show secretary
    var secretary = _.find(self.committee, { role: 'Secretary' });
    if (!_.isUndefined(secretary)) {
      client.say(nick, 'Secretary: %s (%s)', secretary.name, secretary.nick);
    }

    // Show treasurer
    var treasurer = _.find(self.committee, { role: 'Treasurer' });
    if (!_.isUndefined(treasurer)) {
      client.say(nick, 'Treasurer: %s (%s)', treasurer.name, treasurer.nick);
    }

    // Show public relations officer
    var pro = _.find(self.committee, { role: 'Public Relations Officer' });
    if (!_.isUndefined(pro)) {
      client.say(nick, 'Public Relations Officer: %s (%s)', pro.name, pro.nick);
    }

    // Show Events officer
    var events = _.find(self.committee, { role: 'Events Officer' });
    if (!_.isUndefined(events)) {
      client.say(nick, 'Events Officer: %s (%s)', events.name, events.nick);
    }

    // Show first year rep
    var first_year_rep = _.find(self.committee, { role: 'First Year Representative' });
    if (!_.isUndefined(first_year_rep)) {
      client.say(nick, 'First Year Representative: %s (%s)', first_year_rep.name, first_year_rep.nick);
    }

    // Show webmaster
    var webmaster = _.find(self.committee, { role: 'Webmaster' });
    if (!_.isUndefined(first_year_rep)) {
      client.say(nick, 'Webmaster: %s (%s)', webmaster.name, webmaster.nick);
    }

    // Show helpdesk
    var helpdesk = _.find(self.committee, { role: 'Helpdesk' });
    if (!_.isUndefined(helpdesk)) {
      var helpdesk_string = _.map(helpdesk, function (member) { return member.name + ' (' + member.nick + ')' }).join(', ');
      client.say(nick, 'Helpdesk: %s', helpdesk_string);
    }

    // Show admins
    var admins = _.find(self.committee, { role: 'System Administrators' });
    if (!_.isUndefined(admins)) {
      var admins_string = _.map(admins, function (member) { return member.name + ' (' + member.nick + ')' }).join(', ');
      client.say(nick, 'System Administrators: %s', admins_string);
    }
  };

  self.reload = function () {

  };
};

exports = module.exports = RedbrickCommittee;