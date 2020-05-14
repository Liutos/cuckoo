'use strict';

const Service = require('egg').Service;
const dateFormat = require('dateformat');

class ContextRepositoryService extends Service {
  async create({ name }) {
    const { sqlite } = this.app;

    const result = await sqlite.run('INSERT INTO t_context(create_at, name, update_at) VALUES(?, ?, ?)', [
      dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss'),
      name,
      dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss')
    ]);
    return await this.get(result.lastID);
  }

  async delete(id) {
    const { logger, sqlite } = this.app;

    await sqlite.run('DELETE FROM t_context WHERE id = ?', [id]);
    logger.info(`删除t_context表中id列为${id}的行`);
  }

  async get(id) {
    const { sqlite } = this.app;

    return await sqlite.get('SELECT * FROM t_context WHERE id = ?', [id]);
  }

  async search(query) {
    const { sqlite } = this.app;

    if (typeof query.sort !== 'string') {
      query.sort = 'id:desc';
    }

    const columns = [];
    const values = [];
    if (typeof query.name === 'string') {
      columns.push('name');
      values.push(query.name);
    }
    let sql = 'SELECT * FROM t_context';
    if (columns.length > 0) {
      sql += ' WHERE ' + columns.map(column => `${column} = ?`).join(' AND ');
    }
    sql += ` ORDER BY ${query.sort.split(':')[0]} ${query.sort.split(':')[1]}`;

    return await sqlite.all(sql, values);
  }
}

module.exports = ContextRepositoryService;
