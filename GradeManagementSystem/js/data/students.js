// 学生数据管理 - 独立数据文件，供学生端使用

// 学生基础数据
const studentsData = {
    '20230101': {
        name: '张三',
        studentId: '20230101',
        department: '计算机科学与技术学院',
        grade: '2023级',
        email: 'zhangsan@university.edu.cn',
        phone: '13800138000',
        admissionDate: '2023-09-01',
        major: '计算机科学与技术',
        class: '计算机2301班',
        avatar: '../public/images/avatars/student1.png'
    }
};

// 学生活动记录管理
let studentActivities = {
    '20230101': [
        {
            id: 1,
            type: 'course_selection',
            title: '选择了新课程：数据结构',
            description: '成功选择数据结构课程，开始学习线性表和链表',
            timestamp: '2024-12-19 14:30:00',
            courseId: 'CS301',
            courseName: '数据结构'
        },
        {
            id: 2,
            type: 'todo_completed',
            title: '完成了作业：线性代数习题一',
            description: '按时完成了线性代数第一章的习题作业',
            timestamp: '2024-12-18 16:45:00',
            courseId: 'MA202',
            courseName: '线性代数'
        },
        {
            id: 3,
            type: 'grade_query',
            title: '查询了成绩：高等数学 92分',
            description: '查看了上学期高等数学的期末成绩',
            timestamp: '2024-12-17 09:15:00',
            courseId: 'MA101',
            courseName: '高等数学'
        },
        {
            id: 4,
            type: 'course_drop',
            title: '退选了课程：大学物理',
            description: '由于课程冲突，退选了大学物理课程',
            timestamp: '2024-12-16 11:20:00',
            courseId: 'PH101',
            courseName: '大学物理'
        },
        {
            id: 5,
            type: 'course_selection',
            title: '选择了新课程：线性代数',
            description: '成功选择线性代数课程，开始学习行列式和矩阵',
            timestamp: '2024-12-15 10:00:00',
            courseId: 'MA202',
            courseName: '线性代数'
        }
    ]
};

// 学生数据管理函数
const studentManager = {
    // 获取学生信息
    getStudentInfo: function(studentId) {
        return studentsData[studentId] || null;
    },
    
    // 获取学生活动记录（最近N条）
    getRecentActivities: function(studentId, limit = 5) {
        const activities = studentActivities[studentId] || [];
        return activities.slice(0, limit).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    
    // 添加学生活动记录
    addActivity: function(studentId, activity) {
        if (!studentActivities[studentId]) {
            studentActivities[studentId] = [];
        }
        
        const newActivity = {
            id: Date.now(),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            ...activity
        };
        
        studentActivities[studentId].unshift(newActivity);
        
        // 保持最多50条活动记录
        if (studentActivities[studentId].length > 50) {
            studentActivities[studentId] = studentActivities[studentId].slice(0, 50);
        }
        
        return newActivity;
    },
    
    // 记录选课活动
    recordCourseSelection: function(studentId, courseId, courseName) {
        return this.addActivity(studentId, {
            type: 'course_selection',
            title: `选择了新课程：${courseName}`,
            description: `成功选择${courseName}课程，开始新的学习旅程`,
            courseId: courseId,
            courseName: courseName
        });
    },
    
    // 记录退课活动
    recordCourseDrop: function(studentId, courseId, courseName) {
        return this.addActivity(studentId, {
            type: 'course_drop',
            title: `退选了课程：${courseName}`,
            description: `退选了${courseName}课程`,
            courseId: courseId,
            courseName: courseName
        });
    },
    
    // 记录待办事项完成
    recordTodoCompletion: function(studentId, courseId, courseName, todoTitle) {
        return this.addActivity(studentId, {
            type: 'todo_completed',
            title: `完成了任务：${todoTitle}`,
            description: `按时完成了${courseName}课程的${todoTitle}`,
            courseId: courseId,
            courseName: courseName
        });
    },
    
    // 记录成绩查询
    recordGradeQuery: function(studentId, courseId, courseName, grade) {
        return this.addActivity(studentId, {
            type: 'grade_query',
            title: `查询了成绩：${courseName} ${grade}分`,
            description: `查看了${courseName}课程的成绩`,
            courseId: courseId,
            courseName: courseName,
            grade: grade
        });
    }
};

// 导出供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { studentsData, studentActivities, studentManager };
}