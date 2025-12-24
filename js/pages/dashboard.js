/**
 * 仪表板页面逻辑
 */

document.addEventListener('DOMContentLoaded', function () {
    // 检查登录状态和会话有效期
    if (!checkAuth()) {
        return;
    }

    // 加载统计数据
    loadStatistics();

    // 加载用户信息
    loadUserInfo();

    // 绑定退出登录按钮事件
    initLogoutButton();
});

/**
 * 检查登录状态和会话有效期
 * @returns {boolean} 是否已登录且会话有效
 */
function checkAuth() {
    const user = Utils.storage.get('user');
    const loginTime = Utils.storage.get('loginTime');
    const SESSION_DURATION = 2 * 60 * 1000; // 2分钟有效期

    // 检查是否已登录
    if (!user) {
        window.location.href = '../index.html';
        return false;
    }

    // 检查会话是否过期
    if (loginTime) {
        const now = Date.now();
        if (now - loginTime > SESSION_DURATION) {
            // 会话已过期
            Utils.storage.remove('user');
            Utils.storage.remove('token');
            Utils.storage.remove('loginTime');
            alert('登录会话已过期，请重新登录');
            window.location.href = '../index.html';
            return false;
        }
    }

    return true;
}

/**
 * 初始化退出登录按钮
 */
function initLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

/**
 * 加载统计数据
 */
function loadStatistics() {
    // 检查数据是否存在
    const studentsData = window.StudentsData || [];
    const gradesData = window.GradesData || [];

    const stats = {
        totalStudents: studentsData.length,
        totalGrades: gradesData.length,
        averageScore: calculateAverageScore(gradesData),
        passRate: calculatePassRate(gradesData)
    };

    // 更新页面显示
    updateStatDisplay(stats);
}

/**
 * 计算平均分数
 * @param {Array} gradesData 成绩数据
 * @returns {number}
 */
function calculateAverageScore(gradesData) {
    if (!gradesData || gradesData.length === 0) return 0;
    const total = gradesData.reduce((sum, g) => sum + (g.score || 0), 0);
    return Math.round(total / gradesData.length);
}

/**
 * 计算及格率
 * @param {Array} gradesData 成绩数据
 * @returns {string}
 */
function calculatePassRate(gradesData) {
    if (!gradesData || gradesData.length === 0) return '0%';
    const passCount = gradesData.filter(g => (g.score || 0) >= 60).length;
    return Math.round((passCount / gradesData.length) * 100) + '%';
}

/**
 * 更新统计显示
 * @param {object} stats 
 */
function updateStatDisplay(stats) {
    // 更新学生总数
    const studentCountEl = document.getElementById('studentCount');
    if (studentCountEl) studentCountEl.textContent = stats.totalStudents;

    // 更新成绩记录数
    const gradeCountEl = document.getElementById('gradeCount');
    if (gradeCountEl) gradeCountEl.textContent = stats.totalGrades;

    // 更新教师数量（从用户数据获取）
    const teacherCountEl = document.getElementById('teacherCount');
    if (teacherCountEl && window.UserData) {
        const teachers = UserData.userService.getUsersByRole('teacher');
        teacherCountEl.textContent = teachers.length;
    }

    // 更新平均成绩
    const avgGradeEl = document.getElementById('avgGrade');
    if (avgGradeEl) avgGradeEl.textContent = stats.averageScore;
}

/**
 * 加载用户信息
 */
function loadUserInfo() {
    const user = Utils.storage.get('user');
    const userNameEl = document.getElementById('userName');
    if (userNameEl && user) {
        userNameEl.textContent = user.name || '用户';
    }
}

/**
 * 退出登录
 */
function logout() {
    // 清除登录状态
    Utils.storage.remove('user');
    Utils.storage.remove('token');
    Utils.storage.remove('loginTime');

    // 显示提示
    alert('已成功退出登录');

    // 跳转到登录页
    window.location.href = '../index.html';
}
