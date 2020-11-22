'use strict';

const Controller = require('egg').Controller;
const dateFormat = require('dateformat');

class TaskPageController extends Controller {
  async get() {
    const { ctx, service } = this;

    const id = parseInt(ctx.params.id);

    const task = await service.task.get(id);

    const contexts = await service.context.search({});
    // TODO: 这里应当有一个类专门负责生成render方法的第二个参数要求的对象。这里的对象就是一个view model，而这个类就是一个model->view model的转换工厂。
    await ctx.render('page-task.nj', {
      brief: task.brief,
      detail: task.detail,
      icon: task.icon,
      id: task.id,
      reminds: task.reminds.map(remind => {
        let { restricted_hours } = remind;
        if (!restricted_hours || restricted_hours.length === 0) {
          restricted_hours = [];
          for (let i = 0; i < 24; i++) {
            restricted_hours.push(0);
          }
        }
        const restrictedHours = restricted_hours.map((v, i) => {
          return {
            checked: v === 1,
            index: i,
            label: i < 10 ? `0${i}:00` : `${i}:00`
          };
        });
        return {
          contextName: remind.context && remind.context.name,
          contexts: contexts.map(context => {
            return {
              id: context.id,
              name: context.name,
              selected: remind.context && remind.context.id === context.id
            };
          }),
          duration: typeof remind.duration === 'number' ? remind.duration : null,
          id: remind.id,
          readableTimestamp: dateFormat(remind.timestamp * 1000, 'yyyy-mm-dd\'T\'HH:MM:ss'),
          repeatType: remind.repeat && remind.repeat.type,
          restrictedHours
        };
      }),
      states: [
        { name: '启用', selected: task.state === 'active', value: 'active' },
        { name: '已结束', selected: task.state === 'done', value: 'done' },
        { name: '未启用', selected: task.state === 'inactive', value: 'inactive' },
      ]
    });
  }
}

module.exports = TaskPageController;
