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

  async search(query) {
    const { mysql } = this.app;

    if (typeof query.sort !== 'string') {
      query.sort = 'id:desc';
    }

    const where = {};
    if (typeof query.task_id === 'string') {
      where.task_id = query.task_id;
    }
    return await mysql.select('t_remind_log', {
      limit: query.limit || 10,
      orders: [ query.sort.split(':') ],
      where,
    });
  }
}

module.exports = RemindLogService;
