'use strict';

const Service = require('egg').Service;

class RemindLogService extends Service {
  async create({ plan_alarm_at, real_alarm_at, task_id }) {
    const { app } = this;
    const { mysql } = app;

    await mysql.insert('t_remind_log', {
      create_at: new Date(),
      plan_alarm_at,
      real_alarm_at,
      task_id,
      update_at: new Date(),
    });
  }
}

module.exports = RemindLogService;
