exports.connect = function(app, callback) {
  require('../plugin_code/helpdesk/setup.js')(app);
  callback();
}
