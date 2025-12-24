/**
 * 学生数据文件
 * 包含学生基本信息和班级分配
 */

(function() {
    'use strict';

    // 学生数据
    const studentsData = [
        {
            id: '2021001',
            name: '张三',
            gender: '男',
            classId: 'CS202101',
            className: '计算机科学与技术1班',
            major: '计算机科学与技术',
            grade: '2021',
            phone: '13800138000',
            email: 'zhangsan@example.com',
            enrollmentDate: '2021-09-01',
            status: 'active'
        },
        {
            id: '2021002',
            name: '李四',
            gender: '女',
            classId: 'CS202101',
            className: '计算机科学与技术1班',
            major: '计算机科学与技术',
            grade: '2021',
            phone: '13800138001',
            email: 'lisi@example.com',
            enrollmentDate: '2021-09-01',
            status: 'active'
        },
        {
            id: '2021003',
            name: '王五',
            gender: '男',
            classId: 'CS202101',
            className: '计算机科学与技术1班',
            major: '计算机科学与技术',
            grade: '2021',
            phone: '13800138002',
            email: 'wangwu@example.com',
            enrollmentDate: '2021-09-01',
            status: 'active'
        },
        {
            id: '2021004',
            name: '赵六',
            gender: '女',
            classId: 'CS202102',
            className: '计算机科学与技术2班',
            major: '计算机科学与技术',
            grade: '2021',
            phone: '13800138003',
            email: 'zhaoliu@example.com',
            enrollmentDate: '2021-09-01',
            status: 'active'
        },
        {
            id: '2021005',
            name: '钱七',
            gender: '男',
            classId: 'CS202102',
            className: '计算机科学与技术2班',
            major: '计算机科学与技术',
            grade: '2021',
            phone: '13800138004',
            email: 'qianqi@example.com',
            enrollmentDate: '2021-09-01',
            status: 'active'
        },
        {
            id: '2021006',
            name: '孙八',
            gender: '女',
            classId: 'MATH202101',
            className: '数学与应用数学1班',
            major: '数学与应用数学',
            grade: '2021',
            phone: '13800138005',
            email: 'sunba@example.com',
            enrollmentDate: '2021-09-01',
            status: 'active'
        },
        {
            id: '2021007',
            name: '周九',
            gender: '男',
            classId: 'MATH202101',
            className: '数学与应用数学1班',
            major: '数学与应用数学',
            grade: '2021',
            phone: '13800138006',
            email: 'zhoujiu@example.com',
            enrollmentDate: '2021-09-01',
            status: 'active'
        },
        {
            id: '2021008',
            name: '吴十',
            gender: '女',
            classId: 'ENG202101',
            className: '英语1班',
            major: '英语',
            grade: '2021',
            phone: '13800138007',
            email: 'wushi@example.com',
            enrollmentDate: '2021-09-01',
            status: 'active'
        },
        {
            id: '2022001',
            name: '郑一',
            gender: '男',
            classId: 'CS202201',
            className: '计算机科学与技术1班',
            major: '计算机科学与技术',
            grade: '2022',
            phone: '13800138008',
            email: 'zhengyi@example.com',
            enrollmentDate: '2022-09-01',
            status: 'active'
        },
        {
            id: '2022002',
            name: '王二',
            gender: '女',
            classId: 'CS202201',
            className: '计算机科学与技术1班',
            major: '计算机科学与技术',
            grade: '2022',
            phone: '13800138009',
            email: 'wanger@example.com',
            enrollmentDate: '2022-09-01',
            status: 'active'
        },
        {
            id: '2022003',
            name: '李三',
            gender: '男',
            classId: 'CS202201',
            className: '计算机科学与技术1班',
            major: '计算机科学与技术',
            grade: '2022',
            phone: '13800138010',
            email: 'lisan@example.com',
            enrollmentDate: '2022-09-01',
            status: 'active'
        },
        {
            id: '2022004',
            name: '张四',
            gender: '女',
            classId: 'CS202202',
            className: '计算机科学与技术2班',
            major: '计算机科学与技术',
            grade: '2022',
            phone: '13800138011',
            email: 'zhangsi@example.com',
            enrollmentDate: '2022-09-01',
            status: 'active'
        },
        {
            id: '2022005',
            name: '陈五',
            gender: '男',
            classId: 'CS202202',
            className: '计算机科学与技术2班',
            major: '计算机科学与技术',
            grade: '2022',
            phone: '13800138012',
            email: 'chenwu@example.com',
            enrollmentDate: '2022-09-01',
            status: 'active'
        },
        {
            id: '2023001',
            name: '林六',
            gender: '女',
            classId: 'CS202301',
            className: '计算机科学与技术1班',
            major: '计算机科学与技术',
            grade: '2023',
            phone: '13800138013',
            email: 'linliu@example.com',
            enrollmentDate: '2023-09-01',
            status: 'active'
        },
        {
            id: '2023002',
            name: '黄七',
            gender: '男',
            classId: 'CS202301',
            className: '计算机科学与技术1班',
            major: '计算机科学与技术',
            grade: '2023',
            phone: '13800138014',
            email: 'huangqi@example.com',
            enrollmentDate: '2023-09-01',
            status: 'active'
        },
        {
            id: '2023003',
            name: '赵八',
            gender: '女',
            classId: 'CS202302',
            className: '计算机科学与技术2班',
            major: '计算机科学与技术',
            grade: '2023',
            phone: '13800138015',
            email: 'zhaoba@example.com',
            enrollmentDate: '2023-09-01',
            status: 'active'
        },
        {
            id: '2023004',
            name: '刘九',
            gender: '男',
            classId: 'CS202302',
            className: '计算机科学与技术2班',
            major: '计算机科学与技术',
            grade: '2023',
            phone: '13800138016',
            email: 'liujiu@example.com',
            enrollmentDate: '2023-09-01',
            status: 'active'
        },
        {
            id: '2024001',
            name: '徐十',
            gender: '女',
            classId: 'CS202401',
            className: '计算机科学与技术1班',
            major: '计算机科学与技术',
            grade: '2024',
            phone: '13800138017',
            email: 'xushi@example.com',
            enrollmentDate: '2024-09-01',
            status: 'active'
        },
        {
            id: '2024002',
            name: '马一',
            gender: '男',
            classId: 'CS202401',
            className: '计算机科学与技术1班',
            major: '计算机科学与技术',
            grade: '2024',
            phone: '13800138018',
            email: 'mayi@example.com',
            enrollmentDate: '2024-09-01',
            status: 'active'
        },
        {
            id: '2024003',
            name: '朱二',
            gender: '女',
            classId: 'CS202402',
            className: '计算机科学与技术2班',
            major: '计算机科学与技术',
            grade: '2024',
            phone: '13800138019',
            email: 'zhuier@example.com',
            enrollmentDate: '2024-09-01',
            status: 'active'
        },
        {
            id: '2024004',
            name: '胡三',
            gender: '男',
            classId: 'CS202402',
            className: '计算机科学与技术2班',
            major: '计算机科学与技术',
            grade: '2024',
            phone: '13800138020',
            email: 'husan@example.com',
            enrollmentDate: '2024-09-01',
            status: 'active'
        }
    ];

    // 学生数据管理模块
    const StudentsModule = {
        /**
         * 获取所有学生数据
         */
        getAllStudents() {
            return studentsData;
        },

        /**
         * 根据学号获取学生信息
         */
        getStudentById(studentId) {
            return studentsData.find(student => student.id === studentId);
        },

        /**
         * 根据班级获取学生列表
         */
        getStudentsByClass(classId) {
            return studentsData.filter(student => student.classId === classId);
        },

        /**
         * 根据年级获取学生列表
         */
        getStudentsByGrade(grade) {
            return studentsData.filter(student => student.grade === grade);
        },

        /**
         * 根据专业获取学生列表
         */
        getStudentsByMajor(major) {
            return studentsData.filter(student => student.major === major);
        },

        /**
         * 搜索学生
         */
        searchStudents(keyword) {
            const lowerKeyword = keyword.toLowerCase();
            return studentsData.filter(student => 
                student.id.toLowerCase().includes(lowerKeyword) ||
                student.name.toLowerCase().includes(lowerKeyword) ||
                student.classId.toLowerCase().includes(lowerKeyword) ||
                student.major.toLowerCase().includes(lowerKeyword)
            );
        },

        /**
         * 获取班级统计信息
         */
        getClassStatistics() {
            const stats = {};
            studentsData.forEach(student => {
                if (!stats[student.classId]) {
                    stats[student.classId] = {
                        className: student.className,
                        total: 0,
                        male: 0,
                        female: 0
                    };
                }
                stats[student.classId].total++;
                if (student.gender === '男') {
                    stats[student.classId].male++;
                } else {
                    stats[student.classId].female++;
                }
            });
            return stats;
        },

        /**
         * 获取年级统计信息
         */
        getGradeStatistics() {
            const stats = {};
            studentsData.forEach(student => {
                if (!stats[student.grade]) {
                    stats[student.grade] = {
                        total: 0,
                        male: 0,
                        female: 0,
                        classes: new Set()
                    };
                }
                stats[student.grade].total++;
                stats[student.grade].classes.add(student.classId);
                if (student.gender === '男') {
                    stats[student.grade].male++;
                } else {
                    stats[student.grade].female++;
                }
            });

            // 转换Set为数组
            Object.keys(stats).forEach(grade => {
                stats[grade].classCount = stats[grade].classes.size;
                delete stats[grade].classes;
            });

            return stats;
        },

        /**
         * 添加新学生
         */
        addStudent(student) {
            studentsData.push({
                ...student,
                status: 'active',
                enrollmentDate: new Date().toISOString().split('T')[0]
            });
            return true;
        },

        /**
         * 更新学生信息
         */
        updateStudent(studentId, updates) {
            const index = studentsData.findIndex(student => student.id === studentId);
            if (index !== -1) {
                studentsData[index] = { ...studentsData[index], ...updates };
                return true;
            }
            return false;
        },

        /**
         * 删除学生
         */
        deleteStudent(studentId) {
            const index = studentsData.findIndex(student => student.id === studentId);
            if (index !== -1) {
                studentsData.splice(index, 1);
                return true;
            }
            return false;
        },

        /**
         * 批量导入学生
         */
        batchImport(students) {
            const validStudents = [];
            const errors = [];

            students.forEach((student, index) => {
                try {
                    // 验证必填字段
                    if (!student.id || !student.name || !student.classId) {
                        errors.push({ row: index + 1, error: '缺少必填字段' });
                        return;
                    }

                    // 检查学号是否已存在
                    if (this.getStudentById(student.id)) {
                        errors.push({ row: index + 1, error: '学号已存在' });
                        return;
                    }

                    // 添加学生
                    this.addStudent(student);
                    validStudents.push(student);
                } catch (error) {
                    errors.push({ row: index + 1, error: error.message });
                }
            });

            return {
                success: validStudents.length,
                errors: errors,
                total: students.length
            };
        },

        /**
         * 学生分班
         */
        assignToClass(studentIds, targetClassId) {
            const results = {
                success: [],
                failed: []
            };

            studentIds.forEach(studentId => {
                const student = this.getStudentById(studentId);
                if (student) {
                    student.classId = targetClassId;
                    // 更新班级名称（需要从班级数据中获取）
                    results.success.push(studentId);
                } else {
                    results.failed.push({ studentId, error: '学生不存在' });
                }
            });

            return results;
        },

        /**
         * 获取学生课程表
         */
        getStudentTimetable(studentId) {
            const student = this.getStudentById(studentId);
            if (!student) return null;

            // 这里应该从课程表数据中获取
            // 暂时返回模拟数据
            return {
                studentId: studentId,
                studentName: student.name,
                classId: student.classId,
                semester: '2024-1',
                timetable: []
            };
        }
    };

    // 全局暴露
    window.StudentsModule = StudentsModule;

})();