const express = require('express');
const bodyParser = require('body-parser');
const { knex } = require('./knex');
const {
  getBets,
  rollWheel,
  getSeed,
  rotateSeed,
  getActiveSeed,
} = require('./wheel');

const response = (handler) => async (req, res) => {
  try {
    res.send(await handler(req.body));
  } catch (e) {
    res.status(400).send(e.message);
  }
};

async function start() {
  await knex.migrate.latest();
  const app = express();

  app.use(bodyParser.json());

  app.use((req, res, next) => {
    next();
  });

  app.post(
    '/get-bets',
    response(async ({ user, limit, offset }) =>
      getBets({ user, limit, offset })
    )
  );

  app.post(
    '/roll-wheel',
    response(async ({ user, amount }) =>
      rollWheel({ user, amount })
    )
  );

  app.post(
    '/get-active-seed',
    response(async ({ user }) => getActiveSeed({ user }))
  );

  app.post(
    '/rotate-seed',
    response(async ({ user }) => rotateSeed({ user }))
  );

  app.post(
    '/get-seed',
    response(async ({ seedId }) => getSeed({ seedId }))
  );

  app.listen(80);
}

start();
