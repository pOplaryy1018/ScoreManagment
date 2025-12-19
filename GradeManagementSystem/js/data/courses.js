/**
 * 课程数据模块
 * 包含课程信息的模拟数据和操作方法
 */

const CoursesData = [
  {
    id: 'CS101',
    name: '计算机科学导论',
    credit: 3,
    teacher: '李教授',
    capacity: 30,
    department: '计算机学院',
    requirements: '无先修课程要求，适合所有专业学生',
    description: '计算机科学基础课程，介绍计算机系统、编程基础等',
    todoItems: [
      { id: 1, type: '课件', title: '第一章 计算机基础', description: '学习计算机基本概念', dueDate: '2024-12-28', completed: false },
      { id: 2, type: '作业', title: '实验一 编程基础', description: '完成基础编程练习', dueDate: '2025-01-05', completed: false }
    ]
  },
  {
    id: 'CS201',
    name: '数据结构与算法',
    credit: 4,
    teacher: '张教授',
    capacity: 25,
    department: '计算机学院',
    requirements: '需先修《计算机科学导论》',
    description: '深入学习数据结构（链表、树、图）和常用算法（排序、搜索）'
  },
  {
    id: 'CS301',
    name: '数据库系统原理',
    credit: 3,
    teacher: '王教授',
    capacity: 35,
    department: '计算机学院',
    requirements: '需先修《数据结构与算法》',
    description: '学习关系型数据库设计、SQL语言、数据库管理系统原理'
  },
  {
    id: 'MATH101',
    name: '高等数学',
    credit: 5,
    teacher: '刘教授',
    capacity: 50,
    department: '数学学院',
    requirements: '无先修课程要求',
    description: '微积分、极限、级数等数学基础理论'
  },
  {
    id: 'MATH201',
    name: '线性代数',
    credit: 3,
    teacher: '陈教授',
    capacity: 45,
    department: '数学学院',
    requirements: '建议先修《高等数学》',
    description: '矩阵运算、向量空间、线性变换等'
  },
  {
    id: 'EE101',
    name: '电路分析基础',
    credit: 4,
    teacher: '赵教授',
    capacity: 40,
    department: '电子工程学院',
    requirements: '需先修《高等数学》',
    description: '电路基本概念、基尔霍夫定律、电路分析方法'
  },
  {
    id: 'PHY101',
    name: '大学物理',
    credit: 4,
    teacher: '周教授',
    capacity: 60,
    department: '物理学院',
    requirements: '需先修《高等数学》',
    description: '力学、热学、电磁学、光学基础'
  },
  {
    id: 'ENG101',
    name: '大学英语',
    credit: 2,
    teacher: '林老师',
    capacity: 40,
    department: '外国语学院',
    requirements: '无先修课程要求',
    description: '英语听说读写综合训练'
  },
  {
    id: 'CS401',
    name: '软件工程',
    credit: 3,
    teacher: '孙教授',
    capacity: 30,
    department: '计算机学院',
    requirements: '需先修《数据结构与算法》',
    description: '软件开发生命周期、项目管理、测试与维护'
  },
  {
    id: 'CS402',
    name: '计算机网络',
    credit: 3,
    teacher: '吴教授',
    capacity: 35,
    department: '计算机学院',
    requirements: '需先修《计算机科学导论》',
    description: 'OSI模型、TCP/IP协议、网络安全基础'
  }
];

/**
 * 课程服务
 */
