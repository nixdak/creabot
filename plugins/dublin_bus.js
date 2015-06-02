exports.connect = function(app, callback) {
    require('../plugin_code/dublin_bus/commands.js')(app);
}
