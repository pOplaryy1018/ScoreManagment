// 教师端课程管理模块

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 检查用户权限
  checkTeacherPermission();
  
  // 初始化课程管理模块
  initCourseManagement();
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

// 初始化课程管理模块
function initCourseManagement() {
  // 生成课程管理界面
  generateCourseManagementUI();
  
  // 加载教师课程数据
  loadTeacherCourses();
  
  // 绑定事件监听器
  bindCourseManagementEvents();
}

// 生成课程管理界面HTML
function generateCourseManagementUI() {
  const mainContent = document.getElementById('course-management-content');
  
  if (!mainContent) return;
  
  mainContent.innerHTML = `
    <div class="course-management">
      <!-- 课程列表区域 -->
      <div class="course-list-section">
        <div class="section-header">
          <h2>课程列表</h2>
          <button class="btn btn-primary" id="addCourseBtn">
            <span class="btn-icon">+</span>
            新建课程
          </button>
        </div>
        <div class="course-grid" id="courseGrid">
          <!-- 课程卡片将通过JS动态生成 -->
        </div>
      </div>
      
      <!-- 课程编辑区域 -->
      <div class="course-edit-section" id="courseEditSection" style="display: none;">
        <div class="section-header">
          <h2 id="editSectionTitle">编辑课程</h2>
          <button class="btn btn-outline" id="backToListBtn">
            <span class="btn-icon">←</span>
            返回列表
          </button>
        </div>
        
        <form class="course-form" id="courseForm">
          <div class="form-row">
            <div class="form-group">
              <label for="courseName" class="form-label">课程名称 *</label>
              <input type="text" id="courseName" name="courseName" class="form-input" required>
              <div class="form-error" id="courseNameError"></div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="courseDescription" class="form-label">课程简介</label>
              <textarea id="courseDescription" name="courseDescription" class="form-textarea" rows="4"></textarea>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">封面图上传</label>
              <div class="image-upload">
                <input type="file" id="coverImage" accept="image/jpeg,image/png" class="file-input">
                <label for="coverImage" class="upload-label">
                  <span class="upload-icon">📷</span>
                  <span>选择封面图片 (JPG/PNG)</span>
                </label>
                <div class="image-preview" id="coverPreview"></div>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">首页轮播图</label>
              <div class="multi-image-upload">
                <input type="file" id="homeCarousel" accept="image/jpeg,image/png" multiple class="file-input">
                <label for="homeCarousel" class="upload-label">
                  <span class="upload-icon">🖼️</span>
                  <span>选择首页轮播图片 (可多选)</span>
                </label>
                <div class="image-gallery" id="homeCarouselGallery"></div>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">课程内轮播图</label>
              <div class="multi-image-upload">
                <input type="file" id="courseCarousel" accept="image/jpeg,image/png" multiple class="file-input">
                <label for="courseCarousel" class="upload-label">
                  <span class="upload-icon">🖼️</span>
                  <span>选择课程内轮播图片 (可多选)</span>
                </label>
                <div class="image-gallery" id="courseCarouselGallery"></div>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">功能设置</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="enableComments" name="enableComments">
                  <span class="checkbox-custom"></span>
                  开启评论区
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" id="enableNotes" name="enableNotes">
                  <span class="checkbox-custom"></span>
                  开启笔记区
                </label>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">课件资源管理</label>
              <div class="material-upload">
                <input type="file" id="materialUpload" multiple class="file-input" 
                       accept=".pdf,.docx,.jpg,.png,.mp3,.mp4">
                <label for="materialUpload" class="upload-label">
                  <span class="upload-icon">📎</span>
                  <span>选择课件文件 (PDF/DOCX/JPG/PNG/MP3/MP4)</span>
                </label>
                <div class="material-list" id="materialList">
                  <!-- 课件列表将通过JS动态生成 -->
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-outline" id="saveDraftBtn">保存草稿</button>
            <button type="button" class="btn btn-secondary" id="previewBtn">预览</button>
            <button type="submit" class="btn btn-primary" id="publishBtn">发布</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 预览模态框 -->
    <div class="modal" id="previewModal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>课程预览</h3>
          <button class="modal-close" id="closePreviewBtn">×</button>
        </div>
        <div class="modal-body" id="previewContent">
          <!-- 预览内容将通过JS动态生成 -->
        </div>
      </div>
    </div>
  `;
}

