'use strict';

const Controller = require('egg').Controller;
const Joi = require('@hapi/joi');

class TaskController extends Controller {
  /**
   * 快捷创建任务的API
   */
  async create() {
    const { ctx, service } = this;
    const { request: { body } } = ctx;

    const schema = Joi.object({
      brief: Joi.string().required(),
      contextName: Joi.string(),
      dateTime: Joi.string().required().pattern(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/),
      detail: Joi.string().allow(''),
      repeatType: Joi.string()
    });
    await schema.validateAsync(body);

    // 检查contextName是否存在
    let context = null;
    if (body.contextName) {
      context = (await service.context.search({
        name: body.contextName
      }))[0];
      if (!context) {
        throw new Error(`无效的场景名称：${body.contextName}`);
      }
    }
    // 再创建任务
    const taskMaterial = {
      brief: body.brief,
      detail: body.detail
    };
    if (context) {
      taskMaterial.context_id = context.id;
    }
    const task = await service.task.create(taskMaterial);
    // 最后创建提醒
    const remindMaterial = {
      repeatType: body.repeatType,
      taskId: task.id,
      timestamp: Math.trunc(new Date(body.dateTime).getTime() / 1000)
    };
    await service.remind.create(remindMaterial);

    ctx.body = {
      data: {
        task: await service.task.get(task.id)
      }
    };
    ctx.status = 201;
  }
}

module.exports = TaskController;
