#!/bin/sh
yarn install
(cd dice && yarn install)
(cd wheel && yarn install)
(cd graphql && yarn install)
(cd statistic && yarn install)
docker-compose up
