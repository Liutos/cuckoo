'use strict';

const { app, assert } = require('egg-mock/bootstrap');

// 先创建一个任务，再创建2个提醒，最后查出任务对象检查reminds字段。
describe('test/app/service/task.test.js', () => {
  let remind1 = null;
  let remind2 = null;
  let task = null;

  after(async () => {
    const ctx = app.mockContext();
    remind1 && await ctx.service.remind.delete(remind1.id);
    remind2 && await ctx.service.remind.delete(remind2.id);
    task && await ctx.service.task.delete(task.id);
  });

  it('创建任务', async function () {
    const ctx = app.mockContext();
    const _task = await ctx.service.task.create({
      brief: 'abc',
      detail: 'def',
      device: 'mobilePhone',
      icon: 'http://example.com',
      icon_file: '/tmp'
    });
    assert(_task);
    task = _task;
  });

  it('创建两个提醒', async () => {
    const ctx = app.mockContext();
    remind1 = await ctx.service.remind.create({
      duration: 30,
      repeatType: 'daily',
      taskId: task.id,
      timestamp: Date.now()
    });
    remind2 = await ctx.service.remind.create({
      duration: 30,
      repeatType: 'daily',
      taskId: task.id,
      timestamp: Date.now()
    });
    assert(remind1);
    assert(remind2);
  });

  it('查看任务', async () => {
    const ctx = app.mockContext();
    const _task = await ctx.service.task.get(task.id);
    assert(_task);
    assert(_task.reminds);
    assert(Array.isArray(_task.reminds));
    assert(_task.reminds.length === 2);
  });

  it('搜索任务', async () => {
    const ctx = app.mockContext();
    const _tasks = await ctx.service.task.search({
      id: task.id
    });
    assert(_tasks);
    assert(Array.isArray(_tasks));
    assert(_tasks.length === 1);
    assert(_tasks[0]);
    assert(Array.isArray(_tasks[0].reminds));
    assert(_tasks[0].reminds.length === 2);
  });

  it('修改任务', async () => {
    const ctx = app.mockContext();
    const brief = '改一下任务简述';
    task.patch({
      brief
    });
    await ctx.service.task.put(task);
    const _task = await ctx.service.task.get(task.id);
    assert(_task);
    assert(_task.brief === brief);
  });

  it('删除任务', async () => {
    const ctx = app.mockContext();
    await ctx.service.task.delete(task.id);
    const _task = await ctx.service.task.get(task.id);
    assert(!_task);
  });

  it('提醒也被一并删除了', async () => {
    const ctx = app.mockContext();
    const reminds = await ctx.service.remind.search({
      taskId: task.id
    });
    assert(Array.isArray(reminds));
    assert(reminds.length === 0);
  });
});
