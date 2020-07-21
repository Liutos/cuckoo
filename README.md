> A reminder designed for programmers.

Create a notification triggered after 1 minute by means of Alfred Workflow.

![](https://raw.githubusercontent.com/Liutos/cuckoo/master/docs/AlfredWorkflowExample.gif)

Create a notification at 9 pm for entry in `org-mode` by Emacs extension.

![](https://raw.githubusercontent.com/Liutos/cuckoo/master/docs/EmacsExtensionExample.gif)

The notification triggered by `alerter`

![](https://raw.githubusercontent.com/Liutos/cuckoo/master/docs/alerterNotifyExample.jpg)

# Features

- Repeated task notification;
- Notify based on context;
- Push notification to WeChat account;
- Integration with Alfred and Emacs;

# Installation

```shell
git clone git@github.com:Liutos/cuckoo.git
cd cuckoo
npm i
npm run start
```

# Example

Create a task reminded at 2020-06-01 00:00:00.

```shell
timestamp=$(date -f '%Y-%m-%d %T' -j '2020-06-01 00:00:00' '+%s')
remind_id=$(curl -H 'Content-Type: application/json' -X POST -d "{\"timestamp\":${timestamp}}" 'http://localhost:7002/remind' | jq '.remind.id')
curl -H 'Content-Type: application/json' -X POST -d "{\"brief\":\"Hello, cuckoo!\",\"remind_id\":${remind_id}}" 'http://localhost:7002/task'
```

Create a task reminded at 10 am every day.

```shell
timestamp=$(date -f '%Y-%m-%d %T' -j '2020-06-01 10:00:00' '+%s')
remind_id=$(curl -H 'Content-Type: application/json' -X POST -d "{\"repeat_type\":\"daily\",\"timestamp\":${timestamp}}" 'http://localhost:7002/remind' | jq '.remind.id')
curl -H 'Content-Type: application/json' -X POST -d "{\"brief\":\"Sign up.\",\"remind_id\":${remind_id}}" 'http://localhost:7002/task'
```

For more usage about `cuckoo`'s HTTP API, see [API使用指南](https://github.com/Liutos/cuckoo/wiki/API-reference).

# Configuration

`cuckoo` can be customized through file `config/config.prod.js`.

If `context.detector` is set to `controlPlane`, `cuckoo` will use [`ControlPlane`](https://github.com/dustinrue/ControlPlane) for detecting current context.

If `mobilePhone.push.serverChan.sckey` is set, it must be a valid key acquire from [`Server酱`](http://sc.ftqq.com/3.version). After set, `cuckoo` will be able to push notification to WeChat account.

The default `reminder.type` is `applescript`, and can be change to `alerter`(Using [`alerter`](https://github.com/vjeantet/alerter)) or `node-notifier`(Using [`node-notifier`](https://github.com/mikaelbr/node-notifier)).

By default, `cuckoo` pull tasks from queue every 30 seconds. This can be customized by setting `schedule.poll.interval`.

# Integration

`cuckoo` can be integrated with `Alfred` and `Emacs`.

- For integrating with Alfred, see [Alfred Workflow](https://github.com/Liutos/cuckoo/wiki/Alfred-Workflow).
- For using inside Emacs `org-mode`, see [Emacs extension org cuckoo](https://github.com/Liutos/cuckoo/wiki/Emacs-extension-org-cuckoo).

# Release History

See [CHANGELOG.md](CHANGELOG.md).