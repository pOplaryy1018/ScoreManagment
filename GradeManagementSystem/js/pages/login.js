// 登录页面逻辑

document.addEventListener('DOMContentLoaded', function() {
    // 初始化登录表单
    initLoginForm();
    
    // 检查是否已登录
    if (Utils.isLoggedIn()) {
        Utils.navigateTo('pages/dashboard.html');
        return;
    }
});

/**
 * 初始化登录表单
 */
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (!loginForm) return;
    
    // 表单提交事件
    loginForm.addEventListener('submit', handleLogin);
    
    // 输入框实时验证
    usernameInput.addEventListener('input', debounce(validateUsername, 300));
    passwordInput.addEventListener('input', debounce(validatePassword, 300));
    
    // 回车键提交
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin(e);
        }
    });
}

/**
 * 处理登录
 * @param {Event} e 事件对象
 */
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.querySelector('.login-btn');
    
    // 验证输入
    if (!validateUsername()) return;
    if (!validatePassword()) return;
    
    // 禁用登录按钮
    loginBtn.disabled = true;
    loginBtn.textContent = '登录中...';
    
    // 模拟登录请求
    setTimeout(() => {
        const user = UserData.userService.authenticate(username, password);
        
        if (user) {
            // 登录成功
            Utils.storage.set('user', user);
            Utils.storage.set('token', 'mock_token_' + Date.now());
            
            // 更新最后登录时间
            UserData.userService.updateUser(user.id, {
                lastLogin: new Date().toISOString()
            });
            
            Utils.showMessage('登录成功！', 'success');
            
            // 跳转到仪表板
            setTimeout(() => {
                Utils.navigateTo('pages/dashboard.html');
            }, 1000);
        } else {
            // 登录失败
            Utils.showMessage('用户名或密码错误！', 'error');
            
            // 启用登录按钮
            loginBtn.disabled = false;
            loginBtn.textContent = '登录';
        }
    }, 1000);
}

/**
 * 验证用户名
 * @returns {boolean} 是否有效
 */
function validateUsername() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    const formGroup = usernameInput.closest('.form-group');
    
    // 清除之前的错误状态
    clearError(formGroup);
    
    if (!username) {
        showError(formGroup, '请输入用户名');
        return false;
    }
    
    if (username.length < 3) {
        showError(formGroup, '用户名至少3个字符');
        return false;
    }
    
    if (username.length > 20) {
        showError(formGroup, '用户名不能超过20个字符');
        return false;
    }
    
    showSuccess(formGroup);
    return true;
}

/**
 * 验证密码
 * @returns {boolean} 是否有效
 */
function validatePassword() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    const formGroup = passwordInput.closest('.form-group');
    
    // 清除之前的错误状态
    clearError(formGroup);
    
    if (!password) {
        showError(formGroup, '请输入密码');
        return false;
    }
    
    if (password.length < 6) {
        showError(formGroup, '密码至少6个字符');
        return false;
    }
    
    showSuccess(formGroup);
    return true;
}

/**
 * 显示错误信息
 * @param {HTMLElement} formGroup 表单组元素
 * @param {string} message 错误信息
 */
function showError(formGroup, message) {
    clearError(formGroup);
    
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    errorEl.style.cssText = `
        color: var(--accent-color);
        font-size: 0.8rem;
        margin-top: 0.25rem;
    `;
    
    formGroup.appendChild(errorEl);
    formGroup.classList.add('error');
}

/**
 * 显示成功状态
 * @param {HTMLElement} formGroup 表单组元素
 */
function showSuccess(formGroup) {
    clearError(formGroup);
    formGroup.classList.remove('error');
    formGroup.classList.add('success');
}

/**
 * 清除错误状态
 * @param {HTMLElement} formGroup 表单组元素
 */
function clearError(formGroup) {
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    formGroup.classList.remove('error', 'success');
}

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

// 添加错误状态的CSS样式
const errorStyles = `
    .form-group.error input {
        border-color: var(--accent-color);
        box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
    }
    
    .form-group.success input {
        border-color: var(--secondary-color);
        box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.2);
    }
`;

// 动态添加样式
const styleSheet = document.createElement('style');
styleSheet.textContent = errorStyles;
document.head.appendChild(styleSheet);