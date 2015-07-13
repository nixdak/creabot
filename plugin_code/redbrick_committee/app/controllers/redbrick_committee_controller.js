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
      chair_string = chairperson.name + ' (' + chairperson.nick + ')';
      client.say(nick, 'Chairperson: ' + chair_string);
    }

    // Show secretary
    var secretary = _.find(self.committee, { role: 'Secretary' });
    if (!_.isUndefined(secretary)) {
      secretary_string = secretary.name + ' (' + secretary.nick + ')';
      client.say(nick, 'Secretary: ' + secretary_string);
    }

    // Show treasurer
    var treasurer = _.find(self.committee, { role: 'Treasurer' });
    if (!_.isUndefined(treasurer)) {
      treasurer_string = treasurer.name + ' (' + treasurer.nick + ')';
      client.say(nick, 'Treasurer: ' + treasurer_string);
    }

    // Show public relations officer
    var pro = _.find(self.committee, { role: 'Public Relations Officer' });
    if (!_.isUndefined(pro)) {
      pro_string = pro.name + ' (' + pro.nick + ')';
      client.say(nick, 'Public Relations Officer: ' + pro_string);
    }

    // Show Events officer
    var events = _.find(self.committee, { role: 'Events Officer' });
    if (!_.isUndefined(events)) {
      events_string = events.name + ' (' + events.nick + ')';
      client.say(nick, 'Events Officer: ' + events_string);
    }

    // Show first year rep
    var first_year_rep = _.find(self.committee, { role: 'First Year Representative' });
    if (!_.isUndefined(first_year_rep)) {
      fyr_string = first_year_rep.name + ' (' + first_year_rep.nick + ')';
      client.say(nick, 'First Year Representative: ' + fyr_string);
    }

    // Show webmaster
    var webmaster = _.find(self.committee, { role: 'Webmaster' });
    if (!_.isUndefined(first_year_rep)) {
      webmaster_string = webmaster.name + ' (' + webmaster.nick + ')';
      client.say(nick, 'Webmaster: ' + webmaster_string);
    }

    // Show helpdesk
    var helpdesk = _.find(self.committee, { role: 'Helpdesk' });
    if (!_.isUndefined(helpdesk)) {
      var helpdesk_string = _.map(helpdesk, function (member) { return member.name + ' (' + member.nick + ')' }).join(', ');
      client.say(nick, 'Helpdesk: ' + helpdesk_string);
    }

    // Show admins
    var admins = _.find(self.committee, { role: 'System Administrator' });
    if (!_.isUndefined(admins)) {
      var admins_string = _.map(admins, function (member) { return member.name + ' (' + member.nick + ')' }).join(', ');
      client.say(nick, 'System Administrators: ' + admins_string);
    }
  };

  self.reload = function () {

  };
};

exports = module.exports = RedbrickCommittee;