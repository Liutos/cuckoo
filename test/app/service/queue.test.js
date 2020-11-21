'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/queue.test.js', () => {
  before(async () => {
    await app.sqlite.run('DELETE FROM task_queue');
    console.log('Clear table task_queue.');
  });

  it('往队列发送任务', async function () {
    const ctx = app.mockContext();
    await ctx.service.queue.send(1, 1577808000, 1);
  });

  it('获取任务触发时刻', async function () {
    const ctx = app.mockContext();
    const score = await ctx.service.queue.getScore(1);
    assert(score === 1577808000);
  });

  it('列出任务', async function () {
    const ctx = app.mockContext();
    const memberScores = await ctx.service.queue.list();
    assert(Array.isArray(memberScores));
    assert(memberScores.length === 1);
    assert(memberScores[0].member === 1);
    assert(memberScores[0].score === 1577808000);
  });

  it('拉取任务', async function () {
    const ctx = app.mockContext();
    const memberScore = await ctx.service.queue.poll();
    assert(memberScore.member === 1);
    assert(memberScore.score === 1577808000);
  });

  it('再次拉取任务为空', async function () {
    const ctx = app.mockContext();
    const memberScore = await ctx.service.queue.poll();
    assert(!memberScore);
  });

  it('删除任务', async function () {
    const ctx = app.mockContext();
    await ctx.service.queue.remove(1);
  });
});
