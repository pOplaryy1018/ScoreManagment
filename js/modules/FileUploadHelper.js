// ==============================================
// 文件上传辅助模块 (FileUploadHelper)
// 负责处理各种文件上传功能，包括类型检查、大小限制等
// ==============================================

const FileUploadHelper = (function() {
  'use strict';

  // 支持的文件类型
  const SUPPORTED_FILE_TYPES = {
    document: ['.pdf', '.docx'],
    image: ['.jpg', '.jpeg', '.png'],
    audio: ['.mp3'],
    video: ['.mp4']
  };

  // 所有支持的文件扩展名
  const ALL_SUPPORTED_EXTENSIONS = [
    '.pdf', '.docx', '.jpg', '.jpeg', '.png', '.mp3', '.mp4'
  ];

  // 文件大小限制 (50MB)
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  // ==============================================
  // 文件类型检查
  // ==============================================

  /**
   * 检查文件类型是否有效
   * @param {File} file 文件对象
   * @returns {boolean}
   */
  function isValidFileType(file) {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return ALL_SUPPORTED_EXTENSIONS.includes(fileExtension);
  }

  /**
   * 获取文件类型
   * @param {string} filename 文件名
   * @returns {string} 文件类型 (document/image/audio/video/other)
   */
  function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'document',
      'docx': 'document',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'mp3': 'audio',
      'mp4': 'video'
    };
    return typeMap[extension] || 'other';
  }

  // ==============================================
  // 文件大小检查
  // ==============================================

  /**
   * 检查文件大小是否超出限制
   * @param {File} file 文件对象
   * @returns {boolean}
   */
  function isFileSizeExceeded(file) {
    return file.size > MAX_FILE_SIZE;
  }

  /**
   * 格式化文件大小
   * @param {number} bytes 字节数
   * @returns {string} 格式化后的文件大小
   */
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ==============================================
  // 文件处理
  // ==============================================

  /**
   * 处理课件上传
   * @param {Event} event 上传事件
   * @param {Array} materialsArray 课件数组引用
   * @param {Function} renderCallback 渲染回调函数
   */
  function handleMaterialUpload(event, materialsArray, renderCallback) {
    const files = event.target.files;
    if (!files.length) return;

    Array.from(files).forEach(file => {
      // 检查文件类型
      if (!isValidFileType(file)) {
        alert(`文件 ${file.name} 类型不支持，仅支持 PDF/DOCX/JPG/PNG/MP3/MP4 格式`);
        return;
      }

      // 检查文件大小
      if (isFileSizeExceeded(file)) {
        alert(`文件 ${file.name} 大小超过50MB限制`);
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        const material = {
          id: 'material_' + Date.now() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: getFileType(file.name),
          size: formatFileSize(file.size),
          url: e.target.result,
          file: file
        };

        materialsArray.push(material);
        if (typeof renderCallback === 'function') {
          renderCallback();
        }
      };
      reader.readAsDataURL(file);
    });

    // 清空文件输入框，允许重复选择相同文件
    event.target.value = '';
  }

  /**
   * 处理作业/考试附件上传
   * @param {FileList} files 文件列表
   * @param {string} fileListId 文件列表容器ID
   */
  function handleAssignmentFileUpload(files, fileListId) {
    const fileList = document.getElementById(fileListId);

    Array.from(files).forEach(file => {
      // 检查文件类型
      if (!isValidFileType(file)) {
        alert(`文件 ${file.name} 类型不支持，仅支持 PDF/DOCX/JPG/PNG/MP3/MP4 格式`);
        return;
      }

      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <span class="file-name">${file.name}</span>
        <button type="button" class="file-remove" onclick="this.parentElement.remove()">×</button>
      `;
      fileList.appendChild(fileItem);
    });
  }

  // ==============================================
  // 公共接口
  // ==============================================

  return {
    // 文件类型检查
    isValidFileType,
    getFileType,

    // 文件大小检查
    isFileSizeExceeded,
    formatFileSize,

    // 文件处理
    handleMaterialUpload,
    handleAssignmentFileUpload,

    // 常量
    MAX_FILE_SIZE,
    SUPPORTED_FILE_TYPES
  };
})();