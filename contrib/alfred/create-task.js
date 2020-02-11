const config = require('./config');

const request = require('co-request');

const querystring = require('querystring');

async function main() {
  // 解析命令行参数
  const query = querystring.parse(process.argv[2], ';');
  let { device, type } = query;
  type = type.trim();
  let repeat_type = null;
  if (type !== '') {
    repeat_type = type;
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
      repeat_type,
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
      device: device || null,
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
