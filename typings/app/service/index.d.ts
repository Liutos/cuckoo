// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportContextRepository = require('../../../app/service/context-repository');
import ExportContext = require('../../../app/service/context');
import ExportIcon = require('../../../app/service/icon');
import ExportQueueRedis = require('../../../app/service/queue-redis');
import ExportQueue = require('../../../app/service/queue');
import ExportRemindLogRepository = require('../../../app/service/remind-log-repository');
import ExportRemindLog = require('../../../app/service/remind-log');
import ExportRemindRepository = require('../../../app/service/remind-repository');
import ExportRemind = require('../../../app/service/remind');
import ExportServerChan = require('../../../app/service/server-chan');
import ExportTaskRepository = require('../../../app/service/task-repository');
import ExportTask = require('../../../app/service/task');
import ExportGatewayShell = require('../../../app/service/gateway/shell');

declare module 'egg' {
  interface IService {
    contextRepository: AutoInstanceType<typeof ExportContextRepository>;
    context: AutoInstanceType<typeof ExportContext>;
    icon: AutoInstanceType<typeof ExportIcon>;
    queueRedis: AutoInstanceType<typeof ExportQueueRedis>;
    queue: AutoInstanceType<typeof ExportQueue>;
    remindLogRepository: AutoInstanceType<typeof ExportRemindLogRepository>;
    remindLog: AutoInstanceType<typeof ExportRemindLog>;
    remindRepository: AutoInstanceType<typeof ExportRemindRepository>;
    remind: AutoInstanceType<typeof ExportRemind>;
    serverChan: AutoInstanceType<typeof ExportServerChan>;
    taskRepository: AutoInstanceType<typeof ExportTaskRepository>;
    task: AutoInstanceType<typeof ExportTask>;
    gateway: {
      shell: AutoInstanceType<typeof ExportGatewayShell>;
    }
  }
}
