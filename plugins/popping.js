import pop from 'butlerbot-popping';

export default pop({
  development: {
    channels: ['#botdev'],
    channelsToExclude: [],
    channelsToJoin: ['#botdev'],
    reddit: {
      userAgent: 'irc-bot',
      refreshToken: 'Will Need to get your own',
      clientId: 'ZZifBCPKv9cUOQ',
      clientSecret: 'Get it your self',
    },
  },

  production: {
    channels: ['#bots'],
    channelsToExclude: ['#CardsAgainstHumanity', '#Countdown', '#Uno', '#BookClub', '#helpdesk'],
    channelsToJoin: ['#bots'],
    reddit: {
      userAgent: 'irc-bot',
      refreshToken: 'Will Need to get your own',
      clientId: 'ZZifBCPKv9cUOQ',
      clientSecret: 'Get it your self',
    },
  },
});
