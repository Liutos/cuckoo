'use strict';

const Service = require('egg').Service;
const shell = require('shelljs');

class ShellGateway extends Service {
  async exec(command, options) {
    return await new Promise(resolve => {
      shell.exec(command, options, (code, stdout, stderr) => {
        resolve({
          code,
          stderr,
          stdout
        });
      });
    });
  }
}

module.exports = ShellGateway;
