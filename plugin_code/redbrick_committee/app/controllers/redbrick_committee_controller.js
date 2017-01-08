const _ = require('underscore');
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.json')[env];
const committee = require('../../config/committee.json');

const RedbrickCommittee = function RedbrickCommittee () {
  const self = this;

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

  self.wait = position => {
    switch (position) {
      case 'Chair':
        self.chair = false;
        self.waitChair = setTimeout(self.readyChair, 60 * 1000 * self.config.waitTime);
        console.log(`Waiting for ${position}`);
        break;
      case 'Sec':
        self.sec = false;
        self.waitSec = setTimeout(self.readySec, 60 * 1000 * self.config.waitTime);
        console.log(`Waiting for ${position}`);
        break;
      case 'Treasurer':
        self.treasurer = false;
        self.waitTreasurer = setTimeout(self.readyTreasurer, 60 * 1000 * self.config.waitTime);
        console.log(`Waiting for ${position}`);
        break;
      case 'PRO':
        self.pro = false;
        self.waitPRO = setTimeout(self.readyPRO, 60 * 1000 * self.config.waitTime);
        console.log(`Waiting for ${position}`);
        break;
      case 'Events':
        self.events = false;
        self.waitEvents = setTimeout(self.readyEvents, 60 * 1000 * self.config.waitTime);
        console.log(`Waiting for ${position}`);
        break;
      case 'FYR':
        self.fyr = false;
        self.waitFYR = setTimeout(self.readyFYR, 60 * 1000 * self.config.waitTime);
        console.log(`Waiting for ${position}`);
        break;
      case 'Web':
        self.web = false;
        self.waitWeb = setTimeout(self.readyWeb, 60 * 1000 * self.config.waitTime);
        console.log(`Waiting for ${position}`);
        break;
      case 'Helpdesk':
        self.helpdesk = false;
        self.waitHelpdesk = setTimeout(self.readyHelpdesk, 60 * 1000 * self.config.waitTime);
        console.log(`Waiting for ${position}`);
        break;
      case 'Admins':
        self.admins = false;
        self.waitAdmins = setTimeout(self.readyAdmins, 60 * 1000 * self.config.waitTime);
        console.log(`Waiting for ${position}`);
        break;
    }
  };

  self.readyChair = () => {
    clearTimeout(self.waitChair);
    self.chair = true;
    console.log('Ready for Chair');
  };

  self.readySec = () => {
    clearTimeout(self.waitSec);
    self.sec = true;
    console.log('Ready for Secretary');
  };

  self.readyTreasurer = () => {
    clearTimeout(self.waitTreasurer);
    self.treasurer = true;
    console.log('Ready for Treasurer');
  };

  self.readyPRO = () => {
    clearTimeout(self.waitPRO);
    self.pro = true;
    console.log('Ready for PRO');
  };

  self.readyEvents = () => {
    clearTimeout(self.waitEvents);
    self.events = true;
    console.log('Ready for Events');
  };

  self.readyFYR = () => {
    clearTimeout(self.waitFYR);
    self.fyr = true;
    console.log('Ready for FYR');
  };

  self.readyWeb = () => {
    clearTimeout(self.waitWeb);
    self.web = true;
    console.log('Ready for Webmaster');
  };

  self.readyHelpdesk = () => {
    clearTimeout(self.waitHelpdesk);
    self.helpdesk = true;
    console.log('Ready for Helpdesk');
  };

  self.readyAdmins = () => {
    clearTimeout(self.waitAdmins);
    self.admins = true;
    console.log('Ready for Admins');
  };

  self.showCommitteeInfo = (client, message, cmdArgs) => {
    client.say(message.args[0], 'Committee details sent. Who you want to tell to resign!');
    self.showChair(client, message, cmdArgs);
    self.showSecretary(client, message, cmdArgs);
    self.showTreasurer(client, message, cmdArgs);
    self.showPRO(client, message, cmdArgs);
    self.showEvents(client, message, cmdArgs);
    self.showFYR(client, message, cmdArgs);
    self.showWebmaster(client, message, cmdArgs);
    self.showHelpdesk(client, message, cmdArgs);
    self.showAdmins(client, message, cmdArgs);
    // console.log('chair: ' + self.chair + ', sec: ' + self.sec + ', treasurer: ' + self.treasurer + ', pro: ' + self.pro + ', events: ' + self.events + ', FYR: ' + self.fyr + ', web: ' + self.web + ', helpdesk: ' + self.helpdesk + ', admins: ' + self.admins);
  };

  self.showChair = (client, { nick }, cmdArgs) => {
    const chairperson = _.find(self.committee, { role: 'Chairperson' });
    if (!_.isUndefined(chairperson) && self.chair) {
      chair_string = `${chairperson.name} (${chairperson.nick})`;
      client.say(
        nick,
        `Chairperson: ${chair_string} contact by /m ${chairperson.nick} <message>, or email ${chairperson.name}@redbrick.dcu.ie`
      );
      // self.wait('Chair');
    }
  };

  self.showSecretary = (client, { nick }, cmdArgs) => {
    const secretary = _.find(self.committee, { role: 'Secretary' });
    if (!_.isUndefined(secretary) && self.sec) {
      secretary_string = `${secretary.name} (${secretary.nick})`;
      client.say(
        nick,
        `Secretary: ${secretary_string} contact by /m ${secretary.nick} <message>, or email ${secretary.nick}@redbrick.dcu.ie`
      );
      // self.wait('Sec');
    }
  };

  self.showTreasurer = (client, { nick }, cmdArgs) => {
    const treasurer = _.find(self.committee, { role: 'Treasurer' });
    if (!_.isUndefined(treasurer) && self.treasurer) {
      treasurer_string = `${treasurer.name} (${treasurer.nick})`;
      client.say(
        nick,
        `Treasurer: ${treasurer_string} contact by /m ${treasurer.nick} <message>, or email ${treasurer.nick}@redbrick.dcu.ie`
      );
      // self.wait('Treasurer');
    }
  };

  self.showPRO = (client, { nick }, cmdArgs) => {
    const pro = _.find(self.committee, { role: 'Public Relations Officer' });
    if (!_.isUndefined(pro) && self.pro) {
      pro_string = `${pro.name} (${pro.nick})`;
      client.say(
        nick,
        `Public Relations Officer: ${pro_string} contact by /m ${pro.nick} <message>, or email ${pro.nick}@redbrick.dcu.ie`
      );
      // self.wait('PRO');
    }
  };

  self.showEvents = (client, { nick }, cmdArgs) => {
    const events = _.find(self.committee, { role: 'Events Officer' });
    if (!_.isUndefined(events) && self.events) {
      events_string = `${events.name} (${events.nick})`;
      client.say(
        nick,
        `Events Officer: ${events_string} contact by /m ${events.nick} <message>, or email ${events.nick}@redbrick.dcu.ie`
      );
      // self.wait('Events');
    }
  };

  self.showFYR = (client, { nick }, cmdArgs) => {
    const first_year_rep = _.find(self.committee, { role: 'First Year Representative' });
    if (!_.isUndefined(first_year_rep) && self.fyr) {
      fyr_string = `${first_year_rep.name} (${first_year_rep.nick})`;
      client.say(
        nick,
        `First Year Representative: ${fyr_string} contact by /m ${first_year_rep.nick} <message>, or email ${first_year_rep.nick}@redbrick.dcu.ie`
      );
      // self.wait('FYR');
    }
  };

  self.showWebmaster = (client, { nick }, cmdArgs) => {
    const webmaster = _.find(self.committee, { role: 'Webmaster' });
    if (!_.isUndefined(webmaster) && self.web) {
      webmaster_string = `${webmaster.name} (${webmaster.nick})`;
      client.say(
        nick,
        `Webmaster: ${webmaster_string} contact by /m ${webmaster.nick} <message>, or email ${webmaster.nick}@redbrick.dcu.ie`
      );
      // self.wait('Web');
    }
  };

  self.showHelpdesk = (client, { nick }, cmdArgs) => {
    const helpdesk = _.filter(self.committee, { role: 'Helpdesk' });
    if (!_.isUndefined(helpdesk) && self.helpdesk) {
      const helpdesk_string = _.map(helpdesk, ({ name, nick }) => `${name} (${nick})`).join(', ');
      client.say(nick, `Helpdesk: ${helpdesk_string} contact by emailing helpdesk@redbrick.dcu.ie`);
      // self.wait('Helpdesk');
    }
  };

  self.showAdmins = (client, { nick }, cmdArgs) => {
    const admins = _.filter(self.committee, { role: 'System Administrator' });
    if (!_.isUndefined(admins) && self.admins) {
      const admins_string = _.map(admins, ({ name, nick }) => `${name} (${nick})`).join(', ');
      client.say(
        nick,
        `System Administrators: ${admins_string} contact by emailing admins@redbrick.dcu.ie`
      );
      // self.wait('Admins');
    }
  };

  self.reload = () => {
    // reload config possibly better done with admin channel controle
  };
};

exports = module.exports = RedbrickCommittee;
