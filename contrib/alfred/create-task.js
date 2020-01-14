const config = require('./config');

const request = require('co-request');

const querystring = require('querystring');

async function main() {
  // 解析命令行参数
  const query = querystring.parse(process.argv[2], ';');
  // 创建必要的重复模式
  const { type } = query;
  let repeat = null;
  if (typeof type === 'string' && type.length > 0) {
    const response = await request({
      body: {
        type
      },
      json: true,
      method: 'post',
      url: `${config.origin}/repeat`
    });
    repeat = response.body.repeat;
  }
  // 先创建一个提醒
  let timestamp = parseInt(query.timestamp);
  if (Number.isNaN(timestamp)) {
    const nMinutes = parseInt(query.delayMinutes);
    timestamp = Math.round(new Date(Date.now() + nMinutes * 60 * 1000).setSeconds(0, 0) / 1000);
  } else {
    timestamp = Math.round(timestamp / 1000);
  }
  let response = await request({
    body: {
      repeat_id: repeat && repeat.id,
      timestamp
    },
    json: true,
    method: 'post',
    url: `${config.origin}/remind`
  });
  const { remind } = response.body;
  // 再创建一个任务
  const brief = query.message;
  response = await request({
    body: {
      brief,
      remind_id: remind.id
    },
    json: true,
    method: 'post',
    url: `${config.origin}/task`
  });
  const { task } = response.body;
  console.log(`创建了任务${task.id}`);
}

main();
