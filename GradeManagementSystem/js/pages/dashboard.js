/**
 * 仪表板页面逻辑
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkAuth();
    
    // 加载统计数据
    loadStatistics();
    
    // 加载用户信息
    loadUserInfo();
});

/**
 * 检查登录状态
 */
function checkAuth() {
    const currentUser = Utils.getStorage('currentUser');
    if (!currentUser) {
        window.location.href = '../index.html';
    }
}

/**
 * 加载统计数据
 */
function loadStatistics() {
    const stats = {
        totalStudents: StudentsData.length,
        totalGrades: GradesData.length,
        averageScore: calculateAverageScore(),
        passRate: calculatePassRate()
    };
    
    // 更新頁面顯示
    updateStatDisplay(stats);
}

/**
 * 計算平均分數
 * @returns {number}
 */
function calculateAverageScore() {
    if (GradesData.length === 0) return 0;
    const total = GradesData.reduce((sum, g) => sum + g.score, 0);
    return Math.round(total / GradesData.length);
}

/**
 * 計算及格率
 * @returns {string}
 */
function calculatePassRate() {
    if (GradesData.length === 0) return '0%';
    const passCount = GradesData.filter(g => g.score >= 60).length;
    return Math.round((passCount / GradesData.length) * 100) + '%';
}

/**
 * 更新統計顯示
 * @param {object} stats 
 */
function updateStatDisplay(stats) {
    const elements = {
        totalStudents: document.getElementById('totalStudents'),
        totalGrades: document.getElementById('totalGrades'),
        averageScore: document.getElementById('averageScore'),
        passRate: document.getElementById('passRate')
    };
    
    for (const [key, el] of Object.entries(elements)) {
        if (el) el.textContent = stats[key];
    }
}

/**
 * 加载用户信息
 */
function loadUserInfo() {
    const currentUser = Utils.getStorage('currentUser');
    const userNameEl = document.getElementById('userName');
    if (userNameEl && currentUser) {
        userNameEl.textContent = currentUser.name;
    }
}

/**
 * 登出
 */
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

