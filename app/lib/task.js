'use strict';

const ctxKey = Symbol();

class Task {
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
