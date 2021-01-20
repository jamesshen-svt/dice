const Redis = require('ioredis');

exports.redis = new Redis({ host: 'redis' });
