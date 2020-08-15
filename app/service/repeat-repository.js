'use strict';

const Repeat = require('../lib/repeat');

const Service = require('egg').Service;
const dateFormat = require('dateformat');

class RepeatService extends Service {
  async create({ type }) {
    const { sqlite } = this.app;

    Repeat.validateType(type);
    const result = await sqlite.run('INSERT INTO t_repeat(create_at, type, update_at) VALUES(?, ?, ?)', [
      dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss'),
      type,
      dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss')
    ]);
    return await this.get(result.lastID);
  }

  async delete(id) {
    const { logger, sqlite } = this.app;

    await sqlite.run('DELETE FROM t_repeat WHERE id = ?', [id]);
    logger.info(`删除t_repeat表中id列为${id}的行`);
  }

  async get(id) {
    const { app } = this;
    const { sqlite } = app;

    const row = await sqlite.get('SELECT * FROM t_repeat WHERE id = ?', [id]);
    return new Repeat(row);
  }

  async put(repeat) {
    const { app } = this;
    const { sqlite } = app;

    await sqlite.run('UPDATE t_repeat SET type = ?, update_at = ? WHERE id = ?', [
      repeat.type,
      dateFormat(Date.now(), 'yyyy-mm-dd HH:MM:ss'),
      repeat.id,
    ]);
  }
}

module.exports = RepeatService;
