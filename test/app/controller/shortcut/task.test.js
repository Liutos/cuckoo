'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/shortcut/task.test.js', () => {
  let context = null;
  let taskId = null;

  after(async () => {
    const ctx = app.mockContext();
    await ctx.service.context.delete(context.id);
    await ctx.service.task.delete(taskId);
  });

  before(async () => {
    const ctx = app.mockContext();
    context = await ctx.service.context.create({ name: 'test' });
  });

  it('便捷地创建任务', async function () {
    app.mockCsrf();
    const response = await app.httpRequest()
      .post('/shortcut/task')
      .send({
        brief: 'test',
        contextName: 'test',
        dateTime: '2020-08-13 08:06:00',
        detail: '',
        repeatType: 'daily'
      })
      .expect(201);

    const { body: { data: { task } } } = response;
    assert(task);
    taskId = task.id;
    assert(task.brief === 'test');
    assert(task.reminds[0].context);
    assert(task.reminds[0].context.name === 'test');
    assert(task.reminds[0]);
    assert(task.reminds[0].timestamp === Math.trunc(new Date('2020-08-13 08:06:00').getTime() / 1000));
    assert(task.reminds[0].repeat);
    assert(task.reminds[0].repeat.type === 'daily');
  });
});
