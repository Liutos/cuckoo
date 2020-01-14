'use strict';

const Controller = require('egg').Controller;

class ContextController extends Controller {
  async create() {
    const { ctx, service } = this;
    const { request: { body } } = ctx;

    const { name } = body;

    const context = await service.context.create({
      name,
    });

    ctx.body = {
      context,
    };
    ctx.status = 201;
  }

  async getCurrent() {
    const { ctx, service } = this;

    const context = service.context.getCurrent();

    ctx.body = {
      context,
    };
  }

  async search() {
    const { ctx, service } = this;
    const { query } = ctx;

    const { name } = query;
    const { sort = 'create_at:desc' } = query;
    const contexts = await service.context.search({
      name,
      sort,
    });

    ctx.body = {
      contexts,
    };
  }
}

module.exports = ContextController;
