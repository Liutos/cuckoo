const config = require('./config');

const dateFormat = require('dateformat');
const request = require('co-request');

async function main() {
  const url = `${config.origin}/task/following`;
  const response = await request({
    json: true,
    url
  });
  const { tasks } = response.body;
  console.log(JSON.stringify({
    items: tasks.map(({ plan_alarm_at, task }) => {
      // subtitle展示的是任务下一次提醒的时刻，以及它的重复模式
      let subtitle = dateFormat(plan_alarm_at * 1000, 'yyyy-mm-dd HH:MM:ss');
      if (task.remind && task.remind.repeat) {
        subtitle += ` *${task.remind.repeat.type}`;
      }

      return {
        arg: `${task.id}`,
        icon: {
          path: task.icon_file || ''
        },
        subtitle,
        title: `#${task.id} ${task.brief} ${task.context ? '@' + task.context.name : ''}`
      }
    })
  }, null, 2));
}

main();
