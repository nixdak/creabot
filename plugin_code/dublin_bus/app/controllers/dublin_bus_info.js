'use strict';

const _ = require('lodash');
const dBus = require('dublin-bus.js');
const config = require('../../config/config.json');

const printBuses = ({stop, buses}, client, channel) => {
  client.say(channel, `Stop address: ${stop}`);
  buses.forEach(({due, route, destination, expected}) => {
    if (due === 'Due') {
      client.say(channel, `${route} to ${destination} is due now`);
    } else {
      client.say(channel, `${route} to ${destination} expected in ${due} min, at ${expected}`);
    }
  })
};

const DublinBusInfo = function DublinBusInfo () {
  const self = this;
  self.config = config;

  self.showStopInfo = (client, { args, nick }, cmdArgs) => {
    if (cmdArgs !== '') {
      cmdArgs = _.map(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (cmdArgs.length < 1 || isNaN(cmdArgs[0])) {
      client.say(args[0], `${nick}: Please supply a stop number.`);
    } else {
      if (_.isUndefined(cmdArgs[1])) {
        dBus.getStopInfo(cmdArgs[0])
          .then(info => printBuses(info, client, args[0]))
          .catch(reason => client.say(args[0], `${nick}: Sorry, ${reason}.`));
      } else {
        dBus.getStopInfoForBuses(cmdArgs[0], cmdArgs.splice(1))
          .then(info => printBuses(info, client, args[0]))
          .catch(reason => client.say(args[0], `${nick}: Sorry, ${reason}.`));
      }
    }
  };
};

exports = module.exports = DublinBusInfo;
