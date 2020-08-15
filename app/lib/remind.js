'use strict';

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
    this.create_at = create_at;
    this.duration = duration;
    this.id = id;
    this.repeat = repeat;
    this.repeatType = repeat_type;
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

  patch(changes) {
    const FIELDS = [
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
