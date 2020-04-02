'use strict';

const dateFormat = require('dateformat');
const shell = require('shelljs');

class AppleScriptReminder {
  notify(options) {
    const {
      alarmAt,
      brief,
      detail,
      icon,
    } = options;
    let command = `/usr/bin/osascript -e 'display notification "预定弹出时间为${dateFormat(alarmAt * 1000, 'yyyy-mm-dd HH:MM:ss')}" with title "${brief}" subtitle "${detail}"'`;
    console.log('command', command);
    return new Promise(resolve => {
      shell.exec(command, { silent: true }, (code, stdout, stderr) => {
        resolve({
          code,
          stderr,
          stdout: JSON.stringify({
            activationValue: '好的'
          }),
        });
      });
    });
  }
}

module.exports = AppleScriptReminder;
