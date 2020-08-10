const Controller = require('egg').Controller;

class RemindLogController extends Controller {
  async search() {
    const { ctx, service } = this;
    const { query } = ctx;

    const { limit = 10, sort = 'create_at:desc', task_id } = query;
    const remindLogs = await service.remindLog.search({
      limit,
      sort,
      task_id
    });

    ctx.body = {
      remindLogs,
    };
  }
}

module.exports = RemindLogController;
