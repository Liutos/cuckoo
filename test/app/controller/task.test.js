'use strict';

const { app, assert } = require('egg-mock/bootstrap');

let taskId = null;

describe('test/app/controller/task.test.js', () => {
  it('创建任务', async function () {
    app.mockCsrf();
    const response = await app.httpRequest()
      .post('/task')
      .send({
        brief: 'test',
        detail: '',
        device: null
      })
      .expect(201);

    const { body } = response;
    assert(body);
    assert(body.task);
    taskId = body.task.id;
  });

  it('更新任务', async function () {
    app.mockCsrf();
    await app.httpRequest()
      .patch(`/task/${taskId}`)
      .send({
        detail: ''
      })
      .expect(204);
  });
});
