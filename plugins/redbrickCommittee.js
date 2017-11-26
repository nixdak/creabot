import cmt from 'butlerbot-redbrick-committee';

export default cmt({
  production: {
    url: 'http://redbrick.dcu.ie/api/committee',
    channels: ['#bots', '#helpdesk'],
    channelsToExclude: ['#CardsAgainstHumanity', '#Countdown', '#Uno', '#BookClub'],
    channelsToJoin: ['#bots', '#helpdesk'],
  },

  development: {
    url: 'http://redbrick.dcu.ie/api/committee',
    channels: 'all',
    channelsToExclude: [],
    channelsToJoin: ['#botdev'],
  },

  postions: [
    'System Administrator',
    'Chairperson',
    'Secretary',
    'Public Relations Officer',
    'Treasurer',
    'Events Officer',
    'Helpdesk',
    'First Year Representative',
  ],
});
