exports.connect = (app, callback) => {
  require('../plugin_code/redbrick_committee/setup.js')(app);
  callback();
};
