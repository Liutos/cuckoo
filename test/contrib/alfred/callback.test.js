
'use strict';

const { assert } = require('egg-mock/bootstrap');
const shell = require('shelljs');

const path = require('path');
const querystring = require('querystring');

// node解释器的路径可以从命令行参数中提取
const program = process.argv[0];

async function runScript(name, args) {
  return await new Promise(resolve => {
    const script = path.resolve(__dirname, `../../../contrib/alfred/${name}.js`);
    const command = `${program} ${script} ${args}`;
    shell.exec(command, { silent: true }, (code, stdout) => {
      resolve(stdout);
    });
  });
}

describe('test/contrib/alfred/callback.test.js', () => {
  it('创建1分钟后的提醒', async () => {
    // 用命令行来运行callback.js文件，并捕获它的输出来进行校验
    const stdout = await runScript('callback', '1 test');
    const data = JSON.parse(stdout);
    assert(Array.isArray(data.items));
    const { items: [{ arg, title }, { title: dateTime }] } = data;
    assert(typeof arg === 'string');
    const query = querystring.parse(arg, ';');
    assert(query.delayMinutes === '1');
    assert(title === 'test');
    assert(dateTime === '1分钟后提醒');
  });

  it('创建今天12:34分的提醒', async () => {
    // 用命令行来运行callback.js文件，并捕获它的输出来进行校验
    const stdout = await runScript('callback', '12:34 test');
    const data = JSON.parse(stdout);
    assert(Array.isArray(data.items));
    const { items: [{ arg, title }] } = data;
    assert(typeof arg === 'string');
    const query = querystring.parse(arg, ';');
    const date = new Date(parseInt(query.timestamp));
    assert(date.getHours() === 12);
    assert(date.getMinutes() === 34);
    assert(title === 'test');
  });

  it('创建明天12:34分的提醒', async () => {
    // 用命令行来运行callback.js文件，并捕获它的输出来进行校验
    const stdout = await runScript('callback', '+1d 12:34 test');
    const data = JSON.parse(stdout);
    assert(Array.isArray(data.items));
    const { items: [{ arg, title }] } = data;
    assert(typeof arg === 'string');
    const query = querystring.parse(arg, ';');
    const timestamp = parseInt(query.timestamp);
    const date = new Date(timestamp);
    assert(date.getDate() === new Date().getDate() + 1);
    assert(date.getHours() === 12);
    assert(date.getMinutes() === 34);
    assert(title === 'test');
  });

  it('创建本月22号23:45分的提醒', async () => {
    // 用命令行来运行callback.js文件，并捕获它的输出来进行校验
    const stdout = await runScript('callback', '22 23:45 test');
    const data = JSON.parse(stdout);
    assert(Array.isArray(data.items));
    const { items: [{ arg, title }] } = data;
    assert(typeof arg === 'string');
    const query = querystring.parse(arg, ';');
    const timestamp = parseInt(query.timestamp);
    const date = new Date(timestamp);
    assert(date.getDate() === 22);
    assert(date.getHours() === 23);
    assert(date.getMinutes() === 45);
    assert(title === 'test');
  });

  it('创建今年7月份22号23:45分的提醒', async () => {
    // 用命令行来运行callback.js文件，并捕获它的输出来进行校验
    const stdout = await runScript('callback', '7-22 23:45 test');
    const data = JSON.parse(stdout);
    assert(Array.isArray(data.items));
    const { items: [{ arg, title }] } = data;
    assert(typeof arg === 'string');
    const query = querystring.parse(arg, ';');
    const timestamp = parseInt(query.timestamp);
    const date = new Date(timestamp);
    assert(date.getMonth() === 6);
    assert(date.getDate() === 22);
    assert(date.getHours() === 23);
    assert(date.getMinutes() === 45);
    assert(title === 'test');
  });

  it('创建2019年7月份22号23:45分的提醒', async () => {
    // 用命令行来运行callback.js文件，并捕获它的输出来进行校验
    const stdout = await runScript('callback', '2019-7-22 23:45 test');
    const data = JSON.parse(stdout);
    assert(Array.isArray(data.items));
    const { items: [{ arg, title }] } = data;
    assert(typeof arg === 'string');
    const query = querystring.parse(arg, ';');
    const timestamp = parseInt(query.timestamp);
    const date = new Date(timestamp);
    assert(date.getFullYear() === 2019);
    assert(date.getMonth() === 6);
    assert(date.getDate() === 22);
    assert(date.getHours() === 23);
    assert(date.getMinutes() === 45);
    assert(title === 'test');
  });
});
