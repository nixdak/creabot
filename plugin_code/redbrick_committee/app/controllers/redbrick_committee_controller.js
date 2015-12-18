var _ = require('underscore'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env],
    committee = require('../../config/committee.json');

var RedbrickCommittee = function RedbrickCommittee() {
  var self = this;

  self.config = config;
  self.committee = committee;
  self.chair = true;
  self.sec = true;
  self.treasurer = true;
  self.pro = true;
  self.events = true;
  self.helpdesk = true;
  self.admins = true;
  self.web = true;
  self.fyr = true;

  self.wait = function(position) {
    switch (position) {
      case 'Chair':
        self.chair = false;
        self.waitChair = setTimeout(self.ready(position), 60 * 1000 * self.config.waitTime);
        console.log('Waiting for ' + position);
        break;
      case 'Sec':
        self.sec = false;
        self.waitSec = setTimeout(self.ready(position), 60 * 1000 * self.config.waitTime);
        console.log('Waiting for ' + position);
        break;
      case 'Treasurer':
        self.treasurer = false;
        self.waitTreasurer = setTimeout(self.ready(position), 60 * 1000 * self.config.waitTime);
        console.log('Waiting for ' + position);
        break;
      case 'PRO':
        self.pro = false;
        self.waitPRO = setTimeout(self.ready(position), 60 * 1000 * self.config.waitTime);
        console.log('Waiting for ' + position);
        break;
      case 'Events':
        self.events = false;
        self.waitEvents = setTimeout(self.ready(position), 60 * 1000 * self.config.waitTime);
        console.log('Waiting for ' + position);
        break;
      case 'FYR':
        self.fyr = false;
        self.waitFYR = setTimeout(self.ready(position), 60 * 1000 * self.config.waitTime);
        console.log('Waiting for ' + position);
        break;
      case 'Web':
        self.web = false;
        self.waitWeb = setTimeout(self.ready(position), 60 * 1000 * self.config.waitTime);
        console.log('Waiting for ' + position);
        break;
      case 'Helpdesk':
        self.helpdesk = false;
        self.waitHelpdesk = setTimeout(self.ready(position), 60 * 1000 * self.config.waitTime);
        console.log('Waiting for ' + position);
        break;
      case 'Admins':
        self.admins = false;
        self.waitAdmins = setTimeout(self.ready(position), 60 * 1000 * self.config.waitTime);
        console.log('Waiting for ' + position);
        break;
    }
  };

  self.ready = function(position) {
    switch (position) {
      case 'Chair':
        clearTimeout(self.waitChair);
        self.chair = true;
        console.log('Ready for ' + position);
        break;
      case 'Sec':
        clearTimeout(self.waitSec);
        self.sec = true;
        console.log('Ready for ' + position);
        break;
      case 'Treasurer':
        clearTimeout(self.waitTreasurer);
        self.treasurer = true;
        console.log('Ready for ' + position);
        break;
      case 'PRO':
        clearTimeout(self.waitPRO);
        self.pro = true;
        console.log('Ready for ' + position);
        break;
      case 'Events':
        clearTimeout(self.waitEvents);
        self.events = true;
        console.log('Ready for ' + position);
        break;
      case 'FYR':
        clearTimeout(self.waitFYR);
        self.FYR = true;
        console.log('Ready for ' + position);
        break;
      case 'Web':
        clearTimeout(self.waitWeb);
        self.web = true;
        console.log('Ready for ' + position);
        break;
      case 'Helpdesk':
        clearTimeout(self.waitHelpdesk);
        self.Helpdesk = true;
        console.log('Ready for ' + position);
        break;
      case 'Admins':
        clearTimeout(self.waitHelpdesk);
        self.helpdesk = true;
        console.log('Ready for ' + position);
        break;
    }
  };

  self.showCommitteeInfo = function(client, message, cmdArgs) {
    var nick = message.nick;

    self.showChair(client, message, cmdArgs);
    self.showSecretary(client, message, cmdArgs);
    self.showTreasurer(client, message, cmdArgs);
    self.showPRO(client, message, cmdArgs);
    self.showEvents(client, message, cmdArgs);
    self.showFYR(client, message, cmdArgs);
    self.showWebmaster(client, message, cmdArgs);
    self.showHelpdesk(client, message, cmdArgs);
    self.showAdmins(client, message, cmdArgs);
  };

  self.showChair = function (client, message, cmdArgst) {
    var chairperson = _.find(self.committee, { role: 'Chairperson' });
    if (!_.isUndefined(chairperson) && self.chair) {
      chair_string = chairperson.name + ' (' + chairperson.nick + ')';
      client.say(message.args[0], 'Chairperson: ' + chair_string);
      self.wait('Chair');
    }
  };

  self.showSecretary = function (client, message, cmdArgs) {
    var secretary = _.find(self.committee, { role: 'Secretary' });
    if (!_.isUndefined(secretary) && self.sec) {
      secretary_string = secretary.name + ' (' + secretary.nick + ')';
      client.say(message.args[0], 'Secretary: ' + secretary_string);
      self.wait('Sec');
    }
  };

  self.showTreasurer = function (client, message, cmdArgs) {
    var treasurer = _.find(self.committee, { role: 'Treasurer' });
    if (!_.isUndefined(treasurer) && self.treasurer) {
      treasurer_string = treasurer.name + ' (' + treasurer.nick + ')';
      client.say(message.args[0], 'Treasurer: ' + treasurer_string);
      self.wait('Treasurer');
    }
  };

  self.showPRO = function (client, message, cmdArgs) {
    var pro = _.find(self.committee, { role: 'Public Relations Officer' });
    if (!_.isUndefined(pro) && self.pro) {
      pro_string = pro.name + ' (' + pro.nick + ')';
      client.say(message.args[0], 'Public Relations Officer: ' + pro_string);
      self.wait('PRO');
    }
  };

  self.showEvents = function(client, message, cmdArgs) {
    var events = _.find(self.committee, { role: 'Events Officer' });
    if (!_.isUndefined(events) && self.events) {
      events_string = events.name + ' (' + events.nick + ')';
      client.say(message.args[0], 'Events Officer: ' + events_string);
      self.wait('Events');
    }
  };

  self.showFYR = function(client, message, cmdArgs) {
    var first_year_rep = _.find(self.committee, { role: 'First Year Representative' });
    if (!_.isUndefined(first_year_rep) && self.fyr) {
      fyr_string = first_year_rep.name + ' (' + first_year_rep.nick + ')';
      client.say(message.args[0], 'First Year Representative: ' + fyr_string);
      self.wait('FYR');
    }
  };

  self.showWebmaster = function (client, message, cmdArgs) {
    var webmaster = _.find(self.committee, { role: 'Webmaster' });
    if (!_.isUndefined(webmaster) && self.web) {
      webmaster_string = webmaster.name + ' (' + webmaster.nick + ')';
      client.say(message.args[0], 'Webmaster: ' + webmaster_string);
      self.wait('Web');
    }
  };

  self.showHelpdesk = function (client, message, cmdArgs) {
    var helpdesk = _.filter(self.committee, { role: 'Helpdesk' });
    if (!_.isUndefined(helpdesk) && self.helpdesk) {
      var helpdesk_string = _.map(helpdesk, function (member) { return member.name + ' (' + member.nick + ')' }).join(', ');
      client.say(message.args[0], 'Helpdesk: ' + helpdesk_string);
      self.wait('Helpdesk');
    }
  };

  self.showAdmins = function (client, message, cmdArgs) {
    var admins = _.filter(self.committee, { role: 'System Administrator' });
    if (!_.isUndefined(admins) && self.admins) {
      var admins_string = _.map(admins, function (member) { return member.name + ' (' + member.nick + ')' }).join(', ');
      client.say(message.args[0], 'System Administrators: ' + admins_string);
      self.wait('Admins');
    }
  };

  self.reload = function () {
    //reload config possibly better done with admin channel controle
  };
};

exports = module.exports = RedbrickCommittee;
