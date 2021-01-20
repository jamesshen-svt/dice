const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} = require('graphql');
const axios = require('axios');
const DiceBet = require('./dice-bet');
const WheelBet = require('./wheel-bet');
const Seed = require('./seed');
const Statistic = require('./statistic');

exports.Type = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    name: { type: GraphQLString },
    statistic: {
      type: Statistic.Type,
      args: {
        game: { type: GraphQLString },
      },
      resolve: async ({ name: user }, { game }) => {
        const { data } = await axios.post('http://statistic/get-statistic', {
          user,
          game,
        });
        return data;
      },
    },
    diceBets: {
      type: new GraphQLList(DiceBet.Type),
      args: {
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
      },
      async resolve({ name: user }, { limit = 10, offset = 0 }) {
        const { data } = await axios.post('http://dice/get-bets', {
          user,
          limit,
          offset,
        });
        return data;
      },
    },
    activeDiceSeed: {
      type: Seed.Type,
      resolve: async ({ name: user }) => {
        const { data } = await axios.post('http://dice/get-active-seed', {
          user,
        });
        return data;
      },
    },
    wheelBets: {
      type: new GraphQLList(WheelBet.Type),
      args: {
        limit: { type: GraphQLInt },
        offset: { type: GraphQLInt },
      },
      async resolve({ name: user }, { limit = 10, offset = 0 }) {
        const { data } = await axios.post('http://wheel/get-bets', {
          user,
          limit,
          offset,
        });
        return data;
      },
    },
    activeWheelSeed: {
      type: Seed.Type,
      resolve: async ({ name: user }) => {
        const { data } = await axios.post('http://wheel/get-active-seed', {
          user,
        });
        return data;
      },
    },
  }),
});
