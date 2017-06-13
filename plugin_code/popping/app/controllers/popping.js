'use strict';

const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.json')[env];
const urls = require('../../config/url.json');

const Popping = function Popping () {
  const self = this;
  self.config = config;
  self.urls = urls;
  self.fileName = 'plugin_code/popping/config/url.json';

  self.pop = (client, { args, nick }, cmdArgs) => {
    if (cmdArgs === '') {
      const url = self.urls[Math.floor(Math.random() * self.urls.length)];
      client.say(args[0], `NSFW!(most likely) ${url}`);
    }
    if (cmdArgs.length >= 1) {
      self.urls.push(cmdArgs);
      fs.writeFile(self.fileName, JSON.stringify(self.urls, null, 2), err => {
        if (err) return console.log(err);
        // console.log(JSON.stringify(self.urls))
        console.log(`writing to ${self.fileName}`);
      });
      client.say(args[0], `NOPE ${nick}`);
    }
  };
};

exports = module.exports = Popping;
