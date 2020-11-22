'use strict';

// 全局变量定义
let calendar = null;

const allTaskTemplate = `
<table>
  <tr>
    <th>任务ID</th>
    <th>任务简述</th>
    <th>场景要求</th>
  </tr>
{{#each tasks}}
  <tr>
    <td>{{this.id}}</td>
    <td><a href="/page/task/{{this.id}}">{{this.brief}}</a></td>
    <td>
    {{#if this.context}}
      {{this.context.name}}
    {{else}}
      无要求
    {{/if}}
    </td>
  </tr>
{{/each}}
</table>
`;

function makeDateTimeString(timestamp) {
  const date = new Date(timestamp * 1000);
  let dateTime = date.getFullYear();
  dateTime += '-' + (date.getMonth() >= 9 ? date.getMonth() + 1 : ('0' + (date.getMonth() + 1)));
  dateTime += '-' + (date.getDate() >= 10 ? date.getDate() : ('0' + date.getDate()));
  dateTime += ' ' + (date.getHours() >= 10 ? date.getHours() : ('0' + date.getHours()));
  dateTime += ':' + (date.getMinutes() >= 10 ? date.getMinutes() : ('0' + date.getMinutes()));
  dateTime += ':' + (date.getSeconds() >= 10 ? date.getSeconds() : ('0' + date.getSeconds()));
  return dateTime;
}

/**
 * 往任务的提醒中填充可读的日期时间字符串。
 * @param {Object} remind - 任务对象
 * @param {number} remind.planAlarmAt - 秒单位的UNIX时间戳
 */
function fillDateTimeString(remind) {
  remind.dateTime = makeDateTimeString(remind.planAlarmAt);
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
  const { reminds } = body;
  console.log(reminds);
  // 构造HTML插入到id为taskListContainer的div中去
  // 需要呈现的内容有：任务ID、任务简述、下一次提醒的时刻、场景要求、重复模式。
  const tableTemplate = `
<table>
  <tr>
    <th>提醒ID</th>
    <th>触发时刻</th>
    <th>重复模式</th>
    <th>任务ID</th>
    <th>任务简述</th>
    <th>场景要求</th>
  </tr>
{{#each reminds}}
  <tr>
    <td>{{this.id}}</td>
    <td>{{this.dateTime}}</td>
    <td>{{this.repeatType}}</td>
    <td>{{this.taskId}}</td>
    <td><a href="/page/task/{{this.taskId}}">{{this.taskBrief}}</a></td>
    <td>{{this.contextName}}</td>
  </tr>
{{/each}}
</table>
`;
  const makeTable = Handlebars.compile(tableTemplate);
  reminds.forEach(remind => {
    fillDateTimeString(remind);
  });
  const tableHTML = makeTable({ reminds });
  console.log('tableHTML', tableHTML);
  document.getElementById('taskListContainer').innerHTML = tableHTML;

  await fetchAllTaskAndShow(1);
  setCalendar(reminds);
  document.getElementById('followingArea').style.display = 'none';
  document.getElementById('wholeArea').style.display = 'none';
}
window.main = main;

/**
 * @param {Object[]} followingReminds - 接下来的提醒
 */
function setCalendar(followingReminds) {
  // 设置日历
  const calendarEl = document.getElementById('calendar');
  const initialDate = makeDateTimeString(Math.round(new Date().getTime() / 1000));
  calendar = new FullCalendar.Calendar(calendarEl, {
    aspectRatio: 1.35,
    eventClick: (eventClickInfo) => {
      const { event } = eventClickInfo;
      console.log(`点击了事件${event.id}`);
      location.href = `/page/task/${event.id}`;
    },
    expandRows: true,
    firstDay: new Date().getDay(),
    height: 'auto',
    initialDate,
    initialView: 'timeGrid',
    locale: 'zh-cn',
    nowIndicator: true,
    slotDuration: '00:10:00',
    slotLabelFormat: {
      hour: '2-digit',
      hour12: false,
      minute: '2-digit'
    },
    slotMinTime: `${new Date().getHours()}:00:00`,
    timeZone: 'zh-cn',
    validRange: (nowDate) => {
      return {
        start: nowDate
      };
    }
  });
  calendar.render();
  followingReminds.forEach((remind) => {
    const event = {
      allDay: false,
      id: remind.taskId,
      start: remind.dateTime,
      title: remind.taskBrief
    };
    // if (task.remind.duration) {
    //   event.end = makeDateTimeString(task.remind.timestamp + task.remind.duration);
    // }
    calendar.addEvent(event);
  });
}

window.showCalendar = function () {
  // 隐藏列表和任务，露出日历
  document.getElementById('followingArea').style.display = 'none';
  document.getElementById('wholeArea').style.display = 'none';
  document.getElementById('calendar').style.display = 'block';
  document.getElementById('searchResultContainer').style.display = 'none';
};

window.showFollowing = function () {
  // 隐藏日历和任务，露出列表
  document.getElementById('followingArea').style.display = 'block';
  document.getElementById('wholeArea').style.display = 'none';
  document.getElementById('calendar').style.display = 'none';
  document.getElementById('searchResultContainer').style.display = 'none';
};

window.showTasks = function () {
  // 隐藏列表和日历，露出任务
  document.getElementById('followingArea').style.display = 'none';
  document.getElementById('wholeArea').style.display = 'block';
  document.getElementById('calendar').style.display = 'none';
  document.getElementById('searchResultContainer').style.display = 'none';
};

window.showSearchResult = function () {
  // 露出搜索结果
  document.getElementById('followingArea').style.display = 'none';
  document.getElementById('wholeArea').style.display = 'none';
  document.getElementById('calendar').style.display = 'none';
  document.getElementById('searchResultContainer').style.display = 'block';
};

window.search = async function () {
  console.log('点击了搜索');
  const query = document.getElementById('query').value;
  console.log(`query is ${query}`);
  const url = `/task?brief=${query}`;
  const response = await fetch(url);
  const body = await response.json();
  const { tasks } = body;
  const makeTable = Handlebars.compile(allTaskTemplate);
  const tableHTML = makeTable({ tasks });
  document.getElementById('searchResultContainer').innerHTML = tableHTML;
  window.showSearchResult();
};
