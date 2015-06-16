# Countdown

This plugin allows you to play Countdown over irc

## Commands

### Public Commands
* **!challenge #** - Start a new game by challenging another player (e.g. `!challenge creadak` to play with creadak.)
* **!accept #** - accept the challenge (e.g. `!accept butlerx`)
* **!j** - To start the game.
* **!stop** - Stop the currently running game.
* **!quit** - alias of stop.
* **!cd #** - lets you choose letters and numbers at the start of the round.
* **!buzz #** - send in your answer for the Conundrum.
* **!list** - list issued challenges

### Private Commands
* **!cd #** - Play your answer
* **!lock ** - locks in your answer

All of these commands are case insensitive and are trimmed for whitespace so "!start" and "    !StaRt" will work the same


## Configuration

In config/config.json there are all of the options for the game that can be changed to customize the game
