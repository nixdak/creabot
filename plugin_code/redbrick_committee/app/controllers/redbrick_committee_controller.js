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

    self.showChair(client, message, cmdArgs, true);
    self.showSecretary(client, message, cmdArgs, true);
    self.showTreasurer(client, message, cmdArgs, true);
    self.showPRO(client, message, cmdArgs, true);
    self.showEvents(client, message, cmdArgs, true);
    self.showFYR(client, message, cmdArgs, true);
    self.showWebmaster(client, message, cmdArgs, true);
    self.showHelpdesk(client, message, cmdArgs, true);
    self.showAdmins(client, message, cmdArgs, true);
    self.wait();
  };

  self.showChair = function (client, message, cmdArgs, cmt) {
    var chairperson = _.find(self.committee, { role: 'Chairperson' });
    if (!_.isUndefined(chairperson) && self.state === STATES.READY) {
      chair_string = chairperson.name + ' (' + chairperson.nick + ')';
      client.say(message.args[0], 'Chairperson: ' + chair_string);
      if (cmt !== true) {
        self.wait();
      }
    }
  };

  self.showSecretary = function (client, message, cmdArgs, cmt) {
    var secretary = _.find(self.committee, { role: 'Secretary' });
    if (!_.isUndefined(secretary) && self.state === STATES.READY) {
      secretary_string = secretary.name + ' (' + secretary.nick + ')';
      client.say(message.args[0], 'Secretary: ' + secretary_string);
      if (cmt !== true) {
        self.wait();
      }
    }
  };

  self.showTreasurer = function (client, message, cmdArgs, cmt) {
    var treasurer = _.find(self.committee, { role: 'Treasurer' });
    if (!_.isUndefined(treasurer) && self.state === STATES.READY) {
      treasurer_string = treasurer.name + ' (' + treasurer.nick + ')';
      client.say(message.args[0], 'Treasurer: ' + treasurer_string);
      if (cmt !== true) {
        self.wait();
      }
    }
  };

  self.showPRO = function (client, message, cmdArgs, cmt) {
    var pro = _.find(self.committee, { role: 'Public Relations Officer' });
    if (!_.isUndefined(pro) && self.state === STATES.READY) {
      pro_string = pro.name + ' (' + pro.nick + ')';
      client.say(message.args[0], 'Public Relations Officer: ' + pro_string);
      if (cmt !== true) {
        self.wait();
      }
    }
  };

  self.showEvents = function(client, message, cmdArgs, cmt) {
    var events = _.find(self.committee, { role: 'Events Officer' });
    if (!_.isUndefined(events) && self.state === STATES.READY) {
      events_string = events.name + ' (' + events.nick + ')';
      client.say(message.args[0], 'Events Officer: ' + events_string);
      if (cmt !== true) {
        self.wait();
      }
    }
  };

  self.showFYR = function(client, message, cmdArgs, cmt) {
    var first_year_rep = _.find(self.committee, { role: 'First Year Representative' });
    if (!_.isUndefined(first_year_rep) && self.state === STATES.READY) {
      fyr_string = first_year_rep.name + ' (' + first_year_rep.nick + ')';
      client.say(message.args[0], 'First Year Representative: ' + fyr_string);
      if (cmt !== true) {
        self.wait();
      }
    }
  };

  self.showWebmaster = function (client, message, cmdArgs, cmt) {
    var webmaster = _.find(self.committee, { role: 'Webmaster' });
    if (!_.isUndefined(webmaster) && self.state === STATES.READY) {
      webmaster_string = webmaster.name + ' (' + webmaster.nick + ')';
      client.say(message.args[0], 'Webmaster: ' + webmaster_string);
      if (cmt !== true) {
        self.wait();
      }
    }
  };

  self.showHelpdesk = function (client, message, cmdArgs, cmt) {
    var helpdesk = _.filter(self.committee, { role: 'Helpdesk' });
    if (!_.isUndefined(helpdesk) && self.state === STATES.READY) {
      var helpdesk_string = _.map(helpdesk, function (member) { return member.name + ' (' + member.nick + ')' }).join(', ');
      client.say(message.args[0], 'Helpdesk: ' + helpdesk_string);
      if (cmt !== true) {
        self.wait();
      }
    }
  };

  self.showAdmins = function (client, message, cmdArgs, cmt) {
    var admins = _.filter(self.committee, { role: 'System Administrator' });
    if (!_.isUndefined(admins) && self.state === STATES.READY) {
      var admins_string = _.map(admins, function (member) { return member.name + ' (' + member.nick + ')' }).join(', ');
      client.say(message.args[0], 'System Administrators: ' + admins_string);
      if (cmt !== true) {
        self.wait();
      }
    }
  };

  self.reload = function () {
    //reload config possibly better done with admin channel controle
  };
};

exports = module.exports = RedbrickCommittee;
