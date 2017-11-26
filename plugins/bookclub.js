import bookclub from 'butlerbot-bookclub';

export default bookclub({
  development: {
    setTopic: true,
    topicBase: '|| Dev Bot || Expect spam || Expect breakings',
    awsId: '',
    awsSecret: '',
    channels: ['#botdev'],
    channelsToExclude: [],
    channelsToJoin: ['#botdev'],
  },

  production: {
    setTopic: true,
    topicBase:
      ' || Welcome to Bookclub check out https://github.com/butlerx/butlerbot/wiki/bookclub for commands',
    awsId: '',
    awsSecret: '',
    channels: ['#BookClub'],
    channelsToExclude: ['#Uno', '#CardsAgainstHumanity', '#Countdown', 'bots', 'helpdesk'],
    channelsToJoin: ['#BookClub'],
  },
});
