const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLString,
} = require('graphql');
const axios = require('axios');
const User = require('./user');
const Seed = require('./seed');

exports.Type = new GraphQLObjectType({
  name: 'DiceBet',
  fields: () => ({
    id: { type: GraphQLString },
    amount: { type: GraphQLFloat },
    payout: { type: GraphQLFloat },
    target: { type: GraphQLInt },
    result: { type: GraphQLInt },
    nonce: { type: GraphQLInt },
    user: {
      type: User.Type,
      resolve: ({ user }) => ({ name: user }),
    },
    seed: {
      type: Seed.Type,
      resolve: async ({ seed_id: seedId }, args, { dataloaders }) => {
        const data = await dataloaders.seedDiceLoader.load(seedId);
        return data;
      },
    },
  }),
});

/*
 * for this chanllege specifically, assume a one element batch func.
 */
exports.SeedLoadFunc = async (seedIds) => {
  const [seedId] = seedIds;
  const { data } = await axios.post(`http://dice/get-seed`, { seedId });
  return [data];
};
