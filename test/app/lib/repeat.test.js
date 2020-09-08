'use strict';

const Repeat = require('../../../app/lib/repeat');

const { assert } = require('egg-mock/bootstrap');

describe('test/app/lib/repeat.test.js', () => {
  it('计算monthly重复模式下的下一个触发时刻', async () => {
    const repeat = new Repeat({
      type: 'monthly'
    });
    // FIXME: 如果可以控制nextTimestamp内部的Date.now()的结果的话，这个测试用例就可以写得更好了。
    assert(repeat.nextTimestamp(1596805980 * 1000) >= (new Date('2020-10-07 21:13:00')).getTime());
  });
});
