var fs = require('fs'),
    urls = require('../../config/url.json'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env];

var Popping = function Popping() {
  var self = this;
  self.config = config;
  self.urls = urls;

  self.pop = function (client, message, cmdArgs){
    if (cmdArgs === '') {
      var url = urls[Math.floor(Math.random()*urls.length)];
      client.say(message.args[0], url);
    }
    if (cmdArgs.length === 1) {
      url.push(cmdArgs);
      fs.writeFile(urls, JSON.stringify(self.urls, null, 2));
      client.say(message.args[0], "link added");
    }
  };
}

exports = module.exports = Popping;
