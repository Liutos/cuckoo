/**
 * 与图标有关的功能
 */
'use strict';

const Controller = require('egg').Controller;

const fs = require('fs');
const path = require('path');

class ContextController extends Controller {
  async uploadFile() {
    const { ctx } = this;

    const stream = await ctx.getFileStream();
    const dir = path.resolve(__dirname, '../public/icon/');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const target = path.resolve(dir, stream.filename);
    stream.pipe(fs.createWriteStream(target));
    await new Promise(resolve => {
      stream.on('end', () => {
        resolve();
      });
    });

    ctx.body = {
      target
    };
  }
}

module.exports = ContextController;
