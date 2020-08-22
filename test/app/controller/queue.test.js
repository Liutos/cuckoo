'use strict';

const Remind = require('../../../app/lib/remind');

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/queue.test.js', () => {
  it('补充提醒和任务ID', async function () {
    app.mockCsrf();
    app.mockService('queue', 'list', () => {
      return [{
        member: 1,
        remind_id: null,
        score: 3
      }];
    });
    app.mockService('queue', 'send', (taskId, consumeUntil, remindId) => {
      assert(taskId === 1);
      assert(consumeUntil === 3);
      assert(remindId === 2);
    });
    app.mockService('remind', 'get', id => {
      return new Remind({
        id,
        taskId: null
      });
    });
    app.mockService('remind', 'put', remind => {
      assert(remind.taskId === 1);
    });
    app.mockService('task', 'get', id => {
      return {
        id,
        remind: {
          id: 2
        }
      };
    });
    await app.httpRequest()
      .put('/queue/fill-remind-id')
      .expect(204);
  });
});
