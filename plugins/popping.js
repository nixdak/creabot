exports.connect = (app, callback) => {
  require('../plugin_code/popping/setup.js')(app);
  callback();
};
