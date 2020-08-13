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
    assert(task.context);
    assert(task.context.name === 'test');
    assert(task.remind);
    assert(task.remind.timestamp === new Date('2020-08-13 08:06:00').getTime());
    assert(task.remind.repeat);
    assert(task.remind.repeat.type === 'daily');
  });
});
