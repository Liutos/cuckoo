'use strict';

const Service = require('egg').Service;

class ContextService extends Service {
  async create({ name }) {
    const { mysql } = this.app;

    const { insertId } = await mysql.insert('t_context', {
      create_at: new Date(),
      name,
      update_at: new Date(),
    });
    return await this.get(insertId);
  }

  async delete(id) {
    const { logger, mysql } = this.app;

    await mysql.delete('t_context', {
      id,
    });
    logger.info(`删除t_context表中id列为${id}的行`);
  }

  async get(id) {
    const { mysql } = this.app;

    return await mysql.get('t_context', {
      id,
    });
  }

  getCurrent() {
    // 根据配置加载不同的场景检测器来获取当前的场景
    const { config } = this.app;
    const contextDetectorName = config.context.detector;
    if (!contextDetectorName) {
      return '';
    }

    const clz = require(`../lib/contextDetector/${contextDetectorName}`);
    return clz.getCurrent();
  }

  async search(query) {
    const { mysql } = this.app;

    if (typeof query.sort !== 'string') {
      query.sort = 'id:desc';
    }

    const where = {};
    if (typeof query.name === 'string') {
      where.name = query.name;
    }
    return await mysql.select('t_context', {
      orders: [ query.sort.split(':') ],
      where,
    });
  }
}

module.exports = ContextService;
