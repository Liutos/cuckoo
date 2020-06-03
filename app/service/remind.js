'use strict';

const Remind = require('../lib/remind');

const Service = require('egg').Service;

class RemindService extends Service {
  async close(id) {
    const remind = await this.get(id);
    remind.close();
    await this.put(remind);
  }

  async create({ duration, repeat_id, restricted_hours, restrictedWdays, timestamp }) {
    return await this.ctx.service.remindRepository.create({ duration, repeat_id, restricted_hours, restrictedWdays, timestamp });
  }

  async delete(id) {
    await this.ctx.service.remindRepository.delete(id);
  }

  async duplicate(remind) {
    const { service } = this;

    let repeatId = null;
    if (remind.repeat) {
      const repeat = await service.repeat.duplicate(remind.repeat);
      repeatId = repeat.id;
    }

    return await this.create(Object.assign({}, remind, {
      repeat_id: repeatId
    }));
  }

  async get(id) {
    return await this.ctx.service.remindRepository.get(id);
  }

  async put(remind) {
    await this.ctx.service.remindRepository.put(remind);
  }
}

module.exports = RemindService;
