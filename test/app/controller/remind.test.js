'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/remind.test.js', () => {

  it('创建提醒', async function () {
    app.mockCsrf();
    const response = await app.httpRequest()
      .post('/remind')
      .send({
        duration: null,
        repeat_type: null,
        timestamp: 1596631200,
      })
      .expect(201);

    const { body } = response;
    assert(body);
    assert(body.remind);
    assert(body.remind.timestamp === 1596631200);
  });
});
