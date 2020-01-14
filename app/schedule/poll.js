'use strict';

const Subscription = require('egg').Subscription;

class Poll extends Subscription {
  static get schedule() {
    return {
      interval: '1m',
      type: 'worker',
    };
  }

  async subscribe() {
    const { service } = this;

    let message = await service.queue.poll();
    while (message) {
      const {
        member: id,
        score: alarmAt,
      } = message;
      await service.task.remind(id, alarmAt);
      message = await service.queue.poll();
    }
  }
}

module.exports = Poll;
