// ==============================================
// 成绩管理模块 (GradeModule)
// 负责成绩录入、成绩构成设置、成绩统计等功能
// ==============================================

const GradeModule = (function() {
  'use strict';

  // 默认成绩构成数据
  const DEFAULT_GRADE_COMPONENTS = [
    { name: '平时分', weight: 30, maxScore: 100 },
    { name: '期中考试', weight: 30, maxScore: 100 },
    { name: '期末考试', weight: 40, maxScore: 100 }
  ];

  // 兼容通知工具（优先使用 UI.notification，其次 UIModule）
  const uiNotification = (function() {
    if (window.UI && window.UI.notification) return window.UI.notification;
    if (window.UIModule) {
      return {
        success: (msg) => (UIModule.showSuccess ? UIModule.showSuccess(msg) : console.log(msg)),
        error: (msg) => (UIModule.showError ? UIModule.showError(msg) : console.error(msg)),
        warning: (msg) => (UIModule.showWarning ? UIModule.showWarning(msg) : console.warn(msg)),
        info: (msg) => (UIModule.showInfo ? UIModule.showInfo(msg) : console.info(msg))
      };
    }
    return {
      success: (msg) => console.log(msg),
      error: (msg) => console.error(msg),
      warning: (msg) => console.warn(msg),
      info: (msg) => console.info(msg)
    };
  })();

  // ==============================================
  // 课程选择功能（修复版本）
  // ==============================================

  /**
   * 渲染课程选择下拉框（修复版本）
   * 确保仅显示当前登录教师已发布的课程
   */
  function renderCourseSelectorForGrades() {
    // 安全获取当前教师信息
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    
    // 检查用户权限
    if (!currentUser || currentUser.role !== 'teacher') {
      console.warn('[成绩模块] 用户未登录或非教师身份');
      window.location.href = '../index.html';
      return;
    }
    
    const currentTeacherId = currentUser.id;
    
    if (!currentTeacherId) {
      console.error('[成绩模块] 无法获取教师ID');
      window.location.href = '../index.html';
      return;
    }
    
    // 健壮读取课程列表
    let publishedCourses = [];
    try {
      const coursesData = localStorage.getItem('publishedCourses');
      publishedCourses = coursesData ? JSON.parse(coursesData) : [];
      
      // 如果localStorage中没有数据，尝试从全局数据源获取
      if (!Array.isArray(publishedCourses) || publishedCourses.length === 0) {
        publishedCourses = window.coursesData || [];
      }
    } catch (error) {
      console.error('[成绩模块] 读取课程数据失败:', error);
      publishedCourses = window.coursesData || [];
    }
    
    // 严格过滤课程
    const teacherCourses = publishedCourses.filter(course => {
      // 检查课程状态和教师ID
      const isPublished = course.status === 'published' || course.status === '进行中';
      const isTeacherCourse = course.teacherId === currentTeacherId || 
                             course.teacher === currentUser.name;
      
      return isPublished && isTeacherCourse;
    });
    
    // 动态渲染下拉框
    const container = document.getElementById('course-selection-container');
    if (!container) {
      console.error('[成绩模块] 课程选择容器未找到');
      return;
    }
    
    if (teacherCourses.length === 0) {
      container.innerHTML = `
        <div class="course-selection-empty">
          <p>暂无可登记成绩的课程</p>
          <p class="empty-hint">请先发布课程或联系管理员</p>
        </div>
      `;
      
      // 禁用开始录入成绩按钮
      const startBtn = document.getElementById('start-grade-entry-btn');
      if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = '暂无可选课程';
      }
      
      // 开发阶段调试信息
      console.warn(`[成绩模块] 教师 ${currentTeacherId} 无已发布课程`);
      console.log('[成绩模块] 可用课程数据:', publishedCourses);
      
    } else {
      container.innerHTML = `
        <div class="course-selection-form">
          <label for="course-select">选择课程：</label>
          <select id="course-select" class="form-select">
            <option value="">请选择课程</option>
            ${teacherCourses.map(course => `
              <option value="${course.id}">${course.name} (${course.id})</option>
            `).join('')}
          </select>
          <button type="button" class="btn btn-primary" id="start-grade-entry-btn">
            开始录入成绩
          </button>
        </div>
      `;
      
      // 绑定课程选择事件
      bindCourseSelectionEvents();
    }
  }

  /**
   * 绑定课程选择事件（下拉框版本）
   */
  function bindCourseSelectionEvents() {
    const courseSelect = document.getElementById('course-select');
    const startBtn = document.getElementById('start-grade-entry-btn');
    
    if (courseSelect && startBtn) {
      // 课程选择变化时更新按钮状态
      courseSelect.addEventListener('change', function() {
        startBtn.disabled = !this.value;
      });
      
      // 开始录入成绩
      startBtn.addEventListener('click', function() {
        const selectedCourseId = courseSelect.value;
        if (selectedCourseId) {
          selectCourseForGrades(selectedCourseId);
        }
      });
    }
  }

  /**
   * 绑定课程卡片选择事件
   */
  function bindCourseCardSelectionEvents() {
    const selectButtons = document.querySelectorAll('.select-course-btn');
    
    selectButtons.forEach(button => {
      button.addEventListener('click', function() {
        const courseCard = this.closest('.course-card');
        const courseId = courseCard.dataset.courseId;
        
        if (courseId) {
          selectCourseForGrades(courseId);
        }
      });
    });
  }

  /**
   * 选择课程进行成绩录入
   * @param {string} courseId 课程ID
   */
  function selectCourseForGrades(courseId) {
    // 保存选择的课程ID
    sessionStorage.setItem('selectedCourseId', courseId);
    
    // 重新渲染成绩管理模块
    renderGradeModule();
  }

  // ==============================================
  // 成绩管理核心功能
  // ==============================================

  /**
   * 渲染成绩管理模块
   */
  function renderGradeModule() {
    const container = document.getElementById('grade-module-container');
    if (!container) return;
    
    // 检查是否已选择课程
    const selectedCourseId = sessionStorage.getItem('selectedCourseId');
    
    if (!selectedCourseId) {
      // 显示课程选择面板
      renderCourseSelectionPanel(container);
    } else {
      // 显示成绩管理界面
      renderGradeManagementInterface(container, selectedCourseId);
    }
  }

  /**
   * 渲染课程选择面板
   */
  function renderCourseSelectionPanel(container) {
    const currentUser = Utils.storage.get('user', {});
    const teacherId = currentUser.id || 'teacher1';
    
    // 获取教师负责的课程
    const teacherCourses = getTeacherCourses(teacherId);
    
    container.innerHTML = `
      <div class="course-selection-panel">
        <div class="panel-header">
          <h2>📚 请选择课程</h2>
          <p>选择您要管理成绩的课程</p>
        </div>
        
        <div class="course-list">
          ${teacherCourses.length > 0 ? teacherCourses.map(course => `
            <div class="course-card" data-course-id="${course.id}">
              <div class="course-info">
                <h3>${course.name}</h3>
                <p class="course-id">课程代码：${course.id}</p>
                <p class="course-details">学分：${course.credit} | 教师：${course.teacher}</p>
                <p class="course-description">${course.description}</p>
              </div>
              <button type="button" class="btn btn-primary select-course-btn">选择课程</button>
            </div>
          `).join('') : `
            <div class="no-courses">
              <p>暂无负责的课程</p>
            </div>
          `}
        </div>
      </div>
    `;
    
    // 绑定课程卡片选择事件
    bindCourseCardSelectionEvents();
  }

  /**
   * 渲染成绩管理界面
   */
  function renderGradeManagementInterface(container, courseId) {
    const course = getCourseById(courseId);
    
    container.innerHTML = `
      <div class="grade-module">
        <!-- 顶部导航/面包屑 -->
        <div class="grade-navigation">
          <span class="breadcrumb">
            <a href="#" class="back-to-courses">← 返回课程选择</a>
            <span class="separator">/</span>
            <span class="current-course">${course ? course.name : '未知课程'}</span>
          </span>
        </div>
        
        <!-- A. 成绩构成设置区 -->
        <div class="grade-components-section">
          <h3>1. 设置成绩构成</h3>
          <div class="components-table-container">
            <table class="components-table">
              <thead>
                <tr>
                  <th>组成部分</th>
                  <th>权重（%）</th>
                  <th>满分值</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="components-tbody">
                <!-- 动态生成 -->
              </tbody>
            </table>
          </div>
          <div class="components-actions">
            <button type="button" class="btn btn-secondary" id="add-component-btn">+ 添加项</button>
            <button type="button" class="btn btn-primary" id="save-components-btn">保存构成</button>
          </div>
          <div id="weight-error" class="error-message" style="display: none;">
            ⚠️ 权重总和必须为 100%
          </div>
        </div>
        
        <!-- B. 成绩录入与统计区 -->
        <div class="grade-entry-section">
          <h3>2. 录入与管理成绩</h3>
          <div class="grade-table-container">
            <table class="grade-table" id="grade-table">
              <!-- 动态生成表头 -->
            </table>
          </div>
          <div class="grade-actions">
            <button type="button" class="btn btn-secondary" id="import-csv-btn">导入 CSV</button>
            <button type="button" class="btn btn-secondary" id="export-csv-btn">导出成绩报表</button>
            <button type="button" class="btn btn-primary" id="save-grades-btn">保存成绩</button>
          </div>
        </div>
      </div>
    `;
    
    // 绑定事件
    bindGradeModuleEvents(courseId);
    
    // 加载数据
    loadGradeComponents(courseId);
    loadGradeData(courseId);
  }

  /**
   * 绑定成绩管理模块事件
   */
  function bindGradeModuleEvents(courseId) {
    // 绑定返回课程选择事件
    const backLink = document.querySelector('.back-to-courses');
    if (backLink) {
      backLink.addEventListener('click', function(e) {
        e.preventDefault();
        backToCourseSelection();
      });
    }
    
    // 添加成绩构成项
    document.getElementById('add-component-btn').addEventListener('click', function() {
      addComponentRow(courseId);
    });
    
    // 保存成绩构成
    document.getElementById('save-components-btn').addEventListener('click', function() {
      saveGradeComponents(courseId);
    });
    
    // 导入CSV
    document.getElementById('import-csv-btn').addEventListener('click', function() {
      alert('演示版仅支持手动录入');
    });
    
    // 导出CSV
    document.getElementById('export-csv-btn').addEventListener('click', function() {
      exportGradesToCSV(courseId);
    });
    
    // 保存成绩
    document.getElementById('save-grades-btn').addEventListener('click', function() {
      saveGradeData(courseId);
    });
    
    // 实时校验权重
    document.addEventListener('input', function(e) {
      if (e.target.matches('.weight-input')) {
        validateWeightSum();
      }
    });
    
    // 实时计算总分
    document.addEventListener('input', function(e) {
      if (e.target.matches('.score-input')) {
        calculateTotalScore(e.target);
      }
    });
  }

  /**
   * 返回课程选择
   */
  function backToCourseSelection() {
    // 清除选择的课程ID
    sessionStorage.removeItem('selectedCourseId');
    
    // 重新渲染成绩管理模块
    renderGradeModule();
  }

  // ==============================================
  // 成绩构成管理
  // ==============================================

  /**
   * 加载成绩构成数据
   */
  function loadGradeComponents(courseId) {
    let components = sessionStorage.getItem(`gradeComponents_${courseId}`);
    if (components) {
      components = JSON.parse(components);
      renderComponentsTable(components);
    } else {
      // 如果没有保存的数据，显示默认行
      addComponentRow(courseId);
    }
  }

  /**
   * 添加成绩构成行
   */
  function addComponentRow(courseId) {
    const components = getCurrentComponents();
    components.push({ name: '', weight: 0, maxScore: 100 });
    renderComponentsTable(components);
  }

  /**
   * 渲染成绩构成表格
   */
  function renderComponentsTable(components) {
    const tbody = document.getElementById('components-tbody');
    tbody.innerHTML = components.map((component, index) => `
      <tr>
        <td>
          <input type="text" class="name-input" value="${component.name}" data-index="${index}">
        </td>
        <td>
          <input type="number" class="weight-input" value="${component.weight}" min="0" max="100" data-index="${index}">
        </td>
        <td>
          <input type="number" class="maxscore-input" value="${component.maxScore}" min="0" max="1000" data-index="${index}">
        </td>
        <td>
          <button type="button" class="btn btn-danger btn-sm" onclick="GradeModule.removeComponentRow(${index})">删除</button>
        </td>
      </tr>
    `).join('');
    
    // 重新渲染成绩录入表格
    renderGradeTable();
  }

  /**
   * 删除成绩构成行
   */
  function removeComponentRow(index) {
    const components = getCurrentComponents();
    if (components.length <= 1) {
      alert('至少需要保留一个成绩构成项');
      return;
    }
    components.splice(index, 1);
    renderComponentsTable(components);
  }

  /**
   * 获取当前成绩构成
   */
  function getCurrentComponents() {
    const inputs = document.querySelectorAll('#components-tbody input');
    const components = [];
    
    for (let i = 0; i < inputs.length; i += 3) {
      const nameInput = inputs[i];
      const weightInput = inputs[i + 1];
      const maxScoreInput = inputs[i + 2];
      
      if (nameInput && weightInput && maxScoreInput) {
        components.push({
          name: nameInput.value || '',
          weight: parseInt(weightInput.value) || 0,
          maxScore: parseInt(maxScoreInput.value) || 100
        });
      }
    }
    
    return components;
  }

  /**
   * 保存成绩构成
   */
  function saveGradeComponents(courseId) {
    const components = getCurrentComponents();
    sessionStorage.setItem(`gradeComponents_${courseId}`, JSON.stringify(components));
    uiNotification.success('成绩构成已保存！');
    
    // 重新渲染成绩录入表格
    renderGradeTable();
  }

  /**
   * 验证权重总和
   */
  function validateWeightSum() {
    const components = getCurrentComponents();
    const totalWeight = components.reduce((sum, comp) => sum + (comp.weight || 0), 0);
    const errorElement = document.getElementById('weight-error');
    
    if (totalWeight !== 100) {
      errorElement.style.display = 'block';
      return false;
    } else {
      errorElement.style.display = 'none';
      return true;
    }
  }

  // ==============================================
  // 成绩录入功能
  // ==============================================

  /**
   * 渲染成绩录入表格
   */
  function renderGradeTable() {
    const components = getCurrentComponents();
    const table = document.getElementById('grade-table');
    
    // 生成表头
    let headerHTML = '<thead><tr><th>学号</th><th>姓名</th>';
    components.forEach(comp => {
      headerHTML += `<th>${comp.name}</th>`;
    });
    headerHTML += '<th>总分</th></tr></thead>';
    
    // 生成学生数据行
    let bodyHTML = '<tbody>';
    const students = getStudentsByCourse(sessionStorage.getItem('selectedCourseId'));
    
    students.forEach(student => {
      bodyHTML += `<tr data-student-id="${student.id}">`;
      bodyHTML += `<td>${student.id}</td>`;
      bodyHTML += `<td>${student.name}</td>`;
      
      components.forEach(comp => {
        bodyHTML += `<td><input type="number" class="score-input" data-component="${comp.name}" min="0" max="${comp.maxScore}" value=""></td>`;
      });
      
      bodyHTML += `<td class="total-score">0</td>`;
      bodyHTML += '</tr>';
    });
    bodyHTML += '</tbody>';
    
    table.innerHTML = headerHTML + bodyHTML;
    
    // 加载已有成绩数据
    loadExistingGrades();
  }

  /**
   * 计算总分
   */
  function calculateTotalScore(input) {
    const row = input.closest('tr');
    calculateRowTotal(row);
  }

  /**
   * 计算单行总分
   */
  function calculateRowTotal(row) {
    const components = getCurrentComponents();
    const scoreInputs = row.querySelectorAll('.score-input');
    let totalScore = 0;
    
    components.forEach((comp, index) => {
      const input = scoreInputs[index];
      const score = parseFloat(input.value) || 0;
      const weight = comp.weight / 100;
      totalScore += score * weight;
    });
    
    const totalElement = row.querySelector('.total-score');
    totalElement.textContent = Math.round(totalScore);
  }

  /**
   * 加载已有成绩数据
   */
  function loadExistingGrades() {
    const courseId = sessionStorage.getItem('selectedCourseId');
    const gradeData = sessionStorage.getItem(`courseGrades_${courseId}`);
    
    if (gradeData) {
      const grades = JSON.parse(gradeData);
      
      grades.forEach(grade => {
        const row = document.querySelector(`tr[data-student-id="${grade.studentId}"]`);
        if (row) {
          Object.entries(grade.scores).forEach(([componentName, score]) => {
            const input = row.querySelector(`input[data-component="${componentName}"]`);
            if (input) {
              input.value = score;
            }
          });
          
          const totalElement = row.querySelector('.total-score');
          totalElement.textContent = grade.total;
        }
      });
    }
  }

  /**
   * 保存成绩数据
   */
  function saveGradeData(courseId) {
    const components = getCurrentComponents();
    const rows = document.querySelectorAll('#grade-table tbody tr');
    
    const gradeData = [];
    rows.forEach(row => {
      const studentId = row.dataset.studentId;
      const studentName = row.cells[1].textContent;
      const scores = {};
      
      components.forEach((comp, index) => {
        const input = row.querySelector(`input[data-component="${comp.name}"]`);
        scores[comp.name] = parseFloat(input.value) || 0;
      });
      
      const totalScore = parseFloat(row.querySelector('.total-score').textContent) || 0;
      
      gradeData.push({
        studentId,
        name: studentName,
        scores,
        total: totalScore
      });
    });
    
    sessionStorage.setItem(`courseGrades_${courseId}`, JSON.stringify(gradeData));
    uiNotification.success('成绩数据已保存！');
  }

  /**
   * 导出成绩到CSV
   */
  function exportGradesToCSV(courseId) {
    const course = getCourseById(courseId);
    const gradeData = sessionStorage.getItem(`courseGrades_${courseId}`);
    
    if (!gradeData) {
      uiNotification.error('暂无成绩数据可导出');
      return;
    }
    
    const grades = JSON.parse(gradeData);
    const components = getCurrentComponents();
    
    // 生成CSV内容
    let csvContent = '学号,姓名';
    components.forEach(comp => {
      csvContent += `,${comp.name}`;
    });
    csvContent += ',总分\n';
    
    grades.forEach(grade => {
      csvContent += `${grade.studentId},${grade.name}`;
      components.forEach(comp => {
        csvContent += `,${grade.scores[comp.name] || 0}`;
      });
      csvContent += `,${grade.total}\n`;
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${course.name}_成绩报表.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ==============================================
  // 辅助函数
  // ==============================================

  /**
   * 获取教师负责的课程
   */
  function getTeacherCourses(teacherId) {
    const allCourses = window.coursesData || [];
    return allCourses.filter(course => {
      return course.status === '进行中';
    });
  }

  /**
   * 根据ID获取课程信息
   */
  function getCourseById(courseId) {
    const allCourses = window.coursesData || [];
    return allCourses.find(course => course.id === courseId) || null;
  }

  /**
   * 获取课程学生列表
   */
  function getStudentsByCourse(courseId) {
    // 模拟学生数据
    return [
      { id: '2024001', name: '张三' },
      { id: '2024002', name: '李四' },
      { id: '2024003', name: '王五' },
      { id: '2024004', name: '赵六' }
    ];
  }

  // ==============================================
  // 公共接口
  // ==============================================

  return {
    // 初始化函数
    init: function() {
      console.log('[GradeModule] 初始化成绩管理模块');
      // 在页面加载时渲染成绩管理模块
      renderGradeModule();
    },

    // 课程选择功能
    renderCourseSelectorForGrades,
    selectCourseForGrades,
    backToCourseSelection,
    
    // 成绩管理核心功能
    renderGradeModule,
    renderCourseSelectionPanel,
    renderGradeManagementInterface,
    bindGradeModuleEvents,
    
    // 成绩构成管理
    loadGradeComponents,
    addComponentRow,
    removeComponentRow,
    renderComponentsTable,
    getCurrentComponents,
    saveGradeComponents,
    validateWeightSum,
    
    // 成绩录入功能
    renderGradeTable,
    calculateTotalScore,
    calculateRowTotal,
    loadExistingGrades,
    saveGradeData,
    exportGradesToCSV,
    
    // 辅助函数
    getTeacherCourses,
    getCourseById,
    getStudentsByCourse
  };
})();