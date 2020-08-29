'use strict';

const Controller = require('egg').Controller;
const Joi = require('@hapi/joi');

class RemindController extends Controller {
  async close() {
    const { ctx, service } = this;
    const { params } = ctx;

    const { id } = params;

    await service.remind.close(id);

    ctx.body = '';
    ctx.status = 204;
  }

  async create() {
    const { ctx, service } = this;
    const { request: { body } } = ctx;

    const schema = Joi.object({
      duration: [Joi.number(), null],
      repeat_type: [Joi.string(), null],
      restricted_hours: Joi.array().items(Joi.number()).length(24),
      restrictedWdays: Joi.array().items(Joi.number()).length(24),
      timestamp: Joi.number().required(),
    });
    await schema.validateAsync(body);

    const { duration, repeat_type, restricted_hours, restrictedWdays, timestamp } = body;

    const remind = await service.remind.create({
      duration,
      repeatType: repeat_type,
      restricted_hours,
      restrictedWdays,
      timestamp,
    });

    ctx.body = {
      remind,
    };
    ctx.status = 201;
  }

  async get() {
    const { ctx, service } = this;
    const { params } = ctx;

    const { id } = params;

    const remind = await service.remind.get(id);

    ctx.body = {
      remind,
    };
  }

  async update() {
    const { ctx, service } = this;
    const { logger, params, request: { body } } = ctx;

    const schema = Joi.object({
      duration: [
        Joi.number(),
        null,
      ],
      repeat_type: Joi.string(),
      restricted_hours: [
        Joi.array().items(Joi.number()).length(24),
        null,
      ],
      restrictedWdays: [
        Joi.array().items(Joi.number()).length(24),
        null,
      ],
      timestamp: Joi.number(),
    });
    await schema.validateAsync(body);

    const { id } = params;
    const changes = {};
    if (body.duration === null || typeof body.duration === 'number') {
      changes.duration = body.duration;
    }
    if (body.restricted_hours === null) {
      changes.restricted_hours = null;
    } else if (Array.isArray(body.restricted_hours)) {
      changes.restricted_hours = body.restricted_hours;
    }
    if (body.restrictedWdays === null) {
      changes.restrictedWdays = null;
    } else if (Array.isArray(body.restrictedWdays)) {
      changes.restrictedWdays = body.restrictedWdays;
    }
    if (typeof body.timestamp === 'number') {
      changes.timestamp = body.timestamp;
    }

    const remind = await service.remind.get(id);
    if (remind.repeat) {
      if (body.repeat_type === null) {
        changes.repeat = null;
      } else if (typeof body.repeat_type === 'string') {
        remind.repeat.patch({ type: body.repeat_type });
      }
    }
    remind.patch(changes);
    await service.remind.put(remind);

    if (typeof body.timestamp === 'number') {
      const tasks = await service.task.search({
        remind_id: parseInt(id),
      });
      for (const task of tasks) {
        const consumeUntil = body.timestamp;
        await service.queue.send(task.id, consumeUntil, id);
        logger.info(`设置延时队列中的任务${task.id}在${consumeUntil}后才被消费`);
      }
    }

    ctx.body = '';
    ctx.status = 204;
  }
}

module.exports = RemindController;
