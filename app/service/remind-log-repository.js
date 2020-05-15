'use strict';

const Service = require('egg').Service;
const dateFormat = require('dateformat');

class RemindLogService extends Service {
  async create({ plan_alarm_at, real_alarm_at, task_id }) {
    const { sqlite } = this.app;

    await sqlite.run('INSERT INTO t_remind_log(create_at, plan_alarm_at, real_alarm_at, task_id, update_at) VALUES(?, ?, ?, ?, ?)', [
      dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss'),
      plan_alarm_at,
      real_alarm_at,
      task_id,
      dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss'),
    ]);
  }

  async search(query) {
    const { sqlite } = this.app;

    if (typeof query.sort !== 'string') {
      query.sort = 'id:desc';
    }

    const columns = [];
    const values = [];
    if (typeof query.task_id === 'string') {
      columns.push('task_id');
      values.push(query.task_id);
    }
    let sql = 'SELECT * FROM t_remind_log';
    if (columns.length > 0) {
      sql += ' WHERE ' + columns.map(column => `${column} = ?`).join(' AND ');
    }
    sql += ` ORDER BY ${query.sort.split(':')[0]} ${query.sort.split(':')[1]}`;
    sql += ' LIMIT ${query.limit || 10}';

    return await sqlite.all(sql, values);
  }
}

module.exports = RemindLogService;
