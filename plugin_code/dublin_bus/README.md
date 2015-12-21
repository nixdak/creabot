# Dublin Bus
This plugin retrieves and shows information for Dublin Bus stops.

## Commands
- **!dbus stop_number** - Shows the next five buses due at that stop, so !dbus 497 will show information for Stop 497.
- **!dbus stop_number route (route) ... (route)** - Shows the next five buses for the desired routes. So !dbus 497 14 27b will show information about stop 497, for only the 14 and 27b routes.

## Configuration
In config/config.json there are three settings.
- **channels** - Lists the channels this plugin can be used in. If you wish it to be usable in all channels the bot is in, set this to all.
- **channelsToExclude** - Lists the channels the plugin cannot be used in if you have chosen that the plugin can be used in all channels but want to exclude one in particular
- **channelsToJoin** - This is an array of channels the bot should join when this plugin is loaded.
