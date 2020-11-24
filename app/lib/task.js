'use strict';

/**
 * @typedef {Object} Task
 * @property {string} brief - 任务简述
 * @property {string} create_at - 任务的创建时刻
 * @property {string} detail - 任务详情
 * @property {string} device - 任务依赖的设备
 * @property {string} icon - 弹出提醒时的图标
 * @property {string} icon_file - 用于Alfred Workflow展示的图片路径
 * @property {id} id - 任务主键
 * @property {Remind[]} reminds
 * @property {string} state - 任务的状态
 * @property {string} update_at - 任务的最后一次修改的时刻
 */

class Task {
  /**
   * @returns {Task}
   */
  constructor(row) {
    const {
      brief,
      create_at,
      detail,
      device,
      icon,
      icon_file,
      id,
      state,
      update_at,
    } = row;
    this.brief = brief;
    this.create_at = create_at;
    this.detail = detail;
    this.device = device;
    this.icon = icon;
    this.icon_file = icon_file;
    this.id = id;
    this.state = state;
    this.update_at = update_at;
  }

  activate() {
    this.state = 'active';
    this.update_at = new Date();
  }

  close() {
    this.state = 'done';
    this.update_at = new Date();
  }

  patch(changes) {
    if (typeof changes['state'] === 'string' && !['active', 'done', 'inactive'].includes(changes['state'])) {
      throw new Error(`${changes['state']}不是state字段的一个有效值`);
    }
    const FIELDS = [
      'brief',
      'detail',
      'device',
      'icon',
      'icon_file',
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
