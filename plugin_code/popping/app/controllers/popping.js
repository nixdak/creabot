var fs = require('fs'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config.json')[env],
    urls = require('../../config/url.json');

var Popping = function Popping() {
  var self = this;
  self.config = config;
  self.urls = urls;
  self.fileName ='plugin_code/popping/config/url.json';

  self.pop = function (client, message, cmdArgs) {
    if (cmdArgs === '') {
      var url = self.urls[Math.floor(Math.random()*self.urls.length)];
      client.say(message.args[0],'NSFW!(most likely) ' + url);
    }
    if (cmdArgs.length >= 1) {
      self.urls.push(cmdArgs);
      fs.writeFile(self.fileName, JSON.stringify(self.urls, null, 2), function (err) {
        if (err) return console.log(err);
        //console.log(JSON.stringify(self.urls))
        console.log('writing to ' + self.fileName);
      });
      client.say(message.args[0], 'NOPE ' + message.nick);
    }
  };
}

exports = module.exports = Popping;
