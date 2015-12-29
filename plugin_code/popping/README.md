# popping
This plugin allows users to get links to popping related content

## Commands
- **!pop ** - gives a random link to something popping related
- **!pop [link]** - adds link to list of links

## Usage
### pop
To get a random link:

```
<mrs_girl> !pop
<butlerbot> NSFW!(most likely) https://www.youtube.com/watch?v=rGBdeQfcjLU
```

To add a link:

```
!pop https://www.youtube.com/watch?v=rGBdeQfcjLU
```

## Configuration
# channels
This option contains a list of channels that the plugin should respond to commands it defines.

# channelsToExclude
This is an array of strings that the command should ignore commands in. Only used if the channels option is set to 'all'

# channelsToJoin
This is an array of channels that the bot should join. The cards against humanity plugin doesn't support playing the games in multiple channels, so this should only contain one entry.
