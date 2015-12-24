# UNO
This plugin plays the popular card game UNO over IRC

Please note that this plugin is in beta

## Commands
### Public Commands
- **!cards** - Show the cards you have in your hand.
- **!challenge** - Challenge a player if they haven't said uno before playing their second to last card and have them draw two cards.
- **!j** - Alias for join command.
- **!quit** - Quit from the game.
- **!score** - Show each players current score. (Not currently implemented)
- **!start** - Start the game if there are
- **!stop** - Stop the currently running game.
- **!uno** - Declare you have one card left before playing your second last card.

### Private Commands
- **!udraw** - Draw a card from the deck
- **!uend** - End your turn prematurely
- **!uplay # [color]** - Play a card from your hand, where # represents the numbered index of the card you wish to play. Supply one of [red,blue,green,yellow] to specify a colour when playing a Wild/Wild Draw Four card.
- **!uno # [color]** - Declare you have one card left before playing your second last card. If given card index it will play that card from your hand.

All of these commands are case insensitive and are trimmed for whitespace so "!start" and "    !StaRt" will work the same.

## Playing
### Staring a new game
To start a new game you can use

```
!j
```

to join.

Once enough people have joined use the

```
!start
```

 to start the game.

### Play cards
If it is your go your go you will be PMed your hand and the current card at the top of the deck. To play a card, you can use the following command in PM:

```
!uplay 6
```

Where 6 is the index of the card you want to play. If the card is a wild card you will need to pass is a colour you want to change it too this can be done by sending the following command in PM:

```
!upay 6 yellow
```

Where 6 is the card index and yellow is the colour you want to change to.

### Draw cards
If you've no cards to play or just don't wish to play any of the cards you hand you can draw a card by sending the following command in PM:

```
!udraw
```

The card you drew doesn't have to be played and if you don't wish to use it you can use

```
!uend
```

in PM to end your go. If the card you drew was not able to be played your go would automatically end.

### UNO
Once you are about to play your second last card you must declare uno this can be done my using the following command in the channel or in PM:

```
!uno
```

The player can also use this command to play there second to last card such as shown below

```
!uno 1
```

where 1 is the index position of the card the players

If the player doesn't do this they are open to being challenged by any other player using the following command in the channel:

```
!challenge
```

If the player didn't declare uno they will be made to draw 2 card but if they did the player who challenged will be made draw 2 cards.

### Winning
The first player to have no cards in their hand will be declared the winner of the game.

## Configuration
### gameOptions
`plugin_code/uno/config/config.json`

#### turnMinutes
This option controls how long each player has to play during a round of the game.

#### maxIdleTurns
This setting controls how many times a player can idle in a game before they are removed from the game.

#### idleRoundTimerDecrement
This is the amount of seconds that a characters turn decreases for each turn they have idled for. Two times this number must be less then turnMinutes.

#### topicBase
This is the base for the topic for the channel to be based off.

#### setTopic
Tells the bot if it should set the topic for the channel or not.


### pluginOptions
`plugin_code/uno/config/config.json`

#### channels
This option contains a list of channels that the plugin should respond to commands it defines.

#### channelsToExclude
This is an array of strings that the command should ignore commands in. Only used if the channels option is set to 'all'.

#### channelsToJoin
This is an array of channels that the bot should join. The countdown plugin doesn't support playing the games in multiple channels, so this should only contain one entry.
