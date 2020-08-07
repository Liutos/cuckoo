'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/task.test.js', () => {

  it('创建任务', async function () {
    app.mockCsrf();
    const response = await app.httpRequest()
      .post('/task')
      .send({
        brief: 'test',
        detail: '',
        device: null,
        remind_id: 2912,
      })
      .expect(201);

    const { body } = response;
    assert(body);
    assert(body.task);
  });
});
