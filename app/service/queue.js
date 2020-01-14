'use strict';

const Service = require('egg').Service;

class QueueService extends Service {
  async getScore(member) {
    const { redis } = this.app;

    const key = [ 'cuckoo', 'task', 'queue' ].join(':');
    const score = await redis.zscore(key, member);
    return score ? parseInt(score) : score;
  }

  async list() {
    const { app } = this;
    const { redis } = app;

    const key = [ 'cuckoo', 'task', 'queue' ].join(':');
    const stop = await redis.zcard(key);
    const memberScores = await redis.zrange(key, 0, stop, 'WITHSCORES');
    const messages = [];
    for (let i = 0; i < memberScores.length; i += 2) {
      messages.push({
        member: parseInt(memberScores[i]),
        score: parseInt(memberScores[i + 1]),
      });
    }
    return messages;
  }

  async poll() {
    const { app } = this;
    const { redis } = app;

    const key = [ 'cuckoo', 'task', 'queue' ].join(':');
    const max = Math.round(Date.now() / 1000);
    const messages = await redis.zrangebyscore(key, 0, max, 'LIMIT', 0, 1);
    if (messages.length === 0) {
      return null;
    }
    const member = messages[0];
    const score = await redis.zscore(key, member);
    await redis.zrem(key, member);
    return {
      member,
      score,
    };
  }

  async remove(message) {
    const { logger, redis } = this.app;

    const key = [ 'cuckoo', 'task', 'queue' ].join(':');
    await redis.zrem(key, message);
    logger.info(`删除Redis中有序集合${key}中的member ${message}`);
  }

  async send(message, consumeUntil) {
    const { app } = this;
    const { redis } = app;

    const key = [ 'cuckoo', 'task', 'queue' ].join(':');
    const member = message;
    const score = consumeUntil;
    await redis.zadd(key, score, member);
  }
}

module.exports = QueueService;
