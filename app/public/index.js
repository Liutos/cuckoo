const { tasks } = {
  "tasks": []
};

Vue.component('task', {
  methods: {
    updateRemindTimestamp: function (event) {
      const url = `http://localhost:7001/remind/${this.selected.remind.id}`;
      console.log(`准备请求：${url}`);
      axios
        .patch(url, {
          timestamp: parseInt(this.selectedRemindTimestamp)
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          console.log(`response`, response);
          console.log(`将ID为${this.selected.id}的任务的提醒时刻修改为${this.selectedRemindTimestamp}`);
        });
    }
  },
  props: ['selected', 'selectedRemindTimestamp'],
  template: '<div id="selected" v-if="selected">\n<p>简述：{{ selected.brief }}</p>\n<p>详情：{{ selected.detail }}</p>\n<p>下一个提醒时刻：<input v-model="selectedRemindTimestamp" /></p>\n<a v-on:click="updateRemindTimestamp">点我更新提醒时刻</a>\n</div>'
});

var app = new Vue({
  data: {
    selected: {
      brief: 'HELLO WORLD'
    },
    selectedRemindTimestamp: null,
    tasks: tasks.map(({ plan_alarm_at, task }) => {
      return {
        alarmAt: plan_alarm_at,
        brief: task.brief,
        contextName: task.context ? task.context.name : '',
        id: task.id
      }
    })
  },
  el: '#app',
  filters: {
    formatAlarmAt(value) {
      return moment(value).format('YYYY-MM-DD hh:mm');
    }
  },
  methods: {
    selectTask: function (event) {
      const taskId = event.target.id;
      axios
        .get(`http://localhost:7001/task/${taskId}`)
        .then(response => {
          this.selected = response.data.task;
          this.selectedRemindTimestamp = this.selected.remind ? this.selected.remind.timestamp : null;
          console.log('task.selected', this.selected);
        });
    }
  },
  mounted() {
    axios
      .get('http://localhost:7001/task?state=active')
      .then(response => {
        console.log('response', response);
        this.tasks = response.data.tasks;
      })
  }
})
