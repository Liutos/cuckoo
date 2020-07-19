'use strict';

const fs = require('fs');
const path = require('path');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async configDidLoad() {
    // 确保用于存放图标的目录存在
    const dir = path.resolve(__dirname, './app/public/icon/');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }

  /**
   * 只有在willReady，即插件启动后，才可以使用app.sqlite。
   * @see {@link https://eggjs.org/zh-cn/advanced/loader.html#life-cycles}
   */
  async willReady() {
    const { logger, sqlite } = this.app;

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
