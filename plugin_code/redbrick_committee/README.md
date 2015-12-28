# Redbrick Committee
This plugin allows users to look up who is in on the redbrick committee and who is currently in what position

## Commands
- **!cmt** - lists full Committee
- **!chair** - print the chairs name and their username
- **!secretary** - print the secretary name and their username
- **!treasurer** - print the treasurer name and their username
- **!pro** - print the Public Relations Officer name and their username
- **!events** - print the events name and their username
- **!helpdesk** - print the current helpdesk members and their usernames
- **!admins** - print the current team of admins and their usernames
- **!webmaster** - print the webmaster name and their username
- **!fyr** - print the first year rep name and their username

## Usage
If you want to print off a list of the full Committee you can simply use the command:

```
!cmt
```

But if you want to print an individual position you just use that position as a command, such as:

```
!helpdesk
```

If you wanted to just print the helpdesk.

Each command is rate limited to once a minute so the user will have to wait a minute between printing the position.

## Configuration
### Committee
Inside `plugin_code/redbrick_committee/config/committee.json` are all the current committee members in the format:

```
  { "name": "Cian Butler", "nick": "butlerx", "role": "Helpdesk" },
```

Where Cian is the persons name, butlerx the username and role their current position on committee. These can be easily updated but only recognised  positions will be printed

### waitTime
Inside `plugin_code/redbrick_committee/config/config.json` is the variable waitTime, this number, by default 1, is the amount of minutes the wait timer will be set for.

### channels
This option contains a list of channels that the plugin should respond to commands it defines.

### channelsToExclude
This is an array of strings that the command should ignore commands in. Only used if the channels option is set to 'all'

### channelsToJoin
This is an array of channels that the bot should join. The cards against humanity plugin doesn't support playing the games in multiple channels, so this should only contain one entry.
