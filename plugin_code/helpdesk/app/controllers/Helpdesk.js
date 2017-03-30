const fs = require('fs');
const _ = require('lodash');
const request = require('request');
const cheerio = require('cheerio');
const committee = require('../../../redbrick_committee/config/committee.json');
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.json')[env];

const Helpdesk = function Helpdesk () {
  const self = this;
  self.config = config;
  self.fileName = '../toUpdateOnWiki.txt';
  self.committee = committee;
  self.helpdesk = [];

  const helpdesk = _.filter(self.committee, { role: 'Helpdesk' });
  if (!_.isUndefined(helpdesk)) {
    self.helpdesk.push(_.map(helpdesk, ({ nick }) => nick));
  }

  self.help = (client, { args, nick }, cmdArgs) => {
    let channel = args[0];
    if (channel === client.nick) {
      channel = nick;
    }
    const input = cmdArgs.split(' ', 1);
    if (input[0] === '') {
      client.say(
        channel,
        'Helpdesk is a bot to help with all your problems pm me !help for a list of commads'
      );
      return false;
    }
    const url = self.config.wiki + input[0];
    request(url, (error, response, body) => {
      if (!error) {
        const $page = cheerio.load(body);
        let text;
        $page('.mw-content-ltr').filter(() => {
          const data = $page(this);
          text = data.children().first().text();
          client.say(channel, url);
          client.say(nick, text);
        });
        $page('.noarticletext').filter(() => {
          client.say(channel, 'Sorry theres no help for that, but helpdesk has been told');
          fs.appendFile(self.fileName, input[0], err => {
            if (err) return console.log(err);
            console.log(`writing to ${self.fileName}`);
          });
          for (let i = 0; i < self.helpdesk.length; i++) {
            client.say(self.helpdesk[i], `${input[0]} needs to be added to the wiki`);
          }
        });
      } else {
        console.log(`We’ve encountered an error: ${error}`);
      }
    });
  };

  self.list = (client, { args, nick }, cmdArgs) => {
    let channel = args[0];
    if (channel === client.nick) {
      channel = nick;
    }
    let commands = '';
    let pmCommands = '';
    for (let i = 0; i < self.config.commands.length; i++) {
      if (i !== self.config.commands.length - 1) {
        commands += `${self.config.commands[i]}, `;
      } else {
        commands += self.config.commands[i];
      }
    }
    for (let i = 0; i < self.config.pmCommands.length; i++) {
      if (i !== self.config.pmCommands.length - 1) {
        pmCommands += `${self.config.commands[i]}, `;
      } else {
        pmCommands += self.config.pmCommands[i];
      }
    }
    client.say(channel, `The commands are ${commands} and pm only commands are ${pmCommands}`);
  };

  self.email = (client, message, cmdArgs) => {
    return _.noop();
  };
};

exports = module.exports = Helpdesk;