const CourseService = {
  /**
   * 获取所有课程
   * @returns {Array}
   */
  getAll: function () {
    return CoursesData;
  },

  /**
   * 根据ID获取课程
   * @param {string} id 
   * @returns {Object|undefined}
   */
  getById: function (id) {
    return CoursesData.find(course => course.id === id);
  },

  /**
   * 搜索课程
   * @param {Object} filters 搜索条件
   * @returns {Array}
   */
  search: function (filters) {
    let results = [...CoursesData];

    // 按课程号搜索
    if (filters.id) {
      results = results.filter(c =>
        c.id.toLowerCase().includes(filters.id.toLowerCase())
      );
    }

    // 按课程名搜索
    if (filters.name) {
      results = results.filter(c =>
        c.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // 按开课院系筛选
    if (filters.department) {
      results = results.filter(c =>
        c.department === filters.department
      );
    }

    // 按学分筛选
    if (filters.credit) {
      results = results.filter(c =>
        c.credit === parseInt(filters.credit)
      );
    }

    // 按关键词搜索（课程号、课程名、描述）
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      results = results.filter(c =>
        c.id.toLowerCase().includes(keyword) ||
        c.name.toLowerCase().includes(keyword) ||
        c.description.toLowerCase().includes(keyword) ||
        c.teacher.toLowerCase().includes(keyword)
      );
    }

    return results;
  },

  /**
   * 获取所有院系列表
   * @returns {Array}
   */
  getDepartments: function () {
    const departments = [...new Set(CoursesData.map(c => c.department))];
    return departments.sort();
  },

  /**
   * 获取所有学分选项
   * @returns {Array}
   */
  getCredits: function () {
    const credits = [...new Set(CoursesData.map(c => c.credit))];
    return credits.sort((a, b) => a - b);
  }
};
// 课程模拟数据
const MOCK_COURSES = [
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
  },
  {
    id: 'ENG301',
    name: '英语写作',
    teacher: '王教授',
    semester: '2024-2025学年第一学期',
    credit: 2,
    hours: 32,
    students: 30,
    status: '已结束',
    description: '英语写作技巧训练，提高学生的英语表达能力。'
  },
  {
    id: 'PHY102',
    name: '大学物理',
    teacher: '赵教授',
    semester: '2023-2024学年第二学期',
    credit: 3,
    hours: 48,
    students: 50,
    status: '已结束',
    description: '物理学基础课程，涵盖力学、热学、电磁学等内容。'
  }
];

// 教师负责的课程数据
const TEACHER_COURSES = {
  'teacher001': ['CS101', 'MATH201'],
  'teacher002': ['ENG301'],
  'teacher003': ['PHY102']
};

// 获取教师负责的课程列表
function getTeacherCourses(teacherId) {
  const courseIds = TEACHER_COURSES[teacherId] || [];
  return MOCK_COURSES.filter(course => courseIds.includes(course.id));
}

// 根据课程ID获取课程信息
function getCourseById(courseId) {
  return MOCK_COURSES.find(course => course.id === courseId);
}

// 获取所有课程
function getAllCourses() {
  return MOCK_COURSES;
}

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MOCK_COURSES,
    TEACHER_COURSES,
    getTeacherCourses,
    getCourseById,
    getAllCourses
  };
// 课程数据管理 - 独立数据文件，供学生端和教师端共享

