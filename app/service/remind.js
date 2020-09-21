'use strict';

const Reminder = require('../lib/reminder');

const Service = require('egg').Service;

class RemindService extends Service {
  async close(id) {
    const remind = await this.get(id);
    remind.close();
    await this.put(remind);
  }

  async create({ contextId, duration, repeatType, restricted_hours, restrictedWdays, taskId, timestamp }) {
    const { service } = this;

    const remind = await this.ctx.service.remindRepository.create({ contextId, duration, repeatType, restricted_hours, restrictedWdays, taskId, timestamp });
    await service.queue.send(taskId, timestamp, remind.id);
    return remind;
  }

  async delete(id) {
    await this.ctx.service.remindRepository.delete(id);
  }

  async duplicate(remind, taskId) {
    return await this.create(Object.assign({}, remind, {
      taskId
    }));
  }

  async get(id) {
    return await this.ctx.service.remindRepository.get(id);
  }

  /**
   * @param {Object} options
   * @param {string} [options.device] - 即将提醒的任务使用的设备
   * @param {number} options.taskId - 被触发提醒的任务的ID
   */
  async notify(remind, options) {
    const { app, ctx: { logger }, service } = this;

    if (!remind.isExecutable(Date.now())) {
      return null;
    }
    // 先发微信消息，起码不会卡住
    if (options.device === 'mobilePhone') {
      try {
        await service.serverChan.send({
          desp: options.detail,
          text: options.brief,
        });
      } catch (e) {
        logger.warn(`向微信推送任务的消息失败：${e.message}`);
      }
    }
    const { type = 'applescript' } = app.config.reminder || {};
    return await Reminder.create(type, service.gateway.shell).notify(Object.assign({}, options, {
      duration: remind.duration,
    }));
  }

  async put(remind) {
    await this.ctx.service.remindRepository.put(remind);
  }

  async search(query) {
    const { service } = this;

    return await service.remindRepository.search(query);
  }
}

module.exports = RemindService;
