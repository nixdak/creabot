'use strict';

const snoowrap = require('snoowrap');
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.json')[env];
const r = new snoowrap(config.reddit);

const Popping = function Popping () {
  const self = this;
  self.config = config;

  self.pop = (client, { args }) => {
    r.getRandomSubmission('popping').then((listing) => {
      client.say(args[0], `NSFW! (most likely) ${listing[0].url}`);
    });
  };
};

exports = module.exports = Popping;
