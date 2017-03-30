const _ = require('lodash');
const tabletojson = require('tabletojson');
const config = require('../../config/config.json');

const DublinBusInfo = function DublinBusInfo () {
  const self = this;
  self.config = config;

  self.showStopInfo = (client, { args, nick }, cmdArgs) => {
    const url = 'http://www.dublinbus.ie/en/RTPI/Sources-of-Real-Time-Information/?searchtype=view&searchquery=';

    if (cmdArgs !== '') {
      cmdArgs = _.invokeMap(cmdArgs.match(/(\w+)\s?/gi), str => str.trim());
    }

    if (cmdArgs.length < 1 || isNaN(cmdArgs[0])) {
      client.say(args[0], `${nick}: Please supply a stop number.`);
    } else {
      tabletojson.convertUrl(url + cmdArgs[0]).then(tablesAsJson => {
        if (tablesAsJson.length === 2) {
          client.say(args[0], `${nick}: Sorry, that stop doesn't exist.`);
        } else {
          if (_.isUndefined(tablesAsJson[3][0]['0'])) {
            if (_.isUndefined(cmdArgs[1])) {
              client.say(args[0], `Stop address: ${tablesAsJson[2][0]['Stop Address']}`);

              for (let i = 0; i < 5 && i < tablesAsJson[3].length; i++) {
                client.say(
                  args[0],
                  `${tablesAsJson[3][i]['Route']} to ${tablesAsJson[3][i]['Destination']} expected at ${tablesAsJson[3][i]['Expected Time']}`
                );
              }
            } else {
              const buses = [];

              for (let i = 0; i < tablesAsJson[3].length; i++) {
                for (let j = 1; j < cmdArgs.length; j++) {
                  if (cmdArgs[j].toLowerCase() === tablesAsJson[3][i]['Route'].toLowerCase()) {
                    buses[buses.length] = tablesAsJson[3][i];
                  }
                }
              }

              if (buses.length > 0) {
                client.say(args[0], `Stop address: ${tablesAsJson[2][0]['Stop Address']}`);

                for (let i = 0; i < 5 && i < buses.length; i++) {
                  if (buses[i]['Expected Time'] === 'Due') {
                    client.say(
                      args[0],
                      `${buses[i]['Route']} to ${buses[i]['Destination']} is due now.`
                    );
                  } else {
                    client.say(
                      args[0],
                      `${buses[i]['Route']} to ${buses[i]['Destination']} expected at ${buses[i]['Expected Time']}`
                    );
                  }
                }
              } else {
                client.say(args[0], 'No buses for specified routes at this stop.');
              }
            }
          } else {
            client.say(args[0], 'No realtime information is currently available for this stop.');
          }
        }
      });
    }
  };
};

exports = module.exports = DublinBusInfo;
