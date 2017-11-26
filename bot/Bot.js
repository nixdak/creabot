import _ from 'lodash';
import irc from 'irc';
import config from '../config/config.json';

const env = process.env.NODE_ENV || 'development';
const checkUserMode = () => true;

/** Class for IRC Bot */
export default class Bot {
  /**
   * Initialize the bot
   */
  constructor() {
    // Don't join channels until registered on the server
    this.registered = false;
    this.delayedChannels = [];
    this.commands = [];
    this.msgs = [];
    this.config = config[env];
    console.log('Initializing...');
    // init irc client
    this.config.server = process.env.SERVER || this.config.server;
    this.config.nick = process.env.NICK || this.config.nick;
    this.config.clientOptions.port = process.env.PORT || this.config.clientOptions.port;
    this.config.clientOptions.userName = process.env.USER || this.config.clientOptions.userName;

    if (process.env.TARGET && process.env.MESSAGE) {
      const target = process.env.TARGET;
      const message = process.env.MESSAGE;
      config.connectCommands.push({ target, message });
    }
  }

  /**
   * Join channels on irc server
   * @param {string[]} channels List of channels to join
   */
  joinChannels(channels) {
    if (!_.isUndefined(channels)) {
      if (this.registered) {
        _.forEach(channels, (channel) => {
          this.client.join(channel);
        });
      } else {
        this.delayedChannels = this.delayedChannels.concat(channels);
      }
    }
  }

  setTopic(channel, topic) {
    // ignore if not configured to set topic
    if (_.isUndefined(this.config.setTopic) || !this.config.setTopic) return false;
    // construct new topic
    let newTopic = topic;
    if (!_.isUndefined(this.config.topicBase)) newTopic = `${topic} ${this.config.topicBase}`;
    // set it
    this.client.send('TOPIC', channel, newTopic);
  }

  /**
   * Initialize the bot and connect to irc server
   */
  init() {
    console.log(`Connecting to ${this.config.server} as ${this.config.nick}...`);
    this.client = new irc.Client(this.config.server, this.config.nick, this.config.clientOptions);
    // handle connection to server for logging
    this.client.addListener('registered', ({ server }) => {
      console.log(`Connected to server ${server}`);
      this.registered = true;

      // Send connect commands after joining a server
      if (!_.isUndefined(this.config.connectCommands) && this.config.connectCommands.length > 0) {
        _.forEach(this.config.connectCommands, ({ target, message }) => {
          if (target && message) this.client.say(target, message);
        });
      }

      // Join delayed channels
      if (this.delayedChannels.length > 0) this.joinChannels(this.delayedChannels);
    });

    // handle joins to channels for logging
    this.client.addListener('join', (channel, nick) => {
      console.log(`Joined ${channel} as ${nick}`);
      // Send join command after joining a channel
      if (
        !_.isUndefined(this.config.joinCommands) &&
        Object.prototype.hasOwnProperty.call(this.config.joinCommands, channel) &&
        this.config.joinCommands[channel].length > 0
      ) {
        _.forEach(this.config.joinCommands[channel], ({ target, message }) => {
          if (target && message) this.client.say(target, message);
        });
      }
    });

    // output errors
    this.client.addListener('error', message => console.warn('IRC client error: ', message));

    this.client.addListener('message', function messageListener(from, to, text, message) {
      console.log(`message from ${from} to ${to}: ${text}`);
      // parse command
      const cmdArr = text.trim().match(/^[.|!](\w+)\s?(.*)$/i);
      if (!cmdArr || cmdArr.length <= 1) return false;
      const command = cmdArr[1].toLowerCase();
      // parse arguments
      const cmdArgs = cmdArr[2];
      console.log(cmdArr);

      // build callback options
      if (this.config.nick === to) {
        // private message commands
        _.forEach(
          this.msgs,
          _.bind((c) => {
            if (command === c.cmd) {
              console.log(`command: ${c.cmd}`);
              // check user mode
              if (checkUserMode(message, c.mode)) c.callback(this.client, message, cmdArgs);
            }
          }, this),
        );
      } else {
        // public commands
        _.forEach(
          this.commands,
          _.bind((c) => {
            // If the command matches
            if (command === c.cmd) {
              // If the channel matches the command channels or is set to respond on all
              // channels and is not in the commands excluded channels
              if (_.includes(c.channel, to) || c.channel === 'all') {
                if (_.isUndefined(c.exclude) || !_.includes(c.exclude, to)) {
                  console.log(`command: ${c.cmd}`);
                  // check user mode
                  if (checkUserMode(message, c.mode)) c.callback(this.client, message, cmdArgs);
                }
              }
            }
          }, this),
        );
      }
    });
  }

  /**
   * Add a public command to the bot
   * @param {string} cmd Command keyword
   * @param {string} mode User mode that is allowed
   * @param {string[]} channel list of channels to listen too
   * @param {string[]} exclude list of channels to ignore
   * @param {requestCallback} cb Callback function
   */
  cmd(cmd, mode, channel, exclude, callback) {
    this.commands.push({
      cmd,
      mode,
      channel,
      exclude,
      callback,
    });
  }

  /**
   * Add a msg command to the bot
   * @param {string} cmd Command keyword
   * @param {string} mode User mode that is allowed
   * @param {requestCallback} cb Callback function
   */
  msg(cmd, mode, callback) {
    this.msgs.push({
      cmd,
      mode,
      callback,
    });
  }
}
