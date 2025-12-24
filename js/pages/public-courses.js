/**
 * 课程信息展示页面逻辑
 */

document.addEventListener('DOMContentLoaded', function () {
  // 初始化页面
  initPage();
});

/**
 * 初始化页面
 */
function initPage() {
  // 填充筛选下拉框
  populateFilters();

  // 加载所有课程
  loadCourses();

  // 绑定搜索事件
  bindSearchEvents();
}

/**
 * 填充筛选下拉框选项
 */
function populateFilters() {
  // 填充院系下拉框
  const departmentSelect = document.getElementById('department');
  const departments = CourseService.getDepartments();
  departments.forEach(dept => {
    const option = document.createElement('option');
    option.value = dept;
    option.textContent = dept;
    departmentSelect.appendChild(option);
  });

  // 填充学分下拉框
  const creditSelect = document.getElementById('credit');
  const credits = CourseService.getCredits();
  credits.forEach(credit => {
    const option = document.createElement('option');
    option.value = credit;
    option.textContent = credit + ' 学分';
    creditSelect.appendChild(option);
  });
}

/**
 * 加载课程列表
 * @param {Object} filters 可选的筛选条件
 */
function loadCourses(filters = {}) {
  const courses = CourseService.search(filters);
  renderCourses(courses);
  updateResultsCount(courses.length);
}

/**
 * 渲染课程卡片
 * @param {Array} courses 课程数组
 */
function renderCourses(courses) {
  const grid = document.getElementById('coursesGrid');
  const emptyState = document.getElementById('emptyState');

  if (courses.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  grid.innerHTML = courses.map(course => createCourseCard(course)).join('');
}

/**
 * 创建课程卡片 HTML
 * @param {Object} course 课程对象
 * @returns {string} HTML 字符串
 */
function createCourseCard(course) {
  return `
        <div class="course-card" data-course-id="${course.id}">
            <div class="course-header">
                <div class="course-id">${course.id}</div>
                <h3 class="course-name">${course.name}</h3>
                <div class="course-meta">
                    <span class="course-meta-item">
                        <span>📖</span>
                        <span>${course.credit} 学分</span>
                    </span>
                    <span class="course-meta-item">
                        <span>👥</span>
                        <span>容量 ${course.capacity} 人</span>
                    </span>
                </div>
            </div>
            <div class="course-body">
                <div class="course-info-row">
                    <span class="course-info-label">授课教师</span>
                    <span class="course-info-value">${course.teacher}</span>
                </div>
                <div class="course-info-row">
                    <span class="course-info-label">开课院系</span>
                    <span class="course-info-value">${course.department}</span>
                </div>
                <div class="course-description">
                    ${course.description}
                </div>
            </div>
            <div class="course-footer">
                <div class="course-requirements">
                    <span>📋</span>
                    <span>${course.requirements}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * 更新结果数量显示
 * @param {number} count 课程数量
 */
function updateResultsCount(count) {
  document.getElementById('courseCount').textContent = count;
}

/**
 * 绑定搜索相关事件
 */
function bindSearchEvents() {
  const searchForm = document.getElementById('searchForm');
  const resetBtn = document.getElementById('resetBtn');

  // 表单提交事件
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    performSearch();
  });

  // 重置按钮事件
  resetBtn.addEventListener('click', function () {
    searchForm.reset();
    loadCourses();
  });

  // 下拉框变化时自动搜索
  document.getElementById('department').addEventListener('change', performSearch);
  document.getElementById('credit').addEventListener('change', performSearch);
}

/**
 * 执行搜索
 */
function performSearch() {
  const filters = {
    keyword: document.getElementById('keyword').value.trim(),
    id: document.getElementById('courseId').value.trim(),
    department: document.getElementById('department').value,
    credit: document.getElementById('credit').value
  };

  // 移除空值
  Object.keys(filters).forEach(key => {
    if (!filters[key]) delete filters[key];
  });

  loadCourses(filters);
}
