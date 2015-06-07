# Cards Against Humanity

This plugin allows you to play Cards Against Humanity over irc

## Commands

### Public Commands
* **!start #** - Start a new game. Optional parameter can by used to set a point limit for the game (e.g. `!start 10` to play until one player has 10 points.)
* **!stop** - Stop the currently running game.
* **!pause** - Pause the currently running game.
* **!resume** - Resume a paused game.
* **!join** - Join to the currently running game.
* **!j** - Alias for join command.
* **!quit** - Quit from the game.
* **!q** - alias for quit.
* **!cards** - Show the cards you have in your hand.
* **!cah # (#)** - Depending on the context this command will either play cards from your hand, or if you are the czar, will pick the winner at the end of a round
* **!points** - Show players' *awesome points* in the current game.
* **!list** - List players in the current game.
* **!players** - Alias for !list command
* **!status** - Show current status of the game. Output depends on the state of the game (e.g. when waiting for players to play, you can check who hasn't played yet)
* **!discard (#)** - Discard cards once per round, at the cost of one awesome point. You can either provide no arugments to get an entirely new hand, or you can provide indices to only discard those cards. You must have at least one awesome point to discard cards.

### Private Commands
* **!cah # (#)** - Play a card from your hand

All of these commands are case insensitive and are trimmed for whitespace so "!start" and "    !StaRt" will work the same


## Configuration

In config/config.json there are three settings.

* **channels** - Lists the channels this plugin can be used in. If you wish it to be usable in all channels the bot is in, set this to all.
* **channelsToExclude** - Lists the channels the plugin cannot be used in if you have chosen that the plugin can be used in all channels but want to exclude one in particular
* **channelsToJoin** - This is an array of channels the bot should join when this plugin is loaded.