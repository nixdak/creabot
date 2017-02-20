module.exports = app => {
  const path = require('path');
  const plugger = require('plug').create(app);

  plugger.on('connect', (pluginName, pluginData, modulePath) => {
    console.log(`Loaded ${pluginName} plugin.`);
  });

  plugger.find(path.resolve(__dirname, 'plugins_enabled'));
};
