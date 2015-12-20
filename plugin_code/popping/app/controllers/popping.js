var fs = require('fs'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env],
    urls = require('./url.json');

var Popping = function Popping() {
  var self = this;
  self.config = config;
  self.urls = urls;
  console.log('pop');

  self.pop = function (client, message, cmdArgs) {
    if (cmdArgs === '') {
      var url = urls[Math.floor(Math.random()*urls.length)];
      client.say(message.args[0], url);
    }
    if (cmdArgs.length >= 1) {
      self.urls.push(cmdArgs);
      fs.writeFile('url.json', JSON.stringify(self.urls, null, 2));
      client.say(message.args[0], 'link added');
    }
  };
}

exports = module.exports = Popping;
