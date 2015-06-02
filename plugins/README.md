# plugins

Plugins are defined in this directory with a small javascript file that calls each plugins setup file.

There is a small example plugin in the dublin_bus.js file.

Each plugin should be passed in the IRC bot as an argument so that it can register its commands and callbacks with the bot, any extra configuration that needs to happen for the plugin should happen in its own configuration directory to keep the main bot configuration clean.

The bulk of the code for each plugin should go in the plugin_code directory, and enabled plugins should be symlinked to the plugins_enabled directory. To disable a plugin, simply remove the symlink from plugins_enabled and restart the bot.
