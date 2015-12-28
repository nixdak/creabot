exports.connect = function(app, callback) {
  require('../plugin_code/countdown/setup.js')(app);
  callback();
};
