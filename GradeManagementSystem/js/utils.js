// 工具函数库

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} wait 等待时间
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} limit 时间间隔
 * @returns {Function}
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 格式化日期
 * @param {Date|string} date 日期对象或字符串
 * @param {string} format 格式字符串
 * @returns {string}
 */
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 验证邮箱格式
 * @param {string} email 邮箱地址
 * @returns {boolean}
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 验证手机号格式
 * @param {string} phone 手机号码
 * @returns {boolean}
 */
function validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
}

/**
 * 验证密码强度
 * @param {string} password 密码
 * @returns {number} 强度等级 0-4
 */
function validatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
}

/**
 * 本地存储封装
 */
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('存储失败:', error);
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('读取失败:', error);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('删除失败:', error);
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('清空失败:', error);
        }
    }
};

/**
 * 显示消息提示
 * @param {string} message 消息内容
 * @param {string} type 消息类型 success|error|warning|info
 * @param {number} duration 显示时长(毫秒)
 */
function showMessage(message, type = 'info', duration = 3000) {
    const messageContainer = document.getElementById('message-container') || createMessageContainer();
    
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    messageContainer.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.classList.add('fade-out');
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, duration);
}

/**
 * 创建消息容器
 * @returns {HTMLElement}
 */
function createMessageContainer() {
    const container = document.createElement('div');
    container.id = 'message-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 300px;
    `;
    document.body.appendChild(container);
    return container;
}

/**
 * 生成随机ID
 * @param {number} length ID长度
 * @returns {string}
 */
function generateId(length = 8) {
    return Math.random().toString(36).substr(2, length);
}

/**
 * 深拷贝对象
 * @param {any} obj 要拷贝的对象
 * @returns {any}
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * 获取URL参数
 * @param {string} name 参数名
 * @returns {string|null}
 */
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * 设置页面标题
 * @param {string} title 标题
 */
function setPageTitle(title) {
    document.title = `${title} - 成绩管理系统`;
}

/**
 * 检查用户是否登录
 * @returns {boolean}
 */
function isLoggedIn() {
    return !!storage.get('user');
}

/**
 * 跳转到指定页面
 * @param {string} page 页面路径
 */
function navigateTo(page) {
    window.location.href = page;
}

/**
 * 导出工具函数
 */
window.Utils = {
    debounce,
    throttle,
    formatDate,
    validateEmail,
    validatePhone,
    validatePasswordStrength,
    storage,
    showMessage,
    generateId,
    deepClone,
    getUrlParam,
    setPageTitle,
    isLoggedIn,
    navigateTo
};