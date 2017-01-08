exports.connect = (app, callback) => {
  require('../plugin_code/dublin_bus/setup.js')(app);
  callback();
};
