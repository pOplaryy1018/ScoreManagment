/**
 * 课程数据模块（统一版本）
 * 整合公共前端、学生端、教师端共享的课程数据
 */

// ==============================================
// 基础课程数据（统一数据源）
// ==============================================
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
    hours: 48,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: [
      { id: 1, type: '课件', title: '第一章 计算机基础', description: '学习计算机基本概念', dueDate: '2024-12-28', completed: false },
      { id: 2, type: '作业', title: '实验一 编程基础', description: '完成基础编程练习', dueDate: '2025-01-05', completed: false }
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
    hours: 48,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: []
  },
  {
    id: 'CS201',
    name: '数据结构与算法',
    credit: 4,
    teacher: '张教授',
    capacity: 25,
    department: '计算机学院',
    requirements: '需先修《计算机科学导论》',
    description: '深入学习数据结构（链表、树、图）和常用算法（排序、搜索）',
    hours: 64,
    semester: '2024-2025学年第一学期',
    status: '进行中',
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
    hours: 48,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: [
      { id: 9, type: '课件', title: '第一章 线性表', description: '学习线性表的基本概念和操作', dueDate: '2024-12-25', completed: false },
      { id: 10, type: '作业', title: '实验一 链表实现', description: '完成链表的C语言实现', dueDate: '2024-12-30', completed: false },
      { id: 11, type: '课件', title: '第二章 栈和队列', description: '学习栈和队列的基本操作', dueDate: '2025-01-05', completed: false }
    ]
  },
  {
    id: 'CS302',
    name: '数据库系统原理',
    credit: 3,
    teacher: '王教授',
    capacity: 35,
    department: '计算机学院',
    requirements: '需先修《数据结构与算法》',
    description: '学习关系型数据库设计、SQL语言、数据库管理系统原理',
    hours: 48,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: []
  },
  {
    id: 'CS401',
    name: '软件工程',
    credit: 3,
    teacher: '孙教授',
    capacity: 30,
    department: '计算机学院',
    requirements: '需先修《数据结构与算法》',
    description: '软件开发生命周期、项目管理、测试与维护',
    hours: 48,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: []
  },
  {
    id: 'CS402',
    name: '计算机网络',
    credit: 3,
    teacher: '吴教授',
    capacity: 35,
    department: '计算机学院',
    requirements: '需先修《计算机科学导论》',
    description: 'OSI模型、TCP/IP协议、网络安全基础',
    hours: 48,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: []
  },
  {
    id: 'MATH101',
    name: '高等数学',
    credit: 5,
    teacher: '刘教授',
    capacity: 50,
    department: '数学学院',
    requirements: '无先修课程要求',
    description: '微积分、极限、级数等数学基础理论',
    hours: 80,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: [
      { id: 3, type: '课件', title: '第一章 函数与极限', description: '学习函数与极限概念', dueDate: '2024-12-25', completed: false },
      { id: 4, type: '作业', title: '习题一 极限计算', description: '完成极限相关习题', dueDate: '2024-12-30', completed: false }
    ]
  },
  {
    id: 'MATH201',
    name: '线性代数',
    credit: 3,
    teacher: '陈教授',
    capacity: 45,
    department: '数学学院',
    requirements: '建议先修《高等数学》',
    description: '矩阵运算、向量空间、线性变换等',
    hours: 48,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: [
      { id: 12, type: '课件', title: '第一章 行列式', description: '学习行列式的定义和性质', dueDate: '2024-12-20', completed: false },
      { id: 13, type: '作业', title: '习题一', description: '完成行列式的计算题', dueDate: '2024-12-27', completed: false },
      { id: 14, type: '课件', title: '第二章 矩阵', description: '学习矩阵的基本运算', dueDate: '2025-01-03', completed: false }
    ]
  },
  {
    id: 'PHY101',
    name: '大学物理',
    credit: 4,
    teacher: '张老师',
    capacity: 60,
    department: '物理学院',
    requirements: '需先修《高等数学》',
    description: '力学、热学、电磁学、光学基础',
    hours: 64,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: [
      { id: 5, type: '课件', title: '第一章 力学基础', description: '学习牛顿运动定律', dueDate: '2025-01-03', completed: false },
      { id: 6, type: '作业', title: '实验一 力学实验', description: '完成基础力学实验', dueDate: '2025-01-08', completed: false }
    ]
  },
  {
    id: 'EE101',
    name: '电路分析基础',
    credit: 4,
    teacher: '王教授',
    capacity: 40,
    department: '电子工程学院',
    requirements: '需先修《高等数学》',
    description: '电路基本概念、基尔霍夫定律、电路分析方法',
    hours: 64,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: []
  },
  {
    id: 'ENG101',
    name: '大学英语',
    credit: 2,
    teacher: '陈教授',
    capacity: 40,
    department: '外国语学院',
    requirements: '无先修课程要求',
    description: '英语听说读写综合训练',
    hours: 32,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: [
      { id: 7, type: '课件', title: '第一章 英语基础', description: '学习基础英语语法', dueDate: '2024-12-27', completed: false },
      { id: 8, type: '作业', title: '作文一 自我介绍', description: '完成自我介绍作文', dueDate: '2025-01-02', completed: false }
    ]
  },
  {
    id: 'ENG301',
    name: '英语写作',
    credit: 2,
    teacher: '王教授',
    capacity: 30,
    department: '外国语学院',
    requirements: '需先修《大学英语》',
    description: '英语写作技巧训练，提高学生的英语表达能力',
    hours: 32,
    semester: '2024-2025学年第一学期',
    status: '已结束',
    todoItems: []
  },
  // ==============================================
  // 新增课程数据（用于测试成绩登入功能）
  // ==============================================
  {
    id: 'CS301A',
    name: 'Python程序设计',
    credit: 3,
    teacher: '张老师',
    capacity: 35,
    department: '计算机学院',
    requirements: '无先修课程要求，适合编程初学者',
    description: 'Python语言基础、数据结构、面向对象编程、常用库使用',
    hours: 48,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: [
      { id: 15, type: '课件', title: '第一章 Python基础语法', description: '学习Python基本语法和数据类型', dueDate: '2025-01-10', completed: false },
      { id: 16, type: '作业', title: '实验一 基础编程练习', description: '完成Python基础编程题目', dueDate: '2025-01-15', completed: false }
    ]
  },
  {
    id: 'CS401A',
    name: 'Web前端开发',
    credit: 3,
    teacher: '张老师',
    capacity: 30,
    department: '计算机学院',
    requirements: '建议先修《Python程序设计》或《程序设计基础》',
    description: 'HTML5、CSS3、JavaScript基础，响应式网页设计，前端框架介绍',
    hours: 48,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: [
      { id: 17, type: '课件', title: '第一章 HTML5基础', description: '学习HTML5标签和语义化', dueDate: '2025-01-12', completed: false },
      { id: 18, type: '作业', title: '实验一 个人简历网页', description: '使用HTML5和CSS3制作个人简历网页', dueDate: '2025-01-18', completed: false }
    ]
  },
  {
    id: 'MATH301',
    name: '概率论与数理统计',
    credit: 4,
    teacher: '李老师',
    capacity: 40,
    department: '数学学院',
    requirements: '需先修《高等数学》和《线性代数》',
    description: '概率论基础、随机变量、统计推断、回归分析等',
    hours: 64,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: [
      { id: 19, type: '课件', title: '第一章 概率论基础', description: '学习概率的基本概念和性质', dueDate: '2025-01-08', completed: false },
      { id: 20, type: '作业', title: '习题一 概率计算', description: '完成概率相关计算题', dueDate: '2025-01-13', completed: false }
    ]
  },
  {
    id: 'MATH401',
    name: '离散数学',
    credit: 3,
    teacher: '李老师',
    capacity: 35,
    department: '数学学院',
    requirements: '建议先修《高等数学》，计算机专业学生必修',
    description: '集合论、图论、逻辑学、组合数学等离散结构',
    hours: 48,
    semester: '2024-2025学年第一学期',
    status: '进行中',
    todoItems: [
      { id: 21, type: '课件', title: '第一章 集合论', description: '学习集合的基本概念和运算', dueDate: '2025-01-11', completed: false },
      { id: 22, type: '作业', title: '习题一 集合运算', description: '完成集合相关运算题', dueDate: '2025-01-16', completed: false }
    ]
  }
];

