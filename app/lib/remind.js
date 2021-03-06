'use strict';

const Repeat = require('./repeat');

/**
 * @typedef {Object} Remind
 * @property {string} create_at - 该行的创建时刻
 * @property {number} duration - 提醒的持续展示时间，单位为秒
 * @property {number} id - 该行的主键
 * @property {Repeat} repeat - 提醒的重复模式，类型参见 {@link Repeat}
 * @property {number[]} restricted_hours - 允许该提醒弹出的小时（24小时制）
 * @property {number} timestamp - 弹出该提醒的具体时刻
 * @property {string} update_at - 该行的最后一次修改的时刻
 */

class Remind {
  /**
   * Create a remind.
   * @param {Object} row - 从数据库返回的一行
   * @param {number} row.context - 触发该提醒的场景对象
   * @param {string} row.create_at - 该行的创建时刻
   * @param {number} row.duration - 提醒的持续展示时间，单位为秒
   * @param {number} row.id - 该行的主键
   * @param {Repeat} row.repeat - 提醒的重复模式，类型参见 {@link Repeat}
   * @param {number[]} row.restricted_hours - 允许该提醒弹出的小时（24小时制）
   * @param {number|null} row.task_id - 该提醒所属的任务的ID
   * @param {number} row.timestamp - 弹出该提醒的具体时刻
   * @param {string} row.update_at - 该行的最后一次修改的时刻
   * @returns {Remind}
   */
  constructor(row) {
    const {
      context,
      create_at,
      duration,
      id,
      repeat,
      repeat_type,
      restricted_hours,
      restricted_wdays,
      task_id,
      timestamp,
      update_at,
    } = row;
    this.context = context;
    this.create_at = create_at;
    this.duration = duration;
    this.id = id;
    this.repeat = repeat;
    this.repeatType = repeat_type;
    if (typeof repeat_type === 'string') {
      this.repeat = new Repeat({ type: repeat_type });
    }
    this.restricted_hours = typeof restricted_hours === 'number' ? Remind.decodeHours(restricted_hours) : null;
    this.restrictedWdays = typeof restricted_wdays === 'number' ? Remind.decodeHours(restricted_wdays) : null;
    this.taskId = task_id;
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
    return parseInt([...hours].reverse().join(''), 2);
  }

  /**
   * encodeHours的“反函数”
   * @param {number} hours - 以bitmap方式表示允许弹出通知的小时的数字
   * @return {number[]} - 以数组形式表达的允许弹出通知的小时
   */
  static decodeHours(hours) {
    return hours.toString(2).padStart(24, 0).split('').reverse()
      .map(c => {
        return c === '0' ? 0 : 1;
      });
  }

  /**
   * 判断该提醒在指定的时刻是否需要触发。
   * @param {number} timestamp - 秒级单位的时间戳
   */
  isExecutable(timestamp) {
    const { restricted_hours, restrictedWdays } = this;
    const alarmHour = new Date(timestamp).getHours();
    if (Array.isArray(restricted_hours) && restricted_hours[alarmHour] === 0) {
      return false;
    }
    const alarmDay = new Date(timestamp).getDay();
    if (Array.isArray(restrictedWdays) && restrictedWdays[alarmDay] === 0) {
      return false;
    }
    return true;
  }

  isRepeated() {
    return !!this.repeat;
  }

  patch(changes) {
    const FIELDS = [
      'context',
      'duration',
      'repeat',
      'repeatType',
      'restricted_hours',
      'restrictedWdays',
      'taskId',
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
