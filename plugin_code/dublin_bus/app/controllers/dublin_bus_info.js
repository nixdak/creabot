var _ = require('underscore'),
    tabletojson = require('tabletojson'),
    config = require('../../config/config.json');

var DublinBusInfo = function DublinBusInfo() {
  var self = this;
  self.config = config;

  self.showStopInfo = function (client, message, cmdArgs)
  {
    var url = 'http://www.dublinbus.ie/en/RTPI/Sources-of-Real-Time-Information/?searchtype=view&searchquery=';

    if (cmdArgs !== '') {
      cmdArgs = _.map(cmdArgs.match(/(\w+)\s?/gi), function (str) { return str.trim(); });
    }

    if (cmdArgs.length < 1 || isNaN(cmdArgs[0])) {
      client.say(message.args[0], message.nick + ': Please supply a stop number.');
    } else {
      tabletojson.convertUrl(url + cmdArgs[0]).then(function (tablesAsJson) {
        if (tablesAsJson.length === 2) {
          client.say(message.args[0], message.nick + ': Sorry, that stop doesn\'t exist.');
        } else {
          if (typeof tablesAsJson[3][0]['0'] === 'undefined') {
            if (typeof cmdArgs[1] === 'undefined') {
              client.say(message.args[0], 'Stop address: ' + tablesAsJson[2][0]['Stop Address']);

              for (var i = 0; i < 5 && i < tablesAsJson[3].length; i++) {
                client.say(message.args[0], tablesAsJson[3][i]['Route'] + ' to ' + tablesAsJson[3][i]['Destination'] + ' expected at ' + tablesAsJson[3][i]['Expected Time']);
              }
            } else {
              var buses = [];

              for (var i = 0; i < tablesAsJson[3].length; i++) {
                for (var j = 1; j < cmdArgs.length; j++) {
                  if (cmdArgs[j].toLowerCase() === tablesAsJson[3][i]['Route'].toLowerCase()) {
                    buses[buses.length] = tablesAsJson[3][i];
                  }
                }
              }

              if (buses.length > 0) {
                client.say(message.args[0], 'Stop address: ' + tablesAsJson[2][0]['Stop Address']);

                for (var i = 0; i < 5 && i < buses.length; i ++) {
                  if (buses[i]['Expected Time'] === 'Due') {
                    client.say(message.args[0], buses[i]['Route'] + ' to ' + buses[i]['Destination'] + ' is due now.');
                  } else {
                    client.say(message.args[0], buses[i]['Route'] + ' to ' + buses[i]['Destination'] + ' expected at ' + buses[i]['Expected Time']);
                  }
                }
              } else {
                client.say(message.args[0], 'No buses for specified routes at this stop.');
              }
            }
          } else {
            client.say(message.args[0], 'No realtime information is currently available for this stop.');
          }
        }
      });
    }
  };
}

exports = module.exports =DublinBusInfo;
