'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/remind.test.js', () => {
  let remind1 = null;
  let remind2 = null;

  after(async () => {
    const ctx = app.mockContext();
    await ctx.service.remind.delete(remind1.id);
    await ctx.service.remind.delete(remind2.id);
  });

  before(async () => {
    const ctx = app.mockContext();
    // 创建一个指定日期和一个指定小时的提醒
    const restricted_hours = new Array(24);
    restricted_hours.fill(1, 0, 24);
    restricted_hours[new Date().getHours()] = 0;
    remind1 = await ctx.service.remind.create({
      restricted_hours,
      timestamp: Date.now()
    });
    const restrictedWdays = new Array(7);
    restrictedWdays.fill(1, 0, 7);
    restrictedWdays[new Date().getDay()] = 0;
    remind2 = await ctx.service.remind.create({
      restrictedWdays,
      timestamp: Date.now()
    });
  });

  it('不在指定小时内不弹出', async function () {
    const ctx = app.mockContext();
    const result = await ctx.service.remind.notify(remind1, {});
    assert(!result);
  });

  it('不在指定星期X内不弹出', async function () {
    const ctx = app.mockContext();
    const result = await ctx.service.remind.notify(remind2, {});
    assert(!result);
  });
});
