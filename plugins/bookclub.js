exports.connect = (app, callback) => {
  require('../plugin_code/bookclub/setup.js')(app);
  callback();
};
