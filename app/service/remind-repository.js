'use strict';

const Remind = require('../lib/remind');

const Service = require('egg').Service;
const dateFormat = require('dateformat');

class RemindService extends Service {
  async create({ duration, repeatType, restricted_hours, restrictedWdays, timestamp }) {
    const { app } = this;
    const { sqlite } = app;

    const result = await sqlite.run('INSERT INTO t_remind(create_at, duration, repeat_type, restricted_hours, restricted_wdays, timestamp, update_at) VALUES(?, ?, ?, ?, ?, ?, ?)', [
      dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss'),
      duration,
      repeatType,
      Array.isArray(restricted_hours) ? Remind.encodeHours(restricted_hours) : null,
      Array.isArray(restrictedWdays) ? Remind.encodeHours(restrictedWdays) : null,
      timestamp,
      dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss'),
    ]);
    return await this.get(result.lastID);
  }

  async delete(id) {
    const { app, logger } = this;
    const { sqlite } = app;

    await sqlite.run('DELETE FROM t_remind WHERE id = ?', [id]);
    logger.info(`删除t_remind表中id列为${id}的行`);
  }

  async get(id) {
    const { app } = this;
    const { sqlite } = app;

    const row = await sqlite.get('SELECT * FROM t_remind WHERE id = ?', [id]);
    if (!row) {
      return null;
    }
    return new Remind(row);
  }

  async put(remind) {
    const { app } = this;
    const { sqlite } = app;

    await sqlite.run('UPDATE t_remind SET duration = ?, repeat_type = ?, restricted_hours = ?, restricted_wdays = ?, task_id = ?, timestamp = ?, update_at = ? WHERE id = ?', [
      remind.duration,
      remind.repeat && remind.repeat.type,
      remind.restricted_hours && Remind.encodeHours(remind.restricted_hours),
      remind.restrictedWdays && Remind.encodeHours(remind.restrictedWdays),
      remind.taskId,
      remind.timestamp,
      dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss'),
      remind.id,
    ]);
  }
}

module.exports = RemindService;
