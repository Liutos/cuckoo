/**
 * 根据要求往cuckoo中创建任务及其提醒
 */
'use strict';

const { parseDateTime } = require('./lib');

// 先将输入的参数拼成一个字符串
// 逐个匹配输入的字符串中的日期时间的格式
// 计算出要延迟的分钟数
// 输出Workflow所要求的JSON格式内容
function main() {
  let brief;
  let delayMinutes;
  let subtitle;
  let timestamp;
  const totalInput = process.argv.slice(2).join(' ');
  const parseResult = parseDateTime(totalInput);
  brief = parseResult.brief;
  delayMinutes = parseResult.delayMinutes;
  subtitle = parseResult.subtitle;
  timestamp = parseResult.timestamp;

  // 从brief中提炼出重复模式
  brief = brief.trim();
  const repeatTypePattern = /\*([^\s]+)/;
  let repeatType = '';
  if (brief.match(repeatTypePattern)) {
    repeatType = brief.match(repeatTypePattern)[1];
    brief = brief.replace(repeatTypePattern, '').trim();
  }

  // 从brief中提炼出设备
  const devicePattern = /\\([^\s]+)/;
  let device = '';
  if (brief.match(devicePattern)) {
    device = brief.match(devicePattern)[1];
    brief = brief.replace(devicePattern, '').trim();
    if (device === 'mobilePhone') {
      subtitle += '，将会发往微信帐号';
    }
  }

  const durationPattern = /~([0-9]+)/;
  let duration = '';
  if (brief.match(durationPattern)) {
    duration = brief.match(durationPattern)[1];
    brief = brief.replace(durationPattern, '').trim();
    subtitle += ` 持续展示${duration}秒`;
  }

  console.log(JSON.stringify({
    items: [{
      arg: `delayMinutes=${delayMinutes};device=${device};duration=${duration};message=${brief};timestamp=${timestamp};type=${repeatType}`,
      icon: {
        path: ''
      },
      subtitle,
      title: brief
    }]
  }, null, 2));
}

main();
