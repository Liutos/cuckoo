'use strict';

const dateFormat = require('dateformat');

class AppleScriptReminder {
  constructor(shellGateway) {
    this.shellGateway = shellGateway;
  }

  async notify(options) {
    const {
      alarmAt,
      brief,
      detail,
    } = options;
    let command = `/usr/bin/osascript -e 'display notification "预定弹出时间为${dateFormat(alarmAt * 1000, 'yyyy-mm-dd HH:MM:ss')}" with title "${brief}" subtitle "${detail}"'`;
    console.log('command', command);
    let {
      code,
      stderr
    } = await this.shellGateway.exec(command, { silent: true });
    return {
      code,
      stderr,
      stdout: JSON.stringify({
        activationValue: '好的'
      })
    };
  }
}

module.exports = AppleScriptReminder;
