'use strict';

module.exports = app => {
  return {
    schedule: {
      interval: app.config.schedule.poll.interval,
      type: 'worker',
    },
    async task(ctx) {
      const { service } = ctx;

      let message = await service.queue.poll();
      while (message) {
        const {
          remind_id: remindId,
          score: alarmAt,
        } = message;
        const remind = await service.remind.get(remindId);
        setImmediate(async () => {
          await service.task.remind(remind.taskId, alarmAt, remind);
        });
        message = await service.queue.poll();
      }
    }
  };
};
