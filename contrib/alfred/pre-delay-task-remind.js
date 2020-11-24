/**
 * 说明将会如何推迟一个任务的提醒
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
 * 根据ID获取指定任务
 */
async function fetchTask(id) {
  const response = await request({
    json: true,
    url: `${config.origin}/task/${id}`
  });
  return response.body.task;
}

async function main() {
  // 解析命令行参数
  // 参数的顺序依次为：提醒ID、推迟的时间。比如123 1d表示将ID为123的任务的提醒时间延迟1天。
  // 时间的单位支持：m（分钟）、h（小时）、d（天）。
  if (process.argv.length < 4) {
    console.log(JSON.stringify({
      items: [
        {
          arg: '',
          icon: {
            path: ''
          },
          subtitle: '',
          title: '请继续输入'
        },
      ]
    }, null, 2));
  }

  const remindId = parseInt(process.argv[2], 10);
  const interval = process.argv[3];
  const n = parseInt(interval.match(/[0-9]+/)[0]);
  const unit = interval[interval.length - 1];
  let label = null;
  if (unit === 'd') {
    label = '天';
  } else if (unit === 'h') {
    label = '小时';
  } else if (unit === 'm') {
    label = '分钟';
  }
  // 修改提醒的触发时间
  const remind = await fetchRemind(remindId);
  const task = await fetchTask(remind.taskId);
  console.log(JSON.stringify({
    items: [
      {
        arg: `${remindId} ${interval}`,
        icon: {
          path: task.icon_file
        },
        subtitle: `任务简述：${task.brief}`,
        title: `推迟任务${remind.taskId} ${n}${label}`
      },
    ]
  }, null, 2));
}

main();

