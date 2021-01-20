const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLNonNull,
} = require('graphql');
const axios = require('axios');
const DiceBet = require('./dice-bet');
const WheelBet = require('./wheel-bet');
const Seed = require('./seed');

exports.Type = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    rollDice: {
      type: DiceBet.Type,
      args: {
        target: { type: GraphQLNonNull(GraphQLInt) },
        amount: { type: GraphQLNonNull(GraphQLFloat) },
      },
      async resolve(parent, { amount, target }, { user }) {
        const { data } = await axios.post(`http://dice/roll-dice`, {
          user,
          amount,
          target,
        });
        return data;
      },
    },

    rotateDiceSeed: {
      type: Seed.Type,
      async resolve(parent, args, { user }) {
        const { data } = await axios.post(`http://dice/rotate-seed`, {
          user,
        });

        return data;
      },
    },

    rollWheel: {
      type: WheelBet.Type,
      args: {
        amount: { type: GraphQLNonNull(GraphQLFloat) },
      },
      async resolve(parent, { amount }, { user }) {
        const { data } = await axios.post(`http://wheel/roll-wheel`, {
          user,
          amount,
        });
        return data;
      },
    },

    rotateWheelSeed: {
      type: Seed.Type,
      async resolve(parent, args, { user }) {
        const { data } = await axios.post(`http://wheel/rotate-seed`, {
          user,
        });

        return data;
      },
    },
  }),
});
