'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/queue-sqlite.test.js', () => {

  it('往队列发送任务', async function () {
    const ctx = app.mockContext();
    await ctx.service.queueSqlite.send(1, 1577808000);
  });

  it('获取任务触发时刻', async function () {
    const ctx = app.mockContext();
    const score = await ctx.service.queueSqlite.getScore(1);
    assert(score === 1577808000);
  });

  it('列出任务', async function () {
    const ctx = app.mockContext();
    const memberScores = await ctx.service.queueSqlite.list();
    assert(Array.isArray(memberScores));
    assert(memberScores.length === 1);
    assert(memberScores[0].member === 1);
    assert(memberScores[0].score === 1577808000);
  });

  it('拉取任务', async function () {
    const ctx = app.mockContext();
    const memberScore = await ctx.service.queueSqlite.poll();
    assert(memberScore.member === 1);
    assert(memberScore.score === 1577808000);
  });

  it('再次拉取任务为空', async function () {
    const ctx = app.mockContext();
    const memberScore = await ctx.service.queueSqlite.poll();
    assert(!memberScore);
  });

  it('删除任务', async function () {
    const ctx = app.mockContext();
    await ctx.service.queueSqlite.remove(1);
  });
});
