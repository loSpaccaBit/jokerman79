export default {
  routes: [
    {
      method: 'GET',
      path: '/live-stream/:gameId',
      handler: 'live-stream.streamGame',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/live-stream/status',
      handler: 'live-stream.getStatus',
      config: {
        policies: [],
        middlewares: [],
      },
    }
  ],
};
