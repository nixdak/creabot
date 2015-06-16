# Countdown

This plugin allows you to play the popular British TV gameshow Countdown over IRC

## Commands

### Public Commands
* **!accept [nick]#** Accept a challenge from a player.
* **!buzz [word]** - Guess a word during the conundrum round.
* **!cd [string]** - Lets you select consonants and vowels during a letters round, and large and small numbers in a numbers round
* **!challenge [nick]** - Challenge someone to a game.
* **!join** - Join to the currently running game.
* **!j** - Alias for join command.
* **!list** - Shows challenges sent to you and challenges you have sent.
* **!lock** - Locks your answer in, and if both players !lock the current round will end.
* **!quit** - Alias for !stop.
* **!stop** - Stops the currently running game

### Private Commands
* **!cd [word|maths expression]** - Play a word or maths expression for the current round.

All of these commands are case insensitive and are trimmed for whitespace so "!j" and "    !J" will work the same

## Playing

## Configuration

### Letter Options

### Number Options

### Round Options

### Game Options

### Plugin Options

In config/config.json there are three settings.

* **channels** - Lists the channels this plugin can be used in. If you wish it to be usable in all channels the bot is in, set this to all.
* **channelsToExclude** - Lists the channels the plugin cannot be used in if you have chosen that the plugin can be used in all channels but want to exclude one in particular
* **channelsToJoin** - This is an array of channels the bot should join when this plugin is loaded.