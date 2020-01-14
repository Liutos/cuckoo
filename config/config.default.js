'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1543899096465_7258';

  // add your config here
  config.middleware = [];

  config.mysql = {
    client: {
      database: '',
      host: '',
      password: '',
      port: '',
      user: '',
    },
  };

  config.redis = {
    client: {
      db: 0,
      host: '',
      password: '',
      port: 6379,
    },
  };

  config.reminder = {
    type: 'applescript'
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  return config;
};
