[简体中文](https://github.com/Liutos/cuckoo/blob/master/README.zh-CN.md)

# cuckoo

## Overview

Cuckoo is a task reminder, it runs mainly on macOS, provides functionalities include:

- create tasks, setting their reminding time, repeating pattern, context and so on;
- send notification to Wechat account;
- integrate with Emacs by providing an extension;
- easy use in macOS by providing an Alfred Workflow for manipulating tasks.

The complete manual can be found [here](https://github.com/Liutos/cuckoo/wiki).

## Getting Started

### Installation and Configuration

Clone this repository to your local machine

```shell
git clone git@github.com:Liutos/cuckoo.git
cd cuckoo
npm i
```

Finally, start the application

```shell
NODE_ENV=local npm run dev
```

### How to use?

Cuckoo provides many APIs for manipulating tasks, reminds, and repeats. However, the recommended ways for using cuckoo is:

- The [Emacs extension](https://github.com/Liutos/cuckoo/wiki/Emacs%E6%AC%A1%E6%A8%A1%E5%BC%8Forg-cuckoo), or
- The [Alfred Workflow](https://github.com/Liutos/cuckoo/wiki/Alfred-Workflow)

The following sub-chapters give some examples about using the APIs directly.

#### Create Remind

```shell
curl -H 'Content-Type: application/json' -X POST --data '{"repeat_type":"daily","timestamp":1588575600}' 'http://localhost:7001/remind'
```

#### Create Task

```shell
curl -H 'Content-Type: application/json' -X POST --data '{"brief":"test","remind_id":2242}' 'http://localhost:7001/task'
```

#### Create Context

```shell
curl -H 'Content-Type: application/json' -X POST --data '{"name":"home"}' 'http://localhost:7001/context'
```

#### Set Task's Context ID

```shell
curl -H 'Content-Type: application/json' -X PATCH --data '{"context_id":5}' 'http://localhost:7001/task/2216'
```

After setting a task's target context, it will be reminded only when your machine is in this context.

#### Other Aspects about Using

Here are some advanced topics about using cuckoo:

- Its full API document: https://github.com/Liutos/cuckoo/wiki/API%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97
- Send notification to phone through Wechat: https://github.com/Liutos/cuckoo/wiki/%E5%8F%91%E9%80%81%E5%BE%AE%E4%BF%A1%E6%8F%90%E9%86%92
- Auto launch when login in on macOS: https://github.com/Liutos/cuckoo/wiki/%E5%BC%80%E6%9C%BA%E8%87%AA%E5%8A%A8%E8%BF%90%E8%A1%8C
