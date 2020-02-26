/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 **/
import { Server } from 'hapi';
import { environment } from "./environments/environment";
//const wreck = require('wreck');
const request = require("request-promise");

const init = async () => {
  const server = new Server({
    port: 4444,
    host: 'localhost'
  });

  const invokeApi = async (symbol: string,timeSpan: string) =>{
    return await request.get(
      `${environment.apiURL}/beta/stock/${symbol}/chart/${timeSpan}?token=${
        environment.apiKey
      }`
    );
  };

  server.method('invokeApi', invokeApi, {

    cache: {
      expiresIn: 24 * 60 * 60 * 1000,
      generateTimeout: 5000
    },
    generateKey: (symbol, timeSpan) => symbol + ':' + timeSpan
  });

  server.route({
    method: 'GET',
    path: '/stocks/{symbol}/{timeSpan}',
    options: {
      cors: true
    },
    handler: async (request, h) => {

      const { symbol, timeSpan } = request.params;
      return await server.methods.invokeApi(symbol,timeSpan);
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
