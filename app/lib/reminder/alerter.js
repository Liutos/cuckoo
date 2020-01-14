'use strict';

const shell = require('shelljs');

class AlerterReminder {
  notify(options) {
    const {
      brief,
      detail,
      icon,
    } = options;
    let command = '/usr/local/bin/alerter -actions \'完成,5分钟后再提醒,10分钟后再提醒,8点时再提醒\'';
    if (typeof icon === 'string' && icon !== '') {
      command += ` -appIcon ${icon}`;
    }
    command += ' -closeLabel \'好的\' -dropdownLabel \'或者\' -json';
    let message = detail;
    if (typeof this.duration === 'number') {
      message += `\n持续展示${this.duration}秒`;
    } else {
      message += '\n需要手动关闭';
    }
    command += ` -message '${message}'`;
    if (typeof this.duration === 'number') {
      command += ` -timeout ${this.duration}`;
    }
    command += ` -title '${brief}'`;
    console.log('command', command);
    return new Promise(resolve => {
      shell.exec(command, { silent: true }, (code, stdout, stderr) => {
        resolve({
          code,
          stderr,
          stdout,
        });
      });
    });
  }
}

module.exports = AlerterReminder;
