'use strict';

const Service = require('egg').Service;

class RemindLogService extends Service {
  async create({ plan_alarm_at, real_alarm_at, task_id }) {
    await this.ctx.service.remindLogRepository.create({ plan_alarm_at, real_alarm_at, task_id });
  }

  async search(query) {
    return await this.ctx.service.remindLogRepository.search(query);
  }
}

module.exports = RemindLogService;
