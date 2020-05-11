const Service = require('egg').Service;

class SqliteQueueService extends Service {
  constructor(ctx) {
    super(ctx);
    this.db = null;
    this.hasInit = false;
  }

  /**
   * @param {number} member - 任务ID
   */
  async getScore(member) {
    const { sqlite } = this.app;
    const row = await sqlite.get('SELECT next_trigger_time FROM task_queue WHERE task_id = ?', [member]);
    return row && row.next_trigger_time;
  }

  async list() {
    const { sqlite } = this.app;
    const rows = await sqlite.all('SELECT * FROM task_queue ORDER BY next_trigger_time ASC', []);
    return rows.map(({ next_trigger_time, task_id }) => {
      return {
        member: task_id,
        score: next_trigger_time
      };
    });
  }

  /**
   * 取出第一个待处理的任务
   */
  async poll() {
    const { sqlite } = this.app;
    const max = Math.round(Date.now() / 1000);
    const row = await sqlite.get('SELECT * FROM task_queue WHERE next_trigger_time < ? ORDER BY next_trigger_time ASC LIMIT 1', [max]);
    if (!row) {
      return null;
    }
    await sqlite.run('DELETE FROM task_queue WHERE id = ?', [row.id]);
    return {
      member: row.task_id,
      score: row.next_trigger_time
    };
  }

  /**
   * @param {number} message - 任务ID
   */
  async remove(message) {
    const { sqlite } = this.app;
    await sqlite.run('DELETE FROM task_queue WHERE task_id = ?', [message]);
  }

  /**
   * @param {number} message - 任务ID
   * @param {number} consumeUntil - 下一次被触发的时刻
   */
  async send(message, consumeUntil) {
    const { sqlite } = this.app;
    const oldRow = await this._getTask(message);
    if (oldRow) {
      await sqlite.run('UPDATE task_queue SET next_trigger_time = ? WHERE task_id = ?', [consumeUntil, message]);
    } else {
      await sqlite.run('INSERT INTO task_queue(create_at, next_trigger_time, task_id, update_at) VALUES(?, ?, ?, ?)', [Date.now(), consumeUntil, message, Date.now()]);
    }
  }

  /**
   * @param {number} taskId - 任务ID
   */
  async _getTask(taskId) {
    const { sqlite } = this.app;
    return await sqlite.get('SELECT * FROM task_queue WHERE task_id = ?', [taskId]);
  }
}

module.exports = SqliteQueueService;
