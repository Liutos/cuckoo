/**
 * 推迟一个任务的提醒指定的一段时间
 */
const config = require('./config');

const request = require('co-request');

async function fetchRemind(id) {
  const response = await request({
    json: true,
    url: `${config.origin}/remind/${id}`
  });
  return response.body.remind;
}

/**
 * 修改指定ID的提醒的触发时间
 */
async function updateRemindTimestamp(id, timestamp) {
  await request({
    body: {
      timestamp
    },
    json: true,
    method: 'patch',
    url: `${config.origin}/remind/${id}`
  });
}

async function main() {
  // 解析命令行参数
  // 参数的顺序依次为：提醒ID、推迟的时间。比如123 1d表示将ID为123的任务的提醒时间延迟1天。
  // 时间的单位支持：m（分钟）、h（小时）、d（天）。
  const remindId = parseInt(process.argv[2], 10);
  const interval = process.argv[3];
  const n = parseInt(interval.match(/[0-9]+/)[0]);
  const unit = interval[interval.length - 1];
  let ns = null;
  if (unit === 'd') {
    ns = n * 24 * 60 * 60;
  } else if (unit === 'h') {
    ns = n * 60 * 60;
  } else if (unit === 'm') {
    ns = n * 60;
  }
  // 查询这个任务
  const remind = await fetchRemind(remindId);
  // 提取出提醒的ID和预订的提醒时间
  const { timestamp } = remind;
  // 修改提醒的触发时间
  await updateRemindTimestamp(remindId, timestamp + ns);
}

main();

