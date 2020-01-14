'use strict';

const Remind = require('../lib/remind');

const Service = require('egg').Service;

class RemindService extends Service {
  async close(id) {
    const remind = await this.get(id);
    remind.close();
    await this.put(remind);
  }

  async create({ duration, repeat_id, restricted_hours, timestamp }) {
    const { app } = this;
    const { mysql } = app;

    const { insertId } = await mysql.insert('t_remind', {
      create_at: new Date(),
      duration,
      repeat_id,
      restricted_hours: Array.isArray(restricted_hours) ? Remind.encodeHours(restricted_hours) : null,
      timestamp,
      update_at: new Date(),
    });
    return await this.get(insertId);
  }

  async delete(id) {
    const { app, logger, service } = this;
    const { mysql } = app;

    const remind = await this.get(id);
    if (remind && remind.repeat_id) {
      await service.repeat.delete(remind.repeat_id);
    }
    await mysql.delete('t_remind', {
      id,
    });
    logger.info(`删除t_remind表中id列为${id}的行`);
  }

  async get(id) {
    const { app, ctx, service } = this;
    const { mysql } = app;

    const row = await mysql.get('t_remind', {
      id,
    });
    if (!row) {
      return null;
    }
    if (row.repeat_id) {
      row.repeat = await service.repeat.get(row.repeat_id);
    }
    return new Remind(ctx, row);
  }

  async put(remind) {
    const { app, service } = this;
    const { mysql } = app;

    if (remind.repeat) {
      await service.repeat.put(remind.repeat);
    }
    await mysql.update('t_remind', {
      duration: remind.duration,
      repeat_id: remind.repeat && remind.repeat.id,
      restricted_hours: remind.restricted_hours && Remind.encodeHours(remind.restricted_hours),
      timestamp: remind.timestamp,
      update_at: new Date(),
    }, {
      where: {
        id: remind.id,
      },
    });
  }
}

module.exports = RemindService;
