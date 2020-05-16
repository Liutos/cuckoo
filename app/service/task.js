'use strict';

const Task = require('../lib/task');

const Service = require('egg').Service;

class TaskService extends Service {
  async close(task) {
    const { service } = this;

    task.close();
    await this.put(task);
    if (task.isRepeated()) {
      task.activate();
      await this.put(task);
      await service.queue.send(task.id, task.remind.timestamp);
    }
  }

  async create({ brief, context_id, detail, device, icon, icon_file, remind_id }) {
    // const { app, service } = this;
    // const { mysql } = app;

    // const { insertId } = await mysql.insert('t_task', {
    //   brief,
    //   context_id,
    //   create_at: new Date(),
    //   detail,
    //   device,
    //   icon,
    //   icon_file,
    //   remind_id,
    //   state: 'active',
    //   update_at: new Date(),
    // });

    // const task = await this.get(insertId);

    // if (task.remind) {
    //   await service.queue.send(task.id, task.remind.timestamp);
    // }

    // return task;
    return await this.ctx.service.taskRepository.create({ brief, context_id, detail, device, icon, icon_file, remind_id });
  }

  async delete(id) {
    // const { app, logger, service } = this;
    // const { mysql } = app;

    // const task = await this.get(id);
    // if (task && task.remind) {
    //   await service.queue.remove(id);
    //   await service.remind.delete(task.remind.id);
    // }
    // await mysql.delete('t_task', {
    //   id,
    // });
    // logger.info(`删除t_task表中id列为${id}的行`);
    await this.ctx.service.taskRepository.delete(id);
  }

  async duplicate(task) {
    const { service } = this;

    let remindId = null;
    if (task.remind) {
      const remind = await service.remind.duplicate(task.remind);
      remindId = remind.id;
    }

    return await this.create(Object.assign({}, task, {
      detail: `复制自${task.id} ` + task.detail,
      remind_id: remindId
    }));
  }

  async get(id) {
    // const { app, ctx, service } = this;
    // const { mysql } = app;

    // const row = await mysql.get('t_task', {
    //   id,
    // });
    // if (!row) {
    //   return null;
    // }
    // if (row.context_id) {
    //   row.context = await service.context.get(row.context_id);
    // }
    // if (row.remind_id) {
    //   row.remind = await service.remind.get(row.remind_id);
    // }
    // return new Task(ctx, row);
    return await this.ctx.service.taskRepository.get(id);
  }

  /**
   * @param {Object} [context] - 场景
   */
  async getFollowing(context = null) {
    const { logger, service } = this;

    const messages = await service.queue.list();
    const tasks = [];
    for (const message of messages) {
      const {
        member: id,
        score: plan_alarm_at,
      } = message;
      const task = await this.get(id);
      if (task.state !== 'active') {
        logger.info(`任务${task.id}的状态为${task.state}，接下来不会弹出提醒`);
        continue;
      }
      if (context && task.context && task.context.id !== context.id) {
        logger.info(`任务${task.id}所要求的场景为${task.context.name}（${task.context.id}），与目标场景“${context.name}”（${context.id}）不符，接下来不会弹出提醒`);
        continue;
      }
      const hour = new Date(plan_alarm_at * 1000).getHours();
      const { remind } = task;
      if (remind && Array.isArray(remind.restricted_hours) && !remind.restricted_hours[hour]) {
        logger.info(`任务${task.id}在${hour}时不需要弹出提醒`);
        continue;
      }
      tasks.push({
        plan_alarm_at,
        task,
      });
    }
    return tasks;
  }

  async put(task) {
    // const { app, service } = this;
    // const { mysql } = app;

    // if (task.remind) {
    //   await service.remind.put(task.remind);
    // }
    // await mysql.update('t_task', {
    //   brief: task.brief,
    //   context_id: task.context && task.context.id,
    //   detail: task.detail,
    //   device: task.device,
    //   icon: task.icon,
    //   icon_file: task.icon_file,
    //   remind_id: task.remind ? task.remind.id : null,
    //   state: task.state,
    //   update_at: task.update_at,
    // }, {
    //   where: {
    //     id: task.id,
    //   },
    // });
    await this.ctx.service.taskRepository.put(task);
  }

