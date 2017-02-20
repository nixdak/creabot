exports.connect = function (app, callback) {
  require('../plugin_code/uno/setup.js')(app);
  callback();
}