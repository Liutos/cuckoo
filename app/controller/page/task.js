'use strict';

const Controller = require('egg').Controller;
const dateFormat = require('dateformat');

class TaskPageController extends Controller {
  async get() {
    const { ctx, service } = this;

    const id = parseInt(ctx.params.id);

    const task = await service.task.get(id);

    await ctx.render('page-task.nj', {
      brief: task.brief,
      contextName: task.context && task.context.name,
      detail: task.detail,
      icon: task.icon,
      reminds: [task.remind].map(remind => {
        return {
          readableTimestamp: dateFormat(remind.timestamp * 1000, 'yyyy-mm-dd HH:MM:ss'),
        };
      }),
    });
  }
}

module.exports = TaskPageController;
