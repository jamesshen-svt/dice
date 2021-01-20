const createKnex = require('knex');
const path = require('path');
require('pg');

exports.knex = createKnex({
  client: 'pg',
  connection: {
    host: 'wheel-postgres',
    user: 'postgres',
    password: 'password',
    database: 'postgres',
    charset: 'utf8',
  },
  migrations: {
    directory: path.join(__dirname, 'migrations'),
  },
});
