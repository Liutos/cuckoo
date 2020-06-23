'use strict';

const path = require('path');

module.exports = appInfo => {
  const config = exports = {};

  config.context = {
    // 检测当前场景的工具，有效值为app/lib/contextDetector/目录下的文件名。
    detector: '',
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1543899096465_7258';

  config.logger = {
    // 避免在生产模式中运行时，日志输出到了用户的主目录下。
    dir: path.resolve(appInfo.baseDir, 'logs/cuckoo/')
  };

  // add your config here
  config.middleware = [];

  config.mobilePhone = {
    push: {
      serverChan: {
        // 使用方糖推送所必须的参数
        sckey: ''
      }
    }
  };

  config.reminder = {
    type: 'applescript'
  };

  config.schedule = {
    poll: {
      // The running interval of app/schedule/poll.js
      interval: '30s'
    },
    sync: {
      cron: '0 45 */6 * * *'
    }
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.sqlite = {
    db: {
      path: path.resolve(__dirname, '../run/cuckoo.db')
    }
  };

  return config;
};
