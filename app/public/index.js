'use strict';

const CUCKOO_PORT = 7001;

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
  const url = `http://localhost:${CUCKOO_PORT}/task`;
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
  const url = `http://localhost:${CUCKOO_PORT}/task/following`;
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

main();

