const { v4: uuid } = require('uuid');
const { knex } = require('./knex');

exports.updateStatistic = async ({ user, amount, payout, game }) => {
  await knex.raw(
    `
      insert into statistic (
        "id", "user", "wagered", "profit", "game"
      ) values (
        :id, :user, :wagered, :profit, :game
      )
      on conflict ("user", "game") do  update
      set 
      wagered = statistic.wagered + :wagered,
      profit = statistic.profit + :profit
    `,
    {
      id: uuid(),
      user,
      wagered: amount,
      profit: payout - amount,
      game,
    }
  );
};

exports.getStatistic = async ({ user, game }) => {
  const [statistic] = await knex('statistic').where({ user, game });
  return statistic;
};
