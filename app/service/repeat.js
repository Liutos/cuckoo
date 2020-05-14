'use strict';

const Repeat = require('../lib/repeat');

const Service = require('egg').Service;

class RepeatService extends Service {
  async create({ type }) {
    // const { app } = this;
    // const { mysql } = app;

    // Repeat.validateType(type);
    // const { insertId } = await mysql.insert('t_repeat', {
    //   create_at: new Date(),
    //   type,
    //   update_at: new Date(),
    // });
    // return await this.get(insertId);
    return await this.ctx.service.repeatRepository.create({ type });
  }

  async delete(id) {
    // const { logger, mysql } = this.app;

    // await mysql.delete('t_repeat', {
    //   id,
    // });
    // logger.info(`删除t_repeat表中id列为${id}的行`);
    return await this.ctx.service.repeatRepository.delete(id);
  }

  async duplicate(repeat) {
    return await this.create(repeat);
  }

  async get(id) {
    // const { app, ctx } = this;
    // const { mysql } = app;

    // const row = await mysql.get('t_repeat', {
    //   id,
    // });
    // return new Repeat(ctx, row);
    return await this.ctx.service.repeatRepository.get(id);
  }

  async put(repeat) {
    // const { app } = this;
    // const { mysql } = app;

    // await mysql.update('t_repeat', {
    //   type: repeat.type,
    //   update_at: new Date(),
    // }, {
    //   where: {
    //     id: repeat.id,
    //   },
    // });
    return await this.ctx.service.repeatRepository.put(repeat);
  }
}

module.exports = RepeatService;
