'use strict';

const Controller = require('egg').Controller;

class TaskController extends Controller {
  async create() {
    const { ctx, service } = this;
    const { request: { body } } = ctx;

    // TODO: 添加对参数的校验
    const { brief, context_id, detail = '', device, icon, icon_file, remind_id } = body;

    const task = await service.task.create({
      brief,
      context_id,
      detail,
      device,
      icon,
      icon_file,
      remind_id,
    });

    ctx.body = {
      task,
    };
    ctx.status = 201;
  }

  async delete() {
    const { ctx, service } = this;
    const { params } = ctx;

    const { id } = params;

    await service.task.delete(id);

    ctx.body = '';
    ctx.status = 204;
  }

  async duplicate() {
    const { ctx, service } = this;
    const { params } = ctx;

    const { id } = params;

    let task = await service.task.get(id);
    if (!task) {
      throw new Error(`任务${id}不存在`);
    }

    task = await service.task.duplicate(task);

    ctx.body = {
      task
    };
  }

  async get() {
    const { ctx, service } = this;
    const { params } = ctx;

    const { id } = params;

    const task = await service.task.get(id);

    ctx.body = {
      task,
    };
  }

  async getFollowing() {
    const { ctx, logger, service } = this;
    const { query } = ctx;

    const { contextId } = query;
    let context;
    if (contextId === 'all') {
      context = null;
    } else if (typeof contextId === 'string') {
      context = await service.context.get(parseInt(contextId));
    } else {
      const currentContextName = await service.context.getCurrent();
      logger.info(`使用当前场景名${currentContextName}搜索场景对象`);
      context = (await service.context.search({
        name: currentContextName,
      }))[0];
    }

    const tasks = await service.task.getFollowing(context);

    ctx.body = {
      tasks,
    };
  }

  async search() {
    const { ctx, service } = this;
    const { query } = ctx;

    const { brief, context_id, detail } = query;
    const { sort = 'create_at:desc' } = query;
    const { state } = query;
    const tasks = await service.task.search({
      brief,
      context_id,
      detail,
      sort,
      state,
    });

    ctx.body = {
      tasks,
    };
    ctx.set('Access-Control-Allow-Origin', '*');
  }

  async remind() {
    const { ctx, service } = this;
    const { params } = ctx;

    const { id } = params;

    await service.task.remind(id, Math.round(Date.now() / 1000));

    ctx.body = '';
    ctx.status = 204;
  }

  async sync() {
    const { ctx, logger, service } = this;

    const messages = await service.queue.list();
    logger.info(`当前的延迟消息数为${messages.length}`);
    for (const { member: id } of messages) {
      const task = await service.task.get(id);
      if (task.state !== 'active') {
        logger.info(`任务${id}不是活跃状态，应当从延迟队列中移除`);
        await service.queue.remove(id);
      }
    }
    const tasks = await service.task.search({
      state: 'active',
    });
    for (const task of tasks) {
      if (!task.remind) {
        logger.info(`任务${task.id}处于活跃状态但没有设定提醒时间`);
        continue;
      }
      const { remind } = task;
      const score = await service.queue.getScore(task.id);
      let { repeat, timestamp } = remind;
      if (repeat && timestamp * 1000 < Date.now()) {
        timestamp = Math.round(repeat.nextTimestamp(timestamp * 1000) / 1000);
      }
      if (!score) {
        logger.info(`将任务${task.id}补充到延迟队列中`);
        await service.queue.send(task.id, timestamp);
      } else if (score !== timestamp) {
        logger.info(`调整任务${task.id}在延迟队列中的提醒时间，从${score}调整为${timestamp}`);
        await service.queue.send(task.id, timestamp);
      }
    }

    ctx.body = '';
    ctx.status = 204;
  }

  async update() {
    const { ctx, service } = this;
    const { params, request: { body } } = ctx;

    const { id } = params;
    const changes = {};
    if (typeof body.brief === 'string') {
      changes.brief = body.brief;
    }
    if (body.context_id === null) {
      changes.context = null;
    } else if (typeof body.context_id === 'number') {
      changes.context = await service.context.get(body.context_id);
    }
    if (typeof body.detail === 'string') {
      changes.detail = body.detail;
    }
    if (typeof body.device === 'string') {
      changes.device = body.device;
    }
    if (body.icon === null || typeof body.icon === 'string') {
      changes.icon = body.icon;
    }
    if (body.icon_file === null || typeof body.icon_file === 'string') {
      changes.icon_file = body.icon_file;
    }
    if (body.remind_id === null) {
      changes.remind = null;
    } else if (typeof body.remind_id === 'number') {
      changes.remind = await service.remind.get(body.remind_id);
    }
    if (typeof body.state === 'string') {
      changes.state = body.state;
    }

    const task = await service.task.get(id);
    try {
      task.patch(changes);
    } catch (e) {
      ctx.body = e.message;
      ctx.status = 400;
      return;
    }
    await service.task.put(task);

    if (body.state === 'done') {
      await service.queue.remove(id);
    }

    ctx.body = '';
    ctx.status = 204;
  }

  async updateIcon() {
    const { ctx } = this;
    const { params, service } = ctx;

    const { id } = params;

    const stream = await ctx.getFileStream();
    const {
      icon,
      iconFile,
    } = await service.icon.writeIconFile(stream);

    const task = await service.task.get(id);
    task.patch({
      icon,
      icon_file: iconFile,
    });
    await service.task.put(task);

    ctx.body = '';
    ctx.status = 204;
  }
}

module.exports = TaskController;
