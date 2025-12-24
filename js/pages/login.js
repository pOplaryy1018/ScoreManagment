// 登录页面逻辑

// ===================
// 登录配置
// ===================
const LOGIN_CONFIG = {
    maxAttempts: 5,                    // 最大尝试次数
    lockDuration: 5 * 60 * 1000,       // 锁定时长（5分钟）
    lockStorageKey: 'login_attempts',  // localStorage 键名
    sessionDuration: 2 * 60 * 1000     // 登录会话有效期（2分钟）
};

// ===================
// 角色页面映射
// ===================

/**
 * 获取角色对应的页面
 * @param {string} role 用户角色
 * @returns {string} 对应的页面路径
 */
function getRoleBasedPage(role) {
    const rolePages = {
        'guest': 'pages/public-courses.html',             // 游客首页
        'student': 'pages/student-portal.html',           // 学生首页
        'teacher': 'pages/teacher-dashboard.html',        // 教师首页
        'teaching_admin': 'pages/teaching-admin.html',    // 教学管理员首页
        'admin': 'pages/grade-audit.html'                 // 系统管理员首页
    };
    return rolePages[role] || rolePages.guest;
}


// ===================
// 会话有效期检查
// ===================

/**
 * 检查会话是否有效（已登录且未过期）
 * @returns {boolean}
 */
function isSessionValid() {
    if (window.Auth && typeof Auth.isSessionValid === 'function') {
        return Auth.isSessionValid();
    }

    const user = Utils.storage.get('user');
    const loginTime = Utils.storage.get('loginTime');
    if (!user || !loginTime) return false;
    const now = Date.now();
    return now - loginTime <= LOGIN_CONFIG.sessionDuration;
}


/**
 * 清除过期的会话
 */
function clearExpiredSession() {
    const user = Utils.storage.get('user');
    const loginTime = Utils.storage.get('loginTime');

    if (user && loginTime) {
        const now = Date.now();
        if (now - loginTime > LOGIN_CONFIG.sessionDuration) {
            if (window.Auth && typeof Auth.clearSession === 'function') {
                Auth.clearSession();
            } else {
                Utils.storage.remove('user');
                Utils.storage.remove('token');
                Utils.storage.remove('loginTime');
            }
            console.log('登录会话已过期，已自动清除');
        }
    }
}


// ===================
// 页面初始化
// ===================
document.addEventListener('DOMContentLoaded', function () {
    // 检查是否已登录且会话未过期
    if (isSessionValid()) {
        const user = Utils.storage.get('user');
        const targetPage = getRoleBasedPage(user.role);
        if (window.Auth && typeof Auth.navigateToHome === 'function') {
            Auth.navigateToHome(user.role);
        } else {
            Utils.navigateTo(targetPage);
        }
        return;
    }


    // 如果会话已过期，清除登录状态
    clearExpiredSession();

    // 初始化登录表单
    initLoginForm();

    // 初始化角色切换
    initRoleTabs();

    // 加载记住的用户名
    loadRememberedUser();

    // 检查并显示锁定状态
    checkAndShowLockStatus();
});

// ===================
// 初始化登录表单
// ===================
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
    passwordInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleLogin(e);
        }
    });
}

// ===================
// 初始化角色切换
// ===================
function initRoleTabs() {
    document.querySelectorAll('.role-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有 active
            document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
            // 添加当前 active
            tab.classList.add('active');

            // 更新 placeholder
            const role = tab.dataset.role;
            const usernameInput = document.getElementById('username');
            switch (role) {
                case 'student':
                    usernameInput.placeholder = '请输入学号';
                    break;
                case 'teacher':
                    usernameInput.placeholder = '请输入工号';
                    break;
                case 'teachadmin':
                case 'systemadmin':
                    usernameInput.placeholder = '请输入管理员账号';
                    break;
            }
        });
    });
}

