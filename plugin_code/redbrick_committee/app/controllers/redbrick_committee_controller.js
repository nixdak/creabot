var _ = require('underscore'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env],
    committee = require('../../config/committee.json');

var STATES = {
  READY: 'Ready',
  WAIT: 'Waiting'
}

var RedbrickCommittee = function RedbrickCommittee() {
  var self = this;

  self.config = config;
  self.committee = committee;
  self.state = STATES.READY;

  self.wait = function() {
    self.state = STATES.WAIT;
    self.waitTimer = setTimeout(self.ready, 60 * 1000 * self.config.waitTime);
    console.log('Waiting for cmt');
  };

  self.ready = function() {
    clearTimeout(self.waitTimer);
    self.state = STATES.READY;
    console.log('Ready for cmt');
  };

  self.showCommitteeInfo = function(client, message, cmdArgs) {
    var nick = message.nick;
    self.client = client;

    self.showChair(message.args[0]);
    self.showSecretary(message.args[0]);
    self.showTreasurer(message.args[0]);
    self.showPRO(message.args[0]);
    self.showEvents(message.args[0]);
    self.showFYR(message.args[0]);
    self.showWebmaster(message.args[0]);
    self.showHelpdesk(message.args[0]);
    self.showAdmins(message.args[0]);
    self.wait();
  };

  self.showChair = function (channel) {
    var chairperson = _.find(self.committee, { role: 'Chairperson' });
    if (!_.isUndefined(chairperson) && self.state === STATES.READY) {
      chair_string = chairperson.name + ' (' + chairperson.nick + ')';
      self.client.say(channel, 'Chairperson: ' + chair_string);
      // self.wait();
    }
  };

  self.showSecretary = function (channel) {
    var secretary = _.find(self.committee, { role: 'Secretary' });
    if (!_.isUndefined(secretary) && self.state === STATES.READY) {
      secretary_string = secretary.name + ' (' + secretary.nick + ')';
      self.client.say(channel, 'Secretary: ' + secretary_string);
      // self.wait();
    }
  };

  self.showTreasurer = function (channel) {
    var treasurer = _.find(self.committee, { role: 'Treasurer' });
    if (!_.isUndefined(treasurer) && self.state === STATES.READY) {
      treasurer_string = treasurer.name + ' (' + treasurer.nick + ')';
      self.client.say(channel, 'Treasurer: ' + treasurer_string);
      // self.wait();
    }
  };

  self.showPRO = function (channel) {
    var pro = _.find(self.committee, { role: 'Public Relations Officer' });
    if (!_.isUndefined(pro) && self.state === STATES.READY) {
      pro_string = pro.name + ' (' + pro.nick + ')';
      self.client.say(channel, 'Public Relations Officer: ' + pro_string);
      // self.wait();
    }
  };

  self.showEvents = function(channel) {
    var events = _.find(self.committee, { role: 'Events Officer' });
    if (!_.isUndefined(events) && self.state === STATES.READY) {
      events_string = events.name + ' (' + events.nick + ')';
      self.client.say(channel, 'Events Officer: ' + events_string);
      // self.wait();
    }
  };

  self.showFYR = function(channel) {
    var first_year_rep = _.find(self.committee, { role: 'First Year Representative' });
    if (!_.isUndefined(first_year_rep) && self.state === STATES.READY) {
      fyr_string = first_year_rep.name + ' (' + first_year_rep.nick + ')';
      self.client.say(channel, 'First Year Representative: ' + fyr_string);
      // self.wait();
    }
  };

  self.showWebmaster = function (channel) {
    var webmaster = _.find(self.committee, { role: 'Webmaster' });
    if (!_.isUndefined(webmaster) && self.state === STATES.READY) {
      webmaster_string = webmaster.name + ' (' + webmaster.nick + ')';
      self.client.say(channel, 'Webmaster: ' + webmaster_string);
      // self.wait();
    }
  };

  self.showHelpdesk = function (channel) {
    var helpdesk = _.filter(self.committee, { role: 'Helpdesk' });
    if (!_.isUndefined(helpdesk) && self.state === STATES.READY) {
      var helpdesk_string = _.map(helpdesk, function (member) { return member.name + ' (' + member.nick + ')' }).join(', ');
      self.client.say(channel, 'Helpdesk: ' + helpdesk_string);
      // self.wait();
    }
  };

  self.showAdmins = function (channel) {
    var admins = _.filter(self.committee, { role: 'System Administrator' });
    if (!_.isUndefined(admins) && self.state === STATES.READY) {
      var admins_string = _.map(admins, function (member) { return member.name + ' (' + member.nick + ')' }).join(', ');
      self.client.say(channel, 'System Administrators: ' + admins_string);
      // self.wait();
    }
  };

  self.reload = function () {
    //reload config possibly better done with admin channel controle
  };
};

exports = module.exports = RedbrickCommittee;
