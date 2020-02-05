'use strict';

const Reminder = require('./reminder.js');

const leftPad = require('left-pad');
const shell = require('shelljs');

const ctxKey = Symbol();

class Remind {
  constructor(ctx, row) {
    const {
      create_at,
      duration,
      id,
      repeat,
      restricted_hours,
      timestamp,
      update_at,
    } = row;
    this[ctxKey] = ctx;
    this.create_at = create_at;
    this.duration = duration;
    this.id = id;
    this.repeat = repeat;
    this.restricted_hours = typeof restricted_hours === 'number' ? Remind.decodeHours(restricted_hours) : null;
    this.timestamp = timestamp;
    this.update_at = update_at;
  }

  close() {
    if (!this.repeat) {
      return;
    }
    const nextTimestamp = this.repeat.nextTimestamp(this.timestamp * 1000);
    this.timestamp = Math.round(nextTimestamp / 1000);
  }

  /**
   * @param {number[]} hours - 允许弹出通知的小时的数组表示
   * @return {number} - 将表示不同小时的数组转换后的正整数
   */
  static encodeHours(hours) {
    return parseInt(hours.reverse().join(''), 2);
  }

  /**
   * encodeHours的“反函数”
   * @param {number} hours - 以bitmap方式表示允许弹出通知的小时的数字
   * @return {number[]} - 以数组形式表达的允许弹出通知的小时
   */
  static decodeHours(hours) {
    return leftPad(hours.toString(2), 24, 0).split('').reverse()
      .map(c => {
        return c === '0' ? 0 : 1;
      });
  }

  getCtx() {
    return this[ctxKey];
  }

  /**
   * @param {Object} options
   * @param {string} [options.device] - 即将提醒的任务使用的设备
   * @param {number} options.taskId - 被触发提醒的任务的ID
   */
  async notify(options) {
    const alarmHour = new Date().getHours();
    if (Array.isArray(this.restricted_hours) && this.restricted_hours[alarmHour] === 0) {
      this.getCtx().logger.info(`任务${options.taskId}的restricted_hours为${this.restricted_hours}`);
      this.getCtx().logger.info(`任务${options.taskId}的alarmHour为${alarmHour}`);
      this.getCtx().logger.info(`当前小时${alarmHour}不在任务${options.taskId}的restricted_hours指定的有效范围内，不需要弹出提醒`);
      return null;
    }
    // 先发微信消息，起码不会卡住
    if (options.device === 'mobile phone') {
      try {
        await this.getCtx().service.serverChan.send({
          desp: options.detail,
          text: options.brief,
        });
      } catch (e) {
        this.getCtx().logger.warn(`向微信推送任务的消息失败：${e.message}`);
      }
    }
    const { type = 'applescript' } = this.getCtx().app.config.reminder || {};
    return Reminder.create(type).notify(Object.assign({}, options, {
      duration: this.duration
    }));
  }

  patch(changes) {
    const FIELDS = [
      'duration',
      'repeat',
      'restricted_hours',
      'timestamp',
    ];
    for (const field of FIELDS) {
      if (field in changes) {
        this[field] = changes[field];
      }
    }
    this.update_at = new Date();
  }
}

module.exports = Remind;
