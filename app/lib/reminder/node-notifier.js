'use strict';

const notifier = require('node-notifier');

class NodeNotifierReminder {
  notify(options) {
    const {
      brief,
      detail,
      duration,
      icon,
    } = options;
    let message = null;
    if (typeof duration === 'number') {
      message = `持续展示${duration}秒`;
    } else {
      message = '需要手动关闭';
    }
    return new Promise(resolve => {
      notifier.notify({
        actions: '5分钟后再提醒,10分钟后再提醒,30分钟后再提醒,1小时后再提醒,8点时再提醒',
        closeLabel: '好的',
        dropdownLabel: '或者',
        icon,
        message,
        sound: 'default',
        subtitle: detail,
        timeout: duration,
        title: brief,
        wait: true
      }, function (error, response, metadata) {
        resolve({
          stdout: JSON.stringify(metadata)
        });
      });
    });
  }
}

module.exports = NodeNotifierReminder;
