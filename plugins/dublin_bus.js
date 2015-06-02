exports.connect = function(app, callback) {
    require(__dirname + '/dublin_dus/commands.js')(app);
}
