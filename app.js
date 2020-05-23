const sqlite3 = require('sqlite3').verbose();

class MySQLite {
  constructor(db) {
    this.db = db;
  }

  async all(sql, values) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, values, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async get(sql, values) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, values, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async run(sql, values) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }
}

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async configDidLoad() {
    const fileName = this.app.config.sqlite.db.path;
    // 初始化SQLite连接
    const db = new sqlite3.Database(fileName);
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
    this.app.sqlite = new MySQLite(db);
  }
}

module.exports = AppBootHook;
