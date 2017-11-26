import dBus from 'butlerbot-dublin-bus';

export default dBus({
  channels: ['#bots'],
  channelsToExclude: [
    '#Uno',
    '#CardsAgainstHumanity',
    '#Countdown',
    'botdev',
    '#BookClub',
    'helpdesk',
  ],
  channelsToJoin: ['#bots'],
});
