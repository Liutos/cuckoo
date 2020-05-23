'use strict';

module.exports = appInfo => {
  const config = exports = {};

  config.context = {
    // 检测当前场景的工具，有效值为app/lib/contextDetector/目录下的文件名。
    detector: '',
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1543899096465_7258';

  // add your config here
  config.middleware = [];

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
