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
          member: id,
          score: alarmAt,
        } = message;
        setImmediate(async () => {
          await service.task.remind(id, alarmAt);
        });
        message = await service.queue.poll();
      }
    }
  };
};
