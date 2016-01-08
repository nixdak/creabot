var fs = require('fs'),
    c = require('irc-colors'),
    _ = require('underscore'),
    request = require("request"),
    cheerio = require("cheerio"),
    committee = require('../../../redbrick_committee/config/committee.json')
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env];

var Helpdesk = function Helpdesk() {
  var self = this;
  self.config = config;
  self.fileName = '../toUpdateOnWiki.txt';
  self.committee = committee;
  self.helpdesk = [];

  var helpdesk = _.filter(self.committee, { role: 'Helpdesk' });
  if (!_.isUndefined(helpdesk)) {
    self.helpdesk.push(_.map(helpdesk, function (member) { return member.nick }));
  }

  self.help = function (client, message, cmdArgs) {
    var channel = message.args[0];
    if (channel === '') {
      channel = message.nick;
    }
    var input = cmdArgs.split(" ", 1);
    if (input[0] === '') {
      client.say(channel, 'Helpdesk is a bot to help with all your problems pm me !help for a list of commads');
      return false;
    }
    var url = 'http://wiki.redbrick.dcu.ie/mw/' + input[0];
    request(url, function (error, response, body) {
      if (!error) {
        var $page = cheerio.load(body), text;
        $page('.mw-content-ltr').filter(function () {
          var data = $page(this);
          if (!_.isUndefined(data)) {
            text = data.children().first().text();
            console.log(text);
            client.say(message.nick, text);
            client.say(channel, url);
            return true;
          }
          client.say(channel, 'Sorry theres no help for that, but helpdesk has been told');
          fs.appendFile(self.fileName, input[0], function (err) {
            if (err) return console.log(err);
            console.log('writing to ' + self.fileName);
          });
          for (var i = 0; i < self.helpdesk.length; i++) {
            client.say(self.helpdesk[i], input[0] + ' needs to be added to the wiki');
          }
        })
      } else {
        console.log('We’ve encountered an error: ' + error);
      }
    });
  };

  self.list = function (client, message, cmdArgs) {
    var commands = '';
    for (var i = 0; i < self.config.commands.length; i++) {
      if (i !== self.config.commands.length - 1) {
        commands += self.config.commands[i] + ', '
      } else {
        commands += self.config.commands[i];
        client.say(message.nick, commands);
      }
    }
  };

  self.email = function (client, message, cmdArgs) {

  };
}

exports = module.exports = Helpdesk;
