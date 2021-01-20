exports.up = async (knex) => {
  await knex.schema.alterTable('statistic', (table) => {
    table.dropUnique('user');
    table.string('game').notNull().defaultTo('dice');
  });

  await knex.raw(
    'create unique index user_game_unique_index on statistic ("user", "game")'
  );
};

exports.down = async () => {};
