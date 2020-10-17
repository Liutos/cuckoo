// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportContext = require('../../../app/controller/context');
import ExportIcon = require('../../../app/controller/icon');
import ExportQueue = require('../../../app/controller/queue');
import ExportRemindLog = require('../../../app/controller/remind-log');
import ExportRemind = require('../../../app/controller/remind');
import ExportTask = require('../../../app/controller/task');
import ExportPageTask = require('../../../app/controller/page/task');
import ExportShortcutTask = require('../../../app/controller/shortcut/task');

declare module 'egg' {
  interface IController {
    context: ExportContext;
    icon: ExportIcon;
    queue: ExportQueue;
    remindLog: ExportRemindLog;
    remind: ExportRemind;
    task: ExportTask;
    page: {
      task: ExportPageTask;
    }
    shortcut: {
      task: ExportShortcutTask;
    }
  }
}