// 基础课程数据（所有可用课程）
const coursesData = [
    { 
        id: 'CS101', 
        name: '计算机科学导论', 
        credit: 3, 
        teacher: '李教授', 
        capacity: 30,
        department: '计算机学院',
        requirements: '无先修课程要求，适合所有专业学生',
        description: '计算机科学基础课程，介绍计算机系统、编程基础等',
        todoItems: [
            { id: 1, type: '课件', title: '第一章 计算机基础', description: '学习计算机基本概念', dueDate: '2024-12-28', completed: false },
            { id: 2, type: '作业', title: '实验一 编程基础', description: '完成基础编程练习', dueDate: '2025-01-05', completed: false }
        ]
    },
    { 
        id: 'MA101', 
        name: '高等数学', 
        credit: 4, 
        teacher: '王教授', 
        capacity: 40,
        department: '数学学院',
        requirements: '高中数学基础，建议理工科专业学生选修',
        description: '数学基础课程，涵盖微积分、线性代数等',
        todoItems: [
            { id: 3, type: '课件', title: '第一章 函数与极限', description: '学习函数与极限概念', dueDate: '2024-12-25', completed: false },
            { id: 4, type: '作业', title: '习题一 极限计算', description: '完成极限相关习题', dueDate: '2024-12-30', completed: false }
        ]
    },
    { 
        id: 'PH101', 
        name: '大学物理', 
        credit: 3, 
        teacher: '张教授', 
        capacity: 35,
        department: '物理学院',
        requirements: '高中数学基础，建议理工科专业学生选修',
        description: '物理学基础课程，涵盖力学、电磁学等',
        todoItems: [
            { id: 5, type: '课件', title: '第一章 力学基础', description: '学习牛顿运动定律', dueDate: '2025-01-03', completed: false },
            { id: 6, type: '作业', title: '实验一 力学实验', description: '完成基础力学实验', dueDate: '2025-01-08', completed: false }
        ]
    },
    { 
        id: 'EN101', 
        name: '大学英语', 
        credit: 2, 
        teacher: '刘教授', 
        capacity: 25,
        department: '外国语学院',
        requirements: '高中英语基础，所有专业学生必修',
        description: '英语语言课程，提高听说读写能力',
        todoItems: [
            { id: 7, type: '课件', title: '第一章 英语基础', description: '学习基础英语语法', dueDate: '2024-12-27', completed: false },
            { id: 8, type: '作业', title: '作文一 自我介绍', description: '完成自我介绍作文', dueDate: '2025-01-02', completed: false }
        ]
    },
    { 
        id: 'CS102', 
        name: '程序设计基础', 
        credit: 3, 
        teacher: '陈教授', 
        capacity: 30,
        department: '计算机学院',
        requirements: '建议先修计算机科学导论，计算机专业学生必修',
        description: '编程入门课程，学习基础编程概念和技巧',
        todoItems: []
    },
    { 
        id: 'CS301', 
        name: '数据结构', 
        credit: 3, 
        teacher: '张教授', 
        capacity: 30,
        department: '计算机学院',
        requirements: '程序设计基础课程，计算机专业学生必修',
        description: '数据结构与算法课程，学习常用数据结构和算法',
        todoItems: [
            { id: 9, type: '课件', title: '第一章 线性表', description: '学习线性表的基本概念和操作', dueDate: '2024-12-25', completed: false },
            { id: 10, type: '作业', title: '实验一 链表实现', description: '完成链表的C语言实现', dueDate: '2024-12-30', completed: false },
            { id: 11, type: '课件', title: '第二章 栈和队列', description: '学习栈和队列的基本操作', dueDate: '2025-01-05', completed: false }
        ]
    },
    { 
        id: 'MA202', 
        name: '线性代数', 
        credit: 3, 
        teacher: '赵教授', 
        capacity: 35,
        department: '数学学院',
        requirements: '高等数学基础，理工科专业学生建议选修',
        description: '线性代数课程，学习矩阵、向量空间等',
        todoItems: [
            { id: 12, type: '课件', title: '第一章 行列式', description: '学习行列式的定义和性质', dueDate: '2024-12-20', completed: false },
            { id: 13, type: '作业', title: '习题一', description: '完成行列式的计算题', dueDate: '2024-12-27', completed: false },
            { id: 14, type: '课件', title: '第二章 矩阵', description: '学习矩阵的基本运算', dueDate: '2025-01-03', completed: false }
        ]
    }
];

// 学生选课状态管理
let studentCourseData = {
    // 当前学生已选课程（当前学期正在修读的课程）
    selectedCourses: [],
    
    // 学生个人课程历史（包含所有学期的课程）
    myCoursesHistory: []
};

