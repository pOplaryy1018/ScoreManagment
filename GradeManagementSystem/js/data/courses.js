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
}