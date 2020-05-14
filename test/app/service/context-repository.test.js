'use strict';

const { app, assert } = require('egg-mock/bootstrap');

let context = null;
let contextId = null;

describe('test/app/service/context-repository.test.js', () => {

  it('创建场景', async function () {
    const ctx = app.mockContext();
    context = await ctx.service.contextRepository.create({ name: '测试' });
    console.log('context', context);
    contextId = context.id;
  });

  it('获取场景', async function () {
    const ctx = app.mockContext();
    const context = await ctx.service.contextRepository.get(contextId);
    assert(context.id === contextId);
    assert(context.name === '测试');
  });

  it('搜索场景', async function () {
    const ctx = app.mockContext();
    const contexts = await ctx.service.contextRepository.search({});
    assert(Array.isArray(contexts));
    assert(contexts.length >= 1);
    assert(contexts.find(({ id }) => id === contextId));
  });

  it('删除任务', async function () {
    const ctx = app.mockContext();
    await ctx.service.contextRepository.delete(context.id);
  });
});
