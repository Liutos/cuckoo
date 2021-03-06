/**
 * 计算出时间戳的当天是星期几
 * @param {number} timestamp - 时间戳
 */
function getDay(timestamp) {
  return Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(new Date(timestamp));
}

exports.parseDateTime = (totalInput) => {
  let brief;
  let delayMinutes;
  let subtitle;
  let timestamp;
  const MINUTE_PATTERN = /^(\d+)\s+(.+)$/;
  const HM_PATTERN = /^(\d+:\d+)\s+(.+)$/;
  const DHM_PATTERN = /^(\d+)\s+(\d+):(\d+)\s+(.+)$/;
  const MDHM_PATTERN = /^(\d+)-(\d+)\s+(\d+):(\d+)\s+(.+)$/;
  const YMDHM_PATTERN = /^(\d+)-(\d+)-(\d+)\s+(\d+):(\d+)\s+(.+)$/;
  const AFTER_PATTERN = /^\+(\d+)([dhmw])\s+(\d+):(\d+)\s+(.+)/;
  if (totalInput.match(AFTER_PATTERN)) {
    // 表示在指定的天/小时/月/周之后的时刻提醒
    const n = parseInt(totalInput.match(AFTER_PATTERN)[1]);
    const unit = totalInput.match(AFTER_PATTERN)[2];
    const hour = parseInt(totalInput.match(AFTER_PATTERN)[3]);
    const minute = parseInt(totalInput.match(AFTER_PATTERN)[4]);
    brief = totalInput.match(AFTER_PATTERN)[5];
    let hours;
    let unitName;
    switch (unit) {
      case 'd':
        hours = 24;
        unitName = '天';
        break;
      case 'h':
        hours = 1;
        unitName = '小时';
        break;
      case 'm':
        hours = 31 * 24;
        unitName = '月';
        break;
      case 'w':
        hours = 7 * 24;
        unitName = '周';
        break;
    }
    timestamp = new Date().setHours(hour, minute, 0, 0) + n * hours * 60 * 60 * 1000;
    subtitle = `在${n}${unitName}后（${getDay(timestamp)}）的${hour}点${minute}分提醒`;
  } else if (totalInput.match(YMDHM_PATTERN)) {
    // 表示在指定的年份、月份、日期和时刻提醒
    brief = totalInput.match(YMDHM_PATTERN)[6];
    const year = parseInt(totalInput.match(YMDHM_PATTERN)[1]);
    const month = parseInt(totalInput.match(YMDHM_PATTERN)[2]);
    const day = parseInt(totalInput.match(YMDHM_PATTERN)[3]);
    const hour = parseInt(totalInput.match(YMDHM_PATTERN)[4]);
    const minute = parseInt(totalInput.match(YMDHM_PATTERN)[5]);
    timestamp = new Date(new Date().setFullYear(year, month - 1, day)).setHours(hour, minute, 0, 0);
    subtitle = `在${year}年${month}月${day}号（${getDay(timestamp)}）${hour}点${minute}分时提醒`;
  } else if (totalInput.match(MDHM_PATTERN)) {
    // 表示在指定的月份、日期和时刻提醒
    brief = totalInput.match(MDHM_PATTERN)[5];
    const month = parseInt(totalInput.match(MDHM_PATTERN)[1]);
    const day = parseInt(totalInput.match(MDHM_PATTERN)[2]);
    const hour = parseInt(totalInput.match(MDHM_PATTERN)[3]);
    const minute = parseInt(totalInput.match(MDHM_PATTERN)[4]);
    timestamp = new Date(new Date().setMonth(month - 1, day)).setHours(hour, minute, 0, 0);
    subtitle = `在${month}月${day}号（${getDay(timestamp)}）${hour}点${minute}分时提醒`;
  } else if (totalInput.match(DHM_PATTERN)) {
    // 表示在指定的日期和时刻提醒
    brief = totalInput.match(DHM_PATTERN)[4];
    const day = parseInt(totalInput.match(DHM_PATTERN)[1]);
    const hour = parseInt(totalInput.match(DHM_PATTERN)[2]);
    const minute = parseInt(totalInput.match(DHM_PATTERN)[3]);
    timestamp = new Date(new Date().setDate(day)).setHours(hour, minute, 0, 0);
    subtitle = `在本月${day}号（${getDay(timestamp)}）${hour}点${minute}分时提醒`;
  } else if (totalInput.match(MINUTE_PATTERN)) {
    // 表示在指定的分钟后提醒
    brief = totalInput.match(MINUTE_PATTERN)[2];
    delayMinutes = parseInt(totalInput.match(MINUTE_PATTERN)[1]);
    subtitle = `${delayMinutes}分钟后提醒`;
  } else if (totalInput.match(HM_PATTERN)) {
    // 表示在指定的时刻提醒
    brief = totalInput.match(HM_PATTERN)[2];
    const [hourText, minuteText] = totalInput.match(HM_PATTERN)[1].split(':');
    const hour = parseInt(hourText);
    const minute = parseInt(minuteText);
    timestamp = new Date().setHours(hour, minute, 0, 0);
    subtitle = `在${hour}点${minute}分时提醒`;
  } else {
    // 不符合任何一种模式，要求用户重新输入
    console.log(JSON.stringify({
      items: [{
        icon: {
          path: '',
        },
        title: '请输入正确的参数，如：1 test',
      }],
    }, null, 2));
    process.exit();
  }
  return {
    brief,
    delayMinutes,
    subtitle,
    timestamp
  };
};
