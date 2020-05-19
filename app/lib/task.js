'use strict';

const ctxKey = Symbol();

/**
 * @typedef {Object} Task
 * @property {string} brief - 任务简述
 * @property {Context} context - 该任务适用的场景
 * @property {string} create_at - 任务的创建时刻
 * @property {string} detail - 任务详情
 * @property {string} device - 任务依赖的设备
 * @property {string} icon - 弹出提醒时的图标
 * @property {string} icon_file - 用于Alfred Workflow展示的图片路径
 * @property {id} id - 任务主键
 * @property {Remind} remind - 任务的提醒配置
 * @property {string} state - 任务的状态
 * @property {string} update_at - 任务的最后一次修改的时刻
 */

class Task {
  /**
   * @returns {Task}
   */
  constructor(ctx, row) {
    const {
      brief,
      context,
      create_at,
      detail,
      device,
      icon,
      icon_file,
      id,
      remind,
      state,
      update_at,
    } = row;
    this[ctxKey] = ctx;
    this.brief = brief;
    this.context = context;
    this.create_at = create_at;
    this.detail = detail;
    this.device = device;
    this.icon = icon;
    this.icon_file = icon_file;
    this.id = id;
    this.remind = remind;
    this.state = state;
    this.update_at = update_at;
  }

  activate() {
    this.state = 'active';
    this.update_at = new Date();
  }

  close() {
    if (this.remind) {
      this.remind.close();
    }
    this.state = 'done';
    this.update_at = new Date();
  }

  isRepeated() {
    return this.remind && !!this.remind.repeat;
  }

  async notify(alarmAt) {
    return await this.remind.notify({
      alarmAt,
      brief: `#${this.id} ${this.brief}`,
      detail: this.detail,
      device: this.device,
      icon: this.icon,
      taskId: this.id,
    });
  }

  patch(changes) {
    if (typeof changes['state'] === 'string' && !['active', 'done', 'inactive'].includes(changes['state'])) {
      throw new Error(`${changes['state']}不是state字段的一个有效值`);
    }
    const FIELDS = [
      'brief',
      'context',
      'detail',
      'device',
      'icon',
      'icon_file',
      'remind',
      'state',
    ];
    for (const field of FIELDS) {
      if (field in changes) {
        this[field] = changes[field];
      }
    }
    this.update_at = new Date();
  }
}

module.exports = Task;
