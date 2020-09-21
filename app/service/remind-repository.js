'use strict';

const Remind = require('../lib/remind');

const Service = require('egg').Service;
const dateFormat = require('dateformat');

class RemindService extends Service {
  async create({ contextId, duration, repeatType, restricted_hours, restrictedWdays, taskId, timestamp }) {
    const { app } = this;
    const { sqlite } = app;

    const result = await sqlite.run('INSERT INTO t_remind(context_id, create_at, duration, repeat_type, restricted_hours, restricted_wdays, task_id, timestamp, update_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      contextId,
      dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss'),
      duration,
      repeatType,
      Array.isArray(restricted_hours) ? Remind.encodeHours(restricted_hours) : null,
      Array.isArray(restrictedWdays) ? Remind.encodeHours(restrictedWdays) : null,
      taskId,
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
    const { app, service } = this;
    const { sqlite } = app;

    const row = await sqlite.get('SELECT * FROM t_remind WHERE id = ?', [id]);
    if (!row) {
      return null;
    }
    if (typeof row.context_id === 'number') {
      row.context = await service.context.get(row.context_id);
    }
    return new Remind(row);
  }

  async put(remind) {
    const { app } = this;
    const { sqlite } = app;

    await sqlite.run('UPDATE t_remind SET context_id = ?, duration = ?, repeat_type = ?, restricted_hours = ?, restricted_wdays = ?, task_id = ?, timestamp = ?, update_at = ? WHERE id = ?', [
      remind.context && remind.context.id,
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

  /**
   * @param {Object} query
   * @param {string} [query.sort] - 搜索结果的排序规则
   * @param {number} [query.taskId] - 过滤出task_id列为该任务ID的结果
   */
  async search(query) {
    const { app } = this;
    const { logger, sqlite } = app;

    if (typeof query.sort !== 'string') {
      query.sort = 'id:desc';
    }

    const conditions = [ '1 = 1' ];
    const values = [];
    if (typeof query.taskId === 'number') {
      conditions.push('task_id = ?');
      values.push(query.taskId);
    }

    let sql = 'SELECT `id` FROM `t_remind` WHERE ' + conditions.join(' AND ');
    const { limit = 20, offset = 0, sort } = query;
    sql += ` ORDER BY ${sort.split(':')[0]} ${sort.split(':')[1].toUpperCase()}`;
    sql += ` LIMIT ${limit} OFFSET ${offset}`;
    logger.info(`即将被执行的SQL语句为：${sql}`);
    logger.info('用于填充到SQL中的值为：', values);
    const ids = await sqlite.all(sql, values);
    return await Promise.all(ids.map(async ({ id }) => {
      return await this.get(id);
    }));
  }
}

module.exports = RemindService;
