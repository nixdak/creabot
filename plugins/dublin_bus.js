exports.connect = function(app, callback) {
    console.log(__dirname);
    require('./dublin_dus/commands.js')(app);
}
