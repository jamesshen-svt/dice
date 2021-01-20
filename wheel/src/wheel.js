const _ = require('lodash');
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const assert = require('assert');
const big = require('big.js');
const { knex } = require('./knex');
const { redis } = require('./redis');

const parseSeed = (seed) => {
  if (!seed) {
    return null;
  }

  if (seed.active) {
    return _.omit(seed, ['secret']);
  }

  return seed;
};

exports.rollWheel = ({ user, amount }) =>
  knex.transaction(async (trx) => {
    assert(amount >= 0);

    let [seed] = await trx('seed').where({ user, active: true }).forUpdate();
    if (!seed) {
      const secret = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(secret).digest('hex');

      [seed] = await trx('seed')
        .insert({ id: uuid(), user, secret, hash, nonce: 0, active: true })
        .returning('*');
    }

    const nonce = String(seed.nonce + 1);
    const hmac = crypto
      .createHmac('sha256', seed.secret)
      .update(nonce)
      .digest('hex');

    // we take the first 32 bits (4 bytes, 8 hex chars)
    const int = parseInt(hmac.substr(0, 8), 16);
    // float is between 0 inc. and 1 exclusive.
    const float = int / 2 ** 32;

    const result = Math.floor(float * 10);
    // divide result into 10 segments. check 1 segment with 1.5x payout.
    // 7 segments with 1.2 payout.
    // 2 segments with 0 payout.
    let payoutFactor = 0;
    if (result < 1) {
      payoutFactor = 1.5;
    } else if (result >= 1 && result < 8) {
      payoutFactor = 1.2;
    }

    // assume payout is dollar amount. but it might be unnecessary to round or require higher precision for crypto currency.
    const payout = big(amount).times(payoutFactor).round(2).toNumber();
    const [bet] = await trx('bet')
      .insert({
        id: uuid(),
        seed_id: seed.id,
        user,
        amount,
        payout,
        result,
        nonce,
      })
      .returning('*');

    await trx('seed')
      .update('nonce', trx.raw('nonce + 1'))
      .where('id', seed.id);

    await redis.publish('wheel', JSON.stringify(bet));

    return bet;
  });

exports.getBets = async ({ user, limit, offset }) => {
  const bets = await knex('bet')
    .where('user', user)
    .orderBy('bet.created_at', 'desc')
    .limit(limit)
    .offset(offset);

  return bets;
};

exports.getSeed = async ({ seedId }) => {
  const [seed] = await knex('seed').where('id', seedId);
  return parseSeed(seed);
};

exports.rotateSeed = async ({ user }) => {
  const [seed] = await knex('seed')
    .update({ active: false })
    .where({ user, active: true })
    .returning('*');

  return parseSeed(seed);
};

exports.getActiveSeed = async ({ user }) => {
  const [seed] = await knex('seed').where({ user, active: true });
  return parseSeed(seed);
};
