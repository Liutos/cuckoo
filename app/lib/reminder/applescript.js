'use strict';

const shell = require('shelljs');

class AppleScriptReminder {
  notify(options) {
    const {
      brief,
      detail,
      icon,
    } = options;
    let command = `/usr/bin/osascript -e 'display notification "将会自动消失" with title "${brief}" subtitle "${detail}"'`;
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
