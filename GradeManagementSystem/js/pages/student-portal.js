// 学生端页面功能切换逻辑
document.addEventListener('DOMContentLoaded', function() {
        // 权限校验
        if (window.Auth && typeof Auth.enforcePageAccess === 'function') {
            if (!Auth.enforcePageAccess(['student'])) {
                return;
            }
        }

        // 功能配置
        const functions = {
            'course-selection': {

                title: '选课管理',
                description: '您可以在这里进行课程选择和退选操作'
            },
            'my-courses': {
                title: '我的课程',
                description: '您可以在这里查看各学期的课程信息'
            },
            'grade-query': {
                title: '成绩查询',
                description: '您可以在这里查询各学期的课程成绩'
            },
            'todo': {
                title: '待办事项',
                description: '您可以在这里管理和跟踪您的学习任务'
            },
            'profile': {
                title: '个人中心',
                description: '您可以在这里查看和管理您的个人信息'
            }
        };

    // 课程数据状态管理 - 现在从独立文件导入
    let courseData = {
        availableCourses: [],
        selectedCourses: []
    };

    // 我的课程数据 - 现在从独立文件导入
    let myCoursesData = [];

    // 当前学生身份（优先使用登录信息）
    const currentStudentInfo = (window.Auth && typeof Auth.getCurrentUser === 'function') ? Auth.getCurrentUser() : null;
    const currentStudentId = currentStudentInfo?.studentId || currentStudentInfo?.username || currentStudentInfo?.id || 'student001';
    const currentStudentName = currentStudentInfo?.name || '学生';

    // 选课截止时间（可通过 window.ENROLL_DEADLINE_OVERRIDE 覆盖；默认不限）
    const ENROLL_DEADLINE = window.ENROLL_DEADLINE_OVERRIDE || null;

    // 旧版示例成绩（作为回退数据，用于已修课程展示）
    const legacyMockGrades = [
        { 
            courseName: '程序设计基础', 
            courseCode: 'CS102', 
            credit: 3, 
            grade: 85, 
            semester: '2023-2024-1', 
            teacher: '陈教授',
            publishStatus: 'published',
            auditStatus: 'approved',
            gradeDetails: {
                regularScore: { percentage: 0.3, score: 90 },
                finalScore: { percentage: 0.7, score: 83 }
            }
        },
        { 
            courseName: '高等数学', 
            courseCode: 'MATH101', 
            credit: 5, 
            grade: 92, 
            semester: '2023-2024-1', 
            teacher: '刘教授',
            publishStatus: 'published',
            auditStatus: 'approved',
            gradeDetails: {
                regularScore: { percentage: 0.4, score: 95 },
                finalScore: { percentage: 0.6, score: 90 }
            }
        },
        { 
            courseName: '大学英语', 
            courseCode: 'ENG101', 
            credit: 2, 
            grade: 78, 
            semester: '2023-2024-2', 
            teacher: '刘教授',
            publishStatus: 'published',
            auditStatus: 'approved',
            gradeDetails: {
                regularScore: { percentage: 0.5, score: 80 },
                finalScore: { percentage: 0.5, score: 76 }
            }
        }
    ];

    // 选课存储（确保MOCK_ENROLLMENTS结构正确）
    const EnrollmentStore = {

        key: 'MOCK_ENROLLMENTS',
        loadAll() {
            const raw = Utils.storage.get(this.key, []);
            return Array.isArray(raw) ? raw.map(item => ({
                studentId: item.studentId,
                courseId: item.courseId,
                status: item.status || 'enrolled',
                selectedAt: item.selectedAt || new Date().toISOString()
            })) : [];
        },
        saveAll(list) {
            Utils.storage.set(this.key, list);
        },
        getByStudent(studentId) {
            return this.loadAll().filter(item => item.studentId === studentId);
        },
        addEnrollment(studentId, courseId) {
            const all = this.loadAll();
            all.push({ studentId, courseId, status: 'enrolled', selectedAt: new Date().toISOString() });
            this.saveAll(all);
        },
        removeEnrollment(studentId, courseId) {
            const all = this.loadAll().filter(item => !(item.studentId === studentId && item.courseId === courseId));
            this.saveAll(all);
        },
        getCountByCourse(courseId) {
            return this.loadAll().filter(item => item.courseId === courseId).length;
        }
    };

    // 学生活动管理（若未注入则提供兜底实现）
    const studentManager = window.studentManager || {
        recordCourseSelection: () => {},
        recordCourseDrop: () => {},
        recordGradeQuery: () => {},
        recordTodoCompletion: () => {},
        getStudentInfo: () => currentStudentInfo ? {
            name: currentStudentName,
            studentId: currentStudentId,
            department: currentStudentInfo.department || '未知学院',
            grade: currentStudentInfo.grade || '未知年级',
            email: currentStudentInfo.email,
            phone: currentStudentInfo.phone,
            major: currentStudentInfo.major,
            class: currentStudentInfo.className,
            admissionDate: currentStudentInfo.admissionDate
        } : null,
        getRecentActivities: () => []
    };
    window.studentManager = studentManager;

    // 选课截止判定
    function isEnrollmentClosed(course) {
        const deadline = course?.enrollDeadline || course?.enrollEnd || ENROLL_DEADLINE;
        if (!deadline) return false;
        return new Date() > new Date(deadline);
    }




    // 获取DOM元素
    const navItems = document.querySelectorAll('.nav-item');
    const functionContents = document.querySelectorAll('.function-content');
    const currentFunctionTitle = document.getElementById('currentFunctionTitle');
    const currentFunctionDesc = document.getElementById('currentFunctionDesc');
    const studentNameElement = document.getElementById('studentName');
    const studentIdElement = document.getElementById('studentId');
    const logoutBtn = document.getElementById('logoutBtn');

    // 初始化页面
    function initPage() {
        // 初始化学生信息
        initStudentInfo();
        
        // 初始化课程数据
        initCourseData();
        
        // 绑定登出按钮事件
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        // 默认激活选课管理功能
        switchFunction('course-selection');
        
        // 添加导航项点击事件监听
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const functionName = this.getAttribute('data-function');
                switchFunction(functionName);
            });
        });
    }

    // 初始化课程数据
    function initCourseData() {
        // 初始化基础数据（历史课程）
        courseManager.initStudentCourseData(currentStudentId);
        myCoursesData = courseManager.getMyCoursesHistory();

        // 基于存储的选课记录生成当前学期选课
        const currentSemester = '2024-2025-1';
        const enrollments = EnrollmentStore.getByStudent(currentStudentId);
        const enrolledCourseIds = enrollments.map(e => e.courseId);
        const enrollmentCountMap = {};
        enrollments.forEach(e => { enrollmentCountMap[e.courseId] = (enrollmentCountMap[e.courseId] || 0) + 1; });

        // 构建已选课程列表
        const selectedCourses = enrolledCourseIds.map(id => {
            const course = courseManager.getCourseById(id) || coursesData.find(c => c.id === id);
            if (!course) return null;
            return {
                ...course,
                semester: currentSemester,
                semesterName: '2024-2025学年第一学期',
                status: '正在修读',
                grade: course.grade || null,
                todoItems: course.todoItems || []
            };
        }).filter(Boolean);

        // 计算可选课程（去重、过滤已结束/容量已满）
        const allEnrollments = EnrollmentStore.loadAll();
        const courseTakenMap = allEnrollments.reduce((acc, cur) => {
            acc[cur.courseId] = (acc[cur.courseId] || 0) + 1;
            return acc;
        }, {});
        const availableCourses = coursesData.filter(course => {
            if (enrolledCourseIds.includes(course.id)) return false;
            if (course.status === '已结束') return false;
            const taken = courseTakenMap[course.id] || 0;
            return course.capacity ? taken < course.capacity : true;
        });

        courseData.selectedCourses = selectedCourses;
        courseData.availableCourses = availableCourses;

        // 用当前学期数据刷新我的课程（保留历史学期）
        myCoursesData = myCoursesData.filter(course => course.semester !== currentSemester);
        myCoursesData = [...myCoursesData, ...selectedCourses];

        console.log('课程数据初始化完成');
        console.log('可选课程数量:', courseData.availableCourses.length);
        console.log('已选课程数量:', courseData.selectedCourses.length);
        console.log('我的课程数量:', myCoursesData.length);
    }


    // 初始化学生信息
    function initStudentInfo() {
        const currentStudent = (window.Auth && typeof Auth.getCurrentUser === 'function')
            ? Auth.getCurrentUser()
            : null;

        const displayName = currentStudent?.name || '学生姓名';
        const displayId = currentStudent?.username || currentStudent?.studentId || '学号';

        if (studentNameElement) {
            studentNameElement.textContent = displayName;
        }
        if (studentIdElement) {
            studentIdElement.textContent = `学号：${displayId}`;
        }
    }


    
    // 切换功能
    function switchFunction(functionName) {
        // 移除所有导航项的active类
        navItems.forEach(item => {
            item.classList.remove('active');
        });

        // 隐藏所有功能内容
        functionContents.forEach(content => {
            content.classList.remove('active');
        });

        // 激活当前选中的导航项
        const activeNavItem = document.querySelector(`.nav-item[data-function="${functionName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // 显示对应的功能内容
        const activeContent = document.getElementById(`${functionName}-content`);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        // 不再动态更新标题，使用HTML中的固定标题

        // 根据功能类型执行特定初始化
        switch (functionName) {
            case 'course-selection':
                initCourseSelection();
                break;
            case 'my-courses':
                initMyCourses();
                break;
            case 'grade-query':
                initGradeQuery();
                break;
            case 'todo':
                initTodo();
                break;
            case 'profile':
                initProfile();
                break;
        }
    }

    // 初始化选课管理功能
    function initCourseSelection() {
        console.log('初始化选课管理功能');
        
        // 同步我的课程数据到已选课程（当前学期的课程）
        syncMyCoursesToSelectedCourses();
        
        // 渲染可选课程列表
        renderAvailableCourses(courseData.availableCourses);
        
        // 渲染已选课程列表
        renderSelectedCourses(courseData.selectedCourses);
    }
    
    // 同步我的课程数据到已选课程
    function syncMyCoursesToSelectedCourses() {
        // 同步当前学期的已选课程到我的课程历史中
        const currentSemester = '2024-2025-1';
        
        // 获取当前学期已选课程
        const currentSelectedCourses = courseData.selectedCourses;
        
        // 更新我的课程历史：移除当前学期的旧数据，添加新数据
        myCoursesData = myCoursesData.filter(course => course.semester !== currentSemester);
        
        // 添加当前学期的已选课程到我的课程历史
        currentSelectedCourses.forEach(course => {
            if (!myCoursesData.some(existing => existing.id === course.id && existing.semester === currentSemester)) {
                myCoursesData.push({
                    ...course,
                    semester: currentSemester,
                    semesterName: '2024-2025学年第一学期',
                    status: '正在修读',
                    grade: null
                });
            }
        });
        
        console.log('课程数据同步已完成');
    }

    // 渲染可选课程列表
    function renderAvailableCourses(courses) {
        const container = document.getElementById('availableCourses');
        if (!container) return;
        
        if (courses.length === 0) {
            container.innerHTML = '<div class="no-data">暂无可选课程</div>';
            return;
        }

        const coursesHTML = courses.map(course => {
            const taken = EnrollmentStore.getCountByCourse(course.id);
            const isFull = course.capacity ? taken >= course.capacity : false;
            const closed = isEnrollmentClosed(course);
            const disabled = closed || isFull || course.status === '已结束';
            const buttonText = closed ? '选课已截止' : (isFull ? '容量已满' : '选择课程');
            return `
            <div class="course-card">
                <h5>${course.name}</h5>
                <p>课程代码：${course.id}</p>
                <p>学分：${course.credit}</p>
                <p>教师：${course.teacher}</p>
                <p>容量：${course.capacity}人，已选${taken}人</p>
                <p>状态：${course.status || '进行中'}</p>
                <button class="btn btn-primary" ${disabled ? 'disabled' : ''} onclick="selectCourse('${course.id}')">${buttonText}</button>
            </div>
            `;
        }).join('');

        
        container.innerHTML = coursesHTML;
    }


    // 渲染已选课程列表
    function renderSelectedCourses(courses) {
        const container = document.getElementById('selectedCourses');
        if (!container) return;
        
        if (courses.length === 0) {
            container.innerHTML = '<div class="no-data">暂无已选课程，请先在“选课管理”中选择课程</div>';
            return;
        }
        
        const coursesHTML = courses.map(course => `
            <div class="course-card">
                <h5>${course.name}</h5>
                <p>课程代码：${course.id}</p>
                <p>学分：${course.credit}</p>
                <p>教师：${course.teacher}</p>
                <p>成绩：${course.grade || '未出成绩'}</p>
                <button class="btn btn-danger" onclick="dropCourse('${course.id}')">退选课程</button>
            </div>
        `).join('');
        
        container.innerHTML = coursesHTML;
    }


    // 初始化我的课程功能
    function initMyCourses() {
        console.log('初始化我的课程功能');
        
        const queryBtn = document.getElementById('myCoursesQueryBtn');
        if (queryBtn) {
            queryBtn.addEventListener('click', function() {
                queryMyCourses();
            });
        }
        
        // 默认显示所有课程
        queryMyCourses();
    }

    // 查询我的课程
    function queryMyCourses() {
        const semesterSelect = document.getElementById('myCoursesSemesterSelect');
        const semester = semesterSelect ? semesterSelect.value : '';
        
        console.log(`查询我的课程，学期：${semester}`);
        
        // 过滤数据（如果选择了特定学期）
        const filteredData = semester ? 
            myCoursesData.filter(item => item.semester === semester) : 
            myCoursesData;
        
        // 渲染我的课程列表
        renderMyCourses(filteredData);
    }

    // 渲染我的课程列表
    function renderMyCourses(courses) {
        const container = document.getElementById('myCoursesList');
        if (!container) return;
        
        if (courses.length === 0) {
            container.innerHTML = '<div class="no-data">该学期暂无课程数据</div>';
            return;
        }
        
        const coursesHTML = courses.map(course => {
            const statusClass = course.status === '已修完' ? 'status-completed' : 'status-in-progress';
            const gradeText = course.grade ? `<span class="grade">${course.grade}分</span>` : '暂无成绩';
            
            return `
                <div class="course-card">
                    <span class="status-badge ${statusClass}">${course.status}</span>
                    <h5>${course.name}</h5>
                    <p>课程代码：${course.id}</p>
                    <p>学分：${course.credit}</p>
                    <p>教师：${course.teacher}</p>
                    <p>学期：${course.semesterName}</p>
                    <p>成绩：${gradeText}</p>
                </div>
            `;
        }).join('');
        
        container.innerHTML = coursesHTML;
    }

    // 初始化成绩查询功能
    function initGradeQuery() {
        console.log('初始化成绩查询功能');
        
        const queryBtn = document.getElementById('queryBtn');
        if (queryBtn) {
            queryBtn.addEventListener('click', function() {
                queryGrades();
            });
        }
        
        // 默认显示所有成绩
        queryGrades();
    }

    // 查询成绩（按当前学生ID过滤）
    function queryGrades() {
        const semesterSelect = document.getElementById('semesterSelect');
        const semester = semesterSelect ? semesterSelect.value : '';
        
        console.log(`查询成绩，学期：${semester}`);

        // 获取成绩源（优先使用成绩模块，回退到旧版示例数据）
        const allGrades = (window.GradesModule && typeof GradesModule.getAllGrades === 'function')
            ? GradesModule.getAllGrades()
            : (window.gradesData || []);
        const sourceGrades = (allGrades && allGrades.length > 0) ? allGrades : legacyMockGrades;

        const courseGrades = sourceGrades.flatMap(grade => {
            // 新格式（包含 studentGrades 数组）
            if (Array.isArray(grade.studentGrades)) {
                const studentGrade = (grade.studentGrades || []).find(s => s.studentId === currentStudentId);
                if (!studentGrade) return [];
                const courseInfo = courseManager.getCourseById(grade.courseId) || coursesData.find(c => c.id === grade.courseId) || {};
                const details = grade.gradeDetails || {
                    regularScore: { percentage: 0.4, score: studentGrade.score || 0 },
                    finalScore: { percentage: 0.6, score: studentGrade.score || 0 }
                };
                return [{
                    courseName: grade.courseName || courseInfo.name || grade.courseId,
                    courseCode: grade.courseId,
                    credit: courseInfo.credit || '-',
                    grade: studentGrade.score,
                    gradeLetter: studentGrade.grade,
                    semester: grade.semester,
                    teacher: grade.teacherName || courseInfo.teacher || '任课教师',
                    publishStatus: grade.publishStatus || studentGrade.status || 'unpublished',
                    auditStatus: grade.auditStatus || 'pending',
                    anomalyType: grade.anomalyType,
                    gradeDetails: details
                }];
            }
            // 旧格式（单条成绩对象）
            const details = grade.gradeDetails || {
                regularScore: { percentage: 0.4, score: grade.grade || 0 },
                finalScore: { percentage: 0.6, score: grade.grade || 0 }
            };
            return [{
                courseName: grade.courseName || grade.name || grade.courseId,
                courseCode: grade.courseCode || grade.courseId,
                credit: grade.credit || '-',
                grade: grade.grade,
                gradeLetter: grade.gradeLetter,
                semester: grade.semester,
                teacher: grade.teacher || grade.teacherName || '任课教师',
                publishStatus: grade.publishStatus || 'published',
                auditStatus: grade.auditStatus || 'approved',
                anomalyType: grade.anomalyType,
                gradeDetails: details
            }];
        });
        
        // 过滤数据（如果选择了特定学期）
        const filteredData = semester ? 
            courseGrades.filter(item => item.semester === semester) : 
            courseGrades;

        
        // 记录成绩查询活动（记录第一个查询的课程）
        if (filteredData.length > 0) {
            const firstCourse = filteredData[0];
            studentManager.recordGradeQuery(currentStudentId, firstCourse.courseCode, firstCourse.courseName, firstCourse.grade);
        }
        
        // 如果当前在"个人中心"页面，更新活动记录
        const activeNavItem = document.querySelector('.nav-item.active');
        if (activeNavItem && activeNavItem.getAttribute('data-function') === 'profile') {
            updateRecentActivities();
        }
        
        // 渲染成绩表格
        renderGradeTable(filteredData);
    }

    function getGradeStatusInfo(grade) {
        if (grade.publishStatus === 'published') return { label: '已发布', className: 'status-published' };
        if (grade.auditStatus === 'pending') return { label: '待审核', className: 'status-pending' };
        if (grade.auditStatus === 'need_revision' || grade.anomalyType) return { label: '需修改', className: 'status-revision' };
        return { label: '待审核', className: 'status-pending' };
    }

    // 渲染成绩表格
    function renderGradeTable(grades) {
        const tableBody = document.querySelector('#gradeTable tbody');
        if (!tableBody) return;
        
        if (grades.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="no-data">未查询到当前学生的成绩记录</td></tr>';
            return;
        }
        
        const rowsHTML = grades.map(grade => {
            const details = grade.gradeDetails || { regularScore: { percentage: 0, score: 0 }, finalScore: { percentage: 0, score: 0 } };
            const regularPercentage = Math.round(details.regularScore.percentage * 100);
            const finalPercentage = Math.round(details.finalScore.percentage * 100);
            const statusInfo = getGradeStatusInfo(grade);
            
            return `
            <tr>
                <td>${grade.courseName}</td>
                <td>${grade.courseCode}</td>
                <td>${grade.credit}</td>
                <td>
                    <div class="grade-dropdown">
                        <span class="grade-value">${grade.grade}分</span>
                        <span class="grade-status ${statusInfo.className}">${statusInfo.label}</span>
                        <button class="grade-details-toggle" onclick="toggleGradeDetails(this)">▼</button>
                    </div>
                </td>
                <td>${grade.semester}</td>
                <td>${grade.teacher}</td>
            </tr>
            <tr class="grade-details-row" style="display: none;">
                <td colspan="6">
                    <div class="grade-details-table-container">
                        <table class="grade-details-table">
                            <thead>
                                <tr>
                                    <th>成绩类型</th>
                                    <th>占比</th>
                                    <th>分数</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>平时分</td>
                                    <td>${regularPercentage}%</td>
                                    <td>${details.regularScore.score}分</td>
                                </tr>
                                <tr>
                                    <td>期末分</td>
                                    <td>${finalPercentage}%</td>
                                    <td>${details.finalScore.score}分</td>
                                </tr>
                                <tr class="total-row">
                                    <td>总成绩</td>
                                    <td colspan="2">
                                        ${details.regularScore.score} × ${regularPercentage}% + ${details.finalScore.score} × ${finalPercentage}% = ${grade.grade}分
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
        
        tableBody.innerHTML = rowsHTML;
    }

    
    // 切换成绩详情显示/隐藏
    function toggleGradeDetails(button) {
        const row = button.closest('tr');
        const detailsRow = row.nextElementSibling;
        const isVisible = detailsRow.style.display === 'table-row';
        
        if (isVisible) {
            detailsRow.style.display = 'none';
            button.textContent = '▼';
        } else {
            detailsRow.style.display = 'table-row';
            button.textContent = '▲';
        }
    }
    
    // 全局函数（用于HTML按钮调用）
    window.toggleGradeDetails = toggleGradeDetails;

    // 处理登出
    function handleLogout() {
        if (confirm('确定要退出登录吗？')) {
            if (window.Auth && typeof Auth.logout === 'function') {
                Auth.logout(true);
            } else {
                window.location.href = '../index.html';
            }
        }
    }


    // 选择课程（验证状态/容量/重复/截止时间）
    function selectCourse(courseId) {
        try {
            const course = courseManager.getCourseById(courseId) || coursesData.find(c => c.id === courseId);
            if (!course) throw new Error('课程不存在');
            if (course.status === '已结束') throw new Error('该课程已结束，无法选课');
            if (isEnrollmentClosed(course)) throw new Error('该课程选课已截止');


            const isDuplicate = EnrollmentStore.getByStudent(currentStudentId).some(e => e.courseId === courseId);
            if (isDuplicate) throw new Error('您已选择该课程，请勿重复选课');

            const taken = EnrollmentStore.getCountByCourse(courseId);
            if (course.capacity && taken >= course.capacity) {
                throw new Error('课程容量已满，无法选课');
            }

            // 存储选课记录
            EnrollmentStore.addEnrollment(currentStudentId, courseId);

            // 记录选课活动
            studentManager.recordCourseSelection(currentStudentId, courseId, course.name);

            // 重新计算课程数据并同步
            initCourseData();
            syncMyCoursesToSelectedCourses();

            // 重新渲染课程列表
            renderAvailableCourses(courseData.availableCourses);
            renderSelectedCourses(courseData.selectedCourses);

            // 更新待办事项的课程选择器
            updateTodoCourseSelector();

            // 如果当前在"我的课程"页面，重新渲染我的课程
            const activeNavItem = document.querySelector('.nav-item.active');
            if (activeNavItem && activeNavItem.getAttribute('data-function') === 'my-courses') {
                queryMyCourses();
            }

            // 如果当前在"待办事项"页面，重新查询待办事项
            if (activeNavItem && activeNavItem.getAttribute('data-function') === 'todo') {
                queryTodo();
            }

            // 如果当前在"个人中心"页面，更新活动记录
            if (activeNavItem && activeNavItem.getAttribute('data-function') === 'profile') {
                updateRecentActivities();
            }

            alert(`已成功选择课程：${course.name}`);
        } catch (error) {
            alert(error.message || '选课失败，请稍后重试');
        }
    }

    // 退选课程
    function dropCourse(courseId) {
        if (!confirm('确定要退选该课程吗？')) {
            return;
        }
        
        try {
            const course = courseManager.getCourseById(courseId) || coursesData.find(c => c.id === courseId);
            if (!course) throw new Error('课程不存在');

            // 删除选课记录
            EnrollmentStore.removeEnrollment(currentStudentId, courseId);

            // 记录退课活动
            studentManager.recordCourseDrop(currentStudentId, courseId, course.name);

            // 重新计算课程数据并同步
            initCourseData();
            syncMyCoursesToSelectedCourses();

            // 重新渲染课程列表
            renderAvailableCourses(courseData.availableCourses);
            renderSelectedCourses(courseData.selectedCourses);

            // 更新待办事项的课程选择器
            updateTodoCourseSelector();

            // 如果当前在"我的课程"页面，重新渲染我的课程
            const activeNavItem = document.querySelector('.nav-item.active');
            if (activeNavItem && activeNavItem.getAttribute('data-function') === 'my-courses') {
                queryMyCourses();
            }

            // 如果当前在"待办事项"页面，重新查询待办事项
            if (activeNavItem && activeNavItem.getAttribute('data-function') === 'todo') {
                queryTodo();
            }

            // 如果当前在"个人中心"页面，更新活动记录
            if (activeNavItem && activeNavItem.getAttribute('data-function') === 'profile') {
                updateRecentActivities();
            }

            alert(`已成功退选课程：${course.name}`);
        } catch (error) {
            alert(error.message || '退课失败，请稍后重试');
        }
    }


    // 全局函数（用于HTML按钮调用）
    window.selectCourse = selectCourse;
    window.dropCourse = dropCourse;
    window.toggleGradeDetails = toggleGradeDetails;
    window.toggleTodoCompletion = toggleTodoCompletion;

    // 更新待办事项的课程选择器
    function updateTodoCourseSelector() {
        const courseSelect = document.getElementById('todoCourseSelect');
        if (!courseSelect) return;
        
        // 获取当前学期正在修读的课程（从我的课程历史中获取）
        const currentSemester = '2024-2025-1';
        const currentCourses = myCoursesData.filter(course => 
            course.semester === currentSemester && course.status === '正在修读'
        );
        
        // 保存当前选中的值
        const currentValue = courseSelect.value;
        
        // 清空现有选项（保留"全部课程"选项）
        courseSelect.innerHTML = '<option value="">全部课程</option>';
        
        // 添加当前学期正在修读的课程选项
        currentCourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            courseSelect.appendChild(option);
        });
        
        // 恢复之前选中的值（如果还存在）
        if (currentValue && courseSelect.querySelector(`option[value="${currentValue}"]`)) {
            courseSelect.value = currentValue;
        }
    }

    // 上传校验（仅接受PDF/DOCX）
    function bindUploadValidation() {
        const uploadInputs = document.querySelectorAll('input[type="file"].assignment-upload, input[type="file"][data-upload-scope="todo"]');
        uploadInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                if (!/\.(pdf|docx)$/i.test(file.name)) {
                    handleUploadError('仅支持上传PDF或DOCX文件');
                    e.target.value = '';
                }
            });
        });
    }

    function handleUploadError(message) {
        alert(message || '文件上传失败，请重试（仅支持PDF/DOCX）');
    }


    // 初始化待办事项功能
    function initTodo() {
        console.log('初始化待办事项功能');
        
        const queryBtn = document.getElementById('todoQueryBtn');
        if (queryBtn) {
            queryBtn.addEventListener('click', function() {
                queryTodo();
            });
        }
        
        // 更新课程选择器
        updateTodoCourseSelector();

        // 绑定上传校验（仅允许PDF/DOCX）
        bindUploadValidation();
        
        // 默认显示所有待办事项
        queryTodo();
    }


    // 初始化个人中心功能
    function initProfile() {
        console.log('初始化个人中心功能');
        
        // 更新个人信息
        updateProfileInfo();
        
        // 更新学习统计
        updateLearningStats();
        
        // 更新最近活动
        updateRecentActivities();
    }

    // 更新个人信息
    function updateProfileInfo() {
        const currentStudent = studentManager.getStudentInfo(currentStudentId);

        
        if (!currentStudent) {
            console.error('学生信息不存在');
            return;
        }
        
        // 更新基本信息
        document.getElementById('profileName').textContent = currentStudent.name;
        document.getElementById('profileStudentId').textContent = currentStudent.studentId;
        document.getElementById('profileDepartment').textContent = currentStudent.department;
        document.getElementById('profileGrade').textContent = currentStudent.grade;
        
        // 更新详细联系信息（如果存在对应的元素）
        const profileEmail = document.getElementById('profileEmail');
        const profilePhone = document.getElementById('profilePhone');
        const profileMajor = document.getElementById('profileMajor');
        const profileClass = document.getElementById('profileClass');
        const profileAdmissionDate = document.getElementById('profileAdmissionDate');
        
        if (profileEmail) profileEmail.textContent = currentStudent.email || '未设置';
        if (profilePhone) profilePhone.textContent = currentStudent.phone || '未设置';
        if (profileMajor) profileMajor.textContent = currentStudent.major || '未设置';
        if (profileClass) profileClass.textContent = currentStudent.class || '未设置';
        if (profileAdmissionDate) profileAdmissionDate.textContent = currentStudent.admissionDate || '未设置';
    }

    // 更新学习统计
    function updateLearningStats() {
        // 计算详细统计数据
        const completedCourses = myCoursesData.filter(course => course.status === '已修完');
        const currentCourses = myCoursesData.filter(course => course.status === '正在修读');
        const totalCourses = completedCourses.length + currentCourses.length;
        
        const totalCredits = myCoursesData.reduce((sum, course) => sum + course.credit, 0);
        const completedCredits = completedCourses.reduce((sum, course) => sum + course.credit, 0);
        const currentCredits = currentCourses.reduce((sum, course) => sum + course.credit, 0);
        
        const completedWithGrade = completedCourses.filter(course => course.grade);
        const avgGrade = completedWithGrade.length > 0 ? 
            Math.round(completedWithGrade.reduce((sum, course) => sum + course.grade, 0) / completedWithGrade.length) : 
            0;
        
        // 计算学习进度
        const totalTodoItems = myCoursesData.reduce((sum, course) => sum + (course.todoItems ? course.todoItems.length : 0), 0);
        const completedTodoItems = myCoursesData.reduce((sum, course) => 
            sum + (course.todoItems ? course.todoItems.filter(item => item.completed).length : 0), 0
        );
        const todoCompletionRate = totalTodoItems > 0 ? Math.round((completedTodoItems / totalTodoItems) * 100) : 0;
        
        // 更新统计信息
        document.getElementById('totalCourses').textContent = totalCourses;
        document.getElementById('currentCourses').textContent = currentCourses.length;
        document.getElementById('totalCredits').textContent = totalCredits;
        document.getElementById('avgGrade').textContent = avgGrade;
        
        // 更新详细统计信息（如果存在对应的元素）
        const completedCreditsElem = document.getElementById('completedCredits');
        const currentCreditsElem = document.getElementById('currentCredits');
        const todoCompletionRateElem = document.getElementById('todoCompletionRate');
        const totalTodoItemsElem = document.getElementById('totalTodoItems');
        const completedTodoItemsElem = document.getElementById('completedTodoItems');
        const gradedCoursesElem = document.getElementById('gradedCourses');
        const completedCoursesElem = document.getElementById('completedCourses');
        
        if (completedCreditsElem) completedCreditsElem.textContent = completedCredits;
        if (currentCreditsElem) currentCreditsElem.textContent = currentCredits;
        if (todoCompletionRateElem) todoCompletionRateElem.textContent = `${todoCompletionRate}%`;
        if (totalTodoItemsElem) totalTodoItemsElem.textContent = totalTodoItems;
        if (completedTodoItemsElem) completedTodoItemsElem.textContent = completedTodoItems;
        if (gradedCoursesElem) gradedCoursesElem.textContent = completedWithGrade.length;
        if (completedCoursesElem) completedCoursesElem.textContent = completedCourses.length;
    }
    
    // 更新最近活动
    function updateRecentActivities() {
        const activitiesContainer = document.querySelector('.recent-activities');
        if (!activitiesContainer) return;
        
        // 获取最近的活动记录
        const recentActivities = studentManager.getRecentActivities(currentStudentId, 10);

        
        if (recentActivities.length === 0) {
            activitiesContainer.innerHTML = '<div class="no-data">暂无活动记录</div>';
            return;
        }
        
        const activitiesHTML = recentActivities.map(activity => {
            // 根据活动类型设置图标
            let icon = '📚';
            switch(activity.type) {
                case 'course_selection':
                    icon = '📚';
                    break;
                case 'course_drop':
                    icon = '❌';
                    break;
                case 'todo_completed':
                    icon = '✅';
                    break;
                case 'grade_query':
                    icon = '📊';
                    break;
                default:
                    icon = '📝';
            }
            
            // 格式化时间显示
            const timeStr = activity.timestamp.substring(0, 10);
            
            return `
                <div class="activity-item">
                    <span class="activity-icon">${icon}</span>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-description">${activity.description}</div>
                        <div class="activity-time">${timeStr}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        activitiesContainer.innerHTML = activitiesHTML;
    }

    // 获取当前学期正在修读的课程（包含待办事项）
    function getCurrentSemesterCourses() {
        const currentSemester = '2024-2025-1'; // 当前学期
        return myCoursesData.filter(course => 
            course.semester === currentSemester && course.status === '正在修读'
        );
    }

    // 查询待办事项
    function queryTodo() {
        const courseSelect = document.getElementById('todoCourseSelect');
        const courseId = courseSelect ? courseSelect.value : '';
        
        console.log(`查询待办事项，课程：${courseId}`);
        
        // 获取当前学期的课程数据（从我的课程历史中获取当前学期的课程）
        const currentSemester = '2024-2025-1';
        const currentCourses = myCoursesData.filter(course => 
            course.semester === currentSemester && course.status === '正在修读'
        );

        // 未选课引导
        if (currentCourses.length === 0) {
            const container = document.getElementById('todoList');
            if (container) container.innerHTML = '<div class="no-data">您还未选择课程，请先在“选课管理”中选课</div>';
            return;
        }
        
        // 过滤数据（如果选择了特定课程）
        const filteredData = courseId ? 
            currentCourses.filter(course => course.id === courseId) : 
            currentCourses;
        
        // 渲染待办事项列表
        renderTodoList(filteredData);
    }


    // 渲染待办事项列表
    function renderTodoList(courses) {
        const container = document.getElementById('todoList');
        if (!container) return;
        
        if (courses.length === 0) {
            container.innerHTML = '<div class="no-data">该课程暂无待办事项</div>';
            return;
        }
        
        const todoHTML = courses.map(course => {
            if (!course.todoItems || course.todoItems.length === 0) {
                return `
                    <div class="course-todo-section">
                        <h4 class="course-todo-title">${course.name}</h4>
                        <div class="no-data">该课程暂无待办事项</div>
                    </div>
                `;
            }
            
            const courseTodosHTML = course.todoItems.map(item => {
                const completedClass = item.completed ? 'completed' : '';
                const dueDateText = item.dueDate ? `截止日期：${item.dueDate}` : '';
                const statusText = item.completed ? '已完成' : '未完成';
                const statusClass = item.completed ? 'status-completed' : 'status-pending';
                const submissionStatus = item.submissionStatus || (item.completed ? '已提交' : '未提交');
                const submissionClass = submissionStatus === '已批改' ? 'status-completed' : (submissionStatus === '已提交' ? 'status-submitted' : 'status-pending');
                
                return `
                    <div class="todo-card ${completedClass}" data-course-id="${course.id}" data-todo-id="${item.id}">
                        <div class="todo-card-header">
                            <span class="todo-type ${item.type === '课件' ? 'type-lesson' : 'type-homework'}">${item.type}</span>
                            <span class="todo-status ${statusClass}">${statusText}</span>
                            <span class="todo-status ${submissionClass}">${submissionStatus}</span>
                        </div>
                        <div class="todo-card-body">
                            <h5 class="todo-title">${item.title}</h5>
                            <p class="todo-description">${item.description}</p>
                            <div class="todo-meta">
                                <span class="todo-course">${course.name}</span>
                                <span class="todo-due-date">${dueDateText}</span>
                            </div>
                        </div>
                        <div class="todo-card-actions">
                            <button class="todo-complete-btn ${item.completed ? 'completed' : ''}" 
                                    onclick="toggleTodoCompletion('${course.id}', ${item.id})">
                                ${item.completed ? '✓ 已完成' : '标记完成'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            
            return `
                <div class="course-todo-section">
                    <h4 class="course-todo-title">${course.name}</h4>
                    <div class="todo-cards-grid">
                        ${courseTodosHTML}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = todoHTML;
    }

    // 切换待办事项完成状态
    function toggleTodoCompletion(courseId, todoId) {
        // 找到对应的课程和待办事项
        const course = myCoursesData.find(c => c.id === courseId);
        if (!course || !course.todoItems) return;
        
        const todoItem = course.todoItems.find(item => item.id === todoId);
        if (!todoItem) return;
        
        // 记录操作前的状态
        const wasCompleted = todoItem.completed;
        
        // 切换完成状态
        todoItem.completed = !todoItem.completed;
        
        // 记录活动（只有在标记完成时才记录）
        if (!wasCompleted && todoItem.completed) {
            studentManager.recordTodoCompletion(currentStudentId, courseId, course.name, todoItem.title);

        }
        
        // 更新UI
        const todoCard = document.querySelector(`.todo-card[data-course-id="${courseId}"][data-todo-id="${todoId}"]`);
        if (todoCard) {
            const button = todoCard.querySelector('.todo-complete-btn');
            const statusSpan = todoCard.querySelector('.todo-status');
            
            if (todoItem.completed) {
                todoCard.classList.add('completed');
                button.textContent = '✓ 已完成';
                button.classList.add('completed');
                statusSpan.textContent = '已完成';
                statusSpan.className = 'todo-status status-completed';
            } else {
                todoCard.classList.remove('completed');
                button.textContent = '标记完成';
                button.classList.remove('completed');
                statusSpan.textContent = '未完成';
                statusSpan.className = 'todo-status status-pending';
            }
        }
        
        // 如果当前在"个人中心"页面，更新活动记录
        const activeNavItem = document.querySelector('.nav-item.active');
        if (activeNavItem && activeNavItem.getAttribute('data-function') === 'profile') {
            updateRecentActivities();
        }
        
        console.log(`课程 ${course.name} 的待办事项 ${todoItem.title} 状态已更新为：${todoItem.completed ? '已完成' : '未完成'}`);
    }

    // 页面初始化
    initPage();
});
