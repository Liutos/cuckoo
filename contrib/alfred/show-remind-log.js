/**
 * 打印提醒日志
 */
const config = require('./config');

const dateFormat = require('dateformat');
const request = require('co-request');

/**
 * 查询提醒日志
 */
async function fetchRemindLog() {
  const response = await request({
    json: true,
    url: `${config.origin}/remind/log`
  });
  return response.body.remindLogs;
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
  // 调用接口获取提醒日志
  const remindLogs = await fetchRemindLog();
  // 获取任务的详情来作为待展示的内容
  const items = [];
  for (const remindLog of remindLogs) {
    const task = await fetchTask(remindLog.task_id);
    items.push({
      arg: '',
      icon: {
        path: task.icon_file
      },
      subtitle: dateFormat(remindLog.real_alarm_at * 1000, 'yyyy-mm-dd HH:MM:ss'),
      title: task.brief
    });
  }
  console.log(JSON.stringify({
    items
  }, null, 2));
}

main();

