'use strict';

const Service = require('egg').Service;

class ServerChanService extends Service {
  async send(options) {
    const { app } = this;
    const { desp, text } = options;

    await app.curl(`https://sc.ftqq.com/${process.env.SCKEY}.send`, {
      data: {
        desp,
        text,
      },
    });
  }
}

module.exports = ServerChanService;
