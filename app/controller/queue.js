'use strict';

const Controller = require('egg').Controller;

class QueueController extends Controller {
  async poll() {
    const { ctx, service } = this;

    const message = await service.queue.poll();

    ctx.body = {
      message,
    };
  }

  async send() {
    const { ctx, service } = this;
    const { request: { body } } = ctx;

    ctx.validate({
      consumeUntil: { type: 'int' },
      message: { type: 'string' },
    });
    const { consumeUntil, message } = body;

    await service.queue.send(message, consumeUntil);

    ctx.body = '';
    ctx.status = 204;
  }
}

module.exports = QueueController;
