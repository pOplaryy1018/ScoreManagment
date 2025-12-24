// ==============================================
// 作业及考试管理模块 (AssignmentModule)
// 负责作业/考试发布、提交管理、成绩录入、在线批改等功能
// ==============================================

const AssignmentModule = (function() {
  'use strict';

  // 模拟学生数据
  const MOCK_STUDENTS = [
    { id: 'stu001', name: '张三' },
    { id: 'stu002', name: '李四' },
    { id: 'stu003', name: '王五' },
    { id: 'stu004', name: '赵六' },
    { id: 'stu005', name: '钱七' },
    { id: 'stu006', name: '孙八' },
    { id: 'stu007', name: '周九' },
    { id: 'stu008', name: '吴十' },
    { id: 'stu009', name: '郑十一' },
    { id: 'stu010', name: '王十二' }
  ];

  // 题目类型枚举
  const QUESTION_TYPES = {
    SINGLE_CHOICE: 'single_choice',
    MULTIPLE_CHOICE: 'multiple_choice',
    TRUE_FALSE: 'true_false',
    FILL_BLANK: 'fill_blank',
    SHORT_ANSWER: 'short_answer',
    ESSAY: 'essay'
  };

  // 提交状态枚举
  const SUBMISSION_STATUS = {
    NOT_SUBMITTED: 'not_submitted',
    SUBMITTED: 'submitted',
    GRADED: 'graded'
  };

  // ==============================================
  // 初始化模块
  // ==============================================

  /**
   * 初始化作业及考试管理模块
   */
  function init() {
    // 移除导航事件绑定 - 由teacher-manage.js统一管理
    // 避免事件绑定冲突和重复绑定问题
  }

  // ==============================================
  // 渲染模块界面
  // ==============================================

  /**
   * 渲染作业及考试管理模块
   * @param {string} type 类型：'assignment'或'exam'
   */
  function renderModule(type) {
    const containerId = type === 'assignment' ? 'assignment-module-container' : 'exam-module-container';
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    // 清理旧的事件监听器
    cleanupEventListeners(type);
    
    const moduleTitle = type === 'assignment' ? '作业管理' : '考试管理';
    const publishButtonText = type === 'assignment' ? '发布作业' : '发布考试';
    
    container.innerHTML = `
      <div class="assignment-module">
        <!-- 标签页导航 -->
        <div class="assignment-tabs">
          <button class="assignment-tab active" data-tab="publish" data-type="${type}">布置${type === 'assignment' ? '作业' : '考试'}</button>
          <button class="assignment-tab" data-tab="list" data-type="${type}">已发布${type === 'assignment' ? '作业' : '考试'}</button>
        </div>
        
        <!-- 发布表单区域 -->
        <div class="assignment-tab-content active" id="publish-tab-${type}" data-tab-content="publish">
          <div class="assignment-form-section">
            <h3>📝 发布${type === 'assignment' ? '作业' : '考试'}</h3>
            <form class="assignment-form" id="${type}-form">
              <div class="form-group">
                <label for="${type}-title">标题</label>
                <input type="text" id="${type}-title" name="title" class="form-input" required>
              </div>
              
              <div class="form-group">
                <label for="${type}-deadline">截止时间</label>
                <input type="datetime-local" id="${type}-deadline" name="deadline" class="form-input" required>
              </div>
              
              <div class="form-group">
                <label for="${type}-description">说明</label>
                <textarea id="${type}-description" name="description" class="form-textarea" rows="4" placeholder="请输入${type === 'assignment' ? '作业' : '考试'}的详细说明和要求..."></textarea>
              </div>
              
              <div class="form-group">
                <label for="${type}-total-score">总分</label>
                <input type="number" id="${type}-total-score" name="totalScore" class="form-input" min="1" max="1000" value="100" required>
              </div>
              
              <div class="form-group">
                <label>题目管理</label>
                <div class="question-management-section">
                  <div class="question-actions">
                    <button type="button" class="btn btn-outline btn-sm" onclick="AssignmentModule.addQuestion('${type}')">
                      <span class="icon">➕</span> 添加题目
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" onclick="AssignmentModule.batchImportQuestions('${type}')">
                      <span class="icon">📥</span> 批量导入
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" onclick="AssignmentModule.exportQuestions('${type}')">
                      <span class="icon">📤</span> 导出模板
                    </button>
                  </div>
                  <div class="question-list" id="${type}-question-list">
                    <!-- 题目列表将动态生成 -->
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label for="${type}-grading-criteria">评分标准</label>
                <textarea id="${type}-grading-criteria" name="gradingCriteria" class="form-textarea" rows="3" placeholder="请输入评分标准..."></textarea>
              </div>
              
              <div class="form-group">
                <label>附件上传</label>
                <div class="file-upload-section">
                  <input type="file" id="${type}-attachments" multiple class="file-input" 
                         accept=".pdf,.docx,.jpg,.png,.mp3,.mp4">
                  <label for="${type}-attachments" class="upload-label">
                    <span class="upload-icon">📎</span>
                    <span>选择文件 (PDF/DOCX/JPG/PNG/MP3/MP4)</span>
                  </label>
                  <div class="file-list" id="${type}-file-list"></div>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">${publishButtonText}</button>
                <button type="button" class="btn btn-outline" onclick="AssignmentModule.clearForm('${type}')">清空</button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- 已发布列表区域 -->
        <div class="assignment-tab-content" id="list-tab-${type}" data-tab-content="list">
          <div class="assignment-list-section">
            <h3>📋 已发布${type === 'assignment' ? '作业' : '考试'}</h3>
            
            <!-- 筛选和导出工具栏 -->
            <div class="assignment-toolbar">
              <div class="filter-section">
                <label>筛选状态：</label>
                <select class="form-select filter-select" onchange="AssignmentModule.filterAssignments('${type}', this.value)">
                  <option value="all">全部</option>
                  <option value="not_submitted">未提交</option>
                  <option value="submitted">已提交</option>
                  <option value="graded">已批改</option>
                </select>
              </div>
              <div class="export-section">
                <button class="btn btn-outline btn-sm" onclick="AssignmentModule.exportSubmissionStatus('${type}')">
                  <span class="icon">📊</span> 导出Excel
                </button>
              </div>
            </div>
            
            <div class="assignment-table-container">
              <table class="assignment-table">
                <thead>
                  <tr>
                    <th>标题</th>
                    <th>截止时间</th>
                    <th>总分</th>
                    <th>题目数量</th>
                    <th>完成情况</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody id="${type}-list-body">
                  <!-- 列表数据将通过JS动态生成 -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 查看提交模态框 -->
      <div class="submission-modal" id="${type}-submission-modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>批改：<span id="${type}-modal-title"></span></h3>
            <div class="modal-actions">
              <button class="btn btn-outline btn-sm" onclick="AssignmentModule.toggleBatchMode('${type}')">
                <span class="icon">⚡</span> 批量模式
              </button>
              <button class="modal-close" onclick="AssignmentModule.closeModal('${type}')">×</button>
            </div>
          </div>
          <div class="modal-body">
            <!-- 批量批改工具栏 -->
            <div class="batch-toolbar" id="${type}-batch-toolbar" style="display: none;">
              <div class="batch-actions">
                <label>批量评分：</label>
                <input type="number" id="${type}-batch-grade" min="0" max="100" placeholder="输入分数" class="batch-grade-input">
                <button class="btn btn-primary btn-sm" onclick="AssignmentModule.applyBatchGrade('${type}')">应用</button>
                <button class="btn btn-outline btn-sm" onclick="AssignmentModule.clearBatchGrade('${type}')">清空</button>
              </div>
              <div class="batch-info">
                <span id="${type}-batch-count">已选择 0 个学生</span>
              </div>
            </div>
            
            <div class="submission-table-container">
              <table class="submission-table">
                <thead>
                  <tr>
                    <th class="batch-select">
                      <input type="checkbox" id="${type}-select-all" onchange="AssignmentModule.toggleSelectAll('${type}', this.checked)">
                    </th>
                    <th>学生姓名</th>
                    <th>提交状态</th>
                    <th>提交时间</th>
                    <th>附件</th>
                    <th>评分</th>
                    <th>评语</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody id="${type}-submission-body">
                  <!-- 提交数据将通过JS动态生成 -->
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <div class="footer-actions">
              <button class="btn btn-primary" onclick="AssignmentModule.saveGrades('${type}')">
                <span class="icon">💾</span> 保存所有评分
              </button>
              <button class="btn btn-outline" onclick="AssignmentModule.exportGradingReport('${type}')">
                <span class="icon">📊</span> 导出批改报告
              </button>
              <button class="btn btn-outline" onclick="AssignmentModule.closeModal('${type}')">关闭</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // 绑定事件
    bindEvents(type);
    
    // 加载已发布列表
    loadList(type);
  }

  // ==============================================
  // 事件清理
  // ==============================================

  /**
   * 清理事件监听器
   * @param {string} type 类型：'assignment'或'exam'
   */
  function cleanupEventListeners(type) {
    const containerId = type === 'assignment' ? 'assignment-module-container' : 'exam-module-container';
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    // 清理事件委托监听器
    container.removeEventListener('click', handleModuleClick);
    container.removeEventListener('submit', handleModuleSubmit);
    container.removeEventListener('change', handleModuleChange);
    
    console.log(`[AssignmentModule] ${type}模块事件监听器清理完成`);
  }

  // ==============================================
  // 事件绑定
  // ==============================================

  /**
   * 绑定作业及考试管理模块事件
   * @param {string} type 类型：'assignment'或'exam'
   */
  function bindEvents(type) {
    const containerId = type === 'assignment' ? 'assignment-module-container' : 'exam-module-container';
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    // 移除旧的事件委托（如果存在）
    container.removeEventListener('click', handleModuleClick);
    container.removeEventListener('submit', handleModuleSubmit);
    container.removeEventListener('change', handleModuleChange);
    
    // 使用事件委托，单一监听器处理所有交互
    container.addEventListener('click', handleModuleClick);
    container.addEventListener('submit', handleModuleSubmit);
    container.addEventListener('change', handleModuleChange);
    
    console.log(`[AssignmentModule] ${type}模块事件绑定完成`);
  }

  /**
   * 模块点击事件委托处理函数
   * @param {Event} event 点击事件
   */
  function handleModuleClick(event) {
    const target = event.target;
    
    // 处理标签页切换
    if (target.classList.contains('assignment-tab')) {
      event.preventDefault();
      handleTabSwitch(target);
      return;
    }
    
    // 处理查看提交按钮
    if (target.classList.contains('view-submissions-btn') || target.closest('.view-submissions-btn')) {
      event.preventDefault();
      const btn = target.classList.contains('view-submissions-btn') ? target : target.closest('.view-submissions-btn');
      const assignmentId = btn.dataset.assignmentId;
      const type = btn.dataset.type;
      viewSubmissions(assignmentId, type);
      return;
    }
    
    // 处理其他按钮点击
    if (target.tagName === 'BUTTON') {
      handleButtonClick(target);
    }
  }

  /**
   * 模块表单提交事件委托处理函数
   * @param {Event} event 提交事件
   */
  function handleModuleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    // 从表单ID中提取类型
    const formId = form.id;
    const type = formId.includes('assignment') ? 'assignment' : 'exam';
    publish(type);
  }

  /**
   * 模块变化事件委托处理函数
   * @param {Event} event 变化事件
   */
  function handleModuleChange(event) {
    const target = event.target;
    
    // 处理文件上传
    if (target.type === 'file' && target.id.includes('attachments')) {
      const type = target.id.includes('assignment') ? 'assignment' : 'exam';
      handleFileUpload(type, target.files);
    }
  }

  /**
   * 处理标签页切换
   * @param {HTMLElement} tab 标签页元素
   */
  function handleTabSwitch(tab) {
    const container = tab.closest('.assignment-module');
    if (!container) return;

    const tabName = tab.dataset.tab;
    const type = tab.dataset.type || 'assignment';

    // 移除所有标签的active类
    const tabs = container.querySelectorAll('.assignment-tab');
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // 切换内容显示（限定在当前容器内部）
    const contents = container.querySelectorAll('.assignment-tab-content');
    contents.forEach(content => {
      content.classList.remove('active');
    });

    const targetTab = container.querySelector(`#${tabName}-tab-${type}`) || container.querySelector(`[data-tab-content="${tabName}"]`);
    if (targetTab) {
      targetTab.classList.add('active');
    }
  }

  /**
   * 处理按钮点击
   * @param {HTMLElement} button 按钮元素
   */
  function handleButtonClick(button) {
    // 根据按钮的class或data属性处理不同的按钮操作
    if (button.classList.contains('add-question-btn')) {
      const type = button.dataset.type;
      addQuestion(type);
    }
    // 可以添加更多按钮处理逻辑
  }

  // ==============================================
  // 题目管理功能
  // ==============================================

  /**
   * 添加题目
   * @param {string} type 类型
   */
  function addQuestion(type) {
    const questionList = document.getElementById(`${type}-question-list`);
    const questionId = `q_${Date.now()}`;
    
    const questionItem = document.createElement('div');
    questionItem.className = 'question-item';
    questionItem.dataset.questionId = questionId;
    questionItem.innerHTML = `
      <div class="question-header">
        <span class="question-number">题目 ${questionList.children.length + 1}</span>
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">删除</button>
      </div>
      <div class="question-content">
        <div class="form-group">
          <label>题目内容</label>
          <textarea class="form-input" placeholder="请输入题目内容..." rows="2"></textarea>
        </div>
        <div class="form-group">
          <label>题目类型</label>
          <select class="form-select">
            <option value="${QUESTION_TYPES.SINGLE_CHOICE}">单选题</option>
            <option value="${QUESTION_TYPES.MULTIPLE_CHOICE}">多选题</option>
            <option value="${QUESTION_TYPES.TRUE_FALSE}">判断题</option>
            <option value="${QUESTION_TYPES.FILL_BLANK}">填空题</option>
            <option value="${QUESTION_TYPES.SHORT_ANSWER}">简答题</option>
            <option value="${QUESTION_TYPES.ESSAY}">论述题</option>
          </select>
        </div>
        <div class="form-group">
          <label>分值</label>
          <input type="number" class="form-input" min="1" max="100" value="10">
        </div>
        <div class="form-group">
          <label>答案解析</label>
          <textarea class="form-input" placeholder="请输入答案解析..." rows="2"></textarea>
        </div>
      </div>
    `;
    
    questionList.appendChild(questionItem);
  }

  /**
   * 批量导入题目
   * @param {string} type 类型
   */
  function batchImportQuestions(type) {
    // 创建文件输入框
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls,.csv,.json';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      // 模拟导入过程
      alert(`正在导入题目文件: ${file.name}\n（此为模拟功能，实际需要后端支持）`);
      
      // 模拟导入3个题目
      for (let i = 0; i < 3; i++) {
        addQuestion(type);
      }
      
      alert('成功导入3个题目！');
      
      // 清理文件输入
      fileInput.remove();
    });
    
    document.body.appendChild(fileInput);
    fileInput.click();
  }

  /**
   * 导出题目模板
   * @param {string} type 类型
   */
  function exportQuestions(type) {
    // 创建模板数据
    const templateData = {
      title: '题目导入模板',
      columns: ['题目内容', '题目类型', '分值', '答案解析'],
      example: {
        content: '请在此输入题目内容',
        type: 'single_choice',
        score: 10,
        explanation: '请在此输入答案解析'
      }
    };
    
    // 模拟导出过程
    alert(`正在导出${type === 'assignment' ? '作业' : '考试'}题目模板\n（此为模拟功能，实际需要后端支持）`);
    
    // 创建下载链接
    const dataStr = JSON.stringify(templateData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type === 'assignment' ? '作业' : '考试'}_题目模板.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * 获取题目列表数据
   * @param {string} type 类型
   * @returns {Array} 题目列表
   */
  function getQuestionsData(type) {
    const questionItems = document.querySelectorAll(`#${type}-question-list .question-item`);
    const questions = [];
    
    questionItems.forEach((item, index) => {
      const inputs = item.querySelectorAll('textarea, select, input[type="number"]');
      if (inputs.length >= 4) {
        questions.push({
          id: item.dataset.questionId,
          number: index + 1,
          content: inputs[0].value.trim(),
          type: inputs[1].value,
          score: parseInt(inputs[2].value) || 0,
          explanation: inputs[3].value.trim()
        });
      }
    });
    
    return questions;
  }

  // ==============================================
  // 文件上传处理（集成FileUploadHelper）
  // ==============================================

  /**
   * 处理文件上传
   * @param {string} type 类型
   * @param {FileList} files 文件列表
   */
  function handleFileUpload(type, files) {
    const fileList = document.getElementById(`${type}-file-list`);
    
    Array.from(files).forEach(file => {
      // 使用FileUploadHelper检查文件类型
      if (!FileUploadHelper.isValidFileType(file)) {
        UIModule.showModal(`文件 ${file.name} 类型不支持，仅支持 PDF/DOCX/JPG/PNG/MP3/MP4 格式`, {
          title: '文件类型错误'
        });
        return;
      }
      
      // 检查文件大小
      if (!FileUploadHelper.isValidFileSize(file)) {
        UIModule.showModal(`文件 ${file.name} 大小超过限制（最大50MB）`, {
          title: '文件大小错误'
        });
        return;
      }
      
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <span class="file-name">${file.name}</span>
        <span class="file-size">(${FileUploadHelper.formatFileSize(file.size)})</span>
        <button type="button" class="file-remove" onclick="this.parentElement.remove()">×</button>
      `;
      fileList.appendChild(fileItem);
    });
    
    // 清空文件输入框
    document.getElementById(`${type}-attachments`).value = '';
  }

  // ==============================================
  // 发布作业/考试
  // ==============================================

  /**
   * 发布作业/考试
   * @param {string} type 类型
   */
  function publish(type) {
    const title = document.getElementById(`${type}-title`).value.trim();
    const deadline = document.getElementById(`${type}-deadline`).value;
    const description = document.getElementById(`${type}-description`).value.trim();
    const totalScore = parseInt(document.getElementById(`${type}-total-score`).value) || 100;
    const gradingCriteria = document.getElementById(`${type}-grading-criteria`).value.trim();
    
    if (!title || !deadline) {
      alert('请填写标题和截止时间');
      return;
    }
    
    // 获取题目列表
    const questions = getQuestionsData(type);
    
    // 验证总分与题目分值总和
    if (questions.length > 0) {
      const totalQuestionsScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
      if (totalQuestionsScore !== totalScore) {
        const confirmMsg = `题目总分(${totalQuestionsScore})与设置的总分(${totalScore})不一致，是否继续发布？`;
        if (!confirm(confirmMsg)) {
          return;
        }
      }
    }
    
    // 生成唯一ID
    const assignmentId = `${type}_${Date.now()}`;
    
    // 获取文件列表
    const fileItems = document.querySelectorAll(`#${type}-file-list .file-item`);
    const attachments = Array.from(fileItems).map(item => {
      return item.querySelector('.file-name').textContent;
    });
    
    // 创建作业/考试对象
    const assignment = {
      id: assignmentId,
      type: type,
      title: title,
      deadline: deadline,
      description: description,
      totalScore: totalScore,
      gradingCriteria: gradingCriteria,
      questions: questions,
      attachments: attachments,
      createdAt: new Date().toISOString(),
      totalStudents: MOCK_STUDENTS.length
    };
    
    // 保存到localStorage
    saveToStorage(assignment);
    
    // 清空表单
    clearForm(type);
    
    // 刷新列表
    loadList(type);
    
    // 切换到列表标签页
    switchToTab(type, 'list');
    
    alert(`${type === 'assignment' ? '作业' : '考试'}发布成功！\n包含 ${questions.length} 个题目，总分 ${totalScore} 分`);
  }

  /**
   * 保存作业/考试到localStorage
   * @param {Object} assignment 作业/考试对象
   */
  function saveToStorage(assignment) {
    const assignments = Utils.storage.get('assignments', []);
    assignments.push(assignment);
    Utils.storage.set('assignments', assignments);
  }

  // ==============================================
  // 加载作业/考试列表
  // ==============================================

  /**
   * 加载已发布的作业/考试列表
   * @param {string} type 类型
   * @param {string} filterStatus 筛选状态
   */
  function loadList(type, filterStatus = 'all') {
    const assignments = Utils.storage.get('assignments', []);
    const filteredAssignments = assignments.filter(a => a.type === type);
    const tbody = document.getElementById(`${type}-list-body`);
    
    if (filteredAssignments.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>暂无${type === 'assignment' ? '作业' : '考试'}</p>
          </td>
        </tr>
      `;
      return;
    }
    
    // 根据筛选状态过滤作业
    const statusFilteredAssignments = filteredAssignments.filter(assignment => {
      if (filterStatus === 'all') return true;
      
      const submissions = Utils.storage.get('submissions', {});
      const assignmentSubmissions = submissions[assignment.id] || {};
      const submittedCount = Object.keys(assignmentSubmissions).length;
      const gradedCount = Object.values(assignmentSubmissions).filter(grade => grade !== null && grade !== undefined).length;
      
      switch (filterStatus) {
        case 'not_submitted':
          return submittedCount === 0;
        case 'submitted':
          return submittedCount > 0 && gradedCount < submittedCount;
        case 'graded':
          return gradedCount === submittedCount && submittedCount > 0;
        default:
          return true;
      }
    });
    
    if (statusFilteredAssignments.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">
            <div class="empty-icon">🔍</div>
            <p>没有找到符合条件的${type === 'assignment' ? '作业' : '考试'}</p>
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = statusFilteredAssignments.map(assignment => {
      // 计算完成情况
      const submissions = Utils.storage.get('submissions', {});
      const assignmentSubmissions = submissions[assignment.id] || {};
      const submittedCount = Object.keys(assignmentSubmissions).length;
      const gradedCount = Object.values(assignmentSubmissions).filter(grade => grade !== null && grade !== undefined).length;
      
      // 根据完成情况设置状态标签
      let statusClass = 'status-pending';
      let statusText = '未开始';
      
      if (gradedCount === submittedCount && submittedCount > 0) {
        statusClass = 'status-completed';
        statusText = '已批改';
      } else if (submittedCount > 0) {
        statusClass = 'status-submitted';
        statusText = '已提交';
      }
      
      const completionText = `${submittedCount}/${assignment.totalStudents} 已提交`;
      const questionCount = assignment.questions ? assignment.questions.length : 0;
      const totalScore = assignment.totalScore || 100;
      
      return `
        <tr>
          <td>${assignment.title}</td>
          <td>${formatDateTime(assignment.deadline)}</td>
          <td>${totalScore} 分</td>
          <td>${questionCount} 题</td>
          <td>
            <span class="status-badge ${statusClass}">${statusText}</span>
            <span class="completion-text">${completionText}</span>
          </td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="AssignmentModule.viewSubmissions('${assignment.id}', '${type}')">查看提交</button>
            <button class="btn btn-outline btn-sm" onclick="AssignmentModule.viewAssignmentDetails('${assignment.id}', '${type}')">详情</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * 筛选作业/考试列表
   * @param {string} type 类型
   * @param {string} status 筛选状态
   */
  function filterAssignments(type, status) {
    loadList(type, status);
  }

  /**
   * 导出提交情况为Excel
   * @param {string} type 类型
   */
  function exportSubmissionStatus(type) {
    const assignments = Utils.storage.get('assignments', []);
    const filteredAssignments = assignments.filter(a => a.type === type);
    
    if (filteredAssignments.length === 0) {
      alert(`暂无${type === 'assignment' ? '作业' : '考试'}数据可导出`);
      return;
    }
    
    // 创建导出数据
    const exportData = {
      title: `${type === 'assignment' ? '作业' : '考试'}提交情况统计`,
      timestamp: new Date().toLocaleString('zh-CN'),
      assignments: filteredAssignments.map(assignment => {
        const submissions = Utils.storage.get('submissions', {});
        const assignmentSubmissions = submissions[assignment.id] || {};
        const submittedCount = Object.keys(assignmentSubmissions).length;
        const gradedCount = Object.values(assignmentSubmissions).filter(grade => grade !== null && grade !== undefined).length;
        
        return {
          标题: assignment.title,
          截止时间: formatDateTime(assignment.deadline),
          总分: assignment.totalScore || 100,
          题目数量: assignment.questions ? assignment.questions.length : 0,
          总学生数: assignment.totalStudents,
          已提交数: submittedCount,
          已批改数: gradedCount,
          提交率: `${((submittedCount / assignment.totalStudents) * 100).toFixed(1)}%`,
          批改率: submittedCount > 0 ? `${((gradedCount / submittedCount) * 100).toFixed(1)}%` : '0%'
        };
      })
    };
    
    // 模拟导出过程
    alert(`正在导出${type === 'assignment' ? '作业' : '考试'}提交情况\n（此为模拟功能，实际需要后端支持）`);
    
    // 创建下载链接
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type === 'assignment' ? '作业' : '考试'}_提交情况_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    alert(`成功导出 ${filteredAssignments.length} 条${type === 'assignment' ? '作业' : '考试'}记录`);
  }

  /**
   * 查看作业/考试详情
   * @param {string} assignmentId 作业/考试ID
   * @param {string} type 类型
   */
  function viewAssignmentDetails(assignmentId, type) {
    const assignments = Utils.storage.get('assignments', []);
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (!assignment) {
      alert('作业/考试不存在');
      return;
    }
    
    // 构建详情信息
    let details = `标题: ${assignment.title}\n`;
    details += `截止时间: ${formatDateTime(assignment.deadline)}\n`;
    details += `总分: ${assignment.totalScore || 100} 分\n`;
    details += `题目数量: ${assignment.questions ? assignment.questions.length : 0} 题\n`;
    details += `说明: ${assignment.description || '无'}\n`;
    
    if (assignment.gradingCriteria) {
      details += `评分标准: ${assignment.gradingCriteria}\n`;
    }
    
    if (assignment.questions && assignment.questions.length > 0) {
      details += `\n题目列表:\n`;
      assignment.questions.forEach((q, index) => {
        details += `${index + 1}. ${q.content} (${q.score}分)\n`;
      });
    }
    
    alert(details);
  }

  // ==============================================
  // 公共接口包装函数
  // ==============================================

  /**
   * 渲染作业及考试管理模块（用户要求的函数名）
   * @param {string} type 类型：'assignment'（作业）或 'exam'（考试）
   */
  function renderAssignmentModule(type = 'assignment') {
    renderModule(type);
  }

  // ==============================================
  // 查看提交情况
  // ==============================================

  /**
   * 查看学生提交情况
   * @param {string} assignmentId 作业/考试ID
   * @param {string} type 类型
   */
  function viewSubmissions(assignmentId, type) {
    const assignments = Utils.storage.get('assignments', []);
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (!assignment) {
      alert('作业/考试不存在');
      return;
    }
    
    // 设置模态框标题
    document.getElementById(`${type}-modal-title`).textContent = assignment.title;
    
    // 重置批量模式
    document.getElementById(`${type}-batch-toolbar`).style.display = 'none';
    document.getElementById(`${type}-select-all`).checked = false;
    
    // 生成学生提交列表
    const tbody = document.getElementById(`${type}-submission-body`);
    tbody.innerHTML = MOCK_STUDENTS.map(student => {
      // 随机生成提交状态（70%已提交）
      const isSubmitted = Math.random() < 0.7;
      const submissions = Utils.storage.get('submissions', {});
      const studentGrade = submissions[assignmentId] ? submissions[assignmentId][student.id] : null;
      const comments = Utils.storage.get('comments', {});
      const studentComment = comments[assignmentId] ? comments[assignmentId][student.id] : '';
      
      // 生成随机提交时间（在作业创建后到当前时间之间）
      const submitTime = isSubmitted ? 
        new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN') : 
        '--';
      
      return `
        <tr class="submission-row" data-student-id="${student.id}" data-submitted="${isSubmitted}">
          <td class="batch-select">
            <input type="checkbox" class="student-select" onchange="AssignmentModule.updateBatchCount('${type}')" 
                   ${!isSubmitted ? 'disabled' : ''}>
          </td>
          <td>${student.name}</td>
          <td>
            <span class="status-badge ${isSubmitted ? 'status-submitted' : 'status-pending'}">
              ${isSubmitted ? '已提交' : '未提交'}
            </span>
          </td>
          <td>${submitTime}</td>
          <td>
            ${isSubmitted ? 
              `<span class="file-name">${assignment.type}_${student.id}.pdf</span> 
               <div class="file-actions">
                 <a href="#" class="preview-link" onclick="AssignmentModule.previewSubmission('${student.id}', '${assignmentId}', '${type}')">预览</a>
                 <a href="#" class="download-link" onclick="AssignmentModule.downloadSubmission('${student.id}', '${assignmentId}')">下载</a>
               </div>` : 
              '--'
            }
          </td>
          <td>
            <input type="number" min="0" max="${assignment.totalScore || 100}" 
                   value="${studentGrade || ''}" 
                   placeholder="未评分" 
                   class="grade-input" 
                   data-student-id="${student.id}"
                   ${!isSubmitted ? 'disabled' : ''}
                   onchange="AssignmentModule.validateGrade(this, ${assignment.totalScore || 100})">
          </td>
          <td>
            <textarea class="comment-input" placeholder="输入评语..." 
                      data-student-id="${student.id}"
                      ${!isSubmitted ? 'disabled' : ''}>${studentComment}</textarea>
          </td>
          <td>
            ${isSubmitted ? 
              `<button class="btn btn-outline btn-sm" onclick="AssignmentModule.quickGrade('${student.id}', '${assignmentId}', '${type}')">快速批改</button>` : 
              '<span class="text-muted">--</span>'
            }
          </td>
        </tr>
      `;
    }).join('');
    
    // 显示模态框
    document.getElementById(`${type}-submission-modal`).style.display = 'block';
    
    // 保存当前查看的作业/考试ID
    window.currentAssignmentId = assignmentId;
    window.currentAssignmentType = type;
    
    // 初始化批量计数
    updateBatchCount(type);
  }

  // ==============================================
  // 保存成绩
  // ==============================================

  /**
   * 保存作业/考试成绩
   * @param {string} type 类型
   */
  function saveGrades(type) {
    const assignmentId = window.currentAssignmentId;
    if (!assignmentId) return;
    
    // 显示加载指示器
    UIModule.showLoading('正在保存评分...');
    
    setTimeout(() => {
      const gradeInputs = document.querySelectorAll(`#${type}-submission-body .grade-input`);
      const commentInputs = document.querySelectorAll(`#${type}-submission-body .comment-input`);
      const submissions = Utils.storage.get('submissions', {});
      const comments = Utils.storage.get('comments', {});
      
      if (!submissions[assignmentId]) {
        submissions[assignmentId] = {};
      }
      if (!comments[assignmentId]) {
        comments[assignmentId] = {};
      }
      
      let savedCount = 0;
      gradeInputs.forEach(input => {
        const studentId = input.dataset.studentId;
        const grade = input.value.trim();
        
        // 查找对应的评语
        const commentInput = Array.from(commentInputs).find(ci => ci.dataset.studentId === studentId);
        const comment = commentInput ? commentInput.value.trim() : '';
        
        if (grade && !isNaN(grade) && grade >= 0 && grade <= 100) {
          submissions[assignmentId][studentId] = parseInt(grade);
          comments[assignmentId][studentId] = comment;
          savedCount++;
        } else if (grade) {
          // 无效的评分，清除
          delete submissions[assignmentId][studentId];
          delete comments[assignmentId][studentId];
        } else if (comment) {
          // 只有评语没有评分的情况
          comments[assignmentId][studentId] = comment;
        }
      });
      
      Utils.storage.set('submissions', submissions);
      Utils.storage.set('comments', comments);
      
      // 隐藏加载指示器
      UIModule.hideLoading();
      
      // 关闭模态框
      closeModal(type);
      
      // 刷新列表
      loadList(type);
      
      // 使用UIModule显示成功消息
      UIModule.showModal(`成功保存 ${savedCount} 个学生的评分和评语`, {
        title: '保存成功',
        confirmText: '确定'
      });
    }, 500);
  }

  // ==============================================
  // 辅助函数
  // ==============================================

  /**
   * 清空表单
   * @param {string} type 类型
   */
  function clearForm(type) {
    document.getElementById(`${type}-form`).reset();
    document.getElementById(`${type}-file-list`).innerHTML = '';
    document.getElementById(`${type}-question-list`).innerHTML = '';
    // 重置总分为默认值
    document.getElementById(`${type}-total-score`).value = '100';
  }

  /**
   * 切换到指定标签页
   * @param {string} type 类型
   * @param {string} tabName 标签页名称
   */
  function switchToTab(type, tabName) {
    const containerId = type === 'assignment' ? 'assignment-module-container' : 'exam-module-container';
    const tabs = document.querySelectorAll(`#${containerId} .assignment-tab`);
    const contents = document.querySelectorAll(`#${containerId} .assignment-tab-content`);

    // 更新标签页
    tabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      }
    });

    // 更新内容
    contents.forEach(content => {
      content.classList.remove('active');
    });
    const target = document.querySelector(`#${containerId} #${tabName}-tab-${type}`) || document.querySelector(`#${containerId} [data-tab-content="${tabName}"]`);
    if (target) {
      target.classList.add('active');
    }
  }

  /**
   * 关闭模态框
   * @param {string} type 类型
   */
  function closeModal(type) {
    document.getElementById(`${type}-submission-modal`).style.display = 'none';
    window.currentAssignmentId = null;
    window.currentAssignmentType = null;
  }

  /**
   * 预览文件（模拟）
   * @param {string} filename 文件名
   */
  function previewFile(filename) {
    alert(`预览文件：${filename}\n（此为模拟功能，实际需要后端支持）`);
  }

  /**
   * 格式化日期时间
   * @param {string} dateTimeString 日期时间字符串
   * @returns {string} 格式化后的字符串
   */
  function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('zh-CN');
  }

  // ==============================================
  // 增强的批改功能
  // ==============================================

  /**
   * 切换批量模式
   * @param {string} type 类型
   */
  function toggleBatchMode(type) {
    const toolbar = document.getElementById(`${type}-batch-toolbar`);
    const isVisible = toolbar.style.display !== 'none';
    
    if (isVisible) {
      toolbar.style.display = 'none';
      // 清除所有选择
      document.querySelectorAll(`#${type}-submission-body .student-select`).forEach(checkbox => {
        checkbox.checked = false;
      });
      document.getElementById(`${type}-select-all`).checked = false;
    } else {
      toolbar.style.display = 'block';
    }
    
    updateBatchCount(type);
  }

  /**
   * 全选/取消全选
   * @param {string} type 类型
   * @param {boolean} checked 是否选中
   */
  function toggleSelectAll(type, checked) {
    const checkboxes = document.querySelectorAll(`#${type}-submission-body .student-select:not(:disabled)`);
    checkboxes.forEach(checkbox => {
      checkbox.checked = checked;
    });
    
    updateBatchCount(type);
  }

  /**
   * 更新批量计数
   * @param {string} type 类型
   */
  function updateBatchCount(type) {
    const selectedCount = document.querySelectorAll(`#${type}-submission-body .student-select:checked`).length;
    document.getElementById(`${type}-batch-count`).textContent = `已选择 ${selectedCount} 个学生`;
  }

  /**
   * 应用批量评分
   * @param {string} type 类型
   */
  function applyBatchGrade(type) {
    const batchGradeInput = document.getElementById(`${type}-batch-grade`);
    const grade = batchGradeInput.value.trim();
    
    if (!grade || isNaN(grade) || grade < 0) {
      alert('请输入有效的分数');
      return;
    }
    
    const selectedCheckboxes = document.querySelectorAll(`#${type}-submission-body .student-select:checked`);
    
    if (selectedCheckboxes.length === 0) {
      alert('请先选择要批改的学生');
      return;
    }
    
    selectedCheckboxes.forEach(checkbox => {
      const row = checkbox.closest('.submission-row');
      const studentId = row.dataset.studentId;
      const gradeInput = row.querySelector('.grade-input');
      
      if (gradeInput && !gradeInput.disabled) {
        gradeInput.value = grade;
      }
    });
    
    alert(`已为 ${selectedCheckboxes.length} 个学生应用评分：${grade} 分`);
  }

  /**
   * 清空批量评分
   * @param {string} type 类型
   */
  function clearBatchGrade(type) {
    document.getElementById(`${type}-batch-grade`).value = '';
    
    const selectedCheckboxes = document.querySelectorAll(`#${type}-submission-body .student-select:checked`);
    selectedCheckboxes.forEach(checkbox => {
      const row = checkbox.closest('.submission-row');
      const gradeInput = row.querySelector('.grade-input');
      
      if (gradeInput && !gradeInput.disabled) {
        gradeInput.value = '';
      }
    });
    
    alert('已清空所选学生的评分');
  }

  /**
   * 验证评分
   * @param {HTMLInputElement} input 评分输入框
   * @param {number} maxScore 最大分数
   */
  function validateGrade(input, maxScore) {
    const grade = parseInt(input.value);
    
    if (grade > maxScore) {
      alert(`评分不能超过最大分数 ${maxScore}`);
      input.value = maxScore;
    } else if (grade < 0) {
      alert('评分不能为负数');
      input.value = 0;
    }
  }

  /**
   * 预览学生提交
   * @param {string} studentId 学生ID
   * @param {string} assignmentId 作业ID
   * @param {string} type 类型
   */
  function previewSubmission(studentId, assignmentId, type) {
    const assignments = Utils.storage.get('assignments', []);
    const assignment = assignments.find(a => a.id === assignmentId);
    const student = MOCK_STUDENTS.find(s => s.id === studentId);
    
    if (!assignment || !student) {
      alert('数据不存在');
      return;
    }
    
    // 构建预览内容
    let previewContent = `学生：${student.name}\n`;
    previewContent += `作业：${assignment.title}\n`;
    previewContent += `总分：${assignment.totalScore || 100} 分\n\n`;
    
    if (assignment.questions && assignment.questions.length > 0) {
      previewContent += '题目列表：\n';
      assignment.questions.forEach((q, index) => {
        previewContent += `${index + 1}. ${q.content} (${q.score}分)\n`;
        previewContent += `   学生答案：模拟答案内容...\n`;
        previewContent += `   参考答案：${q.explanation || '暂无'}\n\n`;
      });
    }
    
    alert(previewContent);
  }

  /**
   * 下载学生提交
   * @param {string} studentId 学生ID
   * @param {string} assignmentId 作业ID
   */
  function downloadSubmission(studentId, assignmentId) {
    alert(`正在下载学生 ${studentId} 的作业提交\n（此为模拟功能，实际需要后端支持）`);
  }

  /**
   * 快速批改
   * @param {string} studentId 学生ID
   * @param {string} assignmentId 作业ID
   * @param {string} type 类型
   */
  function quickGrade(studentId, assignmentId, type) {
    const assignments = Utils.storage.get('assignments', []);
    const assignment = assignments.find(a => a.id === assignmentId);
    const student = MOCK_STUDENTS.find(s => s.id === studentId);
    
    if (!assignment || !student) {
      alert('数据不存在');
      return;
    }
    
    // 模拟快速批改界面
    const suggestedGrade = Math.floor(Math.random() * (assignment.totalScore || 100)) + 1;
    const grade = prompt(`为 ${student.name} 快速批改\n建议分数：${suggestedGrade} 分\n请输入评分：`, suggestedGrade);
    
    if (grade !== null && !isNaN(grade) && grade >= 0 && grade <= (assignment.totalScore || 100)) {
      // 更新评分输入框
      const gradeInput = document.querySelector(`#${type}-submission-body .grade-input[data-student-id="${studentId}"]`);
      if (gradeInput) {
        gradeInput.value = grade;
      }
      
      // 自动生成评语
      const commentInput = document.querySelector(`#${type}-submission-body .comment-input[data-student-id="${studentId}"]`);
      if (commentInput) {
        const comments = [
          '完成得很好，继续保持！',
          '答案基本正确，但可以更详细一些。',
          '思路清晰，表达准确。',
          '需要加强基础知识理解。',
          '有进步空间，继续努力。'
        ];
        const randomComment = comments[Math.floor(Math.random() * comments.length)];
        commentInput.value = randomComment;
      }
      
      alert(`已为 ${student.name} 评分：${grade} 分`);
    }
  }

  /**
   * 导出批改报告
   * @param {string} type 类型
   */
  function exportGradingReport(type) {
    const assignmentId = window.currentAssignmentId;
    if (!assignmentId) return;
    
    const assignments = Utils.storage.get('assignments', []);
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (!assignment) {
      alert('作业/考试不存在');
      return;
    }
    
    const submissions = Utils.storage.get('submissions', {});
    const comments = Utils.storage.get('comments', {});
    const assignmentSubmissions = submissions[assignmentId] || {};
    const assignmentComments = comments[assignmentId] || {};
    
    // 构建批改报告数据
    const reportData = {
      title: `${type === 'assignment' ? '作业' : '考试'}批改报告`,
      assignment: assignment.title,
      totalScore: assignment.totalScore || 100,
      deadline: formatDateTime(assignment.deadline),
      timestamp: new Date().toLocaleString('zh-CN'),
      students: MOCK_STUDENTS.map(student => {
        const grade = assignmentSubmissions[student.id] || null;
        const comment = assignmentComments[student.id] || '';
        
        return {
          学号: student.id,
          姓名: student.name,
          评分: grade !== null ? grade : '未评分',
          评语: comment,
          状态: grade !== null ? '已批改' : '未批改'
        };
      })
    };
    
    // 模拟导出过程
    alert(`正在导出${type === 'assignment' ? '作业' : '考试'}批改报告\n（此为模拟功能，实际需要后端支持）`);
    
    // 创建下载链接
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type === 'assignment' ? '作业' : '考试'}_批改报告_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    alert('批改报告导出成功！');
  }

  // ==============================================
  // 公共接口
  // ==============================================

  return {
    // 初始化模块
    init,
    
    // 渲染模块
    renderModule,
    
    // 用户要求的渲染函数
    renderAssignmentModule,
    
    // 查看提交
    viewSubmissions,
    
    // 保存成绩
    saveGrades,
    
    // 清空表单
    clearForm,
    
    // 关闭模态框
    closeModal,
    
    // 预览文件
    previewFile,
    
    // 题目管理功能
    addQuestion,
    batchImportQuestions,
    exportQuestions,
    
    // 筛选和导出功能
    filterAssignments,
    exportSubmissionStatus,
    viewAssignmentDetails,
    
    // 在线批改功能
    toggleBatchMode,
    applyBatchGrade,
    clearBatchGrade,
    quickGrade,
    exportGradingReport,
    previewSubmission,
    downloadSubmission
  };
})();