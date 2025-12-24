// 教师端主入口文件
// 负责模块初始化和页面协调

// ==============================================
// 权限管理模块
// ==============================================

/**
 * 检查教师权限
 * @returns {boolean} 是否有权限
 */
function checkTeacherPermission() {
  if (window.Auth && typeof Auth.enforcePageAccess === 'function') {
    return Auth.enforcePageAccess(['teacher']);
  }

  const currentUser = Utils.storage.get('user', {});
  if (!currentUser || currentUser.role !== 'teacher') {
    alert('您没有访问教师端的权限，请重新登录！');
    window.location.href = '../index.html';
    return false;
  }
  
  return true;
}


/**
 * 初始化教师页面权限检查
 * @param {Function} onSuccess 权限验证成功后的回调函数
 */
function initTeacherPage(onSuccess) {
  document.addEventListener('DOMContentLoaded', function() {
    if (checkTeacherPermission()) {
      // 更新用户信息显示
      updateUserInfo();
      
      // 绑定通用事件
      bindCommonEvents();
      
      // 初始化所有模块
      initAllModules();
      
      // 执行成功回调
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    }
  });
}

/**
 * 更新用户信息显示
 */
function updateUserInfo() {
  const currentUser = (window.Auth && typeof Auth.getCurrentUser === 'function')
    ? Auth.getCurrentUser()
    : Utils.storage.get('user', {});
  const userNameElement = document.getElementById('userName');
  
  if (userNameElement) {
    userNameElement.textContent = (currentUser && currentUser.name) ? currentUser.name : '教师';
  }
}


// ==============================================
// 页面导航管理
// ==============================================

/**
 * 绑定页面导航事件
 */
function bindPageNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // 更新菜单激活状态
      navLinks.forEach(l => {
        l.parentElement.classList.remove('active');
      });
      this.parentElement.classList.add('active');
      
      // 根据页面显示不同内容
      const page = this.dataset.page;
      showPageContent(page);
    });
  });
}

/**
 * 显示页面内容
 * @param {string} page 页面标识
 */
function showPageContent(page) {
  // 隐藏所有页面内容
  document.querySelectorAll('.page-content').forEach(content => {
    content.style.display = 'none';
  });
  
  switch (page) {
    case 'course-management':
      document.getElementById('course-management-content').style.display = 'block';
      // 使用CourseModule加载课程数据
      try {
        if (typeof CourseModule !== 'undefined' && typeof CourseModule.loadTeacherCourses === 'function') {
          CourseModule.loadTeacherCourses();
        }
      } catch (error) {
        console.error('[TeacherManage] CourseModule.loadTeacherCourses 失败:', error);
      }
      break;
    case 'assignments':
      document.getElementById('assignments-content').style.display = 'block';
      // 使用AssignmentModule渲染作业模块
      try {
        if (typeof AssignmentModule !== 'undefined' && typeof AssignmentModule.renderAssignmentModule === 'function') {
          AssignmentModule.renderAssignmentModule('assignment');
        }
      } catch (error) {
        console.error('[TeacherManage] AssignmentModule.renderAssignmentModule 失败:', error);
      }
      break;
    case 'exams':
      document.getElementById('exams-content').style.display = 'block';
      // 使用AssignmentModule渲染考试模块
      try {
        if (typeof AssignmentModule !== 'undefined' && typeof AssignmentModule.renderAssignmentModule === 'function') {
          AssignmentModule.renderAssignmentModule('exam');
        }
      } catch (error) {
        console.error('[TeacherManage] AssignmentModule.renderAssignmentModule 失败:', error);
      }
      break;
    case 'grade-entry':
      document.getElementById('grade-entry-content').style.display = 'block';
      // 使用GradeModule加载成绩录入界面
      try {
        if (typeof GradeModule !== 'undefined' && typeof GradeModule.renderGradeModule === 'function') {
          GradeModule.renderGradeModule();
        }
      } catch (error) {
        console.error('[TeacherManage] GradeModule.renderGradeModule 失败:', error);
      }
      break;
    default:
      document.getElementById('course-management-content').style.display = 'block';
      // 使用CourseModule加载课程数据
      if (typeof CourseModule !== 'undefined' && typeof CourseModule.loadTeacherCourses === 'function') {
        CourseModule.loadTeacherCourses();
      }
  }
}

// ==============================================
// 模块初始化
// ==============================================

/**
 * 初始化教师课程数据
 */
