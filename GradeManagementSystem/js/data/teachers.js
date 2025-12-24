/**
 * 教师数据文件
 * 包含教师基本信息和工作量统计
 */

(function() {
    'use strict';

    // 教师数据
    const teachersData = [
        {
            id: 'teacher001',
            name: '张老师',
            gender: '男',
            department: '计算机科学系',
            title: '副教授',
            phone: '13900139001',
            email: 'zhang@university.edu.cn',
            office: 'A栋301',
            hireDate: '2015-09-01',
            status: 'active',
            maxWorkload: 20,
            currentWorkload: 8,
            courses: ['CS301A', 'CS401A']
        },
        {
            id: 'teacher002',
            name: '李老师',
            gender: '女',
            department: '数学系',
            title: '教授',
            phone: '13900139002',
            email: 'li@university.edu.cn',
            office: 'B栋201',
            hireDate: '2010-09-01',
            status: 'active',
            maxWorkload: 20,
            currentWorkload: 8,
            courses: ['MATH301', 'MATH401']
        },
        {
            id: 'teacher003',
            name: '王老师',
            gender: '男',
            department: '计算机科学系',
            title: '讲师',
            phone: '13900139003',
            email: 'wang@university.edu.cn',
            office: 'A栋302',
            hireDate: '2018-09-01',
            status: 'active',
            maxWorkload: 18,
            currentWorkload: 6,
            courses: ['CS101', 'CS201']
        },
        {
            id: 'teacher004',
            name: '刘老师',
            gender: '女',
            department: '英语系',
            title: '副教授',
            phone: '13900139004',
            email: 'liu@university.edu.cn',
            office: 'C栋101',
            hireDate: '2016-09-01',
            status: 'active',
            maxWorkload: 20,
            currentWorkload: 10,
            courses: ['ENG101', 'ENG301']
        },
        {
            id: 'teacher005',
            name: '陈老师',
            gender: '男',
            department: '物理系',
            title: '教授',
            phone: '13900139005',
            email: 'chen@university.edu.cn',
            office: 'D栋201',
            hireDate: '2008-09-01',
            status: 'active',
            maxWorkload: 16,
            currentWorkload: 4,
            courses: ['PHY101']
        },
        {
            id: 'teacher006',
            name: '赵老师',
            gender: '女',
            department: '计算机科学系',
            title: '讲师',
            phone: '13900139006',
            email: 'zhao@university.edu.cn',
            office: 'A栋303',
            hireDate: '2019-09-01',
            status: 'active',
            maxWorkload: 18,
            currentWorkload: 0,
            courses: []
        },
        {
            id: 'teacher007',
            name: '孙老师',
            gender: '男',
            department: '数学系',
            title: '副教授',
            phone: '13900139007',
            email: 'sun@university.edu.cn',
            office: 'B栋202',
            hireDate: '2014-09-01',
            status: 'active',
            maxWorkload: 20,
            currentWorkload: 6,
            courses: ['MATH201']
        },
        {
            id: 'teacher008',
            name: '周老师',
            gender: '女',
            department: '英语系',
            title: '讲师',
            phone: '13900139008',
            email: 'zhou@university.edu.cn',
            office: 'C栋102',
            hireDate: '2020-09-01',
            status: 'active',
            maxWorkload: 18,
            currentWorkload: 4,
            courses: ['ENG201']
        },
        {
            id: 'teacher009',
            name: '吴老师',
            gender: '男',
            department: '物理系',
            title: '副教授',
            phone: '13900139009',
            email: 'wu@university.edu.cn',
            office: 'D栋202',
            hireDate: '2012-09-01',
            status: 'active',
            maxWorkload: 18,
            currentWorkload: 8,
            courses: ['PHY201', 'PHY301']
        },
        {
            id: 'teacher010',
            name: '郑老师',
            gender: '女',
            department: '计算机科学系',
            title: '教授',
            phone: '13900139010',
            email: 'zheng@university.edu.cn',
            office: 'A栋401',
            hireDate: '2009-09-01',
            status: 'active',
            maxWorkload: 16,
            currentWorkload: 6,
            courses: ['CS501']
        }
    ];

    // 教师数据管理模块
    const TeachersModule = {
        /**
         * 获取所有教师数据
         */
        getAllTeachers() {
            return teachersData;
        },

        /**
         * 根据教师ID获取教师信息
         */
        getTeacherById(teacherId) {
            return teachersData.find(teacher => teacher.id === teacherId);
        },

        /**
         * 根据姓名获取教师信息
         */
        getTeacherByName(name) {
            return teachersData.find(teacher => teacher.name === name);
        },

        /**
         * 根据院系获取教师列表
         */
        getTeachersByDepartment(department) {
            return teachersData.filter(teacher => teacher.department === department);
        },

        /**
         * 根据职称获取教师列表
         */
        getTeachersByTitle(title) {
            return teachersData.filter(teacher => teacher.title === title);
        },

        /**
         * 搜索教师
         */
        searchTeachers(keyword) {
            const lowerKeyword = keyword.toLowerCase();
            return teachersData.filter(teacher => 
                teacher.id.toLowerCase().includes(lowerKeyword) ||
                teacher.name.toLowerCase().includes(lowerKeyword) ||
                teacher.department.toLowerCase().includes(lowerKeyword) ||
                teacher.title.toLowerCase().includes(lowerKeyword)
            );
        },

        /**
         * 获取可用教师（工作量未满）
         */
        getAvailableTeachers() {
            return teachersData.filter(teacher => 
                teacher.status === 'active' && 
                teacher.currentWorkload < teacher.maxWorkload
            );
        },

        /**
         * 获取院系统计信息
         */
        getDepartmentStatistics() {
            const stats = {};
            teachersData.forEach(teacher => {
                if (!stats[teacher.department]) {
                    stats[teacher.department] = {
                        total: 0,
                        professor: 0,
                        associateProfessor: 0,
                        lecturer: 0,
                        totalWorkload: 0,
                        maxWorkload: 0
                    };
                }
                stats[teacher.department].total++;
                stats[teacher.department].totalWorkload += teacher.currentWorkload;
                stats[teacher.department].maxWorkload += teacher.maxWorkload;

                if (teacher.title === '教授') {
                    stats[teacher.department].professor++;
                } else if (teacher.title === '副教授') {
                    stats[teacher.department].associateProfessor++;
                } else if (teacher.title === '讲师') {
                    stats[teacher.department].lecturer++;
                }
            });

            // 计算工作量利用率
            Object.keys(stats).forEach(dept => {
                stats[dept].utilizationRate = 
                    Math.round((stats[dept].totalWorkload / stats[dept].maxWorkload) * 100);
            });

            return stats;
        },

        /**
         * 获取教师工作量统计
         */
        getWorkloadStatistics() {
            const stats = {
                total: teachersData.length,
                active: teachersData.filter(t => t.status === 'active').length,
                totalWorkload: 0,
                maxWorkload: 0,
                overloaded: 0,
                available: 0,
                byTitle: {
                    professor: { count: 0, workload: 0 },
                    associateProfessor: { count: 0, workload: 0 },
                    lecturer: { count: 0, workload: 0 }
                }
            };

            teachersData.forEach(teacher => {
                if (teacher.status === 'active') {
                    stats.totalWorkload += teacher.currentWorkload;
                    stats.maxWorkload += teacher.maxWorkload;

                    if (teacher.currentWorkload >= teacher.maxWorkload) {
                        stats.overloaded++;
                    } else if (teacher.currentWorkload < teacher.maxWorkload * 0.8) {
                        stats.available++;
                    }

                    // 按职称统计
                    if (teacher.title === '教授') {
                        stats.byTitle.professor.count++;
                        stats.byTitle.professor.workload += teacher.currentWorkload;
                    } else if (teacher.title === '副教授') {
                        stats.byTitle.associateProfessor.count++;
                        stats.byTitle.associateProfessor.workload += teacher.currentWorkload;
                    } else if (teacher.title === '讲师') {
                        stats.byTitle.lecturer.count++;
                        stats.byTitle.lecturer.workload += teacher.currentWorkload;
                    }
                }
            });

            stats.utilizationRate = Math.round((stats.totalWorkload / stats.maxWorkload) * 100);

            return stats;
        },

        /**
         * 添加新教师
         */
        addTeacher(teacher) {
            teachersData.push({
                ...teacher,
                status: 'active',
                currentWorkload: 0,
                courses: [],
                hireDate: new Date().toISOString().split('T')[0]
            });
            return true;
        },

        /**
         * 更新教师信息
         */
        updateTeacher(teacherId, updates) {
            const index = teachersData.findIndex(teacher => teacher.id === teacherId);
            if (index !== -1) {
                teachersData[index] = { ...teachersData[index], ...updates };
                return true;
            }
            return false;
        },

        /**
         * 删除教师
         */
        deleteTeacher(teacherId) {
            const index = teachersData.findIndex(teacher => teacher.id === teacherId);
            if (index !== -1) {
                teachersData.splice(index, 1);
                return true;
            }
            return false;
        },

        /**
         * 分配课程给教师
         */
        assignCourse(teacherId, courseId, workload) {
            const teacher = this.getTeacherById(teacherId);
            if (!teacher) {
                return { success: false, error: '教师不存在' };
            }

            if (teacher.currentWorkload + workload > teacher.maxWorkload) {
                return { success: false, error: '教师工作量已满' };
            }

            if (!teacher.courses.includes(courseId)) {
                teacher.courses.push(courseId);
                teacher.currentWorkload += workload;
                return { success: true };
            }

            return { success: false, error: '课程已分配' };
        },

        /**
         * 移除教师的课程
         */
        removeCourse(teacherId, courseId, workload) {
            const teacher = this.getTeacherById(teacherId);
            if (!teacher) {
                return { success: false, error: '教师不存在' };
            }

            const courseIndex = teacher.courses.indexOf(courseId);
            if (courseIndex !== -1) {
                teacher.courses.splice(courseIndex, 1);
                teacher.currentWorkload = Math.max(0, teacher.currentWorkload - workload);
                return { success: true };
            }

            return { success: false, error: '课程未分配' };
        },

        /**
         * 获取教师课程表
         */
        getTeacherTimetable(teacherId) {
            const teacher = this.getTeacherById(teacherId);
            if (!teacher) return null;

            // 这里应该从课程表数据中获取
            // 暂时返回模拟数据
            return {
                teacherId: teacherId,
                teacherName: teacher.name,
                semester: '2024-1',
                timetable: []
            };
        },

        /**
         * 检查教师时间冲突
         */
        checkTimeConflict(teacherId, timeSlot, dayOfWeek) {
            // 这里应该检查教师的课程表
            // 暂时返回无冲突
            return { hasConflict: false };
        },

        /**
         * 获取教师建议课程
         */
        getRecommendedCourses(teacherId) {
            const teacher = this.getTeacherById(teacherId);
            if (!teacher) return [];

            // 根据教师的专业背景和职称推荐课程
            const recommendations = [];
            
            if (teacher.department === '计算机科学系') {
                if (teacher.title === '教授') {
                    recommendations.push('CS501', 'CS502');
                } else if (teacher.title === '副教授') {
                    recommendations.push('CS301', 'CS302', 'CS401');
                } else {
                    recommendations.push('CS101', 'CS102', 'CS201');
                }
            } else if (teacher.department === '数学系') {
                if (teacher.title === '教授') {
                    recommendations.push('MATH501');
                } else if (teacher.title === '副教授') {
                    recommendations.push('MATH301', 'MATH401');
                } else {
                    recommendations.push('MATH101', 'MATH201');
                }
            }

            // 过滤掉已经分配的课程
            return recommendations.filter(course => !teacher.courses.includes(course));
        }
    };

    // 全局暴露
    window.TeachersModule = TeachersModule;

})();