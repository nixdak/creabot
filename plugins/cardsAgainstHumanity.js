import cah from 'butlerbot-cards-against-humanity';

export default cah({
  production: {
    gameOptions: {
      setTopic: true,
      topicBase: '|| wiki: https://github.com/butlerx/butlerbot/wiki/Cards-Against-Humanity',
      notifyUsers: false,
      pointLimit: 5,
      idleLimit: 2,
      secondsBeforeStart: 60,
      roundMinutes: 6,
      database: false,
      maxPlayers: 8,
    },

    pluginOptions: {
      channels: ['#CardsAgainstHumanity'],
      channelsToExclude: ['#Uno', '#Countdown', '#bots', '#BookClub', 'helpdesk'],
      channelsToJoin: ['#CardsAgainstHumanity'],
    },
    db: {
      username: 'root',
      password: null,
      database: 'database_development',
      host: '127.0.0.1',
      port: 3306,
    },
  },
  development: {
    gameOptions: {
      setTopic: true,
      topicBase: '|| Dev Bot || Expect spam || Expect breakings',
      notifyUsers: false,
      pointLimit: 5,
      idleLimit: 2,
      secondsBeforeStart: 60,
      roundMinutes: 6,
      database: true,
      maxPlayers: 8,
    },

    pluginOptions: {
      channels: ['#botdev'],
      channelsToExclude: [],
      channelsToJoin: ['#botdev'],
    },
    db: {
      username: 'root',
      password: null,
      database: 'database_production',
      host: '127.0.0.1',
      port: 3306,
    },
  },
});
