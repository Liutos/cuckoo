'use strict';

const Controller = require('egg').Controller;

class QueueController extends Controller {
  /**
   * 遍历task_queue中的记录，为每一行补充remind_id，并且为每一个remind补充task_id。
   */
  async fillRemindId() {
    const { ctx, service } = this;
    const { logger } = ctx;

    const reservations = await service.queue.list();
    for (const reservation of reservations) {
      let {
        member: taskId,
        remind_id: remindId,
        score: consumeUntil
      } = reservation;
      // 如果这一行没有remind_id，就先补充remind_id。
      // remind_id来自于任务的remind_id列。
      if (!remindId) {
        const task = await service.task.get(taskId);
        remindId = task.remind.id;
        await service.queue.send(taskId, consumeUntil, remindId);
        logger.info(`往队列中的任务${taskId}中写入了提醒的ID ${remindId}`);
      } else {
        logger.info(`任务${taskId}中已存在提醒ID ${remindId}`);
      }
      // 如果remind中也没有任务的ID，就补充进去。
      const remind = await service.remind.get(remindId);
      if (!remind.taskId) {
        remind.patch({
          taskId
        });
        await service.remind.put(remind);
        logger.info(`往提醒${remindId}中写入了任务的ID ${taskId}`);
      } else {
        logger.info(`提醒${remindId}中已存在任务ID ${taskId}`);
      }
    }

    ctx.body = '';
    ctx.status = 204;
  }

  async poll() {
    const { ctx, service } = this;

    const message = await service.queue.poll();

    ctx.body = {
      message,
    };
  }

  async send() {
    const { ctx, service } = this;
    const { request: { body } } = ctx;

    ctx.validate({
      consumeUntil: { type: 'int' },
      message: { type: 'string' },
    });
    const { consumeUntil, message } = body;

    await service.queue.send(message, consumeUntil);

    ctx.body = '';
    ctx.status = 204;
  }
}

module.exports = QueueController;
