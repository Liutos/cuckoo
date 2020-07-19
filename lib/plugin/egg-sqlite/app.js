'use strict';

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

module.exports = app => {
  const { logger } = app;
  app.beforeStart(async () => {
    const fileName = app.config.sqlite.db.path;
    const db = new sqlite3.Database(fileName);
    logger.info(`Database file \`${fileName}\` loaded.`);
    const sqlite = new MySQLite(db);
    app.sqlite = sqlite;
    logger.info('`app.sqlite` mounted.');
  });
};
