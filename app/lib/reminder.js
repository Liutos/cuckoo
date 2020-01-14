'use strict';

class Reminder {
  static create(type) {
    const clz = require(`./reminder/${type}`);
    return new clz();
  }
}

module.exports = Reminder;
