/**
 * 搜索cuckoo中存储的任务并以Alfred Workflow要求的格式返回
 */
const config = require('./config');

const dateFormat = require('dateformat');
const request = require('co-request');

async function main() {
  const url = `${config.origin}/task`;
  const response = await request({
    json: true,
    qs: {
      state: 'active'
    },
    url
  });
  const { tasks } = response.body;
  const items = [];
  for (const task of tasks) {
    items.push({
      arg: `${task.id}`,
      icon: {
        path: task.icon_file
      },
      subtitle: `${task.remind && dateFormat(task.remind.timestamp * 1000, 'yyyy-mm-dd HH:MM:ss')}`,
      title: `#${task.id} ${task.brief} ${task.context ? '@' + task.context.name : ''}`,
      uid: `${task.id}`,
      valid: true
    });
  }
  console.log(JSON.stringify({ items }, null, 2));
}

main();