function initTeacherCourses() {
  const currentUser = Utils.storage.get('user', {});
  const teacherId = currentUser.id;
  
  if (!teacherId) {
    console.warn('[TeacherManage] 未找到教师ID，跳过课程初始化');
    return;
  }
  
  // 清空localStorage中的teacherCourses数据，强制使用courses.js中的数据
  Utils.storage.remove('teacherCourses');
  console.log(`[TeacherManage] 已清空localStorage中的课程数据，将使用courses.js中的数据`);
  
  // 确保courses.js中的数据可以被CourseModule正确访问
  if (typeof window.coursesData === 'undefined') {
    console.warn('[TeacherManage] courses.js数据未加载，请确保courses.js已正确引入');
  } else {
    console.log(`[TeacherManage] courses.js数据已加载，共 ${window.coursesData.length} 门课程`);
  }
}

/**
 * 初始化所有模块
 */
function initAllModules() {
  console.log('[TeacherManage] 开始初始化所有模块');
  
  // 初始化教师课程数据
  initTeacherCourses();
  
  // 初始化CourseModule
  try {
    if (typeof CourseModule !== 'undefined' && typeof CourseModule.init === 'function') {
      CourseModule.init();
      console.log('[TeacherManage] CourseModule 初始化完成');
    }
  } catch (error) {
    console.error('[TeacherManage] CourseModule 初始化失败:', error);
  }
  
  // 初始化AssignmentModule
  try {
    if (typeof AssignmentModule !== 'undefined' && typeof AssignmentModule.init === 'function') {
      AssignmentModule.init();
      console.log('[TeacherManage] AssignmentModule 初始化完成');
    }
  } catch (error) {
    console.error('[TeacherManage] AssignmentModule 初始化失败:', error);
  }
  
  // 初始化GradeModule
  try {
    if (typeof GradeModule !== 'undefined' && typeof GradeModule.init === 'function') {
      GradeModule.init();
      console.log('[TeacherManage] GradeModule 初始化完成');
    }
  } catch (error) {
    console.error('[TeacherManage] GradeModule 初始化失败:', error);
  }
  
  // 初始化FileUploadHelper
  try {
    if (typeof FileUploadHelper !== 'undefined' && typeof FileUploadHelper.init === 'function') {
      FileUploadHelper.init();
      console.log('[TeacherManage] FileUploadHelper 初始化完成');
    }
  } catch (error) {
    console.error('[TeacherManage] FileUploadHelper 初始化失败:', error);
  }
  
  // 初始化UI模块（如果存在）
  try {
    if (typeof UIModule !== 'undefined' && typeof UIModule.init === 'function') {
      UIModule.init();
      console.log('[TeacherManage] UIModule 初始化完成');
    }
  } catch (error) {
    console.error('[TeacherManage] UIModule 初始化失败:', error);
  }
  
  console.log('[TeacherManage] 所有模块初始化完成');
}

// ==============================================
// 通用事件绑定
// ==============================================

/**
 * 绑定通用事件
 */
function bindCommonEvents() {
  // 绑定页面导航
  bindPageNavigation();
  
  // 绑定退出登录事件
  bindLogoutEvent();
  
  // 绑定其他通用事件
  bindOtherCommonEvents();
}

/**
 * 绑定退出登录事件
 */
function bindLogoutEvent() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (confirm('确定要退出登录吗？')) {
        if (window.Auth && typeof Auth.logout === 'function') {
          Auth.logout(true);
        } else {
          Utils.storage.remove('user');
          window.location.href = '../index.html';
        }
      }
    });
  }

}

/**
 * 绑定其他通用事件
 */
function bindOtherCommonEvents() {
  // 可以在这里添加其他通用事件绑定
  console.log('[TeacherManage] 通用事件绑定完成');
}

// ==============================================
// 页面初始化
// ==============================================

/**
 * 初始化已发布课程数据
 */
function initPublishedCourses() {
  // 确保已发布课程数据存在
  const publishedCourses = Utils.storage.get('publishedCourses', []);
  if (publishedCourses.length === 0) {
    // 如果没有已发布课程，初始化一个空数组
    Utils.storage.set('publishedCourses', []);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  if (checkTeacherPermission()) {
    // 初始化已发布课程数据
    initPublishedCourses();
    
    // 更新用户信息显示
    updateUserInfo();
    
    // 绑定通用事件
    bindCommonEvents();
    
    // 初始化所有模块
    initAllModules();
    
    // 默认显示课程管理页面
    showPageContent('course-management');
  }
});