# Change Log

## [1.8.0] - 2020-07-20

### Changed

- A new and ugly Web UI for viewing tasks;
- Extract the code about operating on SQLite to be a embedded egg-js plugin in `cuckoo`.

### Fixed

- Correctly recognize the SCHEDULED property of an org-mode entry even there's Chinese words.

## [1.7.0] - 2020-07-13

### Added

- A new HTTP API for setting a task's `icon` and `icon_file` simultaneously by uploading file;
- A new column `task_id` in table `t_remind` for storing the id of the task a remind belongs to;
- A new column `remind_id` in table `task_queue` for storing the id of the remind cause a notification.

## [1.6.0] - 2020-06-28

### Added

- A new scheduled task `sync.js` for synchronizing tasks between database and queue;
- Add icons for Alfred Workflow triggered by keywords `callback` and `following`;

### Changed

- Highlight the date spliting line in result list of `following` Workflow;

### Fixed

- Logs should be output to files under `logs/cuckoo/` directory, not under the `${HOME}`;

## [1.5.0] - 2020-06-19

### Added

- Can customizing the running interval of polling tasks from queue;
- Displaying the day of a remind when using the Workflow triggered by keyword `callback`;
- A new API for uploading icon files to cuckoo. After uploading, they can be accessed under the `/public/icon/` path;
- A new trivial Web UI for creating tasks and their reminds.

### Changed

- Use a configuration item for setting the key of [ServerChan](http://sc.ftqq.com/3.version), instead of using environment variable;

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
