// 教师端页面管理脚本

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 检查用户权限
  checkTeacherPermission();
  
  // 初始化教师端页面
  initTeacherDashboard();
  
  // 绑定事件监听器
  bindEventListeners();
});

// 检查教师权限
function checkTeacherPermission() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  if (!currentUser || currentUser.role !== 'teacher') {
    alert('您没有访问教师端的权限，请重新登录！');
    window.location.href = '../index.html';
    return false;
  }
  
  return true;
}

// 初始化教师仪表板
function initTeacherDashboard() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // 更新用户信息
  updateUserInfo(currentUser);
  
  // 生成教师菜单
  generateTeacherMenu();
  
  // 显示欢迎信息
  showWelcomeMessage(currentUser);
}

// 更新用户信息显示
function updateUserInfo(user) {
  const userNameElement = document.getElementById('userName');
  const userRoleElement = document.getElementById('userRole');
  
  if (userNameElement) {
    userNameElement.textContent = user.name || '教师';
  }
  
  if (userRoleElement) {
    userRoleElement.textContent = `[${user.role || '教师'}]`;
  }
}

// 生成教师菜单
function generateTeacherMenu() {
  const sidebarMenu = document.getElementById('sidebarMenu');
  
  if (!sidebarMenu) return;
  
  // 清空现有菜单
  sidebarMenu.innerHTML = '';
  
  // 教师菜单项
  const teacherMenuItems = [
    {
      id: 'dashboard',
      icon: '🏠',
      text: '仪表板',
      active: true
    },
    {
      id: 'course-management',
      icon: '📚',
      text: '课程管理'
    },
    {
      id: 'assignments',
      icon: '📝',
      text: '作业考试'
    },
    {
      id: 'grade-entry',
      icon: '✏️',
      text: '成绩录入'
    }
  ];
  
  // 生成菜单HTML
  teacherMenuItems.forEach(item => {
    const menuItem = document.createElement('li');
    menuItem.className = `menu__item ${item.active ? 'menu__item--active' : ''}`;
    
    menuItem.innerHTML = `
      <a href="#" class="menu__link" data-page="${item.id}">
        <span class="menu__icon">${item.icon}</span>
        <span class="menu__text">${item.text}</span>
      </a>
    `;
    
    sidebarMenu.appendChild(menuItem);
  });
}

// 显示欢迎信息
function showWelcomeMessage(user) {
  const mainContent = document.getElementById('main-content');
  
  if (!mainContent) return;
  
  mainContent.innerHTML = `
    <div class="teacher-welcome">
      <h2>欢迎，${user.name || '教师'}！</h2>
      <p>请选择左侧菜单进行操作。您可以管理课程、发布作业、录入成绩等。</p>
      
      <div class="teacher-cards">
        <div class="teacher-card" data-page="course-management">
          <span class="teacher-card__icon">📚</span>
          <h3 class="teacher-card__title">课程管理</h3>
          <p class="teacher-card__desc">查看和管理您负责的课程信息，包括课程详情、学生名单等。</p>
        </div>
        
        <div class="teacher-card" data-page="assignments">
          <span class="teacher-card__icon">📝</span>
          <h3 class="teacher-card__title">作业考试</h3>
          <p class="teacher-card__desc">发布作业和考试，管理提交情况，设置截止日期等。</p>
        </div>
        
        <div class="teacher-card" data-page="grade-entry">
          <span class="teacher-card__icon">✏️</span>
          <h3 class="teacher-card__title">成绩录入</h3>
          <p class="teacher-card__desc">录入和修改学生成绩，查看成绩统计和分析报告。</p>
        </div>
      </div>
    </div>
  `;
}

// 绑定事件监听器
function bindEventListeners() {
  // 退出登录按钮
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // 菜单点击事件
  document.addEventListener('click', function(e) {
    // 菜单链接点击
    if (e.target.closest('.menu__link')) {
      e.preventDefault();
      const page = e.target.closest('.menu__link').dataset.page;
      handleMenuClick(page);
    }
    
    // 功能卡片点击
    if (e.target.closest('.teacher-card')) {
      const page = e.target.closest('.teacher-card').dataset.page;
      handleMenuClick(page);
    }
  });
}

// 处理菜单点击
function handleMenuClick(page) {
  // 更新菜单激活状态
  updateMenuActiveState(page);
  
  // 根据页面加载不同内容
  switch (page) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'course-management':
      loadCourseManagement();
      break;
    case 'assignments':
      loadAssignments();
      break;
    case 'grade-entry':
      loadGradeEntry();
      break;
    default:
      loadDashboard();
  }
}

// 更新菜单激活状态
function updateMenuActiveState(activePage) {
  const menuItems = document.querySelectorAll('.menu__item');
  
  menuItems.forEach(item => {
    const link = item.querySelector('.menu__link');
    if (link && link.dataset.page === activePage) {
      item.classList.add('menu__item--active');
    } else {
      item.classList.remove('menu__item--active');
    }
  });
}

// 加载仪表板
function loadDashboard() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  showWelcomeMessage(currentUser);
}

// 加载课程管理页面
function loadCourseManagement() {
  const mainContent = document.getElementById('main-content');
  const teacherCourses = getTeacherCourses();
  
  mainContent.innerHTML = `
    <div class="teacher-form">
      <h2 class="teacher-form__title">课程管理</h2>
      
      <div class="teacher-table-container">
        <table class="teacher-table">
          <thead>
            <tr>
              <th>课程编号</th>
              <th>课程名称</th>
              <th>学期</th>
              <th>学分</th>
              <th>学时</th>
              <th>学生人数</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${teacherCourses.map(course => `
              <tr>
                <td>${course.id}</td>
                <td>${course.name}</td>
                <td>${course.semester}</td>
                <td>${course.credit}</td>
                <td>${course.hours}</td>
                <td>${course.students}</td>
                <td>${course.status}</td>
                <td>
                  <button class="btn btn-outline" onclick="viewCourseDetail('${course.id}')">查看</button>
                  <button class="btn btn-primary" onclick="editCourse('${course.id}')">编辑</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 获取教师负责的课程
function getTeacherCourses() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // 这里应该调用courses.js中的函数，暂时使用模拟数据
  return [
    {
      id: 'CS101',
      name: '计算机科学导论',
      semester: '2024-2025学年第一学期',
      credit: 3,
      hours: 48,
      students: 45,
      status: '进行中'
    },
    {
      id: 'MATH201',
      name: '高等数学',
      semester: '2024-2025学年第一学期',
      credit: 4,
      hours: 64,
      students: 60,
      status: '进行中'
    }
  ];
}

// 加载作业考试页面
function loadAssignments() {
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <div class="teacher-form">
      <h2 class="teacher-form__title">作业考试管理</h2>
      <p>作业考试管理功能正在开发中...</p>
    </div>
  `;
}

// 加载成绩录入页面
function loadGradeEntry() {
  const mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <div class="teacher-form">
      <h2 class="teacher-form__title">成绩录入</h2>
      <p>成绩录入功能正在开发中...</p>
    </div>
  `;
}

// 处理退出登录
function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('loginState');
    window.location.href = '../index.html';
  }
}

// 查看课程详情
function viewCourseDetail(courseId) {
  alert(`查看课程详情：${courseId}`);
}

// 编辑课程
function editCourse(courseId) {
  alert(`编辑课程：${courseId}`);
}