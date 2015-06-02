/**
 * Creabot
 * main application script
 * @author creadak <creadak@gmail.com>
 * @version 0.6.0
 */
console.log('Creabot');

// Set node env
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// dependencies
var bot = require('./app/bot');

// init the bot
bot.init();
// load plugins
require('./plugins.js')(bot);
