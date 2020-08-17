'use strict';

const Reminder = require('../../../../app/lib/reminder');

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/service/queue.test.js', () => {
  it('使用alerter弹出提醒', async () => {
    app.mockService('gateway.shell', 'exec', command => {
      assert(typeof command === 'string');
      assert(command.includes('-appIcon jkl'));
      assert(command.includes('持续展示210秒'));
      assert(command.includes('-timeout 210'));
      assert(command.includes('-title \'abc\''));
    });
    const ctx = app.mockContext();
    await Reminder.create('alerter', ctx.service.gateway.shell).notify({
      alarmAt: Date.now(),
      brief: 'abc',
      detail: 'def',
      device: 'ghi',
      duration: 210,
      icon: 'jkl',
      taskId: 543
    });
  });
});
