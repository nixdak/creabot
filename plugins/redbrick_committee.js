exports.connect = function(app, callback) {
    require('../plugin_code/redbrick_committee/setup.js')(app);
    callback();
};
