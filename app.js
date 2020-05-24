const sqlite3 = require('sqlite3').verbose();

const fs = require('fs');
const path = require('path');

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
    const { logger } = this.app;

    const fileName = this.app.config.sqlite.db.path;
    // 初始化SQLite连接
    const db = new sqlite3.Database(fileName);
    const sqlite = new MySQLite(db);
    this.app.sqlite = sqlite;

    // 检测表是否存在并创建
    const sqlFiles = fs.readdirSync(path.resolve(__dirname, './sql/sqlite/'));
    for (const sqlFile of sqlFiles) {
      const tableName = path.basename(sqlFile, '.sql');
      const isTableExist = await this._checkIsTableExist(tableName);
      if (!isTableExist) {
        const createStatement = fs.readFileSync(path.resolve(__dirname, './sql/sqlite/', sqlFile), 'utf-8');
        logger.info(`表${tableName}不存在，将会自动创建。`);
        await sqlite.run(createStatement, []);
      }
    }
  }

  async _checkIsTableExist(tableName) {
    const { sqlite } = this.app;
    const names = await sqlite.all('SELECT name FROM sqlite_master WHERE type = \'table\'', []);
    return names.find(({ name }) => name === tableName);
  }
}

module.exports = AppBootHook;
