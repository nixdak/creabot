exports.connect = function(app, callback) {
    require('./dublin_dus/commands.js')(app);
}
