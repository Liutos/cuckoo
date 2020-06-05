# Change Log

## [1.4.0] - 2020-06-05

### Added

- A new Alfred Workflow, triggered by keyword `delay`, can use for delaying a task's remind for specific interval;
- By means of the parameter `restrictedWdays`, the user can specify which days the remind should show;
- A new Alfred Workflow, triggered by keyword `rlog`, can show the recent 10 remind logs;

### Changed

- In the Workflow triggered by keyword `following`, the dates inserted into the result list;
- Indicates that the remind will be notify in WeChat account when using `callback`;
- A new column named `restricted_wdays` appears in table `t_remind`.

## [1.3.2] - 2020-05-24

### Added

- When starts, auto creates tables in SQLite database file if they're missing.

## [1.3.0] - 2020-05-20

### Added

- Can customize the duration of a remind in Alfred Workflow;

### Changed

- Completely migrate from MySQL to SQLite for storing repeats, reminds, tasks, and so on. Remove the dependencies on MySQL and Redis, easy to deploy.

## [1.2.0] - 2020-05-04

### Added

- Support setting a default icon file when creating tasks from Emacs org-mode;

### Changed

- Replace Redis by using SQLite for implementing the queue, made it much easier for deployment;

## [1.1.0] - 2020-04-19

### Added

- 使用`setImmediate`运行唤起外部程序弹出通知的代码，避免同一时刻的提醒只能串行触发；
- 支持了新的弹出通知的机制[`node-notifier`](https://github.com/mikaelbr/node-notifier)；
- 新增了复制任务及其提醒、重复模式的接口；
- 在org-cuckoo.el中新增了查看任务的简要信息的Elisp命令；

### Changed

- 调整了使用AppleScript弹出通知时的文案；
