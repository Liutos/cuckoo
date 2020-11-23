'use strict';

const config = require('./config');

const dateFormat = require('dateformat');
const request = require('co-request');

async function main() {
  const contextId = process.argv[2];

  const qs = {
    contextId,
  };
  const url = `${config.origin}/task/following`;
  const response = await request({
    json: true,
    qs,
    url
  });
  const { reminds } = response.body;
  const items = [];
  let lastDate = null;
  for (const remind of reminds) {
    const { contextName, iconFile, planAlarmAt, repeatType, taskBrief, taskId } = remind;

    const currentDate = dateFormat(planAlarmAt * 1000, 'yyyy-mm-dd');
    if (!lastDate || lastDate !== currentDate) {
      // 更新lastDate并写入items中，以作为下拉列表的一行显示。
      lastDate = currentDate;
      items.push({
        icon: { path: '' },
        title: `------------------${lastDate}的提醒------------------`
      });
    }
    // subtitle展示的是任务下一次提醒的时刻，以及它的重复模式
    let subtitle = dateFormat(planAlarmAt * 1000, 'yyyy-mm-dd HH:MM:ss');
    if (repeatType) {
      subtitle += ` *${repeatType}`;
    }

    items.push({
      arg: `${taskId}`,
      icon: {
        path: iconFile || ''
      },
      subtitle,
      title: `#${taskId} ${taskBrief} ${contextName ? '@' + contextName : ''}`
    });
  }
  console.log(JSON.stringify({ items }, null, 2));
}

main();
