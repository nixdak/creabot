var fs = require('fs'),
    c = require('irc-colors'),
    _ = require('underscore'),
    request = require('request'),
    cherrio = require('cherrio'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env];

var Helpdesk = function Helpdesk() {
  var self = this;
  self.config = config;

  self.help = function (client, message, cmdArgs) {
    var input = cmdArgs.split(" ", 1);
    if (input[0] === '') {
      client.say(message.args[0], 'Helpdesk is a bot to help with all your problems pm me !help for a list of commads');
      return false;
    }
    var url = 'http://wiki.redbrick.dcu.ie/mw/' + input[0];
    request(url, function(error, response, html){
      if(!error){
        var $ = cheerio.load(html);
        // We'll use the unique header class as a starting point.
        $('.header').filter(function(){
        // Let's store the data we filter into a variable so we can easily see what's going on.
        var data = $(this);
        console(data);
      }
    })  
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
