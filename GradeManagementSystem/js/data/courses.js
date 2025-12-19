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
