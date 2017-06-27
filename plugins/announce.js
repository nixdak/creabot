'use strict';

exports.connect = (app, callback) => {
  require('../plugin_code/announce/setup.js')(app);
  callback();
};
