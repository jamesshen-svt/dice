/* eslint-disable no-unused-expressions */
const _ = require('lodash');
const { expect } = require('chai');
const { rollWheel } = require('./wheel');
const { knex } = require('./knex');

describe('wheel', () => {
  before(async () => {
    await knex.migrate.latest();
  });

  it('rolls the wheel', async () => {
    const bet = await rollWheel({ user: 'test', amount: 0.1 });
    expect(bet).to.be.ok;
  });

  it('used nonce in order', async () => {
    let bets = await Promise.all(
      _.range(5).map(() => rollWheel({ user: 'test', amount: 0.1 }))
    );

    // lets sort them in case bets get returned out of order
    bets = bets.sort((a, b) => a.nonce - b.nonce);

    let [{ nonce: nextNonce }] = bets;

    for (const bet of bets) {
      expect(bet.nonce).to.equal(nextNonce);
      nextNonce += 1;
    }
  });
});
