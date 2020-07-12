'use strict';

const Service = require('egg').Service;

const fs = require('fs');
const path = require('path');

class IconService extends Service {
  /**
   * 将文件流写入到项目的public/icon目录下的文件中
   * @param {*} stream - 以multipart/form-data方式上传的文件流
   * @return {string} icon文件的磁盘路径
   */
  async writeIconFile(stream) {
    const dir = path.resolve(__dirname, '../public/icon/');
    const target = path.resolve(dir, stream.filename);
    stream.pipe(fs.createWriteStream(target));
    return await new Promise(resolve => {
      stream.on('end', () => {
        resolve({
          icon: `http://localhost:7001/public/icon/${stream.filename}`,
          iconFile: target,
        });
      });
    });
  }
}

module.exports = IconService;
