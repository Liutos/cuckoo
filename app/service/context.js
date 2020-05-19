'use strict';

const Service = require('egg').Service;

class ContextService extends Service {
  async create({ name }) {
    return await this.ctx.service.contextRepository.create({ name });
  }

  async delete(id) {
    return await this.ctx.service.contextRepository.delete(id);
  }

  async get(id) {
    return await this.ctx.service.contextRepository.get(id);
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
    return await this.ctx.service.contextRepository.search(query);
  }
}

module.exports = ContextService;
