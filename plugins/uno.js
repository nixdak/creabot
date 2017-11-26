import uno from 'butlerbot-uno';

export default uno({
  development: {
    gameOptions: {
      turnMinutes: 3,
      maxIdleTurns: 3,
      idleRoundTimerDecrement: 60,
      setTopic: true,
      topicBase: '|| Dev Bot || Expect spam || Expect breakings',
    },

    pluginOptions: {
      channels: ['#botdev'],
      channelsToExclude: [],
      channelsToJoin: ['#botdev'],
    },
  },

  production: {
    gameOptions: {
      turnMinutes: 3,
      maxIdleTurns: 3,
      idleRoundTimerDecrement: 60,
      setTopic: true,
      topicBase: '|| wiki: https://github.com/butlerx/butlerbot/wiki/Uno',
    },

    pluginOptions: {
      channels: ['#Uno'],
      channelsToExclude: ['#CardsAgainstHumanity', '#Countdown', '#bots', '#BookClub', '#helpdesk'],
      channelsToJoin: ['#Uno'],
    },
  },
});
