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
* **!lock** - Locks your answer in, and if both players !lock the current round will end.

All of these commands are case insensitive and are trimmed for whitespace so "!j" and "    !J" will work the same

## Playing

## Configuration

### Letter Options

This is contains the mappings letters and the amount of them that should be in the game. If you want to play with the letter distributions, here is where you do so.

Vowels go in the vowels dictionary, consonants in the consonants dictionary

### Number Options

This is contains the arrays that control the numbers that are available for number rounds. If you want to add, 12, 37, 62, 87 as large numbers for instance they would go into the large numbers array.

### Round Options

* **letters** - An array containing the rounds that should be letters. By default set to the same configuration the show uses.
* **numbers** - An array containing the rounds that should be numbers. Set up the same was as the show by default. If there are any overlap between this and letters, the round will be a letters round.
* **conundrum** - Specifies which round is the conundrum. Unused. Will be deleted.
* **lettersRoundMinutes** - Specifies how long letters rounds should last. Set to 2 by default
* **numbersRoundMinutes** - Specifies how long numbers rounds should last. Set to 5 by default
* **conundrumRoundMinutes** - Specifies how long conundrums should last. Set to 2 by default

### Game Options

### Plugin Options

* **channels** - Lists the channels this plugin can be used in. If you wish it to be usable in all channels the bot is in, set this to all.
* **channelsToExclude** - Lists the channels the plugin cannot be used in if you have chosen that the plugin can be used in all channels but want to exclude one in particular
* **channelsToJoin** - This is an array of channels the bot should join when this plugin is loaded.
