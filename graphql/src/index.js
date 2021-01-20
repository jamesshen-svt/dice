const _ = require('lodash');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const DataLoader = require('dataloader');
const schema = require('./schema');
const DiceBet = require('./schema/dice-bet');
const WheelBet = require('./schema/wheel-bet');

async function start() {
  const app = express();

  const server = new ApolloServer({
    schema,
    context({ req }) {
      /*
      in our backend we use jwt tokens / postgres to lookup the user here.
      to keep it simple we just allow passing in a user as a header and use
      that as an identifier withhin this project.
    */
      const user = _.get(req, 'headers.x-user', 'easygo');
      return {
        user,
        dataloaders: {
          seedDiceLoader: new DataLoader(DiceBet.SeedLoadFunc, {
            batch: false,
          }),
          seedWheelLoader: new DataLoader(WheelBet.SeedLoadFunc, {
            batch: false,
          }),
        },
      };
    },
    introspection: true,
    playground: { endpoint: 'http://localhost/graphql' },
  });

  server.applyMiddleware({ app });

  app.listen(80);

  // eslint-disable-next-line no-console
  console.log('server listening on http://localhost/graphql');
}

start();