  async remind(id, alarmAt) {
    const { logger, service } = this;

    logger.info(`开始处理任务${id}的提醒流程`);
    const currentContext = service.context.getCurrent();
    const task = await this.get(id);
    if (task.state !== 'active') {
      logger.info(`任务${id}没有被启用，不需要弹出提醒`);
    } else if (!task.context || currentContext === task.context.name) {
      await service.remindLog.create({
        plan_alarm_at: alarmAt,
        real_alarm_at: Math.round(Date.now() / 1000),
        task_id: id,
      });
      const result = await task.notify(alarmAt);
      const stdout = result && result.stdout;
      let rv;
      if (typeof stdout === 'string' && stdout.length > 0) {
        rv = JSON.parse(stdout);
      }
      // FIXME: 避免字符串常量重复出现在下一行以及remind.js中
      const pattern = /([0-9]+)分钟后再提醒/;
      if (rv && typeof rv.activationValue === 'string' && rv.activationValue.match(pattern)) {
        const matches = rv.activationValue.match(pattern);
        const minutes = parseInt(matches[0]);
        logger.info(`这里应当往Redis中写入一条${minutes}分钟后执行的任务`);
        if (task.remind) {
          await service.queue.send(task.id, Math.round(Date.now() / 1000) + minutes * 60);
        }
      } else if (rv && typeof rv.activationValue === 'string' && rv.activationValue.match(/8点时再提醒/)) {
        let consumeUntil = new Date().setHours(8, 0, 0, 0);
        while (consumeUntil < Date.now()) {
          consumeUntil += 12 * 60 * 60 * 1000;
        }
        await service.queue.send(task.id, Math.round(consumeUntil / 1000));
      } else if (rv && typeof rv.activationValue === 'string' && rv.activationValue.match(/([0-9]+)小时后再提醒/)) {
        const matches = rv.activationValue.match(/([0-9]+)小时后再提醒/);
        const hours = parseInt(matches[0]);
        logger.info(`这里应当往Redis中写入一条${hours}小时后执行的任务`);
        if (task.remind) {
          await service.queue.send(task.id, Math.round(Date.now() / 1000) + hours * 60 * 60);
        }
      } else {
        await this.close(task);
      }
    } else {
      logger.info(`当前场景（${currentContext}）与任务要求的场景（${task.context.name}）不一致，不需要弹出提醒`);
      await this.close(task);
    }
    logger.info(`任务${id}的提醒流程处理完毕`);
  }

  async search(query) {
    // const { app } = this;
    // const { logger, mysql } = app;

    // if (typeof query.sort !== 'string') {
    //   query.sort = 'id:desc';
    // }

    // const conditions = [ '1 = 1' ];
    // const values = [];
    // if (typeof query.brief === 'string') {
    //   conditions.push('brief LIKE ?');
    //   values.push(`%${query.brief}%`);
    // }
    // if (typeof query.context_id === 'string') {
    //   conditions.push('context_id = ?');
    //   values.push(query.context_id);
    // }
    // if (typeof query.detail === 'string') {
    //   conditions.push('detail LIKE ?');
    //   values.push(`%${query.detail}%`);
    // }
    // if (typeof query.state === 'string') {
    //   conditions.push('state = ?');
    //   values.push(query.state);
    // }
    // if (typeof query.remind_id === 'number') {
    //   conditions.push('remind_id = ?');
    //   values.push(query.remind_id);
    // }

    // const sql = 'SELECT `id` FROM `t_task` WHERE ' + conditions.join(' AND ');
    // logger.info(`即将被执行的SQL语句为：${sql}`);
    // logger.info('用于填充到SQL中的值为：', values);
    // const ids = await mysql.query(sql, values);
    // return await Promise.all(ids.map(async ({ id }) => {
    //   return await this.get(id);
    // }));
    return await this.ctx.service.taskRepository.search(query);
  }
}

module.exports = TaskService;
