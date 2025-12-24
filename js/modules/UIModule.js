// UI模块 - 处理界面渲染和交互功能
const UIModule = (function() {
  'use strict';

  /**
   * 初始化UI模块
   */
  function init() {
    console.log('[UIModule] 初始化UI模块');
    // 可以在这里添加UI相关的初始化逻辑
  }

  /**
   * 显示模态框
   * @param {string} content 模态框内容
   * @param {Object} options 配置选项
   */
  function showModal(content, options = {}) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `;

    modalContent.innerHTML = `
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0;">${options.title || '提示'}</h3>
        <button class="modal-close" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      <div class="modal-footer" style="margin-top: 15px; text-align: right;">
        ${options.showCancel ? '<button class="btn btn-outline" style="margin-right: 10px;">取消</button>' : ''}
        <button class="btn btn-primary">${options.confirmText || '确定'}</button>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 绑定关闭事件
    const closeBtn = modalContent.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
      hideModal(modal);
    });

    // 绑定确认按钮事件
    const confirmBtn = modalContent.querySelector('.btn-primary');
    if (options.onConfirm) {
      confirmBtn.addEventListener('click', () => {
        options.onConfirm();
        hideModal(modal);
      });
    } else {
      confirmBtn.addEventListener('click', () => {
        hideModal(modal);
      });
    }

    // 绑定取消按钮事件
    if (options.showCancel) {
      const cancelBtn = modalContent.querySelector('.btn-outline');
      cancelBtn.addEventListener('click', () => {
        if (options.onCancel) {
          options.onCancel();
        }
        hideModal(modal);
      });
    }

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideModal(modal);
      }
    });

    return modal;
  }

  /**
   * 隐藏模态框
   * @param {HTMLElement} modal 模态框元素
   */
  function hideModal(modal) {
    if (modal && modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  }

  /**
   * 显示加载指示器
   * @param {string} message 加载消息
   */
  function showLoading(message = '加载中...') {
    const loading = document.createElement('div');
    loading.id = 'global-loading';
    loading.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255,255,255,0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;

    loading.innerHTML = `
      <div class="loading-spinner" style="
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      <p style="margin-top: 10px; color: #666;">${message}</p>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    document.body.appendChild(loading);
    return loading;
  }

  /**
   * 隐藏加载指示器
   */
  function hideLoading() {
    const loading = document.getElementById('global-loading');
    if (loading && loading.parentNode) {
      loading.parentNode.removeChild(loading);
    }
  }

  /**
   * 显示通知消息
   * @param {string} message 消息内容
   * @param {string} type 消息类型 (success, error, warning, info)
   * @param {number} duration 显示时长(毫秒)
   */
  function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      z-index: 1001;
      max-width: 300px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease-out;
    `;

    // 设置背景色
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
    notification.style.background = colors[type] || colors.info;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span>${message}</span>
        <button class="notification-close" style="
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          margin-left: 10px;
        ">×</button>
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;

    document.body.appendChild(notification);

    // 绑定关闭事件
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      hideNotification(notification);
    });

    // 自动隐藏
    if (duration > 0) {
      setTimeout(() => {
        hideNotification(notification);
      }, duration);
    }

    return notification;
  }

  /**
   * 隐藏通知消息
   * @param {HTMLElement} notification 通知元素
   */
  function hideNotification(notification) {
    if (notification && notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease-in forwards';
      
      // 添加滑出动画
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 300);
    }
  }

  /**
   * 渲染标签页
   * @param {string} containerId 容器ID
   * @param {Array} tabs 标签页配置
   * @param {Function} onTabChange 标签切换回调
   */
  function renderTabs(containerId, tabs, onTabChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tabHtml = `
      <div class="tab-header">
        ${tabs.map((tab, index) => `
          <button class="tab-button ${index === 0 ? 'active' : ''}" 
                  data-tab="${tab.id}">
            ${tab.label}
          </button>
        `).join('')}
      </div>
      <div class="tab-content">
        ${tabs.map((tab, index) => `
          <div class="tab-panel ${index === 0 ? 'active' : ''}" 
               data-tab="${tab.id}">
            ${tab.content || ''}
          </div>
        `).join('')}
      </div>
    `;

    container.innerHTML = tabHtml;

    // 绑定标签切换事件
    const tabButtons = container.querySelectorAll('.tab-button');
    const tabPanels = container.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabId = this.dataset.tab;
        
        // 更新按钮状态
        tabButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // 更新面板状态
        tabPanels.forEach(panel => panel.classList.remove('active'));
        const targetPanel = container.querySelector(`.tab-panel[data-tab="${tabId}"]`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
        
        // 执行回调
        if (onTabChange) {
          onTabChange(tabId);
        }
      });
    });
  }

  /**
   * 创建确认对话框
   * @param {string} message 确认消息
   * @param {Function} onConfirm 确认回调
   * @param {Function} onCancel 取消回调
   */
  function confirmDialog(message, onConfirm, onCancel) {
    return showModal(`
      <p>${message}</p>
    `, {
      title: '确认操作',
      showCancel: true,
      confirmText: '确定',
      onConfirm: onConfirm,
      onCancel: onCancel
    });
  }

  /**
   * 显示错误消息
   * @param {string} message 错误消息
   */
  function showError(message) {
    return showNotification(message, 'error', 5000);
  }

  /**
   * 显示成功消息
   * @param {string} message 成功消息
   */
  function showSuccess(message) {
    return showNotification(message, 'success', 3000);
  }

  /**
   * 显示警告消息
   * @param {string} message 警告消息
   */
  function showWarning(message) {
    return showNotification(message, 'warning', 4000);
  }

  /**
   * 显示信息消息
   * @param {string} message 信息消息
   */
  function showInfo(message) {
    return showNotification(message, 'info', 3000);
  }

  // 返回公共接口
  return {
    // 初始化模块
    init,
    
    // 模态框相关
    showModal,
    hideModal,
    
    // 加载指示器
    showLoading,
    hideLoading,
    
    // 通知消息
    showNotification,
    hideNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    
    // 界面组件
    renderTabs,
    confirmDialog
  };
})();