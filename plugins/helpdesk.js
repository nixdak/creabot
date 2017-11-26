import helpdesk from 'butlerbot-helpdesk';

export default helpdesk({
  development: {
    channels: ['#botdev'],
    channelsToExclude: [],
    channelsToJoin: ['#botdev'],
    commands: [
      '!cmt',
      '!helpdesk',
      '!chair',
      '!secretary',
      '!treasurer',
      '!pro',
      '!events',
      '!admins',
      '!webmaster',
      '!fyr',
      '!help',
    ],
    pmCommands: [],
    wiki: 'http://wiki.redbrick.dcu.ie/mw/',
  },

  production: {
    channels: ['#bots', '#helpdesk'],
    channelsToExclude: ['#CardsAgainstHumanity', '#Countdown', '#Uno', '#BookClub'],
    channelsToJoin: ['#bots', '#helpdesk'],
    commands: [
      '!cmt',
      '!helpdesk',
      '!chair',
      '!secretary',
      '!treasurer',
      '!pro',
      '!events',
      '!admins',
      '!webmaster',
      '!fyr',
      '!halpdack',
      '!dbus',
      '!pop',
    ],
    pmCommands: [],
    wiki: 'http://wiki.redbrick.dcu.ie/mw/',
  },
});
