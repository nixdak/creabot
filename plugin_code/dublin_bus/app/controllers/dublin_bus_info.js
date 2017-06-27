'use strict';

const _ = require('lodash');
const dBus = require('dublin-bus.js');
const config = require('../../config/config.json');

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
        dBus.getStopInfo(cmdArgs[0]).then(({ stop, buses }) => {
          client.say(args[0], `Stop address: ${stop}`);
          for (let i = 0; i < 5 && i < buses.length; i++) {
            if (buses[i].due === 'Due') {
              client.say(args[0], `${buses[i].num} to ${buses[i].route} is due now`);
            } else {
              client.say(args[0], `${buses[i].num} to ${buses[i].route} expected in ${buses[i].due} min, at ${buses[i].expected}`);
            }
          }
        }).catch(reason => client.say(args[0], `${nick}: Sorry, ${reason}.`));
      } else {
        const busArgs = cmdArgs.splice(1);
        dBus.getStopInfoForBuses(cmdArgs[0], busArgs).then(({ stop, buses }) => {
          client.say(args[0], `Stop address: ${stop}`);
          for (let i = 0; i < 5 && i < buses.length; i++) {
            if (buses[i].due === 'Due') {
              client.say(args[0], `${buses[i].num} to ${buses[i].route} is due now`);
            } else {
              client.say(args[0], `${buses[i].num} to ${buses[i].route} expected in ${buses[i].due} min, at ${buses[i].expected}`);
            }
          }
        }).catch(reason => client.say(args[0], `${nick}: Sorry, ${reason}.`));
      }
    }
  };
};

exports = module.exports = DublinBusInfo;
