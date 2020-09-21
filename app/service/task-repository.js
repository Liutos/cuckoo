'use strict';

const Task = require('../lib/task');

const Service = require('egg').Service;
const dateFormat = require('dateformat');

class TaskService extends Service {
  async create({ brief, detail, device, icon, icon_file }) {
    const { app } = this;
    const { sqlite } = app;

    const result = await sqlite.run('INSERT INTO t_task(brief, create_at, detail, device, icon, icon_file, state, update_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?)', [
      brief,
      dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss'),
      detail,
      device,
      icon,
      icon_file,
      'active',
      dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss'),
    ]);

    const task = await this.get(result.lastID);

    return task;
  }

  async delete(id) {
    const { app, logger, service } = this;
    const { sqlite } = app;

    const task = await this.get(id);
    if (task && task.remind) {
      await service.queue.remove(id);
      await service.remind.delete(task.remind.id);
    }
    await sqlite.run('DELETE FROM t_task WHERE id = ?', [id]);
    logger.info(`删除t_task表中id列为${id}的行`);
  }

  async get(id) {
    const { app, service } = this;
    const { sqlite } = app;

    const row = await sqlite.get('SELECT * FROM t_task WHERE id = ?', [id]);
    if (!row) {
      return null;
    }
    if (row.context_id) {
      row.context = await service.context.get(row.context_id);
    }
    row.remind = (await service.remind.search({
      taskId: row.id
    }))[0];
    return new Task(row);
  }

  async put(task) {
    const { app, service } = this;
    const { sqlite } = app;

    if (task.remind) {
      await service.remind.put(task.remind);
    }
    await sqlite.run('UPDATE t_task SET brief = ?, detail = ?, device = ?, icon = ?, icon_file = ?, state = ?, update_at = ? WHERE id = ?', [
      task.brief,
      task.detail,
      task.device,
      task.icon,
      task.icon_file,
      task.state,
      task.update_at,
      task.id,
    ]);
  }

  async search(query) {
    const { app } = this;
    const { logger, sqlite } = app;

    if (typeof query.sort !== 'string') {
      query.sort = 'id:desc';
    }

    const conditions = [ '1 = 1' ];
    const values = [];
    if (typeof query.brief === 'string') {
      conditions.push('brief LIKE ?');
      values.push(`%${query.brief}%`);
    }
    if (typeof query.context_id === 'string') {
      conditions.push('context_id = ?');
      values.push(query.context_id);
    }
    if (typeof query.detail === 'string') {
      conditions.push('detail LIKE ?');
      values.push(`%${query.detail}%`);
    }
    if (typeof query.state === 'string') {
      conditions.push('state = ?');
      values.push(query.state);
    }

    /**
     * SQLite的SELECT语句的文档
     * @see {@link https://www.sqlitetutorial.net/sqlite-select/}
     */
    let sql = 'SELECT `id` FROM `t_task` WHERE ' + conditions.join(' AND ');
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

module.exports = TaskService;
