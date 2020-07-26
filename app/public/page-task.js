'use strict';

const CUCKOO_PORT = 7002;

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
};
