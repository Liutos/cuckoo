'use strict';

const Service = require('egg').Service;

class ServerChanService extends Service {
  async send(options) {
    const { app } = this;
    const { config } = app;
    const { desp, text } = options;

    const { sckey } = config.mobilePhone.push.serverChan;
    await app.curl(`https://sc.ftqq.com/${sckey}.send`, {
      data: {
        desp,
        text,
      },
    });
  }
}

module.exports = ServerChanService;
