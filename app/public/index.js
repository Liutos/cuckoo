'use strict';

const allTaskTemplate = `
<table>
  <tr>
    <th>任务ID</th>
    <th>任务简述</th>
    <th>下一次提醒的时刻</th>
    <th>场景要求</th>
    <th>重复模式</th>
  </tr>
{{#each tasks}}
  <tr>
    <td>{{this.id}}</td>
    <td><a href="/page/task/{{this.id}}">{{this.brief}}</a></td>
    <td>{{this.remind.timestamp}}</td>
    <td>
    {{#if this.context}}
      {{this.context.name}}
    {{else}}
      无要求
    {{/if}}
    </td>
    <td>
    {{#if this.remind.repeat}}
      {{this.remind.repeat.type}}
    {{else}}
      不重复
    {{/if}}
    </td>
  </tr>
{{/each}}
</table>
`;

/**
 * 拉取所有任务并展示到页面上。
 */
async function fetchAllTaskAndShow() {
  // 请求接口获取任务列表
  const url = '/task';
  const response = await fetch(url);
  const body = await response.json();
  const { tasks } = body;
  // 构造HTML插入到id为taskListContainer的div中去
  // 需要呈现的内容有：任务ID、任务简述、下一次提醒的时刻、场景要求、重复模式。
  const makeTable = Handlebars.compile(allTaskTemplate);
  const tableHTML = makeTable({ tasks });
  document.getElementById('wholeTaskContainer').innerHTML = tableHTML;
}

async function main() {
  // 请求接口获取任务列表
  const url = '/task/following';
  const response = await fetch(url);
  const body = await response.json();
  const { tasks } = body;
  console.log(tasks);
  // 构造HTML插入到id为taskListContainer的div中去
  // 需要呈现的内容有：任务ID、任务简述、下一次提醒的时刻、场景要求、重复模式。
  const tableTemplate = `
<table>
  <tr>
    <th>任务ID</th>
    <th>任务简述</th>
    <th>下一次提醒的时刻</th>
    <th>场景要求</th>
    <th>重复模式</th>
  </tr>
{{#each tasks}}
  <tr>
    <td>{{this.task.id}}</td>
    <td>{{this.task.brief}}</td>
    <td>{{this.task.remind.timestamp}}</td>
    <td>
    {{#if this.task.context}}
      {{this.task.context.name}}
    {{else}}
      无要求
    {{/if}}
    </td>
    <td>
    {{#if this.task.remind.repeat}}
      {{this.task.remind.repeat.type}}
    {{else}}
      不重复
    {{/if}}
    </td>
  </tr>
{{/each}}
</table>
`;
  const makeTable = Handlebars.compile(tableTemplate);
  const tableHTML = makeTable({ tasks });
  console.log('tableHTML', tableHTML);
  document.getElementById('taskListContainer').innerHTML = tableHTML;

  await fetchAllTaskAndShow();
}
window.main = main;

async function updateRemindTimestamp(id) {
  // 计算出对应的时间戳
  let timestamp = document.getElementById('remindDateTime').valueAsNumber;
  // 减去8个小时的时区修正
  timestamp -= 8 * 60 * 60 * 1000;
  timestamp = Math.trunc(timestamp / 1000);
  // 更新指定id的提醒的时刻
  const url = `/remind/${id}`;
  await fetch(url, {
    body: JSON.stringify({
      timestamp
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'PATCH'
  });
  alert('提醒时刻修改完毕。');
}
window.updateRemindTimestamp = updateRemindTimestamp;
