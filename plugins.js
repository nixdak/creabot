module.exports = function(app) {
    var path = require('path'),
        plugger = require('plug').create(app);

    plugger.on('connect', function(pluginName, pluginData, modulePath) {
        console.log('Loaded ' + pluginName + ' plugin.');
    });

    plugger.find(path.resolve(__dirname, 'plugins_enabled'));
};