// ==============================================
// 兼容性别名（保证旧代码正常工作）
// ==============================================
const CoursesData = coursesData;  // 公共前端使用
const MOCK_COURSES = coursesData; // 教师端使用

// ==============================================
// 教师课程映射（教师端使用）
// ==============================================
const TEACHER_COURSES = {
  'teacher001': ['CS101', 'CS201'],
  'teacher002': ['ENG101', 'ENG301'],
  'teacher003': ['PHY101'],
  'teacher1': ['CS301A', 'CS401A'],   // 张老师：Python程序设计、Web前端开发
  'teacher2': ['MATH301', 'MATH401'] // 李老师：概率论与数理统计、离散数学
};

// ==============================================
// 学生选课状态管理（学生端使用）
// ==============================================
let studentCourseData = {
  selectedCourses: [],
  myCoursesHistory: []
};

// ==============================================
// 课程服务（公共前端使用）
// ==============================================
const CourseService = {
  getAll: function () {
    return coursesData;
  },

  getById: function (id) {
    return coursesData.find(course => course.id === id);
  },

  search: function (filters) {
    let results = [...coursesData];

    if (filters.id) {
      results = results.filter(c => c.id.toLowerCase().includes(filters.id.toLowerCase()));
    }
    if (filters.name) {
      results = results.filter(c => c.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    if (filters.department) {
      results = results.filter(c => c.department === filters.department);
    }
    if (filters.credit) {
      results = results.filter(c => c.credit === parseInt(filters.credit));
    }
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

  getDepartments: function () {
    return [...new Set(coursesData.map(c => c.department))].sort();
  },

  getCredits: function () {
    return [...new Set(coursesData.map(c => c.credit))].sort((a, b) => a - b);
  }
};

// ==============================================
// 课程管理器（学生端使用）
// ==============================================
const courseManager = {
  getAllCourses: function () {
    return [...coursesData];
  },

  getCourseById: function (courseId) {
    return coursesData.find(course => course.id === courseId);
  },

  getSelectedCourses: function () {
    return [...studentCourseData.selectedCourses];
  },

  getMyCoursesHistory: function () {
    return [...studentCourseData.myCoursesHistory];
  },

  selectCourse: function (courseId) {
    const course = this.getCourseById(courseId);
    if (!course) throw new Error('课程不存在');

    const isAlreadySelected = studentCourseData.selectedCourses.some(c => c.id === courseId);
    if (isAlreadySelected) throw new Error('课程已选择');

    studentCourseData.selectedCourses.push({
      ...course,
      semester: '2024-2025-1',
      semesterName: '2024-2025学年第一学期',
      status: '正在修读',
      grade: null
    });

    return course;
  },

  dropCourse: function (courseId) {
    const courseIndex = studentCourseData.selectedCourses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) throw new Error('课程未选择');
    return studentCourseData.selectedCourses.splice(courseIndex, 1)[0];
  },

  getAvailableCourses: function () {
    const allTakenCourseIds = studentCourseData.myCoursesHistory
      .filter(course => course.status === '已修完' || course.status === '正在修读')
      .map(course => course.id);
    const currentSelectedCourseIds = studentCourseData.selectedCourses.map(course => course.id);
    const unavailableCourseIds = [...new Set([...allTakenCourseIds, ...currentSelectedCourseIds])];
    return coursesData.filter(course => !unavailableCourseIds.includes(course.id));
  },

  initStudentCourseData: function (studentId) {
    studentCourseData.selectedCourses = [];
    studentCourseData.myCoursesHistory = [
      { id: 'CS102', name: '程序设计基础', credit: 3, teacher: '陈教授', department: '计算机学院', semester: '2023-2024-1', semesterName: '2023-2024学年第一学期', status: '已修完', grade: 85, todoItems: [] },
      { id: 'MATH101', name: '高等数学', credit: 5, teacher: '刘教授', department: '数学学院', semester: '2023-2024-1', semesterName: '2023-2024学年第一学期', status: '已修完', grade: 92, todoItems: [] },
      { id: 'ENG101', name: '大学英语', credit: 2, teacher: '林老师', department: '外国语学院', semester: '2023-2024-2', semesterName: '2023-2024学年第二学期', status: '已修完', grade: 78, todoItems: [] }
    ];
    studentCourseData.selectedCourses = [
      { ...this.getCourseById('CS301'), semester: '2024-2025-1', semesterName: '2024-2025学年第一学期', status: '正在修读', grade: null },
      { ...this.getCourseById('MATH201'), semester: '2024-2025-1', semesterName: '2024-2025学年第一学期', status: '正在修读', grade: null }
    ];
    return { historical: studentCourseData.myCoursesHistory, current: studentCourseData.selectedCourses };
  }
};

// ==============================================
// 独立函数（教师端兼容）
// ==============================================
function getTeacherCourses(teacherId) {
  const courseIds = TEACHER_COURSES[teacherId] || [];
  return coursesData.filter(course => courseIds.includes(course.id));
}

function getCourseById(courseId) {
  return coursesData.find(course => course.id === courseId);
}

function getAllCourses() {
  return coursesData;
}

// ==============================================
// 导出（Node.js 环境）
// ==============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    coursesData,
    CoursesData,
    MOCK_COURSES,
    TEACHER_COURSES,
    studentCourseData,
    CourseService,
    courseManager,
    getTeacherCourses,
    getCourseById,
    getAllCourses
  };
}

// ==============================================
// 导出（浏览器环境）
// ==============================================
if (typeof window !== 'undefined') {
  window.coursesData = coursesData;
  window.TEACHER_COURSES = TEACHER_COURSES;
  window.CourseService = CourseService;
  window.courseManager = courseManager;
}
