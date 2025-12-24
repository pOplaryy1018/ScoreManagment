/**
 * 教学管理员界面脚本
 * 负责班级学生管理、课程安排系统、课程表生成等功能
 */

(function() {
    'use strict';

    /**
     * 存储模块 - 简化版本地存储接口
     */
    const StorageModule = {
        setClasses: (classes) => localStorage.setItem('teachingClasses', JSON.stringify(classes)),
        getClasses: () => JSON.parse(localStorage.getItem('teachingClasses') || 'null'),
        setCoursePlans: (plans) => localStorage.setItem('coursePlans', JSON.stringify(plans)),
        getCoursePlans: () => JSON.parse(localStorage.getItem('coursePlans') || 'null'),
        setTimetable: (timetable) => localStorage.setItem('timetable', JSON.stringify(timetable)),
        getTimetable: () => JSON.parse(localStorage.getItem('timetable') || 'null')
    };

    // 教学管理员模块
    const TeachingAdminModule = {
        currentSection: 'class-management',
        currentTab: {},
        selectedStudents: new Set(),
        selectedTeachers: new Set(),
        selectedRooms: new Set(),
        selectedTimeSlots: new Set(),
        selectedClasses: new Set(),
        timetableData: {},
        conflictData: [],
        uploadedStudents: [],
        
        init() {
            this.bindEvents();
            this.initClassManagement();
            this.initCourseScheduling();
            this.initTimetableGeneration();
            this.loadInitialData();
            console.log('教学管理员界面初始化完成');
        },

        bindEvents() {
            // 教学管理员导航切换
            document.querySelectorAll('.teaching-nav-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const section = e.currentTarget.dataset.section;
                    this.switchSection(section);
                });
            });

            // 退出登录
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    if (confirm('确定要退出登录吗？')) {
                        if (window.Auth && typeof Auth.logout === 'function') {
                            Auth.logout(true);
                        } else {
                            window.location.href = '../index.html';
                        }
                    }
                });
            }

            // 班级管理事件
            this.bindClassEvents();

            // 课程安排事件
            this.bindSchedulingEvents();

            // 课程表生成事件
            this.bindTimetableEvents();

            // 视图切换事件
            this.bindViewEvents();
        },

        // 导航切换
        switchSection(sectionId) {
            // 更新导航状态
            document.querySelectorAll('.teaching-nav-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

            // 切换内容区域
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');

            this.currentSection = sectionId;

            // 根据不同section加载相应数据
            switch(sectionId) {
                case 'class-management':
                    this.loadClassData();
                    break;
                case 'course-scheduling':
                    this.loadCoursePlanData();
                    break;
                case 'timetable':
                    this.loadTimetableData();
                    break;
            }
        },

        // 班级学生管理事件绑定
        bindClassEvents() {
            // 添加班级
            const addClassBtn = document.getElementById('addClassBtn');
            if (addClassBtn) {
                addClassBtn.addEventListener('click', () => this.addClass());
            }

            // 更新班级
            const updateClassBtn = document.getElementById('updateClassBtn');
            if (updateClassBtn) {
                updateClassBtn.addEventListener('click', () => this.updateClass());
            }

            // 文件上传区域
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('fileInput');
            
            if (uploadArea && fileInput) {
                uploadArea.addEventListener('click', () => fileInput.click());
                
                uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadArea.classList.add('dragover');
                });

                uploadArea.addEventListener('dragleave', () => {
                    uploadArea.classList.remove('dragover');
                });

                uploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('dragover');
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        this.handleFileUpload(files[0]);
                    }
                });

                fileInput.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        this.handleFileUpload(e.target.files[0]);
                    }
                });
            }

            // 下载模板
            const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
            if (downloadTemplateBtn) {
                downloadTemplateBtn.addEventListener('click', () => this.downloadTemplate());
            }

            // 开始导入
            const importBtn = document.getElementById('importBtn');
            if (importBtn) {
                importBtn.addEventListener('click', () => this.startImport());
            }

            // 搜索班级
            const searchClass = document.getElementById('searchClass');
            if (searchClass) {
                searchClass.addEventListener('input', (e) => {
                    this.searchClasses(e.target.value);
                });
            }

            // 全选班级
            const selectAllClasses = document.getElementById('selectAllClasses');
            if (selectAllClasses) {
                selectAllClasses.addEventListener('change', (e) => {
                    this.selectAllClasses(e.target.checked);
                });
            }

            // 批量分班
            const batchAssignBtn = document.getElementById('batchAssignBtn');
            if (batchAssignBtn) {
                batchAssignBtn.addEventListener('click', () => this.batchAssignStudents());
            }

            // 导出班级信息
            const exportClassBtn = document.getElementById('exportClassBtn');
            if (exportClassBtn) {
                exportClassBtn.addEventListener('click', () => this.exportClassInfo());
            }
        },

        // 班级学生管理初始化
        initClassManagement() {
            this.loadClassData();
            this.updateClassStatistics();
        },

        // 加载班级数据
        loadClassData() {
            const classList = document.getElementById('classList');
            if (!classList) return;

            const classes = this.getClasses();
            const students = StudentsModule.getAllStudents();

            let html = '';
            classes.forEach(cls => {
                const studentCount = students.filter(s => s.classId === cls.id).length;
                const availableSeats = cls.capacity - studentCount;
                
                html += `
                    <tr>
                        <td class="checkbox-cell">
                            <input type="checkbox" class="class-checkbox" data-class-id="${cls.id}">
                        </td>
                        <td>${cls.id}</td>
                        <td>${cls.name}</td>
                        <td>${cls.major}</td>
                        <td>${cls.grade}级</td>
                        <td>${studentCount}</td>
                        <td>${cls.capacity}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="TeachingAdminModule.editClass('${cls.id}')">编辑</button>
                            <button class="btn btn-sm btn-info" onclick="TeachingAdminModule.viewStudents('${cls.id}')">查看学生</button>
                            <button class="btn btn-sm btn-danger" onclick="TeachingAdminModule.deleteClass('${cls.id}')">删除</button>
                        </td>
                    </tr>
                `;
            });

            classList.innerHTML = html;
        },

        // 获取班级列表
        getClasses() {
            // 从localStorage获取班级数据，如果没有则使用默认数据
            let classes = localStorage.getItem('classes');
            if (classes) {
                return JSON.parse(classes);
            }

            // 默认班级数据
            const defaultClasses = [
                { id: 'CS202301', name: '计算机科学与技术2023-1班', major: '计算机科学与技术', grade: '2023', capacity: 40 },
                { id: 'CS202302', name: '计算机科学与技术2023-2班', major: '计算机科学与技术', grade: '2023', capacity: 40 },
                { id: 'SE202301', name: '软件工程2023-1班', major: '软件工程', grade: '2023', capacity: 35 },
                { id: 'SE202302', name: '软件工程2023-2班', major: '软件工程', grade: '2023', capacity: 35 },
                { id: 'MATH202301', name: '数学与应用数学2023-1班', major: '数学与应用数学', grade: '2023', capacity: 30 }
            ];

            localStorage.setItem('classes', JSON.stringify(defaultClasses));
            return defaultClasses;
        },

        // 添加班级
        addClass() {
            const classId = document.getElementById('classId').value.trim();
            const className = document.getElementById('className').value.trim();
            const classMajor = document.getElementById('classMajor').value.trim();
            const classGrade = document.getElementById('classGrade').value;
            const classCapacity = parseInt(document.getElementById('classCapacity').value);

            if (!classId || !className || !classMajor) {
                alert('请填写完整的班级信息');
                return;
            }

            const classes = this.getClasses();
            
            // 检查班级编号是否已存在
            if (classes.find(cls => cls.id === classId)) {
                alert('班级编号已存在');
                return;
            }

            const newClass = {
                id: classId,
                name: className,
                major: classMajor,
                grade: classGrade,
                capacity: classCapacity
            };

            classes.push(newClass);
            localStorage.setItem('classes', JSON.stringify(classes));

            // 清空表单
            document.getElementById('classId').value = '';
            document.getElementById('className').value = '';
            document.getElementById('classMajor').value = '';
            document.getElementById('classCapacity').value = '40';

            // 刷新列表
            this.loadClassData();
            this.updateClassStatistics();

            alert('班级添加成功');
        },

        // 编辑班级
        editClass(classId) {
            const classes = this.getClasses();
            const cls = classes.find(c => c.id === classId);
            
            if (cls) {
                document.getElementById('classId').value = cls.id;
                document.getElementById('className').value = cls.name;
                document.getElementById('classMajor').value = cls.major;
                document.getElementById('classGrade').value = cls.grade;
                document.getElementById('classCapacity').value = cls.capacity;
                
                // 滚动到表单
                document.querySelector('.management-card').scrollIntoView({ behavior: 'smooth' });
            }
        },

        // 更新班级
        updateClass() {
            const classId = document.getElementById('classId').value.trim();
            const className = document.getElementById('className').value.trim();
            const classMajor = document.getElementById('classMajor').value.trim();
            const classGrade = document.getElementById('classGrade').value;
            const classCapacity = parseInt(document.getElementById('classCapacity').value);

            if (!classId || !className || !classMajor) {
                alert('请填写完整的班级信息');
                return;
            }

            let classes = this.getClasses();
            const index = classes.findIndex(cls => cls.id === classId);
            
            if (index === -1) {
                alert('班级不存在');
                return;
            }

            classes[index] = {
                id: classId,
                name: className,
                major: classMajor,
                grade: classGrade,
                capacity: classCapacity
            };

            localStorage.setItem('classes', JSON.stringify(classes));
            this.loadClassData();
            this.updateClassStatistics();

            alert('班级更新成功');
        },

        // 删除班级
        deleteClass(classId) {
            if (!confirm('确定要删除这个班级吗？删除后该班级的学生将变为无班级状态。')) {
                return;
            }

            let classes = this.getClasses();
            classes = classes.filter(cls => cls.id !== classId);
            localStorage.setItem('classes', JSON.stringify(classes));

            // 将该班级的学生设为无班级状态
            const students = StudentsModule.getAllStudents();
            students.forEach(student => {
                if (student.classId === classId) {
                    student.classId = '';
                }
            });

            this.loadClassData();
            this.updateClassStatistics();

            alert('班级删除成功');
        },

        // 查看学生
        viewStudents(classId) {
            const students = StudentsModule.getStudentsByClass(classId);
            const classes = this.getClasses();
            const cls = classes.find(c => c.id === classId);
            
            let studentList = `班级：${cls.name}\n\n学生列表：\n`;
            students.forEach((student, index) => {
                studentList += `${index + 1}. ${student.id} - ${student.name} (${student.gender})\n`;
            });

            alert(studentList);
        },

        // 搜索班级
        searchClasses(keyword) {
            const rows = document.querySelectorAll('#classList tr');
            const lowerKeyword = keyword.toLowerCase();

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(lowerKeyword) ? '' : 'none';
            });
        },

        // 全选班级
        selectAllClasses(checked) {
            const checkboxes = document.querySelectorAll('.class-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = checked;
                if (checked) {
                    this.selectedClasses.add(checkbox.dataset.classId);
                } else {
                    this.selectedClasses.delete(checkbox.dataset.classId);
                }
            });
        },

        // 批量分班
        batchAssignStudents() {
            const selectedClasses = Array.from(document.querySelectorAll('.class-checkbox:checked'))
                .map(cb => cb.dataset.classId);

            if (selectedClasses.length === 0) {
                alert('请选择要操作的班级');
                return;
            }

            const targetClassId = prompt('请输入目标班级编号：');
            if (!targetClassId) return;

            const classes = this.getClasses();
            const targetClass = classes.find(c => c.id === targetClassId);
            
            if (!targetClass) {
                alert('目标班级不存在');
                return;
            }

            const students = StudentsModule.getAllStudents();
            let movedCount = 0;

            selectedClasses.forEach(sourceClassId => {
                const sourceStudents = students.filter(s => s.classId === sourceClassId);
                sourceStudents.forEach(student => {
                    student.classId = targetClassId;
                    movedCount++;
                });
            });

            this.loadClassData();
            this.updateClassStatistics();

            alert(`成功将 ${movedCount} 名学生转移到 ${targetClass.name}`);
        },

        // 导出班级信息
        exportClassInfo() {
            const classes = this.getClasses();
            const students = StudentsModule.getAllStudents();

            let csvContent = "班级编号,班级名称,专业,年级,当前人数,最大容量,剩余名额\n";
            
            classes.forEach(cls => {
                const studentCount = students.filter(s => s.classId === cls.id).length;
                const availableSeats = cls.capacity - studentCount;
                
                csvContent += `${cls.id},${cls.name},${cls.major},${cls.grade}级,${studentCount},${cls.capacity},${availableSeats}\n`;
            });

            this.downloadFile(csvContent, '班级信息.csv', 'text/csv;charset=utf-8;');
        },

        // 下载模板
        downloadTemplate() {
            const template = "学号,姓名,性别,班级编号\n2023001,张三,男,CS202301\n2023002,李四,女,CS202301\n2023003,王五,男,CS202302";
            this.downloadFile(template, '学生导入模板.csv', 'text/csv;charset=utf-8;');
        },

        // 处理文件上传
        handleFileUpload(file) {
            const fileName = file.name.toLowerCase();
            if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
                alert('请上传Excel或CSV文件');
                return;
            }

            // 这里简化处理，实际应该使用SheetJS等库解析Excel
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                this.parseStudentData(content);
            };
            reader.readAsText(file);
        },

        // 解析学生数据
        parseStudentData(content) {
            const lines = content.split('\n');
            const students = [];
            
            // 跳过标题行
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const parts = line.split(',');
                if (parts.length >= 4) {
                    students.push({
                        id: parts[0].trim(),
                        name: parts[1].trim(),
                        gender: parts[2].trim(),
                        classId: parts[3].trim()
                    });
                }
            }

            this.uploadedStudents = students;
            alert(`成功解析 ${students.length} 条学生记录，点击"开始导入"完成导入`);
        },

        // 开始导入
        startImport() {
            if (!this.uploadedStudents || this.uploadedStudents.length === 0) {
                alert('请先上传文件');
                return;
            }

            const result = StudentsModule.batchImport(this.uploadedStudents);
            
            let message = `导入完成：\n成功：${result.success} 条\n失败：${result.errors.length} 条`;
            
            if (result.errors.length > 0) {
                message += '\n\n错误详情：\n';
                result.errors.forEach(error => {
                    message += `第${error.row}行：${error.error}\n`;
                });
            }

            alert(message);
            
            // 清空上传的数据
            this.uploadedStudents = [];
            document.getElementById('fileInput').value = '';
            
            // 刷新数据
            this.loadClassData();
            this.updateClassStatistics();
        },

        // 更新班级统计
        updateClassStatistics() {
            const classes = this.getClasses();
            const students = StudentsModule.getAllStudents();
            
            const totalClasses = classes.length;
            const totalStudents = students.length;
            const avgClassSize = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;
            
            let totalCapacity = 0;
            let totalOccupied = 0;
            
            classes.forEach(cls => {
                totalCapacity += cls.capacity;
                const studentCount = students.filter(s => s.classId === cls.id).length;
                totalOccupied += studentCount;
            });
            
            const availableSeats = totalCapacity - totalOccupied;

            document.getElementById('totalClasses').textContent = totalClasses;
            document.getElementById('totalStudents').textContent = totalStudents;
            document.getElementById('avgClassSize').textContent = avgClassSize;
            document.getElementById('availableSeats').textContent = availableSeats;
        },

        // 下载文件
        downloadFile(content, fileName, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        },

        // 绑定视图切换事件
        bindViewEvents() {
            // 视图切换事件
            document.querySelectorAll('[data-view]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const view = e.currentTarget.dataset.view;
                    this.switchView(view);
                });
            });
        },

        switchSection(sectionId) {
            // 更新导航状态
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-section="${sectionId}"]`).closest('.nav-item').classList.add('active');

            // 切换内容区域
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');

            this.currentSection = sectionId;
        },

        switchTab(sectionId, tabId) {
            // 更新标签按钮状态
            document.querySelectorAll(`#${sectionId} .tab-btn`).forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`#${sectionId} [data-tab="${tabId}"]`).classList.add('active');

            // 切换标签内容
            document.querySelectorAll(`#${sectionId} .tab-content`).forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');

            this.currentTab[sectionId] = tabId;
        },

        switchView(view) {
            // 更新视图按钮状态
            document.querySelectorAll('.view-tab').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-view="${view}"]`).classList.add('active');

            // 重新渲染课程表
            this.renderTimetable(view);
        },

        // ========== 班级学生管理 ==========
        initClassManagement() {
            this.bindClassEvents();
            this.loadClassData();
        },

        bindClassEvents() {
            // 班级管理事件
            document.getElementById('addClassBtn')?.addEventListener('click', () => this.showAddClassModal());
            document.getElementById('editClassBtn')?.addEventListener('click', () => this.showEditClassModal());
            document.getElementById('deleteClassBtn')?.addEventListener('click', () => this.deleteSelectedClasses());

            // 学生导入事件
            document.getElementById('downloadTemplateBtn')?.addEventListener('click', () => this.downloadTemplate());
            document.getElementById('selectFileBtn')?.addEventListener('click', () => this.selectFile());
            document.getElementById('uploadFileBtn')?.addEventListener('click', () => this.uploadFile());
            document.getElementById('confirmImportBtn')?.addEventListener('click', () => this.confirmImport());
            document.getElementById('cancelImportBtn')?.addEventListener('click', () => this.cancelImport());

            // 分班调班事件
            document.getElementById('searchStudentBtn')?.addEventListener('click', () => this.searchStudents());
            document.getElementById('assignToClassBtn')?.addEventListener('click', () => this.assignToClass());
            document.getElementById('clearSelectionBtn')?.addEventListener('click', () => this.clearSelection());

            // 搜索框回车事件
            document.getElementById('studentSearchInput')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchStudents();
            });
        },

        loadClassData() {
            const classes = StorageModule.getClasses() || this.generateMockClasses();
            this.renderClassTable(classes);
            this.updateClassSelects();
        },

        generateMockClasses() {
            const mockClasses = [
                { id: 'CS202101', name: '计算机科学与技术1班', major: '计算机科学与技术', grade: '2021', studentCount: 45, headTeacher: '张老师', createTime: '2021-09-01' },
                { id: 'CS202102', name: '计算机科学与技术2班', major: '计算机科学与技术', grade: '2021', studentCount: 43, headTeacher: '李老师', createTime: '2021-09-01' },
                { id: 'MATH202101', name: '数学与应用数学1班', major: '数学与应用数学', grade: '2021', studentCount: 38, headTeacher: '王老师', createTime: '2021-09-01' },
                { id: 'ENG202101', name: '英语1班', major: '英语', grade: '2021', studentCount: 35, headTeacher: '刘老师', createTime: '2021-09-01' },
                { id: 'CS202201', name: '计算机科学与技术1班', major: '计算机科学与技术', grade: '2022', studentCount: 46, headTeacher: '陈老师', createTime: '2022-09-01' }
            ];
            StorageModule.setClasses(mockClasses);
            return mockClasses;
        },

        renderClassTable(classes) {
            const tbody = document.getElementById('classTableBody');
            if (!tbody) return;

            tbody.innerHTML = classes.map(cls => `
                <tr>
                    <td><input type="checkbox" class="class-checkbox" data-id="${cls.id}"></td>
                    <td>${cls.id}</td>
                    <td>${cls.name}</td>
                    <td>${cls.major}</td>
                    <td>${cls.grade}</td>
                    <td>${cls.studentCount}</td>
                    <td>${cls.headTeacher}</td>
                    <td>${cls.createTime}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="TeachingAdminModule.editClass('${cls.id}')">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="TeachingAdminModule.deleteClass('${cls.id}')">删除</button>
                    </td>
                </tr>
            `).join('');
        },

        updateClassSelects() {
            const classes = StorageModule.getClasses() || [];
            const selects = [document.getElementById('targetClassSelect'), document.getElementById('timetableClassSelect')];
            
            selects.forEach(select => {
                if (!select) return;
                const currentValue = select.value;
                select.innerHTML = '<option value="">请选择班级</option>' + 
                    classes.map(cls => `<option value="${cls.id}">${cls.name}</option>`).join('');
                if (currentValue) select.value = currentValue;
            });
        },

        showAddClassModal() {
            const modalBody = `
                <form id="addClassForm">
                    <div class="form-group">
                        <label>班级编号：</label>
                        <input type="text" id="classId" required>
                    </div>
                    <div class="form-group">
                        <label>班级名称：</label>
                        <input type="text" id="className" required>
                    </div>
                    <div class="form-group">
                        <label>所属专业：</label>
                        <input type="text" id="classMajor" required>
                    </div>
                    <div class="form-group">
                        <label>年级：</label>
                        <select id="classGrade" required>
                            <option value="">请选择年级</option>
                            <option value="2021">2021级</option>
                            <option value="2022">2022级</option>
                            <option value="2023">2023级</option>
                            <option value="2024">2024级</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>班主任：</label>
                        <input type="text" id="headTeacher" required>
                    </div>
                </form>
            `;

            const modalFooter = `
                <button class="btn btn-primary" onclick="TeachingAdminModule.saveClass()">保存</button>
                <button class="btn btn-secondary" onclick="TeachingAdminModule.closeModal()">取消</button>
            `;

            this.showModal('添加班级', modalBody, modalFooter);
        },

        saveClass() {
            const form = document.getElementById('addClassForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const newClass = {
                id: document.getElementById('classId').value,
                name: document.getElementById('className').value,
                major: document.getElementById('classMajor').value,
                grade: document.getElementById('classGrade').value,
                studentCount: 0,
                headTeacher: document.getElementById('headTeacher').value,
                createTime: new Date().toISOString().split('T')[0]
            };

            const classes = StorageModule.getClasses() || [];
            classes.push(newClass);
            StorageModule.setClasses(classes);

            this.renderClassTable(classes);
            this.updateClassSelects();
            this.closeModal();
            NotificationModule.showSuccess('班级添加成功');
        },

        editClass(classId) {
            const classes = StorageModule.getClasses() || [];
            const cls = classes.find(c => c.id === classId);
            if (!cls) return;

            const modalBody = `
                <form id="editClassForm">
                    <div class="form-group">
                        <label>班级编号：</label>
                        <input type="text" id="classId" value="${cls.id}" readonly>
                    </div>
                    <div class="form-group">
                        <label>班级名称：</label>
                        <input type="text" id="className" value="${cls.name}" required>
                    </div>
                    <div class="form-group">
                        <label>所属专业：</label>
                        <input type="text" id="classMajor" value="${cls.major}" required>
                    </div>
                    <div class="form-group">
                        <label>年级：</label>
                        <select id="classGrade" required>
                            <option value="2021" ${cls.grade === '2021' ? 'selected' : ''}>2021级</option>
                            <option value="2022" ${cls.grade === '2022' ? 'selected' : ''}>2022级</option>
                            <option value="2023" ${cls.grade === '2023' ? 'selected' : ''}>2023级</option>
                            <option value="2024" ${cls.grade === '2024' ? 'selected' : ''}>2024级</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>班主任：</label>
                        <input type="text" id="headTeacher" value="${cls.headTeacher}" required>
                    </div>
                </form>
            `;

            const modalFooter = `
                <button class="btn btn-primary" onclick="TeachingAdminModule.updateClass('${classId}')">更新</button>
                <button class="btn btn-secondary" onclick="TeachingAdminModule.closeModal()">取消</button>
            `;

            this.showModal('编辑班级', modalBody, modalFooter);
        },

        updateClass(classId) {
            const form = document.getElementById('editClassForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const classes = StorageModule.getClasses() || [];
            const index = classes.findIndex(c => c.id === classId);
            if (index === -1) return;

            classes[index] = {
                ...classes[index],
                name: document.getElementById('className').value,
                major: document.getElementById('classMajor').value,
                grade: document.getElementById('classGrade').value,
                headTeacher: document.getElementById('headTeacher').value
            };

            StorageModule.setClasses(classes);
            this.renderClassTable(classes);
            this.updateClassSelects();
            this.closeModal();
            NotificationModule.showSuccess('班级信息更新成功');
        },

        deleteClass(classId) {
            if (!confirm('确定要删除这个班级吗？')) return;

            const classes = StorageModule.getClasses() || [];
            const filteredClasses = classes.filter(c => c.id !== classId);
            StorageModule.setClasses(filteredClasses);

            this.renderClassTable(filteredClasses);
            this.updateClassSelects();
            NotificationModule.showSuccess('班级删除成功');
        },

        deleteSelectedClasses() {
            const checkboxes = document.querySelectorAll('.class-checkbox:checked');
            if (checkboxes.length === 0) {
                NotificationModule.showError('请先选择要删除的班级');
                return;
            }

            if (!confirm(`确定要删除选中的 ${checkboxes.length} 个班级吗？`)) return;

            const idsToDelete = Array.from(checkboxes).map(cb => cb.dataset.id);
            const classes = StorageModule.getClasses() || [];
            const filteredClasses = classes.filter(c => !idsToDelete.includes(c.id));
            StorageModule.setClasses(filteredClasses);

            this.renderClassTable(filteredClasses);
            this.updateClassSelects();
            NotificationModule.showSuccess(`成功删除 ${checkboxes.length} 个班级`);
        },

        // ========== 学生批量导入 ==========
        downloadTemplate() {
            // 创建Excel模板数据
            const templateData = [
                ['学号', '姓名', '性别', '班级编号', '专业', '年级', '联系电话', '邮箱'],
                ['2021001', '张三', '男', 'CS202101', '计算机科学与技术', '2021', '13800138000', 'zhangsan@example.com'],
                ['2021002', '李四', '女', 'CS202101', '计算机科学与技术', '2021', '13800138001', 'lisi@example.com']
            ];

            // 创建CSV内容
            const csvContent = templateData.map(row => row.join(',')).join('\n');
            
            // 创建下载链接
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = '学生信息导入模板.csv';
            link.click();
            
            NotificationModule.showSuccess('模板下载成功');
        },

        selectFile() {
            document.getElementById('studentFileInput').click();
        },

        uploadFile() {
            const fileInput = document.getElementById('studentFileInput');
            const file = fileInput.files[0];
            
            if (!file) {
                NotificationModule.showError('请先选择文件');
                return;
            }

            // 模拟文件解析
            this.parseStudentFile(file);
        },

        parseStudentFile(file) {
            // 模拟解析过程
            const mockData = [
                { studentId: '2021001', name: '张三', gender: '男', classId: 'CS202101', status: '有效' },
                { studentId: '2021002', name: '李四', gender: '女', classId: 'CS202101', status: '有效' },
                { studentId: '2021003', name: '王五', gender: '男', classId: 'CS202101', status: '班级不存在' },
                { studentId: '2021004', name: '赵六', gender: '女', classId: 'CS202102', status: '有效' }
            ];

            this.showImportPreview(mockData);
        },

        showImportPreview(data) {
            const validRecords = data.filter(item => item.status === '有效').length;
            const errorRecords = data.filter(item => item.status !== '有效').length;

            document.getElementById('totalRecords').textContent = data.length;
            document.getElementById('validRecords').textContent = validRecords;
            document.getElementById('errorRecords').textContent = errorRecords;

            const tbody = document.getElementById('previewTableBody');
            tbody.innerHTML = data.map(item => `
                <tr class="${item.status === '有效' ? '' : 'error-row'}">
                    <td>${item.studentId}</td>
                    <td>${item.name}</td>
                    <td>${item.gender}</td>
                    <td>${item.classId}</td>
                    <td><span class="status ${item.status === '有效' ? 'success' : 'error'}">${item.status}</span></td>
                </tr>
            `).join('');

            document.getElementById('importPreview').style.display = 'block';
            document.getElementById('uploadFileBtn').disabled = false;
        },

        confirmImport() {
            // 模拟导入过程
            NotificationModule.showSuccess('学生信息导入成功');
            this.cancelImport();
        },

        cancelImport() {
            document.getElementById('importPreview').style.display = 'none';
            document.getElementById('studentFileInput').value = '';
            document.getElementById('selectedFileName').textContent = '未选择文件';
            document.getElementById('uploadFileBtn').disabled = true;
        },

        // ========== 学生分班调班 ==========
        searchStudents() {
            const searchTerm = document.getElementById('studentSearchInput').value.toLowerCase();
            const gradeFilter = document.getElementById('gradeFilter').value;

            // 模拟学生数据
            const mockStudents = [
                { id: '2021001', name: '张三', class: 'CS202101', grade: '2021' },
                { id: '2021002', name: '李四', class: 'CS202101', grade: '2021' },
                { id: '2021003', name: '王五', class: 'CS202102', grade: '2021' },
                { id: '2022001', name: '赵六', class: 'CS202201', grade: '2022' },
                { id: '2022002', name: '钱七', class: 'CS202201', grade: '2022' }
            ];

            let filteredStudents = mockStudents;
            
            if (searchTerm) {
                filteredStudents = filteredStudents.filter(student => 
                    student.id.includes(searchTerm) || student.name.includes(searchTerm)
                );
            }

            if (gradeFilter) {
                filteredStudents = filteredStudents.filter(student => student.grade === gradeFilter);
            }

            this.renderStudentList(filteredStudents);
        },

        renderStudentList(students) {
            const container = document.getElementById('studentListContainer');
            if (!container) return;

            container.innerHTML = students.map(student => `
                <div class="student-item ${this.selectedStudents.has(student.id) ? 'selected' : ''}" 
                     onclick="TeachingAdminModule.toggleStudentSelection('${student.id}')">
                    <input type="checkbox" class="student-checkbox" 
                           ${this.selectedStudents.has(student.id) ? 'checked' : ''}>
                    <div class="student-info">
                        <div class="student-name">${student.name}</div>
                        <div class="student-id">${student.id} | ${student.class}</div>
                    </div>
                </div>
            `).join('');
        },

        toggleStudentSelection(studentId) {
            if (this.selectedStudents.has(studentId)) {
                this.selectedStudents.delete(studentId);
            } else {
                this.selectedStudents.add(studentId);
            }
            
            this.updateSelectedStudentsList();
            this.searchStudents(); // 重新渲染列表以更新选中状态
        },

        updateSelectedStudentsList() {
            const container = document.getElementById('selectedStudentsList');
            const count = document.getElementById('selectedCount');
            
            if (count) {
                count.textContent = this.selectedStudents.size;
            }
            
            if (!container) return;
            
            if (this.selectedStudents.size === 0) {
                container.innerHTML = '<p style="color: #6c757d; text-align: center;">暂未选择学生</p>';
                return;
            }

            // 模拟获取学生详细信息
            const selectedStudents = Array.from(this.selectedStudents).map(id => ({
                id: id,
                name: `学生${id.slice(-4)}`,
                class: 'CS202101'
            }));

            container.innerHTML = selectedStudents.map(student => `
                <div class="selected-student-item">
                    <span>${student.name} (${student.id})</span>
                    <button class="remove-student" onclick="TeachingAdminModule.removeStudent('${student.id}')">移除</button>
                </div>
            `).join('');
        },

        removeStudent(studentId) {
            this.selectedStudents.delete(studentId);
            this.updateSelectedStudentsList();
            this.searchStudents();
        },

        assignToClass() {
            const targetClass = document.getElementById('targetClassSelect').value;
            
            if (this.selectedStudents.size === 0) {
                NotificationModule.showError('请先选择要分配的学生');
                return;
            }

            if (!targetClass) {
                NotificationModule.showError('请选择目标班级');
                return;
            }

            // 模拟分配过程
            const assignmentRecord = {
                students: Array.from(this.selectedStudents),
                targetClass: targetClass,
                time: new Date().toLocaleString(),
                operator: '教学管理员'
            };

            this.addAssignmentHistory(assignmentRecord);
            this.clearSelection();
            NotificationModule.showSuccess(`成功将 ${this.selectedStudents.size} 名学生分配到 ${targetClass}`);
        },

        clearSelection() {
            this.selectedStudents.clear();
            this.updateSelectedStudentsList();
            this.searchStudents();
        },

        addAssignmentHistory(record) {
            const historyContainer = document.getElementById('assignmentHistory');
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-time">${record.time}</div>
                <div>将 ${record.students.length} 名学生分配到 ${record.targetClass}</div>
                <div>操作人：${record.operator}</div>
            `;
            
            historyContainer.insertBefore(historyItem, historyContainer.firstChild);
            
            // 限制历史记录数量
            while (historyContainer.children.length > 10) {
                historyContainer.removeChild(historyContainer.lastChild);
            }
        },

        // ========== 课程安排系统 ==========
        initCourseScheduling() {
            this.bindSchedulingEvents();
            this.loadCoursePlanData();
        },

        bindSchedulingEvents() {
            // 课程计划事件
            document.getElementById('addCoursePlanBtn')?.addEventListener('click', () => this.showAddCoursePlanModal());
            document.getElementById('importPlanBtn')?.addEventListener('click', () => this.importCoursePlan());
            document.getElementById('generatePlanBtn')?.addEventListener('click', () => this.generateSmartPlan());

            // 资源分配事件
            document.getElementById('departmentFilter')?.addEventListener('change', () => this.filterTeachers());
            document.getElementById('teacherSearchInput')?.addEventListener('input', () => this.filterTeachers());
            document.getElementById('buildingFilter')?.addEventListener('change', () => this.filterRooms());
            document.getElementById('roomTypeFilter')?.addEventListener('change', () => this.filterRooms());

            // 冲突检测事件
            document.getElementById('runConflictDetectionBtn')?.addEventListener('click', () => this.runConflictDetection());
            document.getElementById('autoResolveBtn')?.addEventListener('click', () => this.autoResolveConflicts());
            document.getElementById('exportReportBtn')?.addEventListener('click', () => this.exportConflictReport());
        },

        loadCoursePlanData() {
            const coursePlans = StorageModule.getCoursePlans() || this.generateMockCoursePlans();
            this.renderCoursePlanTable(coursePlans);
        },

        generateMockCoursePlans() {
            const mockPlans = [
                { courseId: 'CS301', courseName: 'Python程序设计', teacher: '张老师', credits: 4, totalHours: 64, theoryHours: 48, labHours: 16, classes: 'CS202101,CS202102', studentCount: 88, status: '已安排' },
                { courseId: 'CS401', courseName: 'Web前端开发', teacher: '张老师', credits: 3, totalHours: 48, theoryHours: 32, labHours: 16, classes: 'CS202201', studentCount: 46, status: '已安排' },
                { courseId: 'MATH301', courseName: '概率论与数理统计', teacher: '李老师', credits: 4, totalHours: 64, theoryHours: 64, labHours: 0, classes: 'CS202101,CS202102', studentCount: 88, status: '待安排' },
                { courseId: 'MATH401', courseName: '离散数学', teacher: '李老师', credits: 3, totalHours: 48, theoryHours: 48, labHours: 0, classes: 'CS202201', studentCount: 46, status: '待安排' }
            ];
            StorageModule.setCoursePlans(mockPlans);
            return mockPlans;
        },

        renderCoursePlanTable(plans) {
            const tbody = document.getElementById('coursePlanTableBody');
            if (!tbody) return;

            tbody.innerHTML = plans.map(plan => `
                <tr>
                    <td>${plan.courseId}</td>
                    <td>${plan.courseName}</td>
                    <td>${plan.teacher}</td>
                    <td>${plan.credits}</td>
                    <td>${plan.totalHours}</td>
                    <td>${plan.theoryHours}</td>
                    <td>${plan.labHours}</td>
                    <td>${plan.classes}</td>
                    <td>${plan.studentCount}</td>
                    <td><span class="status ${plan.status === '已安排' ? 'success' : 'pending'}">${plan.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="TeachingAdminModule.editCoursePlan('${plan.courseId}')">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="TeachingAdminModule.deleteCoursePlan('${plan.courseId}')">删除</button>
                    </td>
                </tr>
            `).join('');
        },

        showAddCoursePlanModal() {
            const modalBody = `
                <form id="addCoursePlanForm">
                    <div class="form-group">
                        <label>课程编号：</label>
                        <input type="text" id="courseId" required>
                    </div>
                    <div class="form-group">
                        <label>课程名称：</label>
                        <input type="text" id="courseName" required>
                    </div>
                    <div class="form-group">
                        <label>授课教师：</label>
                        <select id="teacherSelect" required>
                            <option value="">请选择教师</option>
                            <option value="张老师">张老师</option>
                            <option value="李老师">李老师</option>
                            <option value="王老师">王老师</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>学分：</label>
                        <input type="number" id="credits" min="1" max="10" required>
                    </div>
                    <div class="form-group">
                        <label>总学时：</label>
                        <input type="number" id="totalHours" min="1" max="200" required>
                    </div>
                    <div class="form-group">
                        <label>理论学时：</label>
                        <input type="number" id="theoryHours" min="0" required>
                    </div>
                    <div class="form-group">
                        <label>实验学时：</label>
                        <input type="number" id="labHours" min="0" required>
                    </div>
                    <div class="form-group">
                        <label>授课班级：</label>
                        <input type="text" id="classes" placeholder="多个班级用逗号分隔" required>
                    </div>
                </form>
            `;

            const modalFooter = `
                <button class="btn btn-primary" onclick="TeachingAdminModule.saveCoursePlan()">保存</button>
                <button class="btn btn-secondary" onclick="TeachingAdminModule.closeModal()">取消</button>
            `;

            this.showModal('添加开课计划', modalBody, modalFooter);
        },

        saveCoursePlan() {
            const form = document.getElementById('addCoursePlanForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const newPlan = {
                courseId: document.getElementById('courseId').value,
                courseName: document.getElementById('courseName').value,
                teacher: document.getElementById('teacherSelect').value,
                credits: parseInt(document.getElementById('credits').value),
                totalHours: parseInt(document.getElementById('totalHours').value),
                theoryHours: parseInt(document.getElementById('theoryHours').value),
                labHours: parseInt(document.getElementById('labHours').value),
                classes: document.getElementById('classes').value,
                studentCount: this.calculateStudentCount(document.getElementById('classes').value),
                status: '待安排'
            };

            const plans = StorageModule.getCoursePlans() || [];
            plans.push(newPlan);
            StorageModule.setCoursePlans(plans);

            this.renderCoursePlanTable(plans);
            this.closeModal();
            NotificationModule.showSuccess('开课计划添加成功');
        },

        calculateStudentCount(classesStr) {
            // 模拟计算学生数量
            const classes = classesStr.split(',');
            return classes.length * 45; // 假设每个班级45人
        },

        // ========== 课程表生成 ==========
        initTimetable() {
            this.bindTimetableEvents();
            this.initTimetableGrid();
        },

        bindTimetableEvents() {
            document.getElementById('generateTimetableBtn')?.addEventListener('click', () => this.generateTimetable());
            document.getElementById('clearTimetableBtn')?.addEventListener('click', () => this.clearTimetable());
            document.getElementById('exportTimetableBtn')?.addEventListener('click', () => this.exportTimetable());
            document.getElementById('saveTimetableBtn')?.addEventListener('click', () => this.saveTimetable());

            // 课程编辑模态框事件
            document.getElementById('closeCourseEditModal')?.addEventListener('click', () => this.closeCourseEditModal());
            document.getElementById('saveCourseEditBtn')?.addEventListener('click', () => this.saveCourseEdit());
            document.getElementById('cancelCourseEditBtn')?.addEventListener('click', () => this.closeCourseEditModal());
        },

        initTimetableGrid() {
            this.renderTimetable('week');
        },

        renderTimetable(view) {
            const grid = document.getElementById('timetableGrid');
            if (!grid) return;

            if (view === 'week') {
                grid.innerHTML = this.generateWeekTimetable();
            } else if (view === 'day') {
                grid.innerHTML = this.generateDayTimetable();
            } else if (view === 'teacher') {
                grid.innerHTML = this.generateTeacherTimetable();
            } else if (view === 'classroom') {
                grid.innerHTML = this.generateClassroomTimetable();
            }

            this.bindTimetableDragEvents();
        },

        generateWeekTimetable() {
            const timeSlots = ['08:00-08:45', '08:55-09:40', '10:00-10:45', '10:55-11:40', '14:00-14:45', '14:55-15:40', '16:00-16:45', '16:55-17:40'];
            const weekDays = ['周一', '周二', '周三', '周四', '周五'];
            
            let html = '<table class="timetable-table">';
            html += '<thead><tr><th class="time-header">时间</th>';
            weekDays.forEach(day => {
                html += `<th>${day}</th>`;
            });
            html += '</tr></thead><tbody>';

            timeSlots.forEach((slot, slotIndex) => {
                html += `<tr><td class="time-slot">${slot}</td>`;
                weekDays.forEach(day => {
                    const cellId = `${day}-${slotIndex}`;
                    html += `<td class="course-cell" data-cell="${cellId}" ondrop="TeachingAdminModule.handleDrop(event)" ondragover="TeachingAdminModule.handleDragOver(event)" ondragleave="TeachingAdminModule.handleDragLeave(event)">`;
                    html += this.generateCourseItem(cellId);
                    html += '</td>';
                });
                html += '</tr>';
            });

            html += '</tbody></table>';
            return html;
        },

        generateCourseItem(cellId) {
            // 模拟课程数据
            const mockCourses = {
                '周一-0': { name: 'Python程序设计', teacher: '张老师', classroom: 'A101', type: 'lecture' },
                '周一-2': { name: 'Web前端开发', teacher: '张老师', classroom: 'B201', type: 'lab' },
                '周二-1': { name: '概率论与数理统计', teacher: '李老师', classroom: 'C301', type: 'lecture' },
                '周三-0': { name: '离散数学', teacher: '李老师', classroom: 'A102', type: 'lecture' },
                '周四-2': { name: 'Python程序设计', teacher: '张老师', classroom: 'A101', type: 'lab' }
            };

            const course = mockCourses[cellId];
            if (course) {
                return `<div class="course-item ${course.type}" draggable="true" ondragstart="TeachingAdminModule.handleDragStart(event, '${cellId}')" onclick="TeachingAdminModule.editCourse('${cellId}')">
                    <div>${course.name}</div>
                    <div style="font-size: 10px;">${course.teacher} | ${course.classroom}</div>
                </div>`;
            }
            return '';
        },

        bindTimetableDragEvents() {
            // 拖拽事件已在HTML中绑定
        },

        handleDragStart(event, cellId) {
            event.dataTransfer.setData('text/plain', cellId);
            event.target.classList.add('dragging');
        },

        handleDragOver(event) {
            event.preventDefault();
            event.currentTarget.classList.add('drag-over');
        },

        handleDragLeave(event) {
            event.currentTarget.classList.remove('drag-over');
        },

        handleDrop(event) {
            event.preventDefault();
            event.currentTarget.classList.remove('drag-over');
            
            const sourceCellId = event.dataTransfer.getData('text/plain');
            const targetCell = event.currentTarget;
            const targetCellId = targetCell.dataset.cell;
            
            if (sourceCellId !== targetCellId) {
                // 交换课程
                this.swapCourses(sourceCellId, targetCellId);
            }
        },

        swapCourses(sourceId, targetId) {
            // 模拟交换课程
            this.renderTimetable('week');
            NotificationModule.showSuccess('课程时间调整成功');
        },

        editCourse(cellId) {
            const modal = document.getElementById('courseEditModal');
            modal.style.display = 'block';
            
            // 填充表单数据
            document.getElementById('editCourseName').value = 'Python程序设计';
            document.getElementById('editTeacherName').value = '张老师';
            document.getElementById('editClassroom').value = 'A101';
            document.getElementById('editCourseType').value = 'lecture';
            document.getElementById('editWeeklyHours').value = '4';
        },

        closeCourseEditModal() {
            document.getElementById('courseEditModal').style.display = 'none';
        },

        saveCourseEdit() {
            // 保存课程编辑
            this.closeCourseEditModal();
            NotificationModule.showSuccess('课程信息更新成功');
        },

        generateTimetable() {
            const classId = document.getElementById('timetableClassSelect').value;
            const semester = document.getElementById('timetableSemesterSelect').value;
            
            if (!classId) {
                NotificationModule.showError('请选择班级');
                return;
            }

            // 模拟生成课程表
            this.renderTimetable('week');
            NotificationModule.showSuccess('课程表生成成功');
        },

        clearTimetable() {
            if (confirm('确定要清空课程表吗？')) {
                this.timetableData = {};
                this.renderTimetable('week');
                NotificationModule.showSuccess('课程表已清空');
            }
        },

        exportTimetable() {
            // 模拟导出功能
            NotificationModule.showSuccess('课程表导出成功');
        },

        saveTimetable() {
            // 保存课程表到存储
            StorageModule.setTimetable(this.timetableData);
            NotificationModule.showSuccess('课程表保存成功');
        },

        // ========== 冲突检测 ==========
        runConflictDetection() {
            // 模拟冲突检测
            this.conflictData = [
                { id: 1, type: '教师冲突', description: '张老师在周一第1-2节同时安排了两门课程', severity: 'high' },
                { id: 2, type: '教室冲突', description: 'A101教室在周二第3-4节被两门课程同时使用', severity: 'high' },
                { id: 3, type: '学生冲突', description: 'CS202101班级在周三第5-6节有两门课程同时上课', severity: 'medium' }
            ];

            this.renderConflictResults();
            NotificationModule.showSuccess('冲突检测完成');
        },

        renderConflictResults() {
            document.getElementById('conflictCount').textContent = this.conflictData.length;
            document.getElementById('resolvedCount').textContent = '0';
            document.getElementById('pendingCount').textContent = this.conflictData.length;

            const container = document.getElementById('conflictItems');
            container.innerHTML = this.conflictData.map(conflict => `
                <div class="conflict-item">
                    <div class="conflict-info">
                        <div class="conflict-type">${conflict.type}</div>
                        <div class="conflict-description">${conflict.description}</div>
                    </div>
                    <div class="conflict-actions">
                        <button class="btn btn-sm btn-primary" onclick="TeachingAdminModule.resolveConflict(${conflict.id})">解决</button>
                        <button class="btn btn-sm btn-secondary" onclick="TeachingAdminModule.ignoreConflict(${conflict.id})">忽略</button>
                    </div>
                </div>
            `).join('');
        },

        resolveConflict(conflictId) {
            this.conflictData = this.conflictData.filter(c => c.id !== conflictId);
            this.renderConflictResults();
            NotificationModule.showSuccess('冲突已解决');
        },

        ignoreConflict(conflictId) {
            this.conflictData = this.conflictData.filter(c => c.id !== conflictId);
            this.renderConflictResults();
            NotificationModule.showInfo('冲突已忽略');
        },

        autoResolveConflicts() {
            // 模拟自动解决冲突
            this.conflictData = [];
            this.renderConflictResults();
            NotificationModule.showSuccess('所有冲突已自动解决');
        },

        exportConflictReport() {
            // 模拟导出报告
            NotificationModule.showSuccess('冲突检测报告导出成功');
        },

        // ========== 通用功能 ==========
        loadInitialData() {
            // 加载初始数据
            this.updateSelectedStudentsList();
        },

        showModal(title, body, footer) {
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalBody').innerHTML = body;
            document.getElementById('modalFooter').innerHTML = footer;
            document.getElementById('modal').style.display = 'block';
        },

        closeModal() {
            document.getElementById('modal').style.display = 'none';
        },

        // ========== 课程安排系统 ==========
        bindSchedulingEvents() {
            // 添加课程计划
            document.getElementById('addCoursePlanBtn')?.addEventListener('click', () => this.addCoursePlan());

            // 导入模拟课程数据
            document.getElementById('importMockCoursesBtn')?.addEventListener('click', () => this.importMockCoursePlans());

            // 自动排课（生成可用课程表）
            document.getElementById('autoScheduleBtn')?.addEventListener('click', () => this.autoSchedule());

            // 检查可用性
            document.getElementById('checkAvailabilityBtn')?.addEventListener('click', () => this.checkAvailability());

            // 检测冲突
            document.getElementById('detectConflictsBtn')?.addEventListener('click', () => this.detectConflicts());

            // 全选课程
            const selectAllCourses = document.getElementById('selectAllCourses');
            selectAllCourses?.addEventListener('change', (e) => this.selectAllCourses(e.target.checked));
        },

        initCourseScheduling() {
            this.loadCoursePlanData();
            this.updateSchedulingStatistics();
        },

        loadCoursePlanData() {
            // 加载课程选择列表
            this.loadCourseSelects();
            this.loadTeacherSelects();
            this.loadClassSelects();
            
            // 加载课程计划列表
            this.renderCoursePlanList();
        },

        loadCourseSelects() {
            const courseSelect = document.getElementById('courseSelect');
            if (!courseSelect) return;

            const courses = getAllCourses();
            let html = '<option value="">选择课程</option>';
            
            courses.forEach(course => {
                html += `<option value="${course.id}">${course.name} (${course.id})</option>`;
            });
            
            courseSelect.innerHTML = html;
        },

        loadTeacherSelects() {
            const teacherSelect = document.getElementById('teacherSelect');
            if (!teacherSelect) return;

            const teachers = TeachersModule.getAllTeachers();
            let html = '<option value="">选择教师</option>';
            
            teachers.forEach(teacher => {
                const workload = `${teacher.currentWorkload}/${teacher.maxWorkload}`;
                html += `<option value="${teacher.id}">${teacher.name} (${teacher.department}) - 工作量: ${workload}</option>`;
            });
            
            teacherSelect.innerHTML = html;
        },

        loadClassSelects() {
            const courseClassSelect = document.getElementById('courseClassSelect');
            if (!courseClassSelect) return;

            const classes = this.getClasses();
            let html = '<option value="">选择班级</option>';
            
            classes.forEach(cls => {
                const students = StudentsModule.getStudentsByClass(cls.id);
                html += `<option value="${cls.id}">${cls.name} (${students.length}人)</option>`;
            });
            
            courseClassSelect.innerHTML = html;
        },

        renderCoursePlanList() {
            const coursePlanList = document.getElementById('coursePlanList');
            if (!coursePlanList) return;

            const coursePlans = this.getCoursePlans();
            const courses = getAllCourses();
            const teachers = TeachersModule.getAllTeachers();
            const classes = this.getClasses();

            let html = '';
            coursePlans.forEach(plan => {
                const course = courses.find(c => c.id === plan.courseId);
                const teacher = teachers.find(t => t.id === plan.teacherId);
                const cls = classes.find(c => c.id === plan.classId);
                
                html += `
                    <tr>
                        <td class="checkbox-cell">
                            <input type="checkbox" class="course-checkbox" data-plan-id="${plan.id}">
                        </td>
                        <td>${plan.courseId}</td>
                        <td>${course ? course.name : '未知课程'}</td>
                        <td>${teacher ? teacher.name : '未知教师'}</td>
                        <td>${cls ? cls.name : '未知班级'}</td>
                        <td>${plan.hours}</td>
                        <td><span class="status-badge status-${plan.status}">${this.getStatusText(plan.status)}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="TeachingAdminModule.editCoursePlan('${plan.id}')">编辑</button>
                            <button class="btn btn-sm btn-danger" onclick="TeachingAdminModule.deleteCoursePlan('${plan.id}')">删除</button>
                        </td>
                    </tr>
                `;
            });

            coursePlanList.innerHTML = html;
        },

        getCoursePlans() {
            // 从localStorage获取课程计划，如果没有则使用默认数据
            let plans = localStorage.getItem('coursePlans');
            if (plans) {
                return JSON.parse(plans);
            }

            // 默认课程计划数据（含部分已排课项便于展示）
            const defaultPlans = [
                { id: 'plan001', courseId: 'CS301A', teacherId: 'teacher001', classId: 'CS202301', hours: 64, semester: '2024-2', status: 'scheduled', dayOfWeek: 1, timeSlot: '1-2', roomId: 'A101' },
                { id: 'plan002', courseId: 'CS401A', teacherId: 'teacher001', classId: 'CS202302', hours: 48, semester: '2024-2', status: 'pending' },
                { id: 'plan003', courseId: 'MATH301', teacherId: 'teacher002', classId: 'MATH202301', hours: 64, semester: '2024-2', status: 'scheduled', dayOfWeek: 3, timeSlot: '3-4', roomId: 'B201' }
            ];

            localStorage.setItem('coursePlans', JSON.stringify(defaultPlans));
            return defaultPlans;
        },

        // 导入模拟课程计划与课程表数据
        importMockCoursePlans() {
            const mockPlans = [
                { id: 'mock01', courseId: 'CS301A', teacherId: 'teacher001', classId: 'CS202301', hours: 64, semester: '2024-2', status: 'scheduled', dayOfWeek: 1, timeSlot: '1-2', roomId: 'A101' },
                { id: 'mock02', courseId: 'CS401A', teacherId: 'teacher001', classId: 'CS202302', hours: 48, semester: '2024-2', status: 'scheduled', dayOfWeek: 2, timeSlot: '3-4', roomId: 'B201' },
                { id: 'mock03', courseId: 'MATH301', teacherId: 'teacher002', classId: 'MATH202301', hours: 64, semester: '2024-2', status: 'scheduled', dayOfWeek: 3, timeSlot: '5-6', roomId: 'A201' },
                { id: 'mock04', courseId: 'MATH401', teacherId: 'teacher002', classId: 'CS202302', hours: 48, semester: '2024-2', status: 'scheduled', dayOfWeek: 4, timeSlot: '7-8', roomId: 'A202' },
                { id: 'mock05', courseId: 'CS101',  teacherId: 'teacher003', classId: 'CS202301', hours: 48, semester: '2024-2', status: 'pending' }
            ];

            localStorage.setItem('coursePlans', JSON.stringify(mockPlans));
            this.renderCoursePlanList();
            this.updateSchedulingStatistics();
            this.loadTimetableData();
            alert('已导入模拟课程数据并同步课程表');
        },

        getStatusText(status) {
            const statusMap = {
                'pending': '待安排',
                'scheduled': '已安排',
                'conflict': '有冲突',
                'completed': '已完成'
            };
            return statusMap[status] || status;
        },

        addCoursePlan() {
            const courseId = document.getElementById('courseSelect').value;
            const teacherId = document.getElementById('teacherSelect').value;
            const classId = document.getElementById('courseClassSelect').value;
            const hours = parseInt(document.getElementById('courseHours').value);
            const semester = document.getElementById('semester').value;

            if (!courseId || !teacherId || !classId) {
                alert('请填写完整的课程计划信息');
                return;
            }

            // 检查教师工作量
            const teacher = TeachersModule.getTeacherById(teacherId);
            if (teacher && teacher.currentWorkload + hours > teacher.maxWorkload) {
                alert(`教师工作量将超限！当前：${teacher.currentWorkload}，计划增加：${hours}，最大：${teacher.maxWorkload}`);
                return;
            }

            const plans = this.getCoursePlans();
            const newPlan = {
                id: 'plan' + Date.now(),
                courseId,
                teacherId,
                classId,
                hours,
                semester,
                status: 'pending'
            };

            plans.push(newPlan);
            localStorage.setItem('coursePlans', JSON.stringify(plans));

            // 更新教师工作量
            TeachersModule.assignCourse(teacherId, courseId, hours);

            // 清空表单
            document.getElementById('courseSelect').value = '';
            document.getElementById('teacherSelect').value = '';
            document.getElementById('courseClassSelect').value = '';
            document.getElementById('courseHours').value = '64';

            // 刷新列表
            this.renderCoursePlanList();
            this.updateSchedulingStatistics();

            alert('课程计划添加成功');
        },

        editCoursePlan(planId) {
            const plans = this.getCoursePlans();
            const plan = plans.find(p => p.id === planId);
            
            if (plan) {
                document.getElementById('courseSelect').value = plan.courseId;
                document.getElementById('teacherSelect').value = plan.teacherId;
                document.getElementById('courseClassSelect').value = plan.classId;
                document.getElementById('courseHours').value = plan.hours;
                document.getElementById('semester').value = plan.semester;
                
                // 滚动到表单
                document.querySelector('.management-card').scrollIntoView({ behavior: 'smooth' });
            }
        },

        deleteCoursePlan(planId) {
            if (!confirm('确定要删除这个课程计划吗？')) {
                return;
            }

            let plans = this.getCoursePlans();
            const plan = plans.find(p => p.id === planId);
            
            if (plan) {
                // 减少教师工作量
                const teacher = TeachersModule.getTeacherById(plan.teacherId);
                if (teacher) {
                    teacher.currentWorkload -= plan.hours;
                }
            }

            plans = plans.filter(p => p.id !== planId);
            localStorage.setItem('coursePlans', JSON.stringify(plans));

            this.renderCoursePlanList();
            this.updateSchedulingStatistics();

            alert('课程计划删除成功');
        },

        selectAllCourses(checked) {
            const checkboxes = document.querySelectorAll('.course-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = checked;
                if (checked) {
                    this.selectedCourses.add(checkbox.dataset.planId);
                } else {
                    this.selectedCourses.delete(checkbox.dataset.planId);
                }
            });
        },

        checkAvailability() {
            const roomType = document.getElementById('roomType').value;
            const minCapacity = parseInt(document.getElementById('minCapacity').value);
            
            const availableRooms = ClassroomsModule.getAvailableClassrooms('1-2', 1, minCapacity);
            const filteredRooms = availableRooms.filter(room => room.type === roomType);
            
            let message = `可用教室（${roomType}，容量≥${minCapacity}）：\n\n`;
            filteredRooms.forEach(room => {
                message += `${room.id} - ${room.building}${room.number} (容量：${room.capacity})\n`;
            });

            if (filteredRooms.length === 0) {
                message = '没有找到符合条件的可用教室';
            }

            alert(message);
        },

        detectConflicts() {
            const plans = this.getCoursePlans();
            const conflicts = [];

            // 检查教师时间冲突
            const teacherSchedule = {};
            plans.forEach(plan => {
                if (!teacherSchedule[plan.teacherId]) {
                    teacherSchedule[plan.teacherId] = [];
                }
                teacherSchedule[plan.teacherId].push(plan);
            });

            Object.keys(teacherSchedule).forEach(teacherId => {
                const teacherPlans = teacherSchedule[teacherId];
                if (teacherPlans.length > 1) {
                    conflicts.push({
                        type: 'teacher',
                        teacherId,
                        message: `教师 ${TeachersModule.getTeacherById(teacherId)?.name || teacherId} 安排了 ${teacherPlans.length} 门课程，可能存在时间冲突`
                    });
                }
            });

            // 检查教室冲突
            const roomSchedule = {};
            plans.forEach(plan => {
                if (plan.roomId) {
                    if (!roomSchedule[plan.roomId]) {
                        roomSchedule[plan.roomId] = [];
                    }
                    roomSchedule[plan.roomId].push(plan);
                }
            });

            Object.keys(roomSchedule).forEach(roomId => {
                const roomPlans = roomSchedule[roomId];
                if (roomPlans.length > 1) {
                    conflicts.push({
                        type: 'room',
                        roomId,
                        message: `教室 ${roomId} 被安排了 ${roomPlans.length} 门课程，可能存在时间冲突`
                    });
                }
            });

            // 显示冲突结果
            this.renderConflictList(conflicts);
            this.updateSchedulingStatistics();
        },

        renderConflictList(conflicts) {
            const conflictList = document.getElementById('conflictList');
            if (!conflictList) return;

            if (conflicts.length === 0) {
                conflictList.innerHTML = '<p style="color: green;">✓ 未发现冲突</p>';
                return;
            }

            let html = '';
            conflicts.forEach(conflict => {
                html += `
                    <div class="conflict-item">
                        <strong>${conflict.type === 'teacher' ? '教师冲突' : '教室冲突'}</strong><br>
                        ${conflict.message}
                    </div>
                `;
            });

            conflictList.innerHTML = html;
        },

        autoSchedule() {
            if (!confirm('自动排课将根据可用资源智能安排课程，可能需要较长时间。确定继续吗？')) {
                return;
            }

            const plans = this.getCoursePlans();
            const pendingPlans = plans.filter(p => p.status === 'pending');
            
            if (pendingPlans.length === 0) {
                alert('没有待安排的课程');
                return;
            }

            let scheduledCount = 0;
            const timeSlots = ['1-2', '3-4', '5-6', '7-8', '9-10'];
            const daysOfWeek = [1, 2, 3, 4, 5]; // 周一到周五

            pendingPlans.forEach(plan => {
                // 简化的自动排课逻辑
                for (let day of daysOfWeek) {
                    for (let slot of timeSlots) {
                        const teacher = TeachersModule.getTeacherById(plan.teacherId);
                        const conflict = TeachersModule.checkTimeConflict(plan.teacherId, slot, day);
                        
                        if (!conflict.hasConflict) {
                            // 查找合适的教室
                            const cls = this.getClasses().find(c => c.id === plan.classId);
                            const availableRooms = ClassroomsModule.getAvailableClassrooms(slot, day, cls ? cls.capacity : 30);
                            
                            if (availableRooms.length > 0) {
                                // 安排课程
                                plan.status = 'scheduled';
                                plan.timeSlot = slot;
                                plan.dayOfWeek = day;
                                plan.roomId = availableRooms[0].id;
                                scheduledCount++;
                                break;
                            }
                        }
                    }
                    if (plan.status === 'scheduled') break;
                }
            });

            // 保存更新后的计划
            localStorage.setItem('coursePlans', JSON.stringify(plans));

            this.renderCoursePlanList();
            this.updateSchedulingStatistics();
            this.loadTimetableData();

            alert(`自动排课完成！成功安排 ${scheduledCount} 门课程`);
        },

        updateSchedulingStatistics() {
            const plans = this.getCoursePlans();
            const totalCourses = plans.length;
            const assignedCourses = plans.filter(p => p.status === 'scheduled').length;
            const conflictCount = plans.filter(p => p.status === 'conflict').length;
            const availableRooms = ClassroomsModule.getAllClassrooms().filter(r => r.status === 'available').length;

            document.getElementById('totalCourses').textContent = totalCourses;
            document.getElementById('assignedCourses').textContent = assignedCourses;
            document.getElementById('conflictCount').textContent = conflictCount;
            document.getElementById('availableRooms').textContent = availableRooms;
        },

        // ==================== 课程表生成功能 ====================
        
        /**
         * 课程表生成初始化
         */
        initTimetableGeneration() {
            this.loadTimetableData();
            this.setupTimetableEventListeners();
            this.renderTimetableGrid();
        },

        /**
         * 加载课程表数据
         */
        loadTimetableData() {
            const plans = this.getCoursePlans();
            const scheduledPlans = plans.filter(p => p.status === 'scheduled');
            
            this.renderTimetableList(scheduledPlans);
            this.updateTimetableStatistics();

            // 同步可视化网格
            this.renderTimetableGrid();
            scheduledPlans.forEach(plan => this.placeCourseInGrid(plan));
        },

        /**
         * 设置课程表事件监听器
         */
        setupTimetableEventListeners() {
            // 添加课程表按钮
            const addTimetableBtn = document.getElementById('addTimetableBtn');
            if (addTimetableBtn) {
                addTimetableBtn.addEventListener('click', () => this.showAddTimetableModal());
            }

            // 导出课程表按钮
            const exportTimetableBtn = document.getElementById('exportTimetableBtn');
            if (exportTimetableBtn) {
                exportTimetableBtn.addEventListener('click', () => this.exportTimetable());
            }

            // 生成课程表按钮
            const generateTimetableBtn = document.getElementById('generateTimetableBtn');
            if (generateTimetableBtn) {
                generateTimetableBtn.addEventListener('click', () => this.generateTimetable());
            }

            // 班级选择变化
            const classSelect = document.getElementById('timetableClassSelect');
            if (classSelect) {
                classSelect.addEventListener('change', () => this.filterTimetableByClass());
            }

            // 教师选择变化
            const teacherSelect = document.getElementById('timetableTeacherSelect');
            if (teacherSelect) {
                teacherSelect.addEventListener('change', () => this.filterTimetableByTeacher());
            }
        },

        /**
         * 渲染课程表网格
         */
        renderTimetableGrid() {
            const gridContainer = document.getElementById('timetableGrid');
            if (!gridContainer) return;

            const timeSlots = ['1-2节', '3-4节', '5-6节', '7-8节', '9-10节'];
            const days = ['周一', '周二', '周三', '周四', '周五'];
            
            let html = `
                <div class="timetable-header">
                    <div class="time-header">时间</div>
                    ${days.map(day => `<div class="day-header">${day}</div>`).join('')}
                </div>
                <div class="timetable-body">
            `;

            timeSlots.forEach((slot, slotIndex) => {
                html += `
                    <div class="timetable-row">
                        <div class="time-cell">${slot}</div>
                `;
                
                days.forEach((day, dayIndex) => {
                    html += `
                        <div class="timetable-cell" 
                             data-time="${slotIndex + 1}" 
                             data-day="${dayIndex + 1}"
                             ondrop="TeachingAdminModule.handleDrop(event)"
                             ondragover="TeachingAdminModule.handleDragOver(event)">
                        </div>
                    `;
                });
                
                html += '</div>';
            });

            html += '</div>';
            gridContainer.innerHTML = html;
        },

        /**
         * 渲染课程表列表
         */
        renderTimetableList(plans) {
            const listContainer = document.getElementById('timetableList');
            if (!listContainer) return;

            let html = '';
            plans.forEach(plan => {
                const course = getCourseById(plan.courseId);
                const teacher = TeachersModule.getTeacherById(plan.teacherId);
                const cls = this.getClasses().find(c => c.id === plan.classId);
                const room = ClassroomsModule.getClassroomById(plan.roomId);
                const dayNames = ['', '周一', '周二', '周三', '周四', '周五'];

                html += `
                    <tr>
                        <td>${course ? course.name : '未知课程'}</td>
                        <td>${teacher ? teacher.name : '未知教师'}</td>
                        <td>${cls ? cls.name : '未知班级'}</td>
                        <td>${dayNames[plan.dayOfWeek] || '-'}</td>
                        <td>${plan.timeSlot || '-'}</td>
                        <td>${room ? room.name : '未分配'}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="TeachingAdminModule.editTimetableItem('${plan.id}')">编辑</button>
                            <button class="btn btn-sm btn-danger" onclick="TeachingAdminModule.deleteTimetableItem('${plan.id}')">删除</button>
                        </td>
                    </tr>
                `;
            });

            listContainer.innerHTML = html;
        },

        /**
         * 显示添加课程表模态框
         */
        showAddTimetableModal() {
            const modal = document.getElementById('timetableModal');
            if (!modal) return;

            // 填充选择框数据
            this.populateTimetableSelects();
            
            // 显示模态框
            modal.style.display = 'block';
        },

        /**
         * 填充课程表选择框
         */
        populateTimetableSelects() {
            // 填充课程选择框
            const courseSelect = document.getElementById('timetableCourseSelect');
            if (courseSelect) {
                const courses = getAllCourses();
                courseSelect.innerHTML = '<option value="">选择课程</option>' +
                    courses.map(course => `<option value="${course.id}">${course.name}</option>`).join('');
            }

            // 填充教师选择框
            const teacherSelect = document.getElementById('timetableTeacherSelect');
            if (teacherSelect) {
                const teachers = TeachersModule.getAllTeachers();
                teacherSelect.innerHTML = '<option value="">选择教师</option>' +
                    teachers.map(teacher => `<option value="${teacher.id}">${teacher.name}</option>`).join('');
            }

            // 填充班级选择框
            const classSelect = document.getElementById('timetableClassSelect');
            if (classSelect) {
                const classes = this.getClasses();
                classSelect.innerHTML = '<option value="">选择班级</option>' +
                    classes.map(cls => `<option value="${cls.id}">${cls.name}</option>`).join('');
            }

            // 填充教室选择框
            const roomSelect = document.getElementById('timetableRoomSelect');
            if (roomSelect) {
                const rooms = ClassroomsModule.getAllClassrooms();
                roomSelect.innerHTML = '<option value="">选择教室</option>' +
                    rooms.map(room => `<option value="${room.id}">${room.name}</option>`).join('');
            }
        },

        /**
         * 保存课程表项
         */
        saveTimetableItem() {
            const courseId = document.getElementById('timetableCourseSelect').value;
            const teacherId = document.getElementById('timetableTeacherSelect').value;
            const classId = document.getElementById('timetableClassSelect').value;
            const roomId = document.getElementById('timetableRoomSelect').value;
            const dayOfWeek = document.getElementById('timetableDaySelect').value;
            const timeSlot = document.getElementById('timetableTimeSelect').value;

            if (!courseId || !teacherId || !classId || !roomId || !dayOfWeek || !timeSlot) {
                alert('请填写所有必填字段');
                return;
            }

            // 检查冲突
            const conflict = this.detectTimetableConflict(teacherId, roomId, dayOfWeek, timeSlot);
            if (conflict.hasConflict) {
                alert('检测到时间冲突：' + conflict.message);
                return;
            }

            // 创建课程表项
            const timetableItem = {
                id: 'TT' + Date.now(),
                courseId,
                teacherId,
                classId,
                roomId,
                dayOfWeek: parseInt(dayOfWeek),
                timeSlot,
                status: 'scheduled',
                createdAt: new Date().toISOString()
            };

            // 保存到课程计划
            const plans = this.getCoursePlans();
            plans.push(timetableItem);
            localStorage.setItem('coursePlans', JSON.stringify(plans));

            // 更新界面
            this.loadTimetableData();
            this.renderTimetableGrid();
            
            // 关闭模态框
            this.closeTimetableModal();

            alert('课程表项添加成功！');
        },

        /**
         * 检测课程表冲突
         */
        detectTimetableConflict(teacherId, roomId, dayOfWeek, timeSlot) {
            const plans = this.getCoursePlans();
            const scheduledPlans = plans.filter(p => 
                p.status === 'scheduled' && 
                p.dayOfWeek === parseInt(dayOfWeek) && 
                p.timeSlot === timeSlot
            );

            // 检查教师冲突
            const teacherConflict = scheduledPlans.find(p => p.teacherId === teacherId);
            if (teacherConflict) {
                const teacher = TeachersModule.getTeacherById(teacherId);
                return {
                    hasConflict: true,
                    message: `教师 ${teacher ? teacher.name : ''} 在该时间段已有课程安排`
                };
            }

            // 检查教室冲突
            const roomConflict = scheduledPlans.find(p => p.roomId === roomId);
            if (roomConflict) {
                const room = ClassroomsModule.getClassroomById(roomId);
                return {
                    hasConflict: true,
                    message: `教室 ${room ? room.name : ''} 在该时间段已被占用`
                };
            }

            return { hasConflict: false };
        },

        /**
         * 编辑课程表项
         */
        editTimetableItem(itemId) {
            const plans = this.getCoursePlans();
            const item = plans.find(p => p.id === itemId);
            
            if (!item) {
                alert('课程表项不存在');
                return;
            }

            // 填充表单
            document.getElementById('timetableCourseSelect').value = item.courseId;
            document.getElementById('timetableTeacherSelect').value = item.teacherId;
            document.getElementById('timetableClassSelect').value = item.classId;
            document.getElementById('timetableRoomSelect').value = item.roomId;
            document.getElementById('timetableDaySelect').value = item.dayOfWeek;
            document.getElementById('timetableTimeSelect').value = item.timeSlot;

            // 显示模态框
            this.showAddTimetableModal();
            
            // 修改保存按钮行为
            const saveBtn = document.getElementById('saveTimetableBtn');
            if (saveBtn) {
                saveBtn.onclick = () => this.updateTimetableItem(itemId);
            }
        },

        /**
         * 更新课程表项
         */
        updateTimetableItem(itemId) {
            const courseId = document.getElementById('timetableCourseSelect').value;
            const teacherId = document.getElementById('timetableTeacherSelect').value;
            const classId = document.getElementById('timetableClassSelect').value;
            const roomId = document.getElementById('timetableRoomSelect').value;
            const dayOfWeek = document.getElementById('timetableDaySelect').value;
            const timeSlot = document.getElementById('timetableTimeSelect').value;

            if (!courseId || !teacherId || !classId || !roomId || !dayOfWeek || !timeSlot) {
                alert('请填写所有必填字段');
                return;
            }

            // 检查冲突（排除当前项）
            const conflict = this.detectTimetableConflictExcluding(teacherId, roomId, dayOfWeek, timeSlot, itemId);
            if (conflict.hasConflict) {
                alert('检测到时间冲突：' + conflict.message);
                return;
            }

            // 更新课程表项
            const plans = this.getCoursePlans();
            const itemIndex = plans.findIndex(p => p.id === itemId);
            
            if (itemIndex !== -1) {
                plans[itemIndex] = {
                    ...plans[itemIndex],
                    courseId,
                    teacherId,
                    classId,
                    roomId,
                    dayOfWeek: parseInt(dayOfWeek),
                    timeSlot,
                    updatedAt: new Date().toISOString()
                };

                localStorage.setItem('coursePlans', JSON.stringify(plans));

                // 更新界面
                this.loadTimetableData();
                this.renderTimetableGrid();
                
                // 关闭模态框
                this.closeTimetableModal();

                alert('课程表项更新成功！');
            }
        },

        /**
         * 检测冲突（排除指定项）
         */
        detectTimetableConflictExcluding(teacherId, roomId, dayOfWeek, timeSlot, excludeId) {
            const plans = this.getCoursePlans();
            const scheduledPlans = plans.filter(p => 
                p.status === 'scheduled' && 
                p.dayOfWeek === parseInt(dayOfWeek) && 
                p.timeSlot === timeSlot &&
                p.id !== excludeId
            );

            // 检查教师冲突
            const teacherConflict = scheduledPlans.find(p => p.teacherId === teacherId);
            if (teacherConflict) {
                const teacher = TeachersModule.getTeacherById(teacherId);
                return {
                    hasConflict: true,
                    message: `教师 ${teacher ? teacher.name : ''} 在该时间段已有课程安排`
                };
            }

            // 检查教室冲突
            const roomConflict = scheduledPlans.find(p => p.roomId === roomId);
            if (roomConflict) {
                const room = ClassroomsModule.getClassroomById(roomId);
                return {
                    hasConflict: true,
                    message: `教室 ${room ? room.name : ''} 在该时间段已被占用`
                };
            }

            return { hasConflict: false };
        },

        /**
         * 删除课程表项
         */
        deleteTimetableItem(itemId) {
            if (!confirm('确定要删除这个课程表项吗？')) {
                return;
            }

            const plans = this.getCoursePlans();
            const updatedPlans = plans.filter(p => p.id !== itemId);
            
            localStorage.setItem('coursePlans', JSON.stringify(updatedPlans));

            // 更新界面
            this.loadTimetableData();
            this.renderTimetableGrid();

            alert('课程表项删除成功！');
        },

        /**
         * 生成课程表
         */
        generateTimetable() {
            const plans = this.getCoursePlans();
            const scheduledPlans = plans.filter(p => p.status === 'scheduled');
            
            if (scheduledPlans.length === 0) {
                alert('没有已安排的课程，请先进行课程安排');
                return;
            }

            this.renderTimetableGrid();
            scheduledPlans.forEach(plan => this.placeCourseInGrid(plan));
            this.updateTimetableStatistics();

            alert('课程表生成成功！');
        },

        /**
         * 在网格中放置课程
         */
        placeCourseInGrid(plan) {
            const course = getCourseById(plan.courseId);
            const teacher = TeachersModule.getTeacherById(plan.teacherId);
            const room = ClassroomsModule.getClassroomById(plan.roomId);
            
            if (!course || !teacher || !room) return;

            const cell = document.querySelector(
                `.timetable-cell[data-time="${this.getTimeSlotIndex(plan.timeSlot)}"][data-day="${plan.dayOfWeek}"]`
            );

            if (cell) {
                const courseElement = document.createElement('div');
                courseElement.className = 'course-item';
                courseElement.draggable = true;
                courseElement.dataset.planId = plan.id;
                courseElement.innerHTML = `
                    <div class="course-name">${course.name}</div>
                    <div class="course-teacher">${teacher.name}</div>
                    <div class="course-room">${room.name}</div>
                `;
                
                // 添加拖拽事件
                courseElement.addEventListener('dragstart', (e) => this.handleDragStart(e));
                courseElement.addEventListener('dragend', (e) => this.handleDragEnd(e));
                
                cell.appendChild(courseElement);
            }
        },

        /**
         * 获取时间段索引
         */
        getTimeSlotIndex(timeSlot) {
            const slotMap = {
                '1-2': 1,
                '3-4': 2,
                '5-6': 3,
                '7-8': 4,
                '9-10': 5
            };
            return slotMap[timeSlot] || 1;
        },

        /**
         * 处理拖拽开始
         */
        handleDragStart(e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('planId', e.target.dataset.planId);
            e.target.classList.add('dragging');
        },

        /**
         * 处理拖拽结束
         */
        handleDragEnd(e) {
            e.target.classList.remove('dragging');
        },

        /**
         * 处理拖拽经过
         */
        handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            e.currentTarget.classList.add('drag-over');
        },

        /**
         * 处理放置
         */
        handleDrop(e) {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');
            
            const planId = e.dataTransfer.getData('planId');
            const targetCell = e.currentTarget;
            const newDay = parseInt(targetCell.dataset.day);
            const newTimeSlot = this.getTimeSlotFromIndex(parseInt(targetCell.dataset.time));
            
            if (!planId || !newDay || !newTimeSlot) return;
            
            // 更新课程计划
            const plans = this.getCoursePlans();
            const plan = plans.find(p => p.id === planId);
            
            if (plan) {
                // 检查新时间段的冲突
                const conflict = this.detectTimetableConflictExcluding(
                    plan.teacherId, 
                    plan.roomId, 
                    newDay.toString(), 
                    newTimeSlot, 
                    planId
                );
                
                if (conflict.hasConflict) {
                    alert('时间冲突：' + conflict.message);
                    return;
                }
                
                // 更新时间
                plan.dayOfWeek = newDay;
                plan.timeSlot = newTimeSlot;
                
                localStorage.setItem('coursePlans', JSON.stringify(plans));
                
                // 重新生成课程表
                this.generateTimetable();
            }
        },

        /**
         * 从索引获取时间段
         */
        getTimeSlotFromIndex(index) {
            const slotMap = {
                1: '1-2',
                2: '3-4',
                3: '5-6',
                4: '7-8',
                5: '9-10'
            };
            return slotMap[index] || '1-2';
        },

        /**
         * 按班级筛选课程表
         */
        filterTimetableByClass() {
            const classId = document.getElementById('timetableClassSelect').value;
            const plans = this.getCoursePlans();
            
            let filteredPlans = plans.filter(p => p.status === 'scheduled');
            if (classId) {
                filteredPlans = filteredPlans.filter(p => p.classId === classId);
            }
            
            this.renderTimetableList(filteredPlans);
        },

        /**
         * 按教师筛选课程表
         */
        filterTimetableByTeacher() {
            const teacherId = document.getElementById('timetableTeacherSelect').value;
            const plans = this.getCoursePlans();
            
            let filteredPlans = plans.filter(p => p.status === 'scheduled');
            if (teacherId) {
                filteredPlans = filteredPlans.filter(p => p.teacherId === teacherId);
            }
            
            this.renderTimetableList(filteredPlans);
        },

        /**
         * 导出课程表
         */
        exportTimetable() {
            const plans = this.getCoursePlans();
            const scheduledPlans = plans.filter(p => p.status === 'scheduled');
            
            if (scheduledPlans.length === 0) {
                alert('没有可导出的课程表数据');
                return;
            }

            const dayNames = ['', '周一', '周二', '周三', '周四', '周五'];

            // ==== Excel/CSV ====
            let csv = '课程名称,教师姓名,班级名称,星期,节次,教室名称\n';
            scheduledPlans.forEach(plan => {
                const course = getCourseById(plan.courseId);
                const teacher = TeachersModule.getTeacherById(plan.teacherId);
                const cls = this.getClasses().find(c => c.id === plan.classId);
                const room = ClassroomsModule.getClassroomById(plan.roomId);
                csv += `"${course ? course.name : ''}",`;
                csv += `"${teacher ? teacher.name : ''}",`;
                csv += `"${cls ? cls.name : ''}",`;
                csv += `"${dayNames[plan.dayOfWeek] || ''}",`;
                csv += `"${plan.timeSlot || ''}",`;
                csv += `"${room ? room.name : ''}"\n`;
            });
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `课程表_${new Date().toLocaleDateString()}.csv`;
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // ==== PDF/打印视图 ====
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                const rows = scheduledPlans.map(plan => {
                    const course = getCourseById(plan.courseId);
                    const teacher = TeachersModule.getTeacherById(plan.teacherId);
                    const cls = this.getClasses().find(c => c.id === plan.classId);
                    const room = ClassroomsModule.getClassroomById(plan.roomId);
                    return `<tr><td>${course ? course.name : ''}</td><td>${teacher ? teacher.name : ''}</td><td>${cls ? cls.name : ''}</td><td>${dayNames[plan.dayOfWeek] || ''}</td><td>${plan.timeSlot || ''}</td><td>${room ? room.name : ''}</td></tr>`;
                }).join('');
                printWindow.document.write(`
                    <html><head><title>课程表导出</title>
                    <style>
                        body{font-family:Arial,sans-serif;padding:16px;}
                        table{width:100%;border-collapse:collapse;}
                        th,td{border:1px solid #ddd;padding:8px;text-align:left;}
                        th{background:#f5f5f5;font-weight:bold;}
                    </style>
                    </head><body>
                    <h2>课程表</h2>
                    <table><thead><tr><th>课程名称</th><th>教师姓名</th><th>班级名称</th><th>星期</th><th>节次</th><th>教室</th></tr></thead><tbody>${rows}</tbody></table>
                    </body></html>`);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => printWindow.print(), 200);
            }

            alert('课程表已导出：Excel/CSV 与 PDF 打印视图');
        },

        /**
         * 更新课程表统计
         */
        updateTimetableStatistics() {
            const plans = this.getCoursePlans();
            const scheduledPlans = plans.filter(p => p.status === 'scheduled');
            const conflicts = plans.filter(p => p.status === 'conflict');
            const rooms = ClassroomsModule.getAllClassrooms();
            const usedRoomIds = new Set(scheduledPlans.map(p => p.roomId).filter(Boolean));

            document.getElementById('totalCourses').textContent = scheduledPlans.length;
            document.getElementById('weekCourses').textContent = scheduledPlans.filter(p => p.dayOfWeek >= 1 && p.dayOfWeek <= 5).length;
            document.getElementById('conflictCount').textContent = conflicts.length;
            document.getElementById('availableRooms').textContent = rooms.filter(r => r.status === 'available').length - usedRoomIds.size >= 0 ? rooms.filter(r => r.status === 'available').length - usedRoomIds.size : 0;
        },

        /**
         * 关闭课程表模态框
         */
        closeTimetableModal() {
            const modal = document.getElementById('timetableModal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            // 重置表单
            const form = document.getElementById('timetableForm');
            if (form) {
                form.reset();
            }
            
            // 恢复保存按钮行为
            const saveBtn = document.getElementById('saveTimetableBtn');
            if (saveBtn) {
                saveBtn.onclick = () => this.saveTimetableItem();
            }
        },

        /**
         * 清空课程表
         */
        clearTimetable() {
            if (!confirm('确定要清空所有课程表数据吗？此操作不可恢复！')) {
                return;
            }

            // 清空课程计划中的已安排课程
            const plans = this.getCoursePlans();
            const clearedPlans = plans.map(plan => {
                if (plan.status === 'scheduled') {
                    return {
                        ...plan,
                        status: 'pending',
                        dayOfWeek: null,
                        timeSlot: null,
                        roomId: null
                    };
                }
                return plan;
            });

            localStorage.setItem('coursePlans', JSON.stringify(clearedPlans));

            // 重新渲染界面
            this.renderTimetableGrid();
            this.loadTimetableData();

            alert('课程表已清空！');
        },

        /**
         * 打印课程表
         */
        printTimetable() {
            const plans = this.getCoursePlans();
            const scheduledPlans = plans.filter(p => p.status === 'scheduled');
            
            if (scheduledPlans.length === 0) {
                alert('没有可打印的课程表数据');
                return;
            }

            // 创建打印窗口
            const printWindow = window.open('', '_blank');
            
            // 生成打印内容
            let printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>课程表打印</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { text-align: center; color: #333; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .timetable-grid { 
                            display: grid; 
                            grid-template-columns: 80px repeat(5, 1fr); 
                            gap: 1px; 
                            border: 1px solid #ddd; 
                            margin: 20px 0; 
                        }
                        .timetable-cell { 
                            border: 1px solid #ddd; 
                            padding: 10px; 
                            min-height: 60px; 
                            font-size: 12px; 
                        }
                        .time-cell { 
                            background-color: #f2f2f2; 
                            font-weight: bold; 
                            text-align: center; 
                        }
                        .course-item { 
                            background-color: #f0f0f0; 
                            padding: 4px; 
                            margin: 2px 0; 
                            border-radius: 3px; 
                        }
                        @media print {
                            body { margin: 10px; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>课程表</h1>
                    <p>生成时间：${new Date().toLocaleString()}</p>
            `;

            // 添加课程表网格
            const timeSlots = ['1-2节', '3-4节', '5-6节', '7-8节', '9-10节'];
            const days = ['周一', '周二', '周三', '周四', '周五'];
            
            printContent += '<div class="timetable-grid">';
            printContent += '<div class="time-cell">时间</div>';
            days.forEach(day => {
                printContent += `<div class="time-cell">${day}</div>`;
            });
            
            timeSlots.forEach((slot, slotIndex) => {
                printContent += `<div class="time-cell">${slot}</div>`;
                days.forEach((day, dayIndex) => {
                    const plan = scheduledPlans.find(p => 
                        p.dayOfWeek === dayIndex + 1 && 
                        this.getTimeSlotIndex(p.timeSlot) === slotIndex + 1
                    );
                    
                    printContent += '<div class="timetable-cell">';
                    if (plan) {
                        const course = getCourseById(plan.courseId);
                        const teacher = TeachersModule.getTeacherById(plan.teacherId);
                        const room = ClassroomsModule.getClassroomById(plan.roomId);
                        
                        printContent += `
                            <div class="course-item">
                                <strong>${course ? course.name : ''}</strong><br>
                                ${teacher ? teacher.name : ''}<br>
                                ${room ? room.name : ''}
                            </div>
                        `;
                    }
                    printContent += '</div>';
                });
            });
            
            printContent += '</div>';

            // 添加课程列表
            printContent += `
                <h2>课程详细信息</h2>
                <table>
                    <thead>
                        <tr>
                            <th>课程名称</th>
                            <th>教师姓名</th>
                            <th>班级名称</th>
                            <th>星期</th>
                            <th>节次</th>
                            <th>教室名称</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            const dayNames = ['', '周一', '周二', '周三', '周四', '周五'];
            scheduledPlans.forEach(plan => {
                const course = getCourseById(plan.courseId);
                const teacher = TeachersModule.getTeacherById(plan.teacherId);
                const cls = this.getClasses().find(c => c.id === plan.classId);
                const room = ClassroomsModule.getClassroomById(plan.roomId);
                
                printContent += `
                    <tr>
                        <td>${course ? course.name : ''}</td>
                        <td>${teacher ? teacher.name : ''}</td>
                        <td>${cls ? cls.name : ''}</td>
                        <td>${dayNames[plan.dayOfWeek] || ''}</td>
                        <td>${plan.timeSlot || ''}</td>
                        <td>${room ? room.name : ''}</td>
                    </tr>
                `;
            });

            printContent += `
                    </tbody>
                </table>
                </body>
                </html>
            `;

            // 写入内容并打印
            printWindow.document.write(printContent);
            printWindow.document.close();
            
            // 等待内容加载完成后打印
            printWindow.onload = function() {
                printWindow.print();
                printWindow.close();
            };
        }
    };

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', () => {
        if (window.Auth && typeof Auth.enforcePageAccess === 'function') {
            if (!Auth.enforcePageAccess(['teaching_admin'])) {
                return;
            }
        }
        TeachingAdminModule.init();
    });

    // 全局暴露模块
    window.TeachingAdminModule = TeachingAdminModule;
})();