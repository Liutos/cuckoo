'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/remind.test.js', () => {
  let remind = null;

  after(async () => {
    const ctx = app.mockContext();
    await ctx.service.remind.delete(remind.id);
  });

  it('创建提醒', async function () {
    app.mockCsrf();
    const response = await app.httpRequest()
      .post('/remind')
      .send({
        duration: null,
        repeat_type: 'daily',
        timestamp: 1596631200,
      })
      .expect(201);

    const { body } = response;
    assert(body);
    assert(body.remind);
    remind = body.remind;
    assert(body.remind.repeat);
    assert(body.remind.repeat.type === 'daily');
    assert(body.remind.timestamp === 1596631200);
  });
});
