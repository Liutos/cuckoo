'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/remind.test.js', () => {
  let context1 = null;
  let context2 = null;
  let remind = null;

  after(async () => {
    const ctx = app.mockContext();
    await ctx.service.context.delete(context1.id);
    await ctx.service.context.delete(context2.id);
    await ctx.service.remind.delete(remind.id);
  });

  before(async () => {
    const ctx = app.mockContext();
    context1 = await ctx.service.context.create({ name: 'TEST1' });
    context2 = await ctx.service.context.create({ name: 'TEST2' });
  });

  it('创建提醒', async function () {
    app.mockCsrf();
    const response = await app.httpRequest()
      .post('/remind')
      .send({
        contextId: context1.id,
        duration: null,
        repeat_type: 'daily',
        taskId: 123,
        timestamp: 1596631200,
      })
      .expect(201);

    const { body } = response;
    assert(body);
    assert(body.remind);
    remind = body.remind;
    assert(body.remind.context);
    assert(body.remind.context.id === context1.id);
    assert(body.remind.context.name === context1.name);
    assert(body.remind.repeat);
    assert(!body.remind.repeat.id);
    assert(!body.remind.repeatId);
    assert(body.remind.repeat.type === 'daily');
    assert(body.remind.repeatType === 'daily');
    assert(body.remind.taskId === 123);
    assert(body.remind.timestamp === 1596631200);
  });

  it('修改提醒的重复模式和场景', async () => {
    app.mockCsrf();
    await app.httpRequest()
      .patch(`/remind/${remind.id}`)
      .send({
        contextId: context2.id,
        repeat_type: 'weekly'
      })
      .expect(204);
  });

  it('查看提醒', async () => {
    app.mockCsrf();
    const response = await app.httpRequest()
      .get(`/remind/${remind.id}`)
      .expect(200);

    const { body: { remind: _remind } } = response;
    assert(_remind);
    assert(_remind.context);
    assert(_remind.context.id === context2.id);
    assert(_remind.context.name === context2.name);
    assert(_remind.repeat);
    assert(!_remind.repeat.id);
    assert(!_remind.repeatId);
    assert(_remind.repeat.type === 'weekly');
    assert(_remind.repeatType === 'weekly');
  });
});
