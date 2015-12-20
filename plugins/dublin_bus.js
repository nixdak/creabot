exports.connect = function(app, callback) {
  require('../plugin_code/dublin_bus/setup.js')(app);
  callback();
}
