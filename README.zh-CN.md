[English](https://github.com/Liutos/cuckoo/blob/master/README.md)

# cuckoo

定时提醒工具

## 依赖

- mysql
- ControlPlane

## 安装及配置

请先确保自己的系统上已经安装了《依赖》一节中提到的几个软件。

首先将本项目下载到本地

```bash
git clone git@github.com:Liutos/cuckoo.git
cd cuckoo
npm i
```

接着在MySQL中创建所需要的表，示例代码如下

```bash
mysql -u <用户名> -p cuckoo < ./sql/cuckoo.sql
```

然后需要配置cuckoo使用MySQL。在项目根目录的config目录下，新建一个文件config.local.js，内容如下

```js
'use strict';

module.exports = appInfo => {
  const config = exports = {};

  config.mysql = {
    client: {
      database: 'cuckoo',
      host: 'localhost',
      password: '此处填你的MySQL密码',
      port: '3306',
      user: '此处填你的MySQL用户名',
    },
  };

  return config;
};
```

现在可以启动cuckoo了，示例代码如下

```bash
NODE_ENV=local npm run dev
```

## 创建所需要的场景

为了可以实现基于场景的提醒，需要先创建出场景。例如，要创建一个名为“公司”的场景，示例代码如下

```bash
curl -i -H Content-Type\:\ application/json -XPOST http\://localhost\:7001/context -d \{'
'\ \ \"name\"\:\ \"\公\司\"'
'\}
```

之后便可以在需要指定场景的地方，使用“公司”这个场景对应的id了。

## 如何在开机时自动启动cuckoo？

如果想要在开机后自动自动启动cuckoo，可以通过macOS的launchd来实现。首先创建一个cuckoo的启动脚本，示例代码如下

```shell
#!/bin/bash
# 启动cuckoo
export PATH=/usr/local/bin:${PATH} # 将node命令加入到搜索路径中
NODE_ENV=local npm run dev
```

然后在用户目录下的launchd配置目录中创建相应的配置文件，示例代码如下

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
        <dict>
                <key>Label</key>
                <string>这里填一个你随便取的名字</string>
                <key>Program</key>
                <string>这里填刚才的启动脚本的绝对路径</string>
                <key>RunAtLoad</key>
                <true/>
                <key>StandardOutPath</key>
                <string>/tmp/cuckoo.log</string>
                <key>StandardErrorPath</key>
                <string>/tmp/cuckoo.err</string>
        </dict>
</plist>
```

我把上面这段内容保存为文件com.liutos.tools.cuckoo.plist。这么一来，下次登录进系统后，macOS便会自行启动cuckoo。

## 如何使用接口创建提醒？

要创建一个cuckoo的提醒，分为两个步骤：

1. 创建一个remind记录；
2. 创建一个task记录。

### 如何创建remind？

以创建一个在2019年9月23日开始，每天22点整弹出的提醒为例，示例代码如下

```bash
curl -H 'Content-Type: application/json' -X POST --data '{"repeat_type":"","timestamp":1569247200}' 'http://localhost:7001/remind'
```

响应结果如下

```javascript
{
  "remind": {
    "create_at": "2020-01-26T07:59:16.000Z",
    "duration": null,
    "id": 1549,
    "repeat": {
      "create_at": "2020-01-26T07:59:16.000Z",
      "id": 98,
      "type": "daily",
      "update_at": "2020-01-26T07:59:16.000Z"
    },
    "restricted_hours": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ],
    "timestamp": 1569247200,
    "update_at": "2020-01-26T07:59:16.000Z"
  }
}
```

其中的id字段的值是稍后创建任务时所需要的参数。

### 如何创建任务？

以创建一个标题为"test"的提醒为例，示例代码如下

```bash
curl -H 'Content-Type: application/json' -X POST --data '{"brief":"test","remind_id":1549}' 'http://localhost:7001/task'
```

这个创建出来的任务将会在2019年9月23日开始的每一天的晚上10点弹出。如果当前的时间已经过了这个时间了，那么这个任务会在下一分钟立刻弹出。

## Emacs插件

cuckoo自带了一个Emacs的插件——org-cuckoo次模式。安装方法如下

```elisp
(add-to-list 'load-path "/path/to/cuckoo/contrib/emacs/")
(require 'org-cuckoo)
(add-hook 'org-mode-hook
          (lambda ()
            (org-cuckoo-mode)))
(add-hook 'org-after-todo-state-change-hook 'cuckoo-cancelled-state)
```

这样一来，就可以使用如下的快捷键了：

- `C-c r`用于为当前条目在cuckoo中创建任务和提醒。这要求条目是设置了SCHEDULED属性的；
- `C-c C-s`用于设置条目的SCHEDULED属性。在使用`C-c C-s`时与org-mode原本的快捷键没有差异，当带有prefix number时，除了会取消当前条目的SCHEDULED属性之后，org-cuckoo还会根据条目的TASK_ID属性，相应地修改cuckoo中条目的状态。

## alerter的优势

cuckoo默认使用AppleScript来弹出提醒，但[alerter](https://github.com/vjeantet/alerter)是一个更好的选择。alerter比起AppleScript的优势在于：

- 支持自定义icon；
- 支持自定义下拉菜单。基于这个cuckoo实现了推迟提醒的功能；
- 支持超时自动消失。这个由cuckoo的任务的duration字段控制。

推荐大家使用，只需要在config/config.local.js中添加如下内容即可

```js
config.reminder = {
  type: 'alerter'
};
```
