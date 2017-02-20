exports.connect = (app, callback) => {
  require('../plugin_code/helpdesk/setup.js')(app);
  callback();
};
