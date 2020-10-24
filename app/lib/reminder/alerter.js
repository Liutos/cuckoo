'use strict';

class AlerterReminder {
  constructor(shellGateway) {
    this.shellGateway = shellGateway;
  }

  async notify(options) {
    const {
      actions,
      brief,
      detail,
      duration,
      icon,
    } = options;
    let command = `/usr/local/bin/alerter -actions \'${actions.join(',')}\'`;
    if (typeof icon === 'string' && icon !== '') {
      command += ` -appIcon ${icon}`;
    }
    command += ' -closeLabel \'好的\' -dropdownLabel \'或者\' -json';
    let message = detail;
    if (typeof duration === 'number') {
      message += `\n持续展示${duration}秒`;
    } else {
      message += '\n需要手动关闭';
    }
    command += ` -message '${message}' -sound 'default'`;
    if (typeof duration === 'number') {
      command += ` -timeout ${duration}`;
    }
    command += ` -title '${brief}'`;
    console.log('command', command);
    return await this.shellGateway.exec(command, { silent: true });
  }
}

module.exports = AlerterReminder;
