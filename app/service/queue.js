const Service = require('egg').Service;
const sqlite3 = require('sqlite3').verbose();

const path = require('path');

const FILE_NAME = path.resolve(__dirname, '../../run/cuckoo.db');

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
    const db = this._getDb();
    return new Promise((resolve, reject) => {
      db.get('SELECT next_trigger_time FROM task_queue WHERE task_id = ?', [member], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row && row.next_trigger_time);
        }
      });
    });
  }

  async list() {
    const db = this._getDb();
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM task_queue', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(({ next_trigger_time, task_id }) => {
            return {
              member: task_id,
              score: next_trigger_time
            };
          }));
        }
      });
    });
  }

  /**
   * 取出第一个待处理的任务
   */
  async poll() {
    const db = this._getDb();
    const max = Math.round(Date.now() / 1000);
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM task_queue WHERE next_trigger_time < ? ORDER BY next_trigger_time ASC LIMIT 1', [max], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          db.run('DELETE FROM task_queue WHERE id = ?', [row.id], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve({
                member: row.task_id,
                score: row.next_trigger_time
              });
            }
          })
        }
      });
    });
  }

  /**
   * @param {number} message - 任务ID
   */
  async remove(message) {
    const db = this._getDb();
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM task_queue WHERE task_id = ?', [message], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * @param {number} message - 任务ID
   * @param {number} consumeUntil - 下一次被触发的时刻
   */
  async send(message, consumeUntil) {
    const db = this._getDb();
    const oldRow = await this._getTask(message);
    if (oldRow) {
      return new Promise((resolve, reject) => {
        db.run('UPDATE task_queue SET next_trigger_time = ? WHERE task_id = ?', [consumeUntil, message], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        db.run('INSERT INTO task_queue(create_at, next_trigger_time, task_id, update_at) VALUES(?, ?, ?, ?)', [Date.now(), consumeUntil, message, Date.now()], (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }

  /**
   * @param {number} taskId - 任务ID
   */
  async _getTask(taskId) {
    const db = this._getDb();
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM task_queue WHERE task_id = ?', [taskId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      })
    });
  }

  _getDb() {
    if (!this.db) {
      this._init();
    }
    return this.db;
  }

  _init() {
    if (this.hasInit) {
      return;
    }
    this.db = new sqlite3.Database(FILE_NAME);
    this.hasInit = true;
  }
}

module.exports = SqliteQueueService;
