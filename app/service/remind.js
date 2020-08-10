'use strict';

const Reminder = require('../lib/reminder');

const Service = require('egg').Service;

class RemindService extends Service {
  async close(id) {
    const remind = await this.get(id);
    remind.close();
    await this.put(remind);
  }

  async create({ duration, repeat_id, restricted_hours, restrictedWdays, timestamp }) {
    return await this.ctx.service.remindRepository.create({ duration, repeat_id, restricted_hours, restrictedWdays, timestamp });
  }

  async delete(id) {
    await this.ctx.service.remindRepository.delete(id);
  }

  async duplicate(remind) {
    const { service } = this;

    let repeatId = null;
    if (remind.repeat) {
      const repeat = await service.repeat.duplicate(remind.repeat);
      repeatId = repeat.id;
    }

    return await this.create(Object.assign({}, remind, {
      repeat_id: repeatId
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

    const { restricted_hours, restrictedWdays } = remind;
    const { taskId } = options;
    const alarmHour = new Date().getHours();
    if (Array.isArray(restricted_hours) && restricted_hours[alarmHour] === 0) {
      logger.info(`任务${taskId}的restricted_hours为${restricted_hours}`);
      logger.info(`任务${taskId}的alarmHour为${alarmHour}`);
      logger.info(`当前小时${alarmHour}不在任务${taskId}的restricted_hours指定的有效范围内，不需要弹出提醒`);
      return null;
    }
    const alarmDay = new Date().getDay();
    if (Array.isArray(restrictedWdays) && restrictedWdays[alarmDay] === 0) {
      logger.info(`任务${taskId}的restrictedWdays为${restrictedWdays}`);
      logger.info(`任务${taskId}的alarmDay为${alarmDay}`);
      logger.info(`今天${alarmDay}不在任务${taskId}的restrictedWdays指定的有效范围内，不需要弹出提醒`);
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
    return Reminder.create(type).notify(Object.assign({}, options, {
      duration: remind.duration,
    }));
  }

  async put(remind) {
    await this.ctx.service.remindRepository.put(remind);
  }
}

module.exports = RemindService;
