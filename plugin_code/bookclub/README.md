# BookClub
This plugin manages a bookclub keeping track of what books have been read and to read and choosing which book will be read.

## Commands
### Channel Commands
- **!current** - prints this months book
- **!next** - prints next months book
- **!suggest [title];[author];[pages]** - adds a book to the list of suggestions
### PM Commands
- **!listbook** - pms a list of suggestions (to be implemented)

## Usage
### current
To get this months book:
```
<@butlerx> !current
<butlerbot> This months book is The Sphere by Michael Crichton by creadak
```
### next
To get next months book:
```
<@butlerx> !next
<butlerbot> Next months book is The Trial by Franz Kafka suggested by fgsfds_lo
```
### suggest
To suggest a book to be read:
```
<butlerx> !suggest Do Androids Dream of Electric Sheep?; Philip K. Dick; 210
<butlerbot> Book added!
```
It parses to the ; to seperate in put input. It doesn't require all the arguments to add a book
```
<butlerx> !suggest Do Androids Dream of Electric Sheep?; Philip K. Dick
<butlerbot> Book added!
```
will add it without a page number
```
<butlerx> !suggest Do Androids Dream of Electric Sheep?
<butlerbot> Book added!
```
will add it as author unknown

## Configuration
### channels
This option contains a list of channels that the plugin should respond to commands it defines.

### channelsToExclude
This is an array of strings that the command should ignore commands in. Only used if the channels option is set to 'all'

### channelsToJoin
This is an array of channels that the bot should join. The cards against humanity plugin doesn't support playing the games in multiple channels, so this should only contain one entry.

### topicBase
This is the base for the topic for the channel to be based off.

### setTopic
Tells the bot if it should set the topic for the channel or not.
