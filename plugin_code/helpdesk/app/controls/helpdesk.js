var fs = require('fs'),
    c = require('irc-colors'),
    _ = require('underscore'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env];

var Helpdesk = function Helpdesk() {
  var self = this;
  self.config = config;

  self.help = function (client, message, cmdArgs) {
    client.say(message.args[0], 'Helpdesk is a bot to help with all your problems pm me !help for a list of commads')
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
}

exports = module.exports = Helpdesk;