// ===================
// 切换密码可见性
// ===================
function togglePassword() {
    const pwd = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle');

    if (pwd.type === 'password') {
        pwd.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        pwd.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// ===================
// 登录锁定相关功能
// ===================

/**
 * 获取登录尝试记录
 * @param {string} username 用户名
 * @returns {object} 尝试记录
 */
function getLoginAttempts(username) {
    const attempts = Utils.storage.get(LOGIN_CONFIG.lockStorageKey, {});
    return attempts[username] || { count: 0, lockUntil: null };
}

/**
 * 保存登录尝试记录
 * @param {string} username 用户名
 * @param {object} data 尝试数据
 */
function saveLoginAttempts(username, data) {
    const attempts = Utils.storage.get(LOGIN_CONFIG.lockStorageKey, {});
    attempts[username] = data;
    Utils.storage.set(LOGIN_CONFIG.lockStorageKey, attempts);
}

/**
 * 检查账户是否被锁定
 * @param {string} username 用户名
 * @returns {boolean} 是否被锁定
 */
function isAccountLocked(username) {
    const attempts = getLoginAttempts(username);

    if (attempts.lockUntil) {
        const now = Date.now();
        if (now < attempts.lockUntil) {
            return true;
        } else {
            // 锁定已过期，清除记录
            clearFailedAttempts(username);
            return false;
        }
    }
    return false;
}

/**
 * 获取剩余锁定时间（秒）
 * @param {string} username 用户名
 * @returns {number} 剩余秒数
 */
function getRemainingLockTime(username) {
    const attempts = getLoginAttempts(username);
    if (attempts.lockUntil) {
        const remaining = Math.ceil((attempts.lockUntil - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
    }
    return 0;
}

/**
 * 记录失败的登录尝试
 * @param {string} username 用户名
 * @returns {object} 包含剩余次数和是否锁定的信息
 */
function recordFailedAttempt(username) {
    const attempts = getLoginAttempts(username);
    attempts.count = (attempts.count || 0) + 1;

    const remainingAttempts = LOGIN_CONFIG.maxAttempts - attempts.count;

    if (attempts.count >= LOGIN_CONFIG.maxAttempts) {
        // 达到最大尝试次数，锁定账户
        attempts.lockUntil = Date.now() + LOGIN_CONFIG.lockDuration;
        saveLoginAttempts(username, attempts);
        return {
            remainingAttempts: 0,
            isLocked: true,
            lockDuration: LOGIN_CONFIG.lockDuration / 1000 / 60 // 分钟
        };
    }

    saveLoginAttempts(username, attempts);
    return {
        remainingAttempts,
        isLocked: false
    };
}

/**
 * 清除失败尝试记录
 * @param {string} username 用户名
 */
function clearFailedAttempts(username) {
    const attempts = Utils.storage.get(LOGIN_CONFIG.lockStorageKey, {});
    delete attempts[username];
    Utils.storage.set(LOGIN_CONFIG.lockStorageKey, attempts);
}

/**
 * 检查并显示锁定状态
 */
function checkAndShowLockStatus() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();

    if (username && isAccountLocked(username)) {
        showLockWarning(username);
    }
}

/**
 * 显示锁定警告
 * @param {string} username 用户名
 */
function showLockWarning(username) {
    // 移除已有的警告
    removeLockWarning();

    const loginForm = document.getElementById('loginForm');
    const warningDiv = document.createElement('div');
    warningDiv.id = 'lockWarning';
    warningDiv.className = 'lock-warning';

    const remainingSeconds = getRemainingLockTime(username);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    warningDiv.innerHTML = `
        <div class="lock-icon">🔒</div>
        <div class="lock-text">
            <strong>账户已被锁定</strong>
            <p>由于多次登录失败，账户暂时被锁定</p>
            <p class="lock-countdown">剩余时间：<span id="lockTimer">${minutes}:${seconds.toString().padStart(2, '0')}</span></p>
        </div>
    `;

    loginForm.insertBefore(warningDiv, loginForm.firstChild);

    // 禁用登录按钮
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.disabled = true;
    loginBtn.textContent = '账户已锁定';

    // 开始倒计时
    startLockCountdown(username);
}

/**
 * 移除锁定警告
 */
function removeLockWarning() {
    const warning = document.getElementById('lockWarning');
    if (warning) {
        warning.remove();
    }

    // 恢复登录按钮
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = '登 录';
    }
}

/**
 * 开始锁定倒计时
 * @param {string} username 用户名
 */
function startLockCountdown(username) {
    const timerEl = document.getElementById('lockTimer');
    if (!timerEl) return;

    const interval = setInterval(() => {
        const remainingSeconds = getRemainingLockTime(username);

        if (remainingSeconds <= 0) {
            clearInterval(interval);
            removeLockWarning();
            Utils.showMessage('账户已解锁，可以重新登录', 'success');
            return;
        }

        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// ===================
// 记住密码功能
// ===================

/**
 * 保存记住的用户名
 * @param {string} username 用户名
 */
function saveRememberedUser(username) {
    Utils.storage.set('remembered_user', username);
}

/**
 * 加载记住的用户名
 */
function loadRememberedUser() {
    const rememberedUser = Utils.storage.get('remembered_user');
    if (rememberedUser) {
        const usernameInput = document.getElementById('username');
        const rememberCheckbox = document.getElementById('remember');

        if (usernameInput) {
            usernameInput.value = rememberedUser;
        }
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
    }
}

/**
 * 清除记住的用户名
 */
function clearRememberedUser() {
    Utils.storage.remove('remembered_user');
}

// ===================
// 处理登录
// ===================
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberCheckbox = document.getElementById('remember');
    const loginBtn = document.querySelector('.login-btn');

    // 验证输入
    if (!validateUsername()) return;
    if (!validatePassword()) return;

    // 检查是否被锁定
    if (isAccountLocked(username)) {
        showLockWarning(username);
        return;
    }

    // 禁用登录按钮
    loginBtn.disabled = true;
    loginBtn.textContent = '登录中...';

    // 模拟登录请求
    setTimeout(() => {
        const user = UserData.userService.authenticate(username, password);

        if (user) {
            // 登录成功
            clearFailedAttempts(username);

            // 处理记住密码
            if (rememberCheckbox && rememberCheckbox.checked) {
                saveRememberedUser(username);
            } else {
                clearRememberedUser();
            }

            if (window.Auth && typeof Auth.startSession === 'function') {
                Auth.startSession(user);
            } else {
                Utils.storage.set('user', user);
                Utils.storage.set('token', 'mock_token_' + Date.now());
                Utils.storage.set('loginTime', Date.now());
            }

            // 更新最后登录时间
            UserData.userService.updateUser(user.id, {
                lastLogin: new Date().toISOString()
            });

            Utils.showMessage('登录成功！正在跳转...', 'success');

            // 跳转到对应角色首页
            setTimeout(() => {
                const targetPage = getRoleBasedPage(user.role);
                if (window.Auth && typeof Auth.navigateToHome === 'function') {
                    Auth.navigateToHome(user.role);
                } else {
                    Utils.navigateTo(targetPage);
                }
            }, 1000);
            // 获取角色对应的页面
            function getRoleBasedPage(role) {
                const rolePages = {
                    'student': 'pages/student-dashboard.html',      // 学生首页
                    'teacher': 'pages/teacher-dashboard.html',      // 教师首页
                    'teachadmin': 'pages/teachadmin-dashboard.html', // 教学管理员首页
                    'systemadmin': 'pages/admin-dashboard.html'     // 系统管理员首页
                };
                return rolePages[role] || 'pages/dashboard.html';
            }
        } else {
            // 登录失败
            const result = recordFailedAttempt(username);

            if (result.isLocked) {
                Utils.showMessage(`登录失败次数过多，账户已被锁定 ${result.lockDuration} 分钟`, 'error');
                showLockWarning(username);
            } else {
                Utils.showMessage(`用户名或密码错误！还剩 ${result.remainingAttempts} 次尝试机会`, 'error');
            }

            // 启用登录按钮
            loginBtn.disabled = false;
            loginBtn.textContent = '登 录';
        }
    }, 1000);
}

// ===================
// 表单验证
// ===================

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