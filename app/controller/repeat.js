'use strict';

const Controller = require('egg').Controller;

class RepeatController extends Controller {
  async create() {
    const { ctx, service } = this;
    const { request: { body } } = ctx;

    ctx.validate({
      type: { type: 'string' },
    });
    const { type } = body;

    const repeat = await service.repeat.create({
      type,
    });

    ctx.body = {
      repeat,
    };
    ctx.status = 201;
  }

  async get() {
    const { ctx, service } = this;
    const { params } = ctx;

    const { id } = params;

    const repeat = await service.repeat.get(id);

    ctx.body = {
      repeat,
    };
  }
}

module.exports = RepeatController;
