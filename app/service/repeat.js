'use strict';

const Service = require('egg').Service;

class RepeatService extends Service {
  async create({ type }) {
    return await this.ctx.service.repeatRepository.create({ type });
  }

  async delete(id) {
    return await this.ctx.service.repeatRepository.delete(id);
  }

  async duplicate(repeat) {
    return await this.create(repeat);
  }

  async get(id) {
    return await this.ctx.service.repeatRepository.get(id);
  }

  async put(repeat) {
    return await this.ctx.service.repeatRepository.put(repeat);
  }
}

module.exports = RepeatService;
