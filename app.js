const sqlite3 = require('sqlite3').verbose();

const path = require('path');

const FILE_NAME = path.resolve(__dirname, './run/cuckoo.db');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async configDidLoad() {
    // 初始化SQLite连接
    const db = new sqlite3.Database(FILE_NAME);
    db.get('select name from sqlite_master where type=\'table\'', [], (err, row) => {
      if (err) {
        throw err;
      } else if (!row) {
        // 建表
        const createTableSQL = 'CREATE TABLE task_queue (\n      create_at INTEGER,\n      id INTEGER PRIMARY KEY,\n      next_trigger_time INTEGER,\n      task_id INTEGER,\n      update_at INTEGER\n    )';
        this.db.run(createTableSQL, [], (err) => {
          if (err) {
            throw err;
          }
          // 创建索引
          const createIndexSQL = 'CREATE INDEX ntt ON task_queue(next_trigger_time)';
          this.db.run(createIndexSQL, [], (err) => {
            if (err) {
              throw err;
            }
          });
        });
      }
    });
    this.app.sqlite = db;
  }
}

module.exports = AppBootHook;
