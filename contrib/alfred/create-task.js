const config = require('./config');

const request = require('co-request');

const querystring = require('querystring');

async function main() {
  // 解析命令行参数
  const query = querystring.parse(process.argv[2], ';');
  let { device, duration = null, type } = query;
  if (typeof duration === 'string') {
    duration = parseInt(duration, 10);
  }
  if (isNaN(duration)) {
    duration = null;
  }
  type = typeof type === 'string' && type.trim();
  let repeat_type = null;
  if (type !== '') {
    repeat_type = type;
  }
  // 先创建一个任务
  const brief = query.message;
  let response = await request({
    body: {
      brief,
      device: device || null
    },
    json: true,
    method: 'post',
    url: `${config.origin}/task`
  });
  const { task } = response.body;
  console.log(`创建了任务${task.id}`);
  // 再创建一个提醒
  let timestamp = parseInt(query.timestamp);
  if (Number.isNaN(timestamp)) {
    const nMinutes = parseInt(query.delayMinutes);
    timestamp = Math.round(new Date(Date.now() + nMinutes * 60 * 1000).setSeconds(0, 0) / 1000);
  } else {
    timestamp = Math.round(timestamp / 1000);
  }
  response = await request({
    body: {
      duration,
      repeat_type,
      taskId: task.id,
      timestamp
    },
    json: true,
    method: 'post',
    url: `${config.origin}/remind`
  });
  const { remind } = response.body;
  console.log(`创建了提醒${remind.id}`);
}

main();
