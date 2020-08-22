'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/context', controller.context.search);
  router.get('/context/current', controller.context.getCurrent);
  router.post('/context', controller.context.create);
  router.post('/icon/file', controller.icon.uploadFile);
  // Web pages
  router.get('/page/task/:id', controller.page.task.get);
  // Shortcuts
  router.post('/shortcut/task', controller.shortcut.task.create);

  router.post('/queue/poll', controller.queue.poll);
  router.post('/queue/send', controller.queue.send);
  router.put('/queue/fill-remind-id', controller.queue.fillRemindId);

  router.get('/remind/log', controller.remindLog.search);
  router.get('/remind/:id', controller.remind.get);
  router.patch('/remind/:id', controller.remind.update);
  router.post('/remind/:id/close', controller.remind.close);
  router.post('/remind', controller.remind.create);
  router.get('/repeat/:id', controller.repeat.get);
  router.post('/repeat', controller.repeat.create);
  router.del('/task/:id', controller.task.delete);
  router.get('/task', controller.task.search);
  router.get('/task/following', controller.task.getFollowing);
  router.get('/task/:id', controller.task.get);
  router.patch('/task/:id', controller.task.update);
  router.patch('/task/:id/icon', controller.task.updateIcon);
  router.post('/task/sync', controller.task.sync);
  router.post('/task/:id/duplicate', controller.task.duplicate);
  router.post('/task/:id/remind', controller.task.remind);
  router.post('/task', controller.task.create);
};
