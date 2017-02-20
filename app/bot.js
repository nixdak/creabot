const _ = require('underscore');
const irc = require('irc');
const env = process.env.NODE_ENV || 'development';
let config = require('../config/config.json')[env];
let client;
const commands = [];
const msgs = [];

function checkUserMode (message, mode) {
  return true;
}

/**
 * Initialize the bot
 */
exports.init = function () {
  const self = this;

  // Don't join channels until registered on the server
  self.registered = false;
  self.delayedChannels = [];

  console.log('Initializing...');
  // init irc client
  config.server = process.env.SERVER || config.server;
  config.nick = process.env.NICK || config.nick;
  config.clientOptions.port = process.env.PORT || config.clientOptions.port;
  config.clientOptions.userName = process.env.USER || config.clientOptions.userName;

  console.log(`Connecting to ${config.server} as ${config.nick}...`);
  client = new irc.Client(config.server, config.nick, config.clientOptions);

  self.joinChannels = channels => {
    if (typeof channels !== 'undefined') {
      if (self.registered) {
        channels.forEach(channel => {
          client.join(channel);
        });
      } else {
        self.delayedChannels = self.delayedChannels.concat(channels);
      }
    }
  };

  self.setTopic = (channel, topic) => {
    // ignore if not configured to set topic
    if (typeof config.setTopic === 'undefined' || !config.setTopic) {
      return false;
    }

    // construct new topic
    let newTopic = topic;
    if (typeof config.topicBase !== 'undefined') {
      newTopic = `${topic} ${config.topicBase}`;
    }

    // set it
    client.send('TOPIC', channel, newTopic);
  };

  // handle connection to server for logging
  client.addListener('registered', ({ server }) => {
    console.log(`Connected to server ${server}`);
    self.registered = true;

    // Send connect commands after joining a server
    if (typeof config.connectCommands !== 'undefined' && config.connectCommands.length > 0) {
      _.each(config.connectCommands, ({ target, message }) => {
        if (target && message) {
          client.say(target, message);
        }
      });
    }

    // Join delayed channels
    if (self.delayedChannels.length > 0) {
      self.joinChannels(self.delayedChannels);
    }
  });

  // handle joins to channels for logging
  client.addListener('join', (channel, nick, message) => {
    console.log(`Joined ${channel} as ${nick}`);
    // Send join command after joining a channel
    if (
      typeof config.joinCommands !== 'undefined' &&
      config.joinCommands.hasOwnProperty(channel) &&
      config.joinCommands[channel].length > 0
    ) {
      _.each(config.joinCommands[channel], cmd => {
        if (cmd.target && cmd.message) {
          client.say(cmd.target, cmd.message);
        }
      });
    }
  });

  // output errors
  client.addListener('error', message => {
    console.warn('IRC client error: ', message);
  });

  client.addListener('message', function (from, to, text, message) {
    console.log(`message from ${from} to ${to}: ${text}`);
    // parse command
    const cmdArr = text.trim().match(/^[.|!](\w+)\s?(.*)$/i);
    if (!cmdArr || cmdArr.length <= 1) {
      // command not found
      return false;
    }
    const cmd = cmdArr[1].toLowerCase();
    // parse arguments
    const cmdArgs = cmdArr[2];
    console.log(cmdArr);

    // build callback options
    if (config.nick === to) {
      // private message commands
      _.each(
        msgs,
        c => {
          if (cmd === c.cmd) {
            console.log(`command: ${c.cmd}`);
            // check user mode
            if (checkUserMode(message, c.mode)) {
              c.callback(client, message, cmdArgs);
            }
          }
        },
        this
      );
    } else {
      // public commands
      _.each(
        commands,
        c => {
          // If the command matches
          if (cmd === c.cmd) {
            // If the channel matches the command channels or is set to respond on all channels and is not in the
            // commands excluded channels
            if (c.channel.indexOf(to) > -1 || c.channel === 'all') {
              if (typeof c.exclude === 'undefined' || c.exclude.indexOf(to) === -1) {
                console.log(`command: ${c.cmd}`);
                // check user mode
                if (checkUserMode(message, c.mode)) {
                  c.callback(client, message, cmdArgs);
                }
              }
            }
          }
        },
        this
      );
    }
  });
};

/**
 * Add a public command to the bot
 * @param cmd Command keyword
 * @param mode User mode that is allowed
 * @param cb Callback function
 */
exports.cmd = (cmd, mode, channel, excludes, cb) => {
  commands.push({
    cmd,
    mode,
    channel,
    exclude : excludes,
    callback: cb,
  });
};

/**
 * Add a msg command to the bot
 * @param cmd Command keyword
 * @param mode User mode that is allowed
 * @param cb Callback function
 */
exports.msg = (cmd, mode, cb) => {
  msgs.push({
    cmd,
    mode,
    callback: cb,
  });
};
