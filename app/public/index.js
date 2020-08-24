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
    <td>{{this.remind.dateTime}}</td>
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
 * 往任务的提醒中填充可读的日期时间字符串。
 * @param {Object} task - 任务对象
 * @param {Object} task.remind - 提醒对象
 * @param {number} task.remind.timestamp - 秒单位的UNIX时间戳
 */
function makeDateTimeString(task) {
  const { remind } = task;
  if (remind) {
    const { timestamp } = remind;
    const date = new Date(timestamp * 1000);
    let dateTime = date.getFullYear();
    dateTime += '-' + (date.getMonth() >= 9 ? date.getMonth() + 1 : ('0' + date.getMonth()));
    dateTime += '-' + (date.getDate() >= 10 ? date.getDate() : ('0' + date.getDate()));
    dateTime += ' ' + (date.getHours() >= 10 ? date.getHours() : ('0' + date.getHours()));
    dateTime += ':' + (date.getMinutes() >= 10 ? date.getMinutes() : ('0' + date.getMinutes()));
    dateTime += ':' + (date.getSeconds() >= 10 ? date.getMinutes() : ('0' + date.getMinutes()));
    remind.dateTime = dateTime;
  }
}

/**
 * 拉取所有任务并展示到页面上。
 * @param {number} pageNumber - 页码
 */
async function fetchAllTaskAndShow(pageNumber) {
  // 根据页码计算出limit和offset。页码约定从1开始递增。
  const limit = 20;
  const offset = (pageNumber - 1) * limit;
  // 请求接口获取任务列表
  const url = `/task?limit=${limit}&offset=${offset}`;
  const response = await fetch(url);
  const body = await response.json();
  const { tasks } = body;
  // 构造HTML插入到id为taskListContainer的div中去
  // 需要呈现的内容有：任务ID、任务简述、下一次提醒的时刻、场景要求、重复模式。
  const makeTable = Handlebars.compile(allTaskTemplate);
  // 填充.remind.dateTime，以便在模板中展示可读的日期时间字符串。
  tasks.forEach(task => {
    makeDateTimeString(task);
  });
  const tableHTML = makeTable({ tasks });
  document.getElementById('wholeTaskContainer').innerHTML = tableHTML;

  setCurrentPageNumber(pageNumber);
}

function getCurrentPageNumber() {
  const pn = parseInt(document.getElementById('currentPageNumber').innerHTML);
  return Number.isNaN(pn) ? 1 : pn;
}

function setCurrentPageNumber(pageNumber) {
  document.getElementById('currentPageNumber').innerHTML = pageNumber;
}

async function backward() {
  // 获取上一个页码的任务的数据
  const pn = getCurrentPageNumber();
  if (pn > 1) {
    await fetchAllTaskAndShow(pn - 1);
  }
}
window.backward = backward;

async function forward() {
  // 获取上一个页码的任务的数据
  const pn = getCurrentPageNumber();
  await fetchAllTaskAndShow(pn + 1);
}
window.forward = forward;

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
    <td><a href="/page/task/{{this.task.id}}">{{this.task.brief}}</a></td>
    <td>{{this.task.remind.dateTime}}</td>
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
  tasks.forEach(({ task }) => {
    makeDateTimeString(task);
  });
  const tableHTML = makeTable({ tasks });
  console.log('tableHTML', tableHTML);
  document.getElementById('taskListContainer').innerHTML = tableHTML;

  await fetchAllTaskAndShow(1);
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
