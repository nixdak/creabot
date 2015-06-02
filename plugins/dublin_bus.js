exports.connect = function(app, callback) {
    require('./dublin_bus/commands.js')(app);
}
