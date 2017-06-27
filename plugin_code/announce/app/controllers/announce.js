'use strict';

const schedule = require('node-schedule');
const request = require('request-promise-native');
const moment = require('moment');

const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config.json')[env];

function Announce () {
  const self = this;

  self.config = config;
  self.post = null;

  self.update = schedule.scheduleJob(' */5 * * * *', () => {
    if (self.client !== null) {
      console.log('Scheduled update');
      self.getLatestPost().then(post => {
        if(!moment(post.date).isSameOrBefore(self.post.date)) {
          self.post = post;
          self.config.forEach(channel => {
            self.setTopic(
              channel,
              `${self.post.title} - ${self.post.permalink}`
            );
          });
        }
      })
      .catch(reason => console.log(reason));
    } else {
      console.log('update failed');
    }
  });

  self.getLatestPost= () => {
    return new Promise((resolve, reject) => {
      request({
        uri    : `${config.url}/posts`,
        headers: {
          'User-Agent': 'butlerbot',
        },
        json: true,
      }).then((posts => resolve(posts[0])))
      .catch((error => reject(error)));
    });
  };
}

module.exports = Announce;
