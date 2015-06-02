var _ = require('underscore'),
    irc = require('irc'),
    c = require('irc-colors'),
    config = require('../config/config.json'),
    client,
    commands = [],
    msgs = [];

function checkUserMode(message, mode) {
    return true;
}

/**
 * Initialize the bot
 */
exports.init = function () {
    var self = this;
    console.log('Initializing...');
    // init irc client
    console.log('Connecting to ' + config.server + ' as ' + config.nick + '...');
    client = new irc.Client(config.server, config.nick, config.clientOptions);

    // handle connection to server for logging
    client.addListener('registered', function (message) {
        console.log('Connected to server ' + message.server);
        // Send connect commands after joining a server
        if (typeof config.connectCommands !== 'undefined' && config.connectCommands.length > 0) {
            _.each(config.connectCommands, function (cmd) {
                if(cmd.target && cmd.message) {
                    client.say(cmd.target, cmd.message);
                }
            });
        }
    });

    // handle joins to channels for logging
    client.addListener('join', function (channel, nick, message) {
        console.log('Joined ' + channel + ' as ' + nick);
        // Send join command after joining a channel
        if (typeof config.joinCommands !== 'undefined' && config.joinCommands.hasOwnProperty(channel) && config.joinCommands[channel].length > 0) {
            _.each(config.joinCommands[channel], function (cmd) {
                if(cmd.target && cmd.message) {
                    client.say(cmd.target, cmd.message);
                }
            });
        }
    });

    // output errors
    client.addListener('error', function (message) {
        console.warn('IRC client error: ', message);
    });

    client.addListener('message', function (from, to, text, message) {
        console.log('message from ' + from + ' to ' + to + ': ' + text);
        // parse command
        var cmdArr = text.trim().match(/^[\.|!](\w+)\s?(.*)$/i);
        if (!cmdArr || cmdArr.length <= 1) {
            // command not found
            return false;
        }
        var cmd = cmdArr[1].toLowerCase();
        // parse arguments
        var cmdArgs = [];
        if (cmdArr.length > 2) {
            cmdArgs = _.map(cmdArr[2].match(/(\w+)\s?/gi), function (str) {
                return str.trim();
            });
        }
        // build callback options

        if (config.clientOptions.channels.indexOf(to) >= 0) {
            // public commands
            _.each(commands, function (c) {
                if (cmd === c.cmd) {
                    console.log('command: ' + c.cmd);
                    // check user mode
                    if (checkUserMode(message, c.mode)) {
                        c.callback(client, message, cmdArgs);
                    }
                }
            }, this);
        } else if (config.nick === to) {
            // private message commands
            _.each(msgs, function (c) {
                if (cmd === c.cmd) {
                    console.log('command: ' + c.cmd);
                    // check user mode
                    if (checkUserMode(message, c.mode)) {
                        c.callback(client, message, cmdArgs);
                    }
                }
            }, this);
        }
    });

    self.setTopic = function (topic) {
        // ignore if not configured to set topic
        if (typeof config.setTopic === 'undefined' || !config.setTopic) {
            return false;
        }

        // construct new topic
        var newTopic = topic;
        if (typeof config.topicBase !== 'undefined') {
            newTopic = topic + ' ' + config.topicBase;
        }

        // set it
        client.send('TOPIC', channel, newTopic);
    }
};

/**
 * Add a public command to the bot
 * @param cmd Command keyword
 * @param mode User mode that is allowed
 * @param cb Callback function
 */
exports.cmd = function (cmd, mode, cb) {
    commands.push({
        cmd: cmd,
        mode: mode,
        callback: cb
    });
};

/**
 * Add a msg command to the bot
 * @param cmd Command keyword
 * @param mode User mode that is allowed
 * @param cb Callback function
 */
exports.msg = function (cmd, mode, cb) {
    msgs.push({
        cmd: cmd,
        mode: mode,
        callback: cb
    });
};
