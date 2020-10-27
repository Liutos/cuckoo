'use strict';

/**
 * @param {number} id - 要更新图标的任务的id
 */
window.uploadIcon = async function (id) {
  // 先取出待上传的图标的完整路径
  const iconFile = document.getElementById('iconFile').files[0];
  // 执行文件上传
  const formData = new FormData();
  formData.append('file', iconFile);
  const response = await axios({
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data; charset=utf-8',
    },
    method: 'patch',
    url: `/task/${id}/icon`,
  });
  console.log('response', response);
  alert('任务图标更新成功。');
  location.reload();
};

/**
 * 更新这一行提醒的属性。
 * @param {number} id - 待更新的提醒的ID
 */
window.updateRemindContext = async function (id) {
  // 计算出对应的时间戳
  let timestamp = document.getElementById('remindDateTime').valueAsNumber;
  // 减去8个小时的时区修正
  timestamp -= 8 * 60 * 60 * 1000;
  timestamp = Math.trunc(timestamp / 1000);
  // 取出当前的场景的ID，并更新提醒的场景
  const selectElement = document.getElementById('remindContextName');
  const contextId = parseInt(selectElement.value);
  // 取出当前的持续时长并更新
  const durationElement = document.getElementById('remindDuration');
  let duration = parseInt(durationElement.value);
  // 取出重复模式
  const repeatTypeElement = document.getElementById('remindRepeatType');
  const repeatType = repeatTypeElement.value;
  // 取出小时的限定条件
  // 因为数量是固定的，所以直接构造出id然后逐个获取即可。
  const restrictedHours = [];
  for (let i = 0; i < 24; i++) {
    const id = `rh${i}`;
    const element = document.getElementById(id);
    restrictedHours.push(element.checked ? 1 : 0);
  }

  const data = {
    contextId,
    duration,
    restricted_hours: restrictedHours,
    repeat_type: repeatType,
    timestamp
  };
  console.log('data', data);
  const response = await axios({
    data,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    method: 'patch',
    url: `/remind/${id}`,
  });
  console.log('response', response);
  alert('提醒更新成功。');
  location.reload();
};

window.updateTaskState = async function (id) {
  const stateElement = document.getElementById('taskState');
  const state = stateElement.value;
  const response = await axios({
    data: {
      state
    },
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    method: 'patch',
    url: `/task/${id}`,
  });
  console.log('response', response);
  alert('任务状态更新成功。');
  location.reload();
};