// 加载教师课程数据
function loadTeacherCourses() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const courseGrid = document.getElementById('courseGrid');
  
  if (!courseGrid) return;
  
  // 获取教师负责的课程
  const teacherCourses = getTeacherCourses(currentUser.id || 'teacher001');
  
  if (teacherCourses.length === 0) {
    courseGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>暂无课程</h3>
        <p>您还没有创建任何课程，点击"新建课程"开始创建</p>
      </div>
    `;
    return;
  }
  
  // 生成课程卡片
  courseGrid.innerHTML = teacherCourses.map(course => `
    <div class="course-card" data-course-id="${course.id}">
      <div class="course-card__cover">
        <img src="../public/images/courses/${course.id}.jpg" alt="${course.name}" 
             onerror="this.src='../public/images/courses/default.jpg'">
        <div class="course-card__status status-${course.status === '进行中' ? 'published' : 'draft'}">
          ${course.status === '进行中' ? '已发布' : '草稿'}
        </div>
      </div>
      <div class="course-card__content">
        <h3 class="course-card__title">${course.name}</h3>
        <p class="course-card__description">${course.description || '暂无描述'}</p>
        <div class="course-card__meta">
          <span class="meta-item">${course.credit}学分</span>
          <span class="meta-item">${course.hours}学时</span>
          <span class="meta-item">${course.students}名学生</span>
        </div>
      </div>
      <div class="course-card__actions">
        <button class="btn btn-sm btn-outline" onclick="editCourse('${course.id}')">编辑</button>
        <button class="btn btn-sm btn-secondary" onclick="previewCourse('${course.id}')">预览</button>
        ${course.status === '进行中' ? 
          `<button class="btn btn-sm btn-warning" onclick="withdrawCourse('${course.id}')">撤回</button>` : 
          `<button class="btn btn-sm btn-primary" onclick="publishCourse('${course.id}')">发布</button>`
        }
        <button class="btn btn-sm btn-danger" onclick="deleteCourse('${course.id}')">删除</button>
      </div>
    </div>
  `).join('');
}

// 绑定课程管理事件
function bindCourseManagementEvents() {
  // 新建课程按钮
  const addCourseBtn = document.getElementById('addCourseBtn');
  if (addCourseBtn) {
    addCourseBtn.addEventListener('click', createNewCourse);
  }
  
  // 返回列表按钮
  const backToListBtn = document.getElementById('backToListBtn');
  if (backToListBtn) {
    backToListBtn.addEventListener('click', showCourseList);
  }
  
  // 表单提交
  const courseForm = document.getElementById('courseForm');
  if (courseForm) {
    courseForm.addEventListener('submit', handleFormSubmit);
  }
  
  // 保存草稿按钮
  const saveDraftBtn = document.getElementById('saveDraftBtn');
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', saveCourseDraft);
  }
  
  // 预览按钮
  const previewBtn = document.getElementById('previewBtn');
  if (previewBtn) {
    previewBtn.addEventListener('click', previewCourseFromForm);
  }
  
  // 关闭预览按钮
  const closePreviewBtn = document.getElementById('closePreviewBtn');
  if (closePreviewBtn) {
    closePreviewBtn.addEventListener('click', closePreview);
  }
  
  // 图片上传事件
  bindImageUploadEvents();
}

// 绑定图片上传事件
function bindImageUploadEvents() {
  // 封面图上传
  const coverImageInput = document.getElementById('coverImage');
  if (coverImageInput) {
    coverImageInput.addEventListener('change', handleCoverImageUpload);
  }
  
  // 首页轮播图上传
  const homeCarouselInput = document.getElementById('homeCarousel');
  if (homeCarouselInput) {
    homeCarouselInput.addEventListener('change', handleHomeCarouselUpload);
  }
  
  // 课程内轮播图上传
  const courseCarouselInput = document.getElementById('courseCarousel');
  if (courseCarouselInput) {
    courseCarouselInput.addEventListener('change', handleCourseCarouselUpload);
  }
  
  // 课件上传
  const materialUploadInput = document.getElementById('materialUpload');
  if (materialUploadInput) {
    materialUploadInput.addEventListener('change', handleMaterialUpload);
  }
}

// 处理封面图上传
function handleCoverImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const preview = document.getElementById('coverPreview');
  if (!preview) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    preview.innerHTML = `
      <div class="preview-item">
        <img src="${e.target.result}" alt="封面预览">
        <button type="button" class="remove-image" onclick="removeCoverImage()">×</button>
      </div>
    `;
  };
  reader.readAsDataURL(file);
}

// 处理首页轮播图上传
function handleHomeCarouselUpload(event) {
  handleMultiImageUpload(event, 'homeCarouselGallery');
}

// 处理课程内轮播图上传
function handleCourseCarouselUpload(event) {
  handleMultiImageUpload(event, 'courseCarouselGallery');
}

// 处理多图上传
function handleMultiImageUpload(event, galleryId) {
  const files = event.target.files;
  if (!files.length) return;
  
  const gallery = document.getElementById(galleryId);
  if (!gallery) return;
  
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageId = 'img_' + Date.now() + Math.random().toString(36).substr(2, 9);
      const imageItem = document.createElement('div');
      imageItem.className = 'gallery-item';
      imageItem.draggable = true;
      imageItem.innerHTML = `
        <img src="${e.target.result}" alt="轮播图">
        <button type="button" class="remove-image" onclick="removeGalleryImage('${galleryId}', '${imageId}')">×</button>
      `;
      imageItem.id = imageId;
      
      // 添加拖拽事件
      imageItem.addEventListener('dragstart', handleDragStart);
      imageItem.addEventListener('dragover', handleDragOver);
      imageItem.addEventListener('drop', handleDrop);
      imageItem.addEventListener('dragend', handleDragEnd);
      
      gallery.appendChild(imageItem);
    };
    reader.readAsDataURL(file);
  });
}

// 拖拽排序功能
let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
  this.classList.add('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
  e.preventDefault();
  if (draggedItem !== this) {
    this.parentNode.insertBefore(draggedItem, this.nextSibling);
  }
}

function handleDragEnd() {
  this.classList.remove('dragging');
  draggedItem = null;
}

// 创建新课程
function createNewCourse() {
  const editSection = document.getElementById('courseEditSection');
  const listSection = document.querySelector('.course-list-section');
  const title = document.getElementById('editSectionTitle');
  
  if (editSection && listSection && title) {
    title.textContent = '新建课程';
    listSection.style.display = 'none';
    editSection.style.display = 'block';
    
    // 清空表单
    resetCourseForm();
  }
}

// 编辑课程
function editCourse(courseId) {
  const course = getCourseById(courseId);
  if (!course) {
    alert('课程不存在');
    return;
  }
  
  const editSection = document.getElementById('courseEditSection');
  const listSection = document.querySelector('.course-list-section');
  const title = document.getElementById('editSectionTitle');
  
  if (editSection && listSection && title) {
    title.textContent = '编辑课程：' + course.name;
    listSection.style.display = 'none';
    editSection.style.display = 'block';
    
    // 填充表单数据
    fillCourseForm(course);
  }
}

// 填充课程表单
function fillCourseForm(course) {
  document.getElementById('courseName').value = course.name || '';
  document.getElementById('courseDescription').value = course.description || '';
  document.getElementById('enableComments').checked = course.enableComments || false;
  document.getElementById('enableNotes').checked = course.enableNotes || false;
  
  // 从sessionStorage加载草稿数据
  const draftData = sessionStorage.getItem(`course_draft_${course.id}`);
  if (draftData) {
    const draft = JSON.parse(draftData);
    // 填充草稿数据
    if (draft.materials) {
      loadMaterialsData(draft.materials);
    }
  }
}

// 重置课程表单
function resetCourseForm() {
  document.getElementById('courseForm').reset();
  document.getElementById('coverPreview').innerHTML = '';
  document.getElementById('homeCarouselGallery').innerHTML = '';
  document.getElementById('courseCarouselGallery').innerHTML = '';
  clearMaterials();
}

// 显示课程列表
function showCourseList() {
  const editSection = document.getElementById('courseEditSection');
  const listSection = document.querySelector('.course-list-section');
  
  if (editSection && listSection) {
    editSection.style.display = 'none';
    listSection.style.display = 'block';
    
    // 重新加载课程数据
    loadTeacherCourses();
  }
}

// 处理表单提交
function handleFormSubmit(event) {
  event.preventDefault();
  
  if (!validateCourseForm()) {
    return;
  }
  
  const formData = getFormData();
  
  // 这里应该调用API保存课程数据
  console.log('保存课程数据:', formData);
  
  alert('课程发布成功！');
  showCourseList();
}

// 验证课程表单
function validateCourseForm() {
  const courseName = document.getElementById('courseName').value.trim();
  const errorElement = document.getElementById('courseNameError');
  
  if (!courseName) {
    if (errorElement) {
      errorElement.textContent = '课程名称不能为空';
    }
    return false;
  }
  
  if (errorElement) {
    errorElement.textContent = '';
  }
  
  return true;
}

// 获取表单数据
function getFormData() {
  return {
    name: document.getElementById('courseName').value.trim(),
    description: document.getElementById('courseDescription').value.trim(),
    enableComments: document.getElementById('enableComments').checked,
    enableNotes: document.getElementById('enableNotes').checked,
    materials: getMaterialsData()
    // 这里应该包含图片数据
  };
}

// 保存课程草稿
function saveCourseDraft() {
  if (!validateCourseForm()) {
    return;
  }
  
  const formData = getFormData();
  const courseId = 'draft_' + Date.now();
  
  // 保存到sessionStorage
  sessionStorage.setItem(`course_draft_${courseId}`, JSON.stringify(formData));
  
  alert('草稿保存成功！');
}

// 预览课程
function previewCourseFromForm() {
  if (!validateCourseForm()) {
    return;
  }
  
  const formData = getFormData();
  showCoursePreview(formData);
}

// 显示课程预览
function showCoursePreview(courseData) {
  const modal = document.getElementById('previewModal');
  const previewContent = document.getElementById('previewContent');
  
  if (!modal || !previewContent) return;
  
  previewContent.innerHTML = `
    <div class="course-preview">
      <div class="preview-header">
        <h2>${courseData.name}</h2>
        <p>${courseData.description || '暂无描述'}</p>
      </div>
      <div class="preview-content">
        <div class="preview-section">
          <h3>课程设置</h3>
          <ul>
            <li>评论区：${courseData.enableComments ? '开启' : '关闭'}</li>
            <li>笔记区：${courseData.enableNotes ? '开启' : '关闭'}</li>
          </ul>
        </div>
      </div>
    </div>
  `;
  
  modal.style.display = 'block';
}

// 关闭预览
function closePreview() {
  const modal = document.getElementById('previewModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// 预览课程（从列表）
function previewCourse(courseId) {
  const course = getCourseById(courseId);
  if (course) {
    showCoursePreview(course);
  }
}

// 撤回课程
function withdrawCourse(courseId) {
  if (confirm('确定要撤回该课程吗？撤回后学生将无法查看该课程。')) {
    // 这里应该调用API撤回课程
    console.log('撤回课程:', courseId);
    alert('课程已撤回');
    loadTeacherCourses();
  }
}

// 发布课程
function publishCourse(courseId) {
  if (confirm('确定要发布该课程吗？发布后学生将可以查看该课程。')) {
    // 这里应该调用API发布课程
    console.log('发布课程:', courseId);
    alert('课程已发布');
    loadTeacherCourses();
  }
}

// 删除课程
function deleteCourse(courseId) {
  if (confirm('确定要删除该课程吗？此操作不可恢复。')) {
    // 这里应该调用API删除课程
    console.log('删除课程:', courseId);
    alert('课程已删除');
    loadTeacherCourses();
  }
}

// 移除封面图
function removeCoverImage() {
  const preview = document.getElementById('coverPreview');
  if (preview) {
    preview.innerHTML = '';
  }
  const input = document.getElementById('coverImage');
  if (input) {
    input.value = '';
  }
}

// 移除轮播图
function removeGalleryImage(galleryId, imageId) {
  const imageElement = document.getElementById(imageId);
  if (imageElement) {
    imageElement.remove();
  }
}

// 获取教师负责的课程（模拟数据）
function getTeacherCourses(teacherId) {
  const teacherCoursesMap = {
    'teacher001': ['CS101', 'MATH201'],
    'teacher002': ['ENG301'],
    'teacher003': ['PHY102']
  };
  
  const courseIds = teacherCoursesMap[teacherId] || [];
  const allCourses = [
    {
      id: 'CS101',
      name: '计算机科学导论',
      teacher: '张教授',
      semester: '2024-2025学年第一学期',
      credit: 3,
      hours: 48,
      students: 45,
      status: '进行中',
      description: '计算机科学基础课程，涵盖编程基础、算法和数据结构。'
    },
    {
      id: 'MATH201',
      name: '高等数学',
      teacher: '李教授',
      semester: '2024-2025学年第一学期',
      credit: 4,
      hours: 64,
      students: 60,
      status: '进行中',
      description: '大学数学基础课程，包括微积分、线性代数等内容。'
    }
  ];
  
  return allCourses.filter(course => courseIds.includes(course.id));
}

// 根据课程ID获取课程信息
function getCourseById(courseId) {
  const allCourses = [
    {
      id: 'CS101',
      name: '计算机科学导论',
      teacher: '张教授',
      semester: '2024-2025学年第一学期',
      credit: 3,
      hours: 48,
      students: 45,
      status: '进行中',
      description: '计算机科学基础课程，涵盖编程基础、算法和数据结构。'
    },
    {
      id: 'MATH201',
      name: '高等数学',
      teacher: '李教授',
      semester: '2024-2025学年第一学期',
      credit: 4,
      hours: 64,
      students: 60,
      status: '进行中',
      description: '大学数学基础课程，包括微积分、线性代数等内容。'
    }
  ];
  
  return allCourses.find(course => course.id === courseId);
}

// 课件管理相关功能
let courseMaterials = [];

// 处理课件上传
function handleMaterialUpload(event) {
  const files = event.target.files;
  if (!files.length) return;
  
  Array.from(files).forEach(file => {
    // 检查文件类型
    if (!isValidFileType(file)) {
      alert(`文件 ${file.name} 类型不支持，仅支持 PDF/DOCX/JPG/PNG/MP3/MP4 格式`);
      return;
    }
    
    // 检查文件大小（限制为50MB）
    if (file.size > 50 * 1024 * 1024) {
      alert(`文件 ${file.name} 大小超过50MB限制`);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const material = {
        id: 'material_' + Date.now() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: getFileType(file.name),
        size: formatFileSize(file.size),
        url: e.target.result,
        file: file
      };
      
      courseMaterials.push(material);
      renderMaterialList();
    };
    reader.readAsDataURL(file);
  });
  
  // 清空文件输入框，允许重复选择相同文件
  event.target.value = '';
}

// 检查文件类型是否有效
function isValidFileType(file) {
  const validTypes = ['.pdf', '.docx', '.jpg', '.jpeg', '.png', '.mp3', '.mp4'];
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  return validTypes.includes(fileExtension);
}

// 获取文件类型
function getFileType(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  const typeMap = {
    'pdf': 'document',
    'docx': 'document',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'mp3': 'audio',
    'mp4': 'video'
  };
  return typeMap[extension] || 'other';
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 渲染课件列表
function renderMaterialList() {
  const materialList = document.getElementById('materialList');
  if (!materialList) return;
  
  if (courseMaterials.length === 0) {
    materialList.innerHTML = '<div class="empty-materials">暂无课件，请上传文件</div>';
    return;
  }
  
  // 按类型分组
  const groupedMaterials = groupMaterialsByType(courseMaterials);
  
  let html = '';
  
  // 文档类型
  if (groupedMaterials.document && groupedMaterials.document.length > 0) {
    html += createMaterialGroup('document', '文档', groupedMaterials.document);
  }
  
  // 图片类型
  if (groupedMaterials.image && groupedMaterials.image.length > 0) {
    html += createMaterialGroup('image', '图片', groupedMaterials.image);
  }
  
  // 音频类型
  if (groupedMaterials.audio && groupedMaterials.audio.length > 0) {
    html += createMaterialGroup('audio', '音频', groupedMaterials.audio);
  }
  
  // 视频类型
  if (groupedMaterials.video && groupedMaterials.video.length > 0) {
    html += createMaterialGroup('video', '视频', groupedMaterials.video);
  }
  
  materialList.innerHTML = html;
  
  // 绑定预览事件
  bindMaterialPreviewEvents();
}

// 按类型分组课件
function groupMaterialsByType(materials) {
  return materials.reduce((groups, material) => {
    if (!groups[material.type]) {
      groups[material.type] = [];
    }
    groups[material.type].push(material);
    return groups;
  }, {});
}

// 创建课件分组
function createMaterialGroup(type, label, materials) {
  return `
    <details class="material-group" open>
      <summary class="material-group__summary">
        <span class="material-group__icon">${getTypeIcon(type)}</span>
        <span class="material-group__label">${label}</span>
        <span class="material-group__count">(${materials.length}个文件)</span>
      </summary>
      <div class="material-group__content">
        ${materials.map(material => createMaterialItem(material)).join('')}
      </div>
    </details>
  `;
}

// 获取类型图标
function getTypeIcon(type) {
  const icons = {
    'document': '📄',
    'image': '🖼️',
    'audio': '🎵',
    'video': '🎬',
    'other': '📎'
  };
  return icons[type] || icons.other;
}

// 创建课件项
function createMaterialItem(material) {
  return `
    <div class="material-item" data-material-id="${material.id}">
      <div class="material-item__icon">${getTypeIcon(material.type)}</div>
      <div class="material-item__info">
        <div class="material-item__name" data-material-id="${material.id}">${material.name}</div>
        <div class="material-item__meta">${material.size}</div>
      </div>
      <button type="button" class="material-item__delete" onclick="removeMaterial('${material.id}')">
        <span class="delete-icon">×</span>
      </button>
    </div>
  `;
}

// 绑定课件预览事件
function bindMaterialPreviewEvents() {
  const materialNames = document.querySelectorAll('.material-item__name');
  materialNames.forEach(name => {
    name.addEventListener('click', function() {
      const materialId = this.getAttribute('data-material-id');
      previewMaterial(materialId);
    });
  });
}

// 预览课件
function previewMaterial(materialId) {
  const material = courseMaterials.find(m => m.id === materialId);
  if (!material) return;
  
  let previewContent = '';
  let previewClass = '';
  
  switch (material.type) {
    case 'image':
      previewContent = `<img src="${material.url}" alt="${material.name}" class="material-preview-image">`;
      previewClass = 'material-preview-image';
      break;
    case 'audio':
      previewContent = `<audio controls class="material-preview-audio"><source src="${material.url}" type="audio/mp3">您的浏览器不支持音频播放</audio>`;
      previewClass = 'material-preview-audio';
      break;
    case 'video':
      previewContent = `<video controls class="material-preview-video"><source src="${material.url}" type="video/mp4">您的浏览器不支持视频播放</video>`;
      previewClass = 'material-preview-video';
      break;
    case 'document':
    default:
      previewContent = `
        <div class="material-preview-document">
          <div class="material-preview-document-icon">📄</div>
          <h3>文档预览</h3>
          <p>${material.name}</p>
          <p style="color: #666;">文档预览功能需要后端支持</p>
        </div>
      `;
      previewClass = 'material-preview-document';
      break;
  }
  
  // 创建预览模态框
  const modal = document.createElement('div');
  modal.className = 'material-preview-modal';
  
  modal.innerHTML = `
    <div class="material-preview-content">
      <div class="material-preview-header">
        <h3 class="material-preview-title">${material.name}</h3>
        <button class="material-preview-close" onclick="this.closest('.material-preview-modal').remove()">×</button>
      </div>
      <div class="material-preview-body ${previewClass}">
        ${previewContent}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 点击模态框背景关闭
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// 删除课件
function removeMaterial(materialId) {
  if (confirm('确定要删除这个课件吗？')) {
    courseMaterials = courseMaterials.filter(m => m.id !== materialId);
    renderMaterialList();
  }
}

// 获取课件数据（用于保存到sessionStorage）
function getMaterialsData() {
  return courseMaterials.map(material => ({
    id: material.id,
    name: material.name,
    type: material.type,
    size: material.size,
    url: material.url
  }));
}

// 加载课件数据（从sessionStorage）
function loadMaterialsData(materialsData) {
  courseMaterials = materialsData || [];
  renderMaterialList();
}

// 清空课件数据
function clearMaterials() {
  courseMaterials = [];
  renderMaterialList();
}