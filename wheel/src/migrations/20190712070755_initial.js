exports.up = async (knex) => {
  await knex.schema.createTable('seed', (table) => {
    table.uuid('id').primary();

    table.string('user').notNull();

    table.boolean('active').notNull();

    table.string('secret').notNull();
    table.string('hash').notNull();

    table.integer('nonce').notNull();
  });

  await knex.raw(
    'create unique index seed_user_actice_unique_index on seed ("user") where active = true'
  );

  await knex.schema.createTable('bet', (table) => {
    table.uuid('id').primary();

    table.string('user').notNull();

    table.uuid('seed_id').references('seed.id').notNull();

    table.integer('nonce').notNull();

    table.integer('result').notNull();

    table.float('amount').notNull();

    table.float('payout').notNull();

    table.timestamp('created_at').defaultTo(knex.fn.now()).notNull().index();
  });
};

exports.down = async () => {};