// 课程管理函数
const courseManager = {
    // 获取所有可用课程
    getAllCourses: function() {
        return [...coursesData];
    },
    
    // 根据ID获取课程信息
    getCourseById: function(courseId) {
        return coursesData.find(course => course.id === courseId);
    },
    
    // 获取学生当前学期已选课程
    getSelectedCourses: function() {
        return [...studentCourseData.selectedCourses];
    },
    
    // 获取学生个人课程历史
    getMyCoursesHistory: function() {
        return [...studentCourseData.myCoursesHistory];
    },
    
    // 学生选课
    selectCourse: function(courseId) {
        const course = this.getCourseById(courseId);
        if (!course) {
            throw new Error('课程不存在');
        }
        
        // 检查是否已经选择
        const isAlreadySelected = studentCourseData.selectedCourses.some(c => c.id === courseId);
        if (isAlreadySelected) {
            throw new Error('课程已选择');
        }
        
        // 添加到当前学期已选课程
        studentCourseData.selectedCourses.push({
            id: course.id,
            name: course.name,
            credit: course.credit,
            teacher: course.teacher,
            department: course.department,
            requirements: course.requirements,
            semester: '2024-2025-1',
            semesterName: '2024-2025学年第一学期',
            status: '正在修读',
            grade: null,
            todoItems: course.todoItems ? [...course.todoItems] : []
        });
        
        return course;
    },
    
    // 学生退选课程
    dropCourse: function(courseId) {
        const courseIndex = studentCourseData.selectedCourses.findIndex(c => c.id === courseId);
        if (courseIndex === -1) {
            throw new Error('课程未选择');
        }
        
        const droppedCourse = studentCourseData.selectedCourses.splice(courseIndex, 1)[0];
        return droppedCourse;
    },
    
    // 获取学生当前学期可选课程（排除已修读和已选择的课程）
    getAvailableCourses: function() {
        // 获取所有已修读的课程ID（包括历史学期）
        const allTakenCourseIds = studentCourseData.myCoursesHistory
            .filter(course => course.status === '已修完' || course.status === '正在修读')
            .map(course => course.id);
        
        // 获取当前学期已选课程ID
        const currentSelectedCourseIds = studentCourseData.selectedCourses.map(course => course.id);
        
        // 合并所有不可选的课程ID
        const unavailableCourseIds = [...new Set([...allTakenCourseIds, ...currentSelectedCourseIds])];
        
        // 过滤出可选的课程
        return coursesData.filter(course => !unavailableCourseIds.includes(course.id));
    },
    
    // 初始化学生课程数据（模拟历史数据）
    initStudentCourseData: function(studentId) {
        // 清空当前数据
        studentCourseData.selectedCourses = [];
        studentCourseData.myCoursesHistory = [];
        
        // 模拟历史课程数据
        const historicalCourses = [
            { 
                id: 'CS102', 
                name: '程序设计基础', 
                credit: 3, 
                teacher: '陈教授', 
                department: '计算机学院',
                requirements: '建议先修计算机科学导论，计算机专业学生必修',
                semester: '2023-2024-1',
                semesterName: '2023-2024学年第一学期',
                status: '已修完',
                grade: 85,
                todoItems: []
            },
            { 
                id: 'MA101', 
                name: '高等数学', 
                credit: 4, 
                teacher: '王教授', 
                department: '数学学院',
                requirements: '高中数学基础，建议理工科专业学生选修',
                semester: '2023-2024-1',
                semesterName: '2023-2024学年第一学期',
                status: '已修完',
                grade: 92,
                todoItems: []
            },
            { 
                id: 'EN101', 
                name: '大学英语', 
                credit: 2, 
                teacher: '刘教授', 
                department: '外国语学院',
                requirements: '高中英语基础，所有专业学生必修',
                semester: '2023-2024-2',
                semesterName: '2023-2024学年第二学期',
                status: '已修完',
                grade: 78,
                todoItems: []
            }
        ];
        
        // 模拟当前学期已选课程
        const currentSemesterCourses = [
            { 
                id: 'CS301', 
                name: '数据结构', 
                credit: 3, 
                teacher: '张教授', 
                department: '计算机学院',
                requirements: '程序设计基础课程，计算机专业学生必修',
                semester: '2024-2025-1',
                semesterName: '2024-2025学年第一学期',
                status: '正在修读',
                grade: null,
                todoItems: [
                    { id: 9, type: '课件', title: '第一章 线性表', description: '学习线性表的基本概念和操作', dueDate: '2024-12-25', completed: false },
                    { id: 10, type: '作业', title: '实验一 链表实现', description: '完成链表的C语言实现', dueDate: '2024-12-30', completed: false },
                    { id: 11, type: '课件', title: '第二章 栈和队列', description: '学习栈和队列的基本操作', dueDate: '2025-01-05', completed: false }
                ]
            },
            { 
                id: 'MA202', 
                name: '线性代数', 
                credit: 3, 
                teacher: '赵教授', 
                department: '数学学院',
                requirements: '高等数学基础，理工科专业学生建议选修',
                semester: '2024-2025-1',
                semesterName: '2024-2025学年第一学期',
                status: '正在修读',
                grade: null,
                todoItems: [
                    { id: 12, type: '课件', title: '第一章 行列式', description: '学习行列式的定义和性质', dueDate: '2024-12-20', completed: false },
                    { id: 13, type: '作业', title: '习题一', description: '完成行列式的计算题', dueDate: '2024-12-27', completed: false },
                    { id: 14, type: '课件', title: '第二章 矩阵', description: '学习矩阵的基本运算', dueDate: '2025-01-03', completed: false }
                ]
            }
        ];
        
        // 设置数据
        studentCourseData.myCoursesHistory = [...historicalCourses];
        studentCourseData.selectedCourses = [...currentSemesterCourses];
        
        console.log(`学生 ${studentId} 的课程数据初始化完成`);
        console.log('历史课程数量:', historicalCourses.length);
        console.log('当前学期已选课程数量:', currentSemesterCourses.length);
        
        return {
            historical: historicalCourses,
            current: currentSemesterCourses
        };
    }
};

// 导出供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { coursesData, studentCourseData, courseManager };
}
