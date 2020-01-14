'use strict';

const dateMath = require('date-arithmetic');

const ctxKey = Symbol();

class Repeat {
  constructor(ctx, row) {
    const {
      create_at,
      id,
      type,
      update_at,
    } = row;
    this[ctxKey] = ctx;
    this.create_at = create_at;
    this.id = id;
    // TODO: 检查type是否为合法的字符串
    this.type = type;
    this.update_at = update_at;
  }

  getCtx() {
    return this[ctxKey];
  }

  /**
   * @param {number} current - 作为计算起点的当前时间戳，单位为毫秒
   * @return {number} 按照这个重复模式迭代的下一个时刻的时间戳
   */
  nextTimestamp(current) {
    const now = Date.now();
    const type = this.type;
    let nextTime = current;
    do {
      if (type === 'daily') {
        nextTime += 24 * 60 * 60 * 1000;
      } else if (type === 'end_of_month') {
        // 先算出2个月后的日期，再通过setDate回到上一个月的最后一天
        const twoMonthLater = dateMath.add(new Date(current), 2, 'month');
        nextTime = new Date(twoMonthLater.getTime()).setDate(0);
      } else if (type === 'hourly') {
        nextTime += 60 * 60 * 1000;
      } else if (type === 'minutely') {
        nextTime += 60 * 1000;
      } else if (type === 'monthly') {
        const nextDate = dateMath.add(new Date(current), 1, 'month');
        nextTime = nextDate.getTime();
      } else if (type === 'weekly') {
        nextTime += 7 * 24 * 60 * 60 * 1000;
      } else if (type === 'yearly') {
        const nextDate = dateMath.add(new Date(current), 1, 'year');
        nextTime = nextDate.getTime();
      } else if (type.match(/^every_[0-9]+_days$/)) {
        const nDays = parseInt(type.match(/^every_([0-9]+)_days$/)[1]);
        nextTime += nDays * 24 * 60 * 60 * 1000;
      } else if (type.match(/^every_[0-9]+_hours$/)) {
        const nHours = parseInt(type.match(/^every_([0-9]+)_hours$/)[1]);
        nextTime += nHours * 60 * 60 * 1000;
      }
    } while (nextTime < now);
    return nextTime;
  }

  patch(changes) {
    const FIELDS = [
      'type',
    ];
    for (const field of FIELDS) {
      if (field in changes) {
        this[field] = changes[field];
      }
    }
    this.update_at = new Date();
  }
}

module.exports = Repeat;
