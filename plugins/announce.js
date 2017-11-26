import announce from 'butlerbot-announce';

export default announce({
  production: {
    waitTime: 1,
    channelsToJoin: [],
    baseUrl: 'https://www.redbrick.dcu.ie/api/',
  },

  development: {
    waitTime: 1,
    channelsToJoin: ['#botdev'],
    baseUrl: 'https://www.redbrick.dcu.ie/api/',
  },
});
