'use strict';

const shell = require('shelljs');

const path = require('path');

class ControlPlaneDetector {
  static getCurrent() {
    const script = path.resolve(__dirname, '../../../script/get_current_context.scpt');
    const command = `osascript ${script}`;
    return shell.exec(command, { silent: true }).stdout.trim();
  }
}

module.exports = ControlPlaneDetector;
