'use strict';

class Reminder {
  static create(type, shellGateway) {
    const clz = require(`./reminder/${type}`);
    return new clz(shellGateway);
  }
}

module.exports = Reminder;
