// ==============================================
// 课程管理模块 - 重构版
// 支持表格展示、筛选、富文本编辑等功能
// ==============================================

const CourseModule = (function() {
  'use strict';

  // 课件材料数组
  let courseMaterials = [];
  // 当前筛选条件
  let currentFilters = {
    search: '',
    semester: '',
    status: ''
  };

  function getTeacherIdentifiers() {
    const user = Utils.storage.get('user', {}) || {};
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      key: user.username || user.id || user.name || ''
    };
  }

  /**
   * 初始化课程管理模块
   */
  function init() {
    console.log('[CourseModule] 初始化课程管理模块');
    // 绑定通用事件
    bindCommonEvents();
    // 初始化富文本编辑器
    initRichTextEditors();
    // 加载课程数据
    loadTeacherCourses();
  }

  /**
   * 初始化课件上传功能
   */
  function initMaterialUpload() {
    const uploadZone = document.getElementById('fileUploadZone');
    const materialUpload = document.getElementById('materialUpload');
    
    if (!uploadZone || !materialUpload) return;
    
    // 点击上传区域触发文件选择
    uploadZone.addEventListener('click', function() {
      materialUpload.click();
    });
    
    // 文件选择事件
    materialUpload.addEventListener('change', function(e) {
      handleMaterialUpload(e);
    });
    
    // 拖拽上传功能
    uploadZone.addEventListener('dragover', function(e) {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', function() {
      uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', function(e) {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      
      if (e.dataTransfer.files.length > 0) {
        const event = {
          target: {
            files: e.dataTransfer.files
          }
        };
        handleMaterialUpload(event);
      }
    });
  }
  
  /**
   * 处理课件上传
   */
  function handleMaterialUpload(event) {
    const files = event.target.files;
    if (!files.length) return;
    
    Array.from(files).forEach(file => {
      // 检查文件类型
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'audio/mpeg', 'video/mp4'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const allowedExtensions = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'mp3', 'mp4'];
      
      if (!allowedExtensions.includes(fileExtension)) {
        Utils.showMessage(`文件 ${file.name} 类型不支持，仅支持 PDF/DOCX/JPG/PNG/MP3/MP4 格式`, 'error');
        return;
      }
      
      // 检查文件大小（50MB）
      if (file.size > 50 * 1024 * 1024) {
        Utils.showMessage(`文件 ${file.name} 大小超过50MB限制`, 'error');
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
        Utils.showMessage(`课件 ${file.name} 上传成功`, 'success');
      };
      reader.readAsDataURL(file);
    });
    
    // 清空文件输入框
    event.target.value = '';
  }
  
  /**
   * 获取文件类型图标
   */
  function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': '📄',
      'docx': '📝',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'mp3': '🎵',
      'mp4': '🎬'
    };
    return typeMap[ext] || '📎';
  }
  
  /**
   * 格式化文件大小
   */
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * 渲染课件列表
   */
  function renderMaterialList() {
    const materialList = document.getElementById('materialList');
    if (!materialList) return;
    
    if (courseMaterials.length === 0) {
      materialList.innerHTML = '<div class="empty-materials">暂无课件</div>';
      return;
    }
    
    materialList.innerHTML = courseMaterials.map(material => `
      <div class="material-item" data-material-id="${material.id}">
        <div class="material-item__icon">${material.type}</div>
        <div class="material-item__info">
          <div class="material-item__name">${material.name}</div>
          <div class="material-item__meta">${material.size}</div>
        </div>
        <button type="button" class="material-item__delete" onclick="CourseModule.removeMaterial('${material.id}')">
          <span class="delete-icon">×</span>
        </button>
      </div>
    `).join('');
  }
  
  /**
   * 删除课件
   */
  function removeMaterial(materialId) {
    courseMaterials = courseMaterials.filter(material => material.id !== materialId);
    renderMaterialList();
    Utils.showMessage('课件删除成功', 'success');
  }
  
  /**
   * 初始化轮播图管理
   */
  function initCarouselManager() {
    const uploadZone = document.getElementById('carouselUploadZone');
    const carouselUpload = document.getElementById('carouselUpload');
    
    if (!uploadZone || !carouselUpload) return;
    
    // 点击上传区域触发文件选择
    uploadZone.addEventListener('click', function() {
      carouselUpload.click();
    });
    
    // 文件选择事件
    carouselUpload.addEventListener('change', function(e) {
      handleCarouselUpload(e);
    });
    
    // 拖拽上传功能
    uploadZone.addEventListener('dragover', function(e) {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', function() {
      uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', function(e) {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      
      if (e.dataTransfer.files.length > 0) {
        const event = {
          target: {
            files: e.dataTransfer.files
          }
        };
        handleCarouselUpload(event);
      }
    });
  }
  
  /**
   * 处理轮播图上传
   */
  function handleCarouselUpload(event) {
    const files = event.target.files;
    if (!files.length) return;
    
    Array.from(files).slice(0, 5).forEach(file => {
      // 检查是否为图片
      if (!file.type.startsWith('image/')) {
        Utils.showMessage(`文件 ${file.name} 不是图片格式`, 'error');
        return;
      }
      
      // 检查文件大小（5MB）
      if (file.size > 5 * 1024 * 1024) {
        Utils.showMessage(`图片 ${file.name} 大小超过5MB限制`, 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const carouselItem = {
          id: 'carousel_' + Date.now() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          url: e.target.result,
          file: file
        };
        
        // 添加到轮播图数组
        if (!window.carouselImages) window.carouselImages = [];
        window.carouselImages.push(carouselItem);
        renderCarouselPreview();
        Utils.showMessage(`轮播图 ${file.name} 上传成功`, 'success');
      };
      reader.readAsDataURL(file);
    });
    
    // 清空文件输入框
    event.target.value = '';
  }
  
  /**
   * 渲染轮播图预览
   */
  function renderCarouselPreview() {
    const carouselPreview = document.getElementById('carouselPreview');
    if (!carouselPreview || !window.carouselImages) return;
    
    if (window.carouselImages.length === 0) {
      carouselPreview.innerHTML = '<div class="empty-carousel">暂无轮播图</div>';
      return;
    }
    
    carouselPreview.innerHTML = window.carouselImages.map(item => `
      <div class="carousel-item" data-carousel-id="${item.id}">
        <img src="${item.url}" alt="${item.name}">
        <button type="button" class="carousel-item__delete" onclick="CourseModule.removeCarouselItem('${item.id}')">
          ×
        </button>
      </div>
    `).join('');
  }
  
  /**
   * 删除轮播图项
   */
  function removeCarouselItem(itemId) {
    if (!window.carouselImages) return;
    window.carouselImages = window.carouselImages.filter(item => item.id !== itemId);
    renderCarouselPreview();
    Utils.showMessage('轮播图删除成功', 'success');
  }

  /**
   * 初始化富文本编辑器
   */
  function initRichTextEditors() {
    // 初始化工具栏按钮事件
    const editorToolbars = document.querySelectorAll('.editor-toolbar');
    
    editorToolbars.forEach(toolbar => {
      toolbar.addEventListener('click', function(e) {
        const target = e.target.closest('.editor-btn');
        if (!target) return;
        
        e.preventDefault();
        
        const command = target.dataset.command;
        const value = target.dataset.value;
        const editor = toolbar.nextElementSibling;
        
        if (editor && editor.contentEditable === 'true') {
          editor.focus();
          
          try {
            if (command === 'createLink') {
              const url = prompt('请输入链接地址:');
              if (url) {
                document.execCommand('createLink', false, url);
              }
            } else if (value) {
              document.execCommand(command, false, value);
            } else {
              document.execCommand(command, false, null);
            }
          } catch (error) {
            console.warn('编辑器命令执行失败:', error);
          }
        }
      });
    });

    // 监听编辑器内容变化，同步到隐藏的textarea
    const editors = document.querySelectorAll('.rich-text-editor');
    editors.forEach(editor => {
      editor.addEventListener('input', function() {
        const textareaId = editor.id + 'Text';
        const textarea = document.getElementById(textareaId);
        if (textarea) {
          textarea.value = editor.innerHTML;
        }
      });
      
      // 粘贴时清理格式
      editor.addEventListener('paste', function(e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
      });
    });
  }

  /**
   * 绑定通用事件
   */
  function bindCommonEvents() {
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

    // 筛选事件
    bindFilterEvents();

    // 自动保存草稿
    setupAutoSave();
  }

  /**
   * 绑定筛选事件
   */
  function bindFilterEvents() {
    const searchInput = document.getElementById('courseSearch');
    const semesterFilter = document.getElementById('semesterFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) {
      searchInput.addEventListener('input', function() {
        currentFilters.search = this.value.trim();
        filterCourses();
      });
    }

    if (semesterFilter) {
      semesterFilter.addEventListener('change', function() {
        currentFilters.semester = this.value;
        filterCourses();
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', function() {
        currentFilters.status = this.value;
        filterCourses();
      });
    }
  }

  /**
   * 设置自动保存草稿
   */
  function setupAutoSave() {
    const courseForm = document.getElementById('courseForm');
    if (!courseForm) return;

    // 失去焦点时保存
    courseForm.addEventListener('blur', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        saveCourseDraft();
      }
    }, true);

    // 每30秒自动保存
    setInterval(saveCourseDraft, 30000);
  }

  /**
   * 筛选课程
   */
  function filterCourses() {
    const { key } = getTeacherIdentifiers();
    const teacherCourses = getTeacherCourses(key);
    
    const filteredCourses = teacherCourses.filter(course => {
      // 搜索筛选
      if (currentFilters.search && !course.name.toLowerCase().includes(currentFilters.search.toLowerCase())) {
        return false;
      }
      
      // 学期筛选
      if (currentFilters.semester && course.semester !== currentFilters.semester) {
        return false;
      }
      
      // 状态筛选
      if (currentFilters.status) {
        const courseStatus = getCourseStatus(course);
        if (currentFilters.status !== courseStatus) {
          return false;
        }
      }
      
      return true;
    });
    
    renderCourseTable(filteredCourses);
  }

  /**
   * 获取课程状态
   */
  function getCourseStatus(course) {
    if (course.status === '进行中') return 'published';
    if (course.status === '草稿') return 'draft';
    if (course.status === '已撤回') return 'withdrawn';
    return 'draft';
  }

  /**
   * 创建新课程
   */
  function createNewCourse() {
    const editSection = document.getElementById('courseEditSection');
    const listSection = document.querySelector('.teacher-table-container');
    const title = document.getElementById('editSectionTitle');

    if (editSection && listSection && title) {
      title.textContent = '新建课程';
      listSection.style.display = 'none';
      editSection.style.display = 'block';

      // 清空表单
      resetCourseForm();
    }
  }

  /**
   * 编辑课程
   */
  function editCourse(courseId) {
    const course = getCourseById(courseId);
    if (!course) {
      Utils.showMessage('课程不存在', 'error');
      return;
    }

    const editSection = document.getElementById('courseEditSection');
    const listSection = document.querySelector('.teacher-table-container');
    const title = document.getElementById('editSectionTitle');

    if (editSection && listSection && title) {
      title.textContent = '编辑课程：' + course.name;
      listSection.style.display = 'none';
      editSection.style.display = 'block';

      // 填充表单数据
      fillCourseForm(course);
    }
  }

  /**
   * 填充课程表单
   */
  function fillCourseForm(course) {
    document.getElementById('courseName').value = course.name || '';
    document.getElementById('courseCredit').value = course.credit || 3;
    document.getElementById('courseHours').value = course.hours || 48;
    document.getElementById('courseSemester').value = course.semester || '';
    
    // 填充富文本编辑器内容
    const descriptionEditor = document.getElementById('courseDescription');
    const requirementsEditor = document.getElementById('courseRequirements');
    
    if (descriptionEditor) {
      descriptionEditor.innerHTML = course.description || '';
    }
    if (requirementsEditor) {
      requirementsEditor.innerHTML = course.requirements || '';
    }
    
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

  /**
   * 重置课程表单
   */
  function resetCourseForm() {
    document.getElementById('courseForm').reset();
    clearMaterials();
  }

  /**
   * 显示课程列表
   */
  function showCourseList() {
    const editSection = document.getElementById('courseEditSection');
    const listSection = document.querySelector('.teacher-table-container');

    if (editSection && listSection) {
      editSection.style.display = 'none';
      listSection.style.display = 'block';

      // 重新加载课程数据
      loadTeacherCourses();
    }
  }

  /**
   * 处理表单提交
   */
  function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateCourseForm()) {
      return;
    }

    const formData = getFormData();
    
    // 保存课程数据
    saveCourseData(formData);
    
    Utils.showMessage('课程发布成功！', 'success');
    showCourseList();
  }

  /**
   * 保存课程数据
   */
  function saveCourseData(courseData) {
    const currentUser = Utils.storage.get('user', {});
    const courses = Utils.storage.get('teacherCourses', []);
    
    // 生成课程ID
    const courseId = 'course_' + Date.now();
    
    const course = {
      id: courseId,
      name: courseData.name,
      credit: parseInt(courseData.credit),
      hours: parseInt(courseData.hours),
      semester: courseData.semester,
      description: courseData.description,
      requirements: courseData.requirements,
      enableComments: courseData.enableComments,
      enableNotes: courseData.enableNotes,
      teacher: currentUser.name || '教师',
      teacherId: currentUser.id,
      status: 'published',
      students: 0,
      createdAt: new Date().toISOString(),
      version: 1
    };
    
    courses.push(course);
    Utils.storage.set('teacherCourses', courses);
    
    // 清除草稿
    sessionStorage.removeItem(`course_draft_${courseId}`);
  }

  /**
   * 验证课程表单
   */
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

  /**
   * 获取表单数据
   */
  function getFormData() {
    const descriptionEditor = document.getElementById('courseDescription');
    const requirementsEditor = document.getElementById('courseRequirements');
    
    return {
      name: document.getElementById('courseName').value.trim(),
      credit: document.getElementById('courseCredit').value,
      hours: document.getElementById('courseHours').value,
      semester: document.getElementById('courseSemester').value,
      description: descriptionEditor ? descriptionEditor.innerHTML.trim() : '',
      requirements: requirementsEditor ? requirementsEditor.innerHTML.trim() : '',
      enableComments: document.getElementById('enableComments').checked,
      enableNotes: document.getElementById('enableNotes').checked,
      materials: getMaterialsData()
    };
  }

  /**
   * 保存课程草稿
   */
  function saveCourseDraft() {
    if (!validateCourseForm()) {
      return;
    }

    const formData = getFormData();
    const courseId = 'draft_' + Date.now();

    // 保存到sessionStorage
    sessionStorage.setItem(`course_draft_${courseId}`, JSON.stringify(formData));

    Utils.showMessage('草稿保存成功！', 'success');
  }

  /**
   * 预览课程
   */
  function previewCourseFromForm() {
    if (!validateCourseForm()) {
      return;
    }

    const formData = getFormData();
    showCoursePreview(formData);
  }

  /**
   * 显示课程预览
   */
  function showCoursePreview(courseData) {
    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const previewContent = document.createElement('div');
    previewContent.className = 'preview-content';
    previewContent.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `;

    previewContent.innerHTML = `
      <div class="preview-header">
        <h2>课程预览</h2>
        <button class="preview-close" onclick="this.closest('.preview-modal').remove()">×</button>
      </div>
      <div class="preview-body">
        <h3>${courseData.name}</h3>
        <p><strong>学分：</strong>${courseData.credit}</p>
        <p><strong>学时：</strong>${courseData.hours}</p>
        <p><strong>学期：</strong>${courseData.semester}</p>
        <p><strong>课程描述：</strong>${courseData.description || '暂无描述'}</p>
        <p><strong>选课要求：</strong>${courseData.requirements || '无特殊要求'}</p>
        <p><strong>课程设置：</strong></p>
        <ul>
          <li>评论区：${courseData.enableComments ? '开启' : '关闭'}</li>
          <li>笔记区：${courseData.enableNotes ? '开启' : '关闭'}</li>
        </ul>
      </div>
    `;

    modal.appendChild(previewContent);
    document.body.appendChild(modal);

    // 点击背景关闭
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  /**
   * 预览课程（从列表）
   */
  function previewCourse(courseId) {
    const course = getCourseById(courseId);
    if (course) {
      showCoursePreview(course);
    }
  }

  /**
   * 撤回课程
   */
  function withdrawCourse(courseId) {
    const course = getCourseById(courseId);
    if (!course) {
      Utils.showMessage('课程不存在', 'error');
      return;
    }
    
    if (course.status !== 'published') {
      Utils.showMessage('只有已发布的课程才能撤回', 'error');
      return;
    }
    
    if (confirm('确定要撤回该课程吗？撤回后学生将无法查看该课程。')) {
      const courses = Utils.storage.get('teacherCourses', []);
      const courseIndex = courses.findIndex(course => course.id === courseId);
      
      if (courseIndex !== -1) {
        courses[courseIndex].status = 'withdrawn';
        courses[courseIndex].withdrawnAt = new Date().toISOString();
        courses[courseIndex].lastModifiedAt = new Date().toISOString();
        
        // 记录撤回历史
        recordPublishHistory(courseId, course.version || 1, 'withdrawn');
        
        Utils.storage.set('teacherCourses', courses);
        Utils.showMessage('课程已撤回', 'success');
        
        // 发送状态变更通知
        notifyStatusChange(courseId, 'withdrawn');
        
        loadTeacherCourses();
      }
    }
  }

  /**
   * 发布课程
   */
  function publishCourse(courseId) {
    const course = getCourseById(courseId);
    if (!course) {
      Utils.showMessage('课程不存在', 'error');
      return;
    }
    
    // 发布前验证
    if (!validateCourseForPublishing(course)) {
      return;
    }
    
    if (confirm('确定要发布该课程吗？发布后学生将可以查看该课程。')) {
      const courses = Utils.storage.get('teacherCourses', []);
      const courseIndex = courses.findIndex(course => course.id === courseId);
      
      if (courseIndex !== -1) {
        // 创建新版本
        const newVersion = (course.version || 1) + 1;
        
        courses[courseIndex].status = 'published';
        courses[courseIndex].publishedAt = new Date().toISOString();
        courses[courseIndex].version = newVersion;
        courses[courseIndex].lastModifiedAt = new Date().toISOString();
        
        // 记录发布历史
        recordPublishHistory(courseId, newVersion, 'published');
        
        Utils.storage.set('teacherCourses', courses);
        Utils.showMessage('课程已发布', 'success');
        
        // 发送状态变更通知
        notifyStatusChange(courseId, 'published');
        
        loadTeacherCourses();
      }
    }
  }

  /**
   * 删除课程
   */
  function deleteCourse(courseId) {
    if (confirm('确定要删除该课程吗？此操作不可恢复。')) {
      const courses = Utils.storage.get('teacherCourses', []);
      const filteredCourses = courses.filter(course => course.id !== courseId);
      Utils.storage.set('teacherCourses', filteredCourses);
      Utils.showMessage('课程已删除', 'success');
      loadTeacherCourses();
    }
  }

  /**
   * 获取教师负责的课程
   */
  function getTeacherCourses(teacherId) {
    const { id: userId, username, name, key } = getTeacherIdentifiers();
    const teacherKey = teacherId || key;
    const identifiers = [teacherKey, username, name, userId].filter(Boolean);

    // 优先从本地存储读取教师创建/编辑的课程
    const storedCourses = Utils.storage.get('teacherCourses', []);
    if (storedCourses.length > 0) {
      const matchedStored = storedCourses.filter(course =>
        identifiers.includes(course.teacherId) || identifiers.includes(course.teacher)
      );
      if (matchedStored.length > 0) {
        return matchedStored;
      }
    }

    // 从基础课程数据匹配（按账号/姓名映射）
    try {
      if (typeof window.coursesData !== 'undefined' && window.coursesData.length > 0) {
        const teacherCoursesMap = {
          'teacher1': ['CS301A', 'CS401A'],
          'teacher2': ['MATH301', 'MATH401'],
          'teacher001': ['CS101', 'CS201'],
          'teacher002': ['ENG101', 'ENG301'],
          'teacher003': ['PHY101'],
          '张老师': ['CS301A', 'CS401A'],
          '李老师': ['MATH301', 'MATH401'],
          'user_003': ['CS301A', 'CS401A'],
          'user_004': ['MATH301', 'MATH401']
        };

        let courseIds = [];
        for (const id of identifiers) {
          if (teacherCoursesMap[id]) {
            courseIds = teacherCoursesMap[id];
            break;
          }
        }

        // 如果映射未命中，则直接按教师姓名匹配课程教师字段
        const matchedCourses = courseIds.length > 0
          ? window.coursesData.filter(course => courseIds.includes(course.id))
          : window.coursesData.filter(course => name && course.teacher === name);

        return matchedCourses.map(course => ({
          id: course.id,
          name: course.name,
          teacher: course.teacher,
          teacherId: teacherKey || course.teacher,
          semester: course.semester,
          credit: course.credit,
          hours: course.hours,
          students: course.capacity || Math.floor(Math.random() * 30) + 20,
          status: course.status === '进行中' ? 'published' : 'draft',
          description: course.description,
          requirements: course.requirements,
          enableComments: true,
          enableNotes: true,
          createdAt: new Date().toISOString(),
          publishedAt: course.status === '进行中' ? new Date().toISOString() : null,
          version: 1,
          department: course.department,
          capacity: course.capacity
        }));
      }
    } catch (error) {
      console.warn('导入课程数据失败:', error);
    }

    // 后备模拟数据
    const teacherCoursesMap = {
      'teacher001': ['CS101', 'MATH201'],
      'teacher002': ['ENG301'],
      'teacher003': ['PHY102'],
      '张老师': ['CS301A', 'CS401A'],
      '李老师': ['MATH301', 'MATH401']
    };

    let courseIds = [];
    for (const id of identifiers) {
      if (teacherCoursesMap[id]) {
        courseIds = teacherCoursesMap[id];
        break;
      }
    }

    const allCourses = [
      {
        id: 'CS101',
        name: '计算机科学导论',
        teacher: '张教授',
        teacherId: 'teacher001',
        semester: '2024-2025学年第一学期',
        credit: 3,
        hours: 48,
        students: 45,
        status: 'published',
        description: '计算机科学基础课程，涵盖编程基础、算法和数据结构。',
        requirements: '无特殊要求',
        enableComments: true,
        enableNotes: true,
        createdAt: '2024-09-01T00:00:00Z',
        publishedAt: '2024-09-01T00:00:00Z',
        version: 1
      },
      {
        id: 'MATH201',
        name: '高等数学',
        teacher: '李教授',
        teacherId: 'teacher001',
        semester: '2024-2025学年第一学期',
        credit: 4,
        hours: 64,
        students: 60,
        status: 'published',
        description: '大学数学基础课程，包括微积分、线性代数等内容。',
        requirements: '需要高中数学基础',
        enableComments: true,
        enableNotes: false,
        createdAt: '2024-09-01T00:00:00Z',
        publishedAt: '2024-09-01T00:00:00Z',
        version: 1
      }
    ];

    return allCourses.filter(course => courseIds.includes(course.id));
  }

  /**
   * 根据课程ID获取课程信息
   */
  function getCourseById(courseId) {
    const storedCourses = Utils.storage.get('teacherCourses', []);
    const course = storedCourses.find(course => course.id === courseId);
    
    if (course) {
      return course;
    }
    
    // 如果没有找到，返回模拟数据
    const allCourses = [
      {
        id: 'CS101',
        name: '计算机科学导论',
        teacher: '张教授',
        semester: '2024-2025学年第一学期',
        credit: 3,
        hours: 48,
        students: 45,
        status: 'published',
        description: '计算机科学基础课程，涵盖编程基础、算法和数据结构。',
        requirements: '无特殊要求',
        enableComments: true,
        enableNotes: true
      },
      {
        id: 'MATH201',
        name: '高等数学',
        teacher: '李教授',
        semester: '2024-2025学年第一学期',
        credit: 4,
        hours: 64,
        students: 60,
        status: 'published',
        description: '大学数学基础课程，包括微积分、线性代数等内容。',
        requirements: '需要高中数学基础',
        enableComments: true,
        enableNotes: false
      }
    ];

    return allCourses.find(course => course.id === courseId);
  }

  /**
   * 加载教师课程数据
   */
  function loadTeacherCourses() {
    const { key } = getTeacherIdentifiers();
    const teacherCourses = getTeacherCourses(key);
    
    renderCourseTable(teacherCourses);
    updateStatusStats(key);
  }

  /**
   * 更新状态统计面板
   */
  function updateStatusStats(teacherId) {
    const stats = getCourseStatusStats(teacherId);
    
    // 更新统计面板显示
    const totalElement = document.getElementById('totalCourses');
    const draftElement = document.getElementById('draftCourses');
    const publishedElement = document.getElementById('publishedCourses');
    const withdrawnElement = document.getElementById('withdrawnCourses');
    const archivedElement = document.getElementById('archivedCourses');
    
    if (totalElement) totalElement.textContent = stats.total;
    if (draftElement) draftElement.textContent = stats.draft;
    if (publishedElement) publishedElement.textContent = stats.published;
    if (withdrawnElement) withdrawnElement.textContent = stats.withdrawn;
    if (archivedElement) archivedElement.textContent = stats.archived;
  }

  /**
   * 渲染课程表格
   */
  function renderCourseTable(courses) {
    const container = document.getElementById('courseTableBody');

    if (!container) {
      console.warn('课程表格容器元素未找到');
      return;
    }

    if (courses.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            <div class="empty-icon">📚</div>
            <h3>暂无课程</h3>
            <p>您还没有创建任何课程，点击"新建课程"开始创建</p>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = courses.map(course => {
      const statusText = getStatusText(course.status);
      const statusClass = getStatusClass(course.status);
      
      // 根据课程状态生成不同的操作按钮
      let actionButtons = '';
      
      switch (course.status) {
        case 'draft':
          actionButtons = `
            <button class="btn btn-sm btn-outline" onclick="CourseModule.editCourse('${course.id}')">编辑</button>
            <button class="btn btn-sm btn-secondary" onclick="CourseModule.previewCourse('${course.id}')">预览</button>
            <button class="btn btn-sm btn-primary" onclick="CourseModule.publishCourse('${course.id}')">发布</button>
            <button class="btn btn-sm btn-danger" onclick="CourseModule.deleteCourse('${course.id}')">删除</button>
          `;
          break;
          
        case 'published':
          actionButtons = `
            <button class="btn btn-sm btn-outline" onclick="CourseModule.editCourse('${course.id}')">编辑</button>
            <button class="btn btn-sm btn-secondary" onclick="CourseModule.previewCourse('${course.id}')">预览</button>
            <button class="btn btn-sm btn-warning" onclick="CourseModule.withdrawCourse('${course.id}')">撤回</button>
            <button class="btn btn-sm btn-danger" onclick="CourseModule.deleteCourse('${course.id}')">删除</button>
          `;
          break;
          
        case 'withdrawn':
          actionButtons = `
            <button class="btn btn-sm btn-outline" onclick="CourseModule.editCourse('${course.id}')">编辑</button>
            <button class="btn btn-sm btn-secondary" onclick="CourseModule.previewCourse('${course.id}')">预览</button>
            <button class="btn btn-sm btn-success" onclick="CourseModule.restoreCourse('${course.id}')">恢复</button>
            <button class="btn btn-sm btn-info" onclick="CourseModule.archiveCourse('${course.id}')">归档</button>
            <button class="btn btn-sm btn-danger" onclick="CourseModule.deleteCourse('${course.id}')">删除</button>
          `;
          break;
          
        case 'archived':
          actionButtons = `
            <button class="btn btn-sm btn-secondary" onclick="CourseModule.previewCourse('${course.id}')">预览</button>
            <span class="action-disabled">已归档</span>
          `;
          break;
          
        default:
          actionButtons = `
            <button class="btn btn-sm btn-outline" onclick="CourseModule.editCourse('${course.id}')">编辑</button>
            <button class="btn btn-sm btn-secondary" onclick="CourseModule.previewCourse('${course.id}')">预览</button>
            <button class="btn btn-sm btn-danger" onclick="CourseModule.deleteCourse('${course.id}')">删除</button>
          `;
      }
      
      return `
        <tr>
          <td>${course.id}</td>
          <td>${course.name}</td>
          <td>${course.semester}</td>
          <td>${course.credit}</td>
          <td>${course.hours}</td>
          <td>${course.students || 0}</td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td>
            <div class="action-buttons">
              ${actionButtons}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * 获取状态文本
   */
  function getStatusText(status) {
    const statusMap = {
      'draft': '草稿',
      'published': '已发布',
      'withdrawn': '已撤回'
    };
    return statusMap[status] || '草稿';
  }

  /**
   * 获取状态类名
   */
  function getStatusClass(status) {
    const classMap = {
      'draft': 'status-draft',
      'published': 'status-published',
      'withdrawn': 'status-withdrawn'
    };
    return classMap[status] || 'status-draft';
  }

  /**
   * 课件管理相关功能
   */

  /**
   * 渲染课件列表
   */
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

  /**
   * 按类型分组课件
   */
  function groupMaterialsByType(materials) {
    return materials.reduce((groups, material) => {
      if (!groups[material.type]) {
        groups[material.type] = [];
      }
      groups[material.type].push(material);
      return groups;
    }, {});
  }

  /**
   * 创建课件分组
   */
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

  /**
   * 获取类型图标
   */
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

  /**
   * 创建课件项
   */
  function createMaterialItem(material) {
    return `
      <div class="material-item" data-material-id="${material.id}">
        <div class="material-item__icon">${getTypeIcon(material.type)}</div>
        <div class="material-item__info">
          <div class="material-item__name" data-material-id="${material.id}">${material.name}</div>
          <div class="material-item__meta">${material.size}</div>
        </div>
        <button type="button" class="material-item__delete" onclick="CourseModule.removeMaterial('${material.id}')">
          <span class="delete-icon">×</span>
        </button>
      </div>
    `;
  }

  /**
   * 绑定课件预览事件
   */
  function bindMaterialPreviewEvents() {
    const materialNames = document.querySelectorAll('.material-item__name');
    materialNames.forEach(name => {
      name.addEventListener('click', function() {
        const materialId = this.getAttribute('data-material-id');
        previewMaterial(materialId);
      });
    });
  }

  /**
   * 预览课件
   */
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

  /**
   * 删除课件
   */
  function removeMaterial(materialId) {
    if (confirm('确定要删除这个课件吗？')) {
      courseMaterials = courseMaterials.filter(m => m.id !== materialId);
      renderMaterialList();
    }
  }

  /**
   * 获取课件数据（用于保存到sessionStorage）
   */
  function getMaterialsData() {
    return courseMaterials.map(material => ({
      id: material.id,
      name: material.name,
      type: material.type,
      size: material.size,
      url: material.url
    }));
  }

  /**
   * 加载课件数据（从sessionStorage）
   */
  function loadMaterialsData(materialsData) {
    courseMaterials = materialsData || [];
    renderMaterialList();
  }

  /**
   * 清空课件数据
   */
  function clearMaterials() {
    courseMaterials = [];
    renderMaterialList();
  }

  /**
   * 验证课程是否满足发布条件
   */
  function validateCourseForPublishing(course) {
    const errors = [];
    
    // 检查课程名称
    if (!course.name || course.name.trim().length === 0) {
      errors.push('课程名称不能为空');
    }
    
    // 检查学分
    if (!course.credit || course.credit <= 0) {
      errors.push('学分必须大于0');
    }
    
    // 检查学时
    if (!course.hours || course.hours <= 0) {
      errors.push('学时必须大于0');
    }
    
    // 检查学期
    if (!course.semester || course.semester.trim().length === 0) {
      errors.push('学期不能为空');
    }
    
    // 检查课程描述
    if (!course.description || course.description.trim().length === 0) {
      errors.push('课程描述不能为空');
    }
    
    // 检查选课要求
    if (!course.requirements || course.requirements.trim().length === 0) {
      errors.push('选课要求不能为空');
    }
    
    if (errors.length > 0) {
      Utils.showMessage('发布前验证失败：' + errors.join('，'), 'error');
      return false;
    }
    
    return true;
  }

  /**
   * 记录发布历史
   */
  function recordPublishHistory(courseId, version, action) {
    const currentUser = Utils.storage.get('user', {});
    const history = Utils.storage.get('coursePublishHistory', []);
    
    const historyItem = {
      courseId: courseId,
      version: version,
      action: action,
      timestamp: new Date().toISOString(),
      operator: currentUser.name || '未知用户',
      operatorId: currentUser.id
    };
    
    history.push(historyItem);
    Utils.storage.set('coursePublishHistory', history);
  }

  /**
   * 发送状态变更通知
   */
  function notifyStatusChange(courseId, newStatus) {
    const course = getCourseById(courseId);
    if (!course) return;
    
    const notifications = Utils.storage.get('systemNotifications', []);
    
    let message = '';
    switch (newStatus) {
      case 'published':
        message = `课程"${course.name}"已发布`;
        break;
      case 'withdrawn':
        message = `课程"${course.name}"已撤回`;
        break;
      default:
        message = `课程"${course.name}"状态已变更为${newStatus}`;
    }
    
    const notification = {
      id: 'notification_' + Date.now(),
      type: 'course_status_change',
      title: '课程状态变更',
      message: message,
      timestamp: new Date().toISOString(),
      read: false,
      courseId: courseId,
      courseName: course.name
    };
    
    notifications.push(notification);
    Utils.storage.set('systemNotifications', notifications);
  }

  /**
   * 获取课程状态统计
   */
  function getCourseStatusStats(teacherId) {
    const courses = getTeacherCourses(teacherId);
    
    const stats = {
      total: courses.length,
      draft: 0,
      published: 0,
      withdrawn: 0,
      archived: 0
    };
    
    courses.forEach(course => {
      switch (course.status) {
        case 'draft':
          stats.draft++;
          break;
        case 'published':
          stats.published++;
          break;
        case 'withdrawn':
          stats.withdrawn++;
          break;
        case 'archived':
          stats.archived++;
          break;
      }
    });
    
    return stats;
  }

  /**
   * 归档课程
   */
  function archiveCourse(courseId) {
    const course = getCourseById(courseId);
    if (!course) {
      Utils.showMessage('课程不存在', 'error');
      return;
    }
    
    if (course.status !== 'withdrawn') {
      Utils.showMessage('只有已撤回的课程才能归档', 'error');
      return;
    }
    
    if (confirm('确定要归档该课程吗？归档后课程将进入历史记录，无法再修改。')) {
      const courses = Utils.storage.get('teacherCourses', []);
      const courseIndex = courses.findIndex(course => course.id === courseId);
      
      if (courseIndex !== -1) {
        courses[courseIndex].status = 'archived';
        courses[courseIndex].archivedAt = new Date().toISOString();
        courses[courseIndex].lastModifiedAt = new Date().toISOString();
        
        // 记录归档历史
        recordPublishHistory(courseId, course.version || 1, 'archived');
        
        Utils.storage.set('teacherCourses', courses);
        Utils.showMessage('课程已归档', 'success');
        
        // 发送状态变更通知
        notifyStatusChange(courseId, 'archived');
        
        loadTeacherCourses();
      }
    }
  }

  /**
   * 恢复课程（从撤回状态恢复）
   */
  function restoreCourse(courseId) {
    const course = getCourseById(courseId);
    if (!course) {
      Utils.showMessage('课程不存在', 'error');
      return;
    }
    
    if (course.status !== 'withdrawn') {
      Utils.showMessage('只有已撤回的课程才能恢复', 'error');
      return;
    }
    
    if (confirm('确定要恢复该课程吗？恢复后课程将重新变为已发布状态。')) {
      const courses = Utils.storage.get('teacherCourses', []);
      const courseIndex = courses.findIndex(course => course.id === courseId);
      
      if (courseIndex !== -1) {
        courses[courseIndex].status = 'published';
        courses[courseIndex].restoredAt = new Date().toISOString();
        courses[courseIndex].lastModifiedAt = new Date().toISOString();
        
        // 记录恢复历史
        recordPublishHistory(courseId, course.version || 1, 'restored');
        
        Utils.storage.set('teacherCourses', courses);
        Utils.showMessage('课程已恢复', 'success');
        
        // 发送状态变更通知
        notifyStatusChange(courseId, 'published');
        
        loadTeacherCourses();
      }
    }
  }

  /**
   * 查看课程详情
   * @param {string} courseId 课程ID
   */
  function viewCourseDetail(courseId) {
    const course = getCourseById(courseId);
    if (!course) {
      Utils.showMessage('课程不存在', 'error');
      return;
    }
    
    // 这里可以实现查看课程详情的逻辑
    console.log('查看课程详情:', course);
    Utils.showMessage(`正在查看课程: ${course.name}`, 'info');
  }

  // 返回公共接口
  return {
    // 初始化模块
    init,
    // 课程操作
    createNewCourse,
    editCourse,
    viewCourseDetail,
    previewCourse,
    withdrawCourse,
    publishCourse,
    deleteCourse,
    archiveCourse,
    restoreCourse,
    // 课件管理
    removeMaterial,
    // 页面导航
    showCourseList,
    // 数据加载
    loadTeacherCourses,
    // 状态管理
    getCourseStatusStats,
    validateCourseForPublishing
  };
})();