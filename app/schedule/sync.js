/**
 * 调用/task/sync接口，在数据库和队列间同步待提醒的任务。
 */
'use strict';

module.exports = app => {
  return {
    schedule: {
      cron: app.config.schedule.sync.cron,
      type: 'worker',
    },
    async task(ctx) {
      const { logger } = ctx;
      const { port } = app;
      await ctx.curl(`http://localhost:${port}/task/sync`, {
        method: 'POST'
      });
      logger.info('任务同步完毕。');
    }
  };
};
