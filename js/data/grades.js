/**
 * 成绩数据管理模块
 */

// 模拟成绩数据
const gradesData = [
    // 正常成绩数据
    {
        id: 'grade001',
        courseId: 'CS301A',
        courseName: 'Python程序设计',
        teacherId: 'teacher1',
        teacherName: '张老师',
        semester: '2024-2025-1',
        studentGrades: [
            { studentId: 'student001', studentName: '张三', score: 85, grade: 'B', status: 'published' },
            { studentId: 'student002', studentName: '李四', score: 92, grade: 'A', status: 'published' },
            { studentId: 'student003', studentName: '王五', score: 78, grade: 'C', status: 'published' },
            { studentId: 'student004', studentName: '赵六', score: 88, grade: 'B', status: 'published' },
            { studentId: 'student005', studentName: '钱七', score: 95, grade: 'A', status: 'published' },
            { studentId: 'student006', studentName: '孙八', score: 72, grade: 'C', status: 'published' },
            { studentId: 'student007', studentName: '周九', score: 83, grade: 'B', status: 'published' },
            { studentId: 'student008', studentName: '吴十', score: 90, grade: 'A', status: 'published' },
            { studentId: 'student009', studentName: '郑十一', score: 76, grade: 'C', status: 'published' },
            { studentId: 'student010', studentName: '王十二', score: 89, grade: 'B', status: 'published' }
        ],
        statistics: {
            totalStudents: 10,
            averageScore: 83.8,
            maxScore: 95,
            minScore: 72,
            passRate: 100,
            excellentRate: 40,
            goodRate: 40,
            averageRate: 20
        },
        auditStatus: 'published',
        publishStatus: 'published',
        submitTime: '2025-01-15T10:30:00',
        publishTime: '2025-01-20T14:00:00',
        anomalyType: null
    },
    // 异常成绩数据 - 优秀率过高
    {
        id: 'grade002',
        courseId: 'CS401A',
        courseName: 'Web前端开发',
        teacherId: 'teacher1',
        teacherName: '张老师',
        semester: '2024-2025-1',
        studentGrades: [
            { studentId: 'student011', studentName: '陈一', score: 95, grade: 'A', status: 'pending' },
            { studentId: 'student012', studentName: '林二', score: 98, grade: 'A', status: 'pending' },
            { studentId: 'student013', studentName: '黄三', score: 92, grade: 'A', status: 'pending' },
            { studentId: 'student014', studentName: '何四', score: 96, grade: 'A', status: 'pending' },
            { studentId: 'student015', studentName: '高五', score: 94, grade: 'A', status: 'pending' },
            { studentId: 'student016', studentName: '马六', score: 97, grade: 'A', status: 'pending' },
            { studentId: 'student017', studentName: '罗七', score: 93, grade: 'A', status: 'pending' },
            { studentId: 'student018', studentName: '梁八', score: 95, grade: 'A', status: 'pending' },
            { studentId: 'student019', studentName: '宋九', score: 91, grade: 'A', status: 'pending' },
            { studentId: 'student020', studentName: '唐十', score: 96, grade: 'A', status: 'pending' }
        ],
        statistics: {
            totalStudents: 10,
            averageScore: 94.7,
            maxScore: 98,
            minScore: 91,
            passRate: 100,
            excellentRate: 100,
            goodRate: 0,
            averageRate: 0
        },
        auditStatus: 'pending',
        publishStatus: 'unpublished',
        submitTime: '2025-01-18T16:45:00',
        publishTime: null,
        anomalyType: 'high_excellent'
    },
    // 异常成绩数据 - 及格率过低
    {
        id: 'grade003',
        courseId: 'MATH301',
        courseName: '概率论与数理统计',
        teacherId: 'teacher2',
        teacherName: '李老师',
        semester: '2024-2025-1',
        studentGrades: [
            { studentId: 'student021', studentName: '徐一', score: 85, grade: 'B', status: 'pending' },
            { studentId: 'student022', studentName: '朱二', score: 92, grade: 'A', status: 'pending' },
            { studentId: 'student023', studentName: '秦三', score: 45, grade: 'F', status: 'pending' },
            { studentId: 'student024', studentName: '尤四', score: 38, grade: 'F', status: 'pending' },
            { studentId: 'student025', studentName: '许五', score: 52, grade: 'F', status: 'pending' },
            { studentId: 'student026', studentName: '何六', score: 48, grade: 'F', status: 'pending' },
            { studentId: 'student027', studentName: '吕七', score: 55, grade: 'F', status: 'pending' },
            { studentId: 'student028', studentName: '施八', score: 88, grade: 'B', status: 'pending' },
            { studentId: 'student029', studentName: '张九', score: 42, grade: 'F', status: 'pending' },
            { studentId: 'student030', studentName: '孔十', score: 35, grade: 'F', status: 'pending' }
        ],
        statistics: {
            totalStudents: 10,
            averageScore: 58.0,
            maxScore: 92,
            minScore: 35,
            passRate: 40,
            excellentRate: 10,
            goodRate: 20,
            averageRate: 10
        },
        auditStatus: 'pending',
        publishStatus: 'unpublished',
        submitTime: '2025-01-19T09:20:00',
        publishTime: null,
        anomalyType: 'low_pass'
    },
    // 正常成绩数据 - 已审核待发布
    {
        id: 'grade004',
        courseId: 'MATH401',
        courseName: '离散数学',
        teacherId: 'teacher2',
        teacherName: '李老师',
        semester: '2024-2025-1',
        studentGrades: [
            { studentId: 'student031', studentName: '曹一', score: 78, grade: 'C', status: 'approved' },
            { studentId: 'student032', studentName: '严二', score: 85, grade: 'B', status: 'approved' },
            { studentId: 'student033', studentName: '华三', score: 82, grade: 'B', status: 'approved' },
            { studentId: 'student034', studentName: '金四', score: 79, grade: 'C', status: 'approved' },
            { studentId: 'student035', studentName: '魏五', score: 88, grade: 'B', status: 'approved' },
            { studentId: 'student036', studentName: '陶六', score: 76, grade: 'C', status: 'approved' },
            { studentId: 'student037', studentName: '姜七', score: 83, grade: 'B', status: 'approved' },
            { studentId: 'student038', studentName: '戚八', score: 80, grade: 'B', status: 'approved' },
            { studentId: 'student039', studentName: '谢九', score: 77, grade: 'C', status: 'approved' },
            { studentId: 'student040', studentName: '邹十', score: 84, grade: 'B', status: 'approved' }
        ],
        statistics: {
            totalStudents: 10,
            averageScore: 81.2,
            maxScore: 88,
            minScore: 76,
            passRate: 100,
            excellentRate: 0,
            goodRate: 70,
            averageRate: 30
        },
        auditStatus: 'approved',
        publishStatus: 'unpublished',
        submitTime: '2025-01-17T11:15:00',
        publishTime: null,
        anomalyType: null
    }
];

// 异常学生数据 - 成绩波动
const anomalyStudentsData = [
    {
        id: 'anomaly001',
        studentId: 'student041',
        studentName: '刘一',
        courseId: 'CS301A',
        courseName: 'Python程序设计',
        currentScore: 45,
        historicalAverage: 85.5,
        fluctuation: -40.5,
        fluctuationRate: -47.4,
        status: 'pending',
        detectedTime: '2025-01-20T10:30:00'
    },
    {
        id: 'anomaly002',
        studentId: 'student042',
        studentName: '陈二',
        courseId: 'MATH301',
        courseName: '概率论与数理统计',
        currentScore: 98,
        historicalAverage: 72.3,
        fluctuation: 25.7,
        fluctuationRate: 35.5,
        status: 'pending',
        detectedTime: '2025-01-20T11:45:00'
    },
    {
        id: 'anomaly003',
        studentId: 'student043',
        studentName: '张三',
        courseId: 'CS401A',
        courseName: 'Web前端开发',
        currentScore: 35,
        historicalAverage: 78.8,
        fluctuation: -43.8,
        fluctuationRate: -55.6,
        status: 'reviewed',
        detectedTime: '2025-01-19T14:20:00'
    }
];

// 审核记录数据
const auditRecordsData = [
    {
        id: 'audit001',
        gradeId: 'grade004',
        courseId: 'MATH401',
        courseName: '离散数学',
        reviewerId: 'admin001',
        reviewerName: '王管理员',
        reviewTime: '2025-01-18T15:30:00',
        reviewResult: 'approved',
        reviewComment: '成绩分布正常，同意发布。',
        reviewLevel: 1,
        nextReviewerId: null
    },
    {
        id: 'audit002',
        gradeId: 'grade002',
        courseId: 'CS401A',
        courseName: 'Web前端开发',
        reviewerId: 'admin002',
        reviewerName: '李管理员',
        reviewTime: '2025-01-19T09:15:00',
        reviewResult: 'need_revision',
        reviewComment: '优秀率异常偏高，请教师核实成绩真实性。',
        reviewLevel: 1,
        nextReviewerId: null
    }
];

// 发布记录数据
const publishRecordsData = [
    {
        id: 'publish001',
        gradeId: 'grade001',
        courseId: 'CS301A',
        courseName: 'Python程序设计',
        publisherId: 'admin001',
        publisherName: '王管理员',
        publishTime: '2025-01-20T14:00:00',
        publishType: 'batch',
        affectedStudents: 10,
        publishStatus: 'success'
    }
];

// 成绩数据管理模块
const GradesModule = {
    /**
     * 获取所有成绩数据
     */
    getAllGrades() {
        return gradesData;
    },

    /**
     * 根据ID获取成绩数据
     */
    getGradeById(gradeId) {
        return gradesData.find(grade => grade.id === gradeId);
    },

    /**
     * 根据课程ID获取成绩数据
     */
    getGradesByCourseId(courseId) {
        return gradesData.filter(grade => grade.courseId === courseId);
    },

    /**
     * 根据教师ID获取成绩数据
     */
    getGradesByTeacherId(teacherId) {
        return gradesData.filter(grade => grade.teacherId === teacherId);
    },

    /**
     * 根据审核状态获取成绩数据
     */
    getGradesByAuditStatus(status) {
        return gradesData.filter(grade => grade.auditStatus === status);
    },

    /**
     * 根据发布状态获取成绩数据
     */
    getGradesByPublishStatus(status) {
        return gradesData.filter(grade => grade.publishStatus === status);
    },

    /**
     * 获取异常成绩数据
     */
    getAnomalyGrades() {
        return gradesData.filter(grade => grade.anomalyType !== null);
    },

    /**
     * 获取异常学生数据
     */
    getAnomalyStudents() {
        return anomalyStudentsData;
    },

    /**
     * 获取审核记录
     */
    getAuditRecords() {
        return auditRecordsData;
    },

    /**
     * 获取发布记录
     */
    getPublishRecords() {
        return publishRecordsData;
    },

    /**
     * 更新成绩审核状态
     */
    updateAuditStatus(gradeId, status, reviewerId, reviewerName, comment) {
        const grade = this.getGradeById(gradeId);
        if (grade) {
            grade.auditStatus = status;
            
            // 添加审核记录
            auditRecordsData.push({
                id: 'audit' + Date.now(),
                gradeId: gradeId,
                courseId: grade.courseId,
                courseName: grade.courseName,
                reviewerId: reviewerId,
                reviewerName: reviewerName,
                reviewTime: new Date().toISOString(),
                reviewResult: status,
                reviewComment: comment,
                reviewLevel: 1,
                nextReviewerId: null
            });
            
            return true;
        }
        return false;
    },

    /**
     * 更新成绩发布状态
     */
    updatePublishStatus(gradeId, status, publisherId, publisherName) {
        const grade = this.getGradeById(gradeId);
        if (grade) {
            grade.publishStatus = status;
            grade.publishTime = status === 'published' ? new Date().toISOString() : null;
            
            // 更新学生成绩状态
            grade.studentGrades.forEach(studentGrade => {
                studentGrade.status = status;
            });
            
            // 添加发布记录
            if (status === 'published') {
                publishRecordsData.push({
                    id: 'publish' + Date.now(),
                    gradeId: gradeId,
                    courseId: grade.courseId,
                    courseName: grade.courseName,
                    publisherId: publisherId,
                    publisherName: publisherName,
                    publishTime: new Date().toISOString(),
                    publishType: 'single',
                    affectedStudents: grade.studentGrades.length,
                    publishStatus: 'success'
                });
            }
            
            return true;
        }
        return false;
    },

    /**
     * 批量发布成绩
     */
    batchPublishGrades(gradeIds, publisherId, publisherName) {
        const results = {
            success: [],
            failed: []
        };

        gradeIds.forEach(gradeId => {
            if (this.updatePublishStatus(gradeId, 'published', publisherId, publisherName)) {
                results.success.push(gradeId);
            } else {
                results.failed.push(gradeId);
            }
        });

        // 添加批量发布记录
        if (results.success.length > 0) {
            publishRecordsData.push({
                id: 'publish' + Date.now(),
                gradeId: null,
                courseId: null,
                courseName: '批量发布',
                publisherId: publisherId,
                publisherName: publisherName,
                publishTime: new Date().toISOString(),
                publishType: 'batch',
                affectedStudents: results.success.reduce((total, gradeId) => {
                    const grade = this.getGradeById(gradeId);
                    return total + (grade ? grade.studentGrades.length : 0);
                }, 0),
                publishStatus: 'success'
            });
        }

        return results;
    },

    /**
     * 计算成绩统计信息
     */
    calculateStatistics(studentGrades) {
        if (!studentGrades || studentGrades.length === 0) {
            return {
                totalStudents: 0,
                averageScore: 0,
                maxScore: 0,
                minScore: 0,
                passRate: 0,
                excellentRate: 0,
                goodRate: 0,
                averageRate: 0
            };
        }

        const scores = studentGrades.map(sg => sg.score);
        const totalStudents = studentGrades.length;
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalStudents;
        const maxScore = Math.max(...scores);
        const minScore = Math.min(...scores);
        const passCount = scores.filter(score => score >= 60).length;
        const excellentCount = scores.filter(score => score >= 90).length;
        const goodCount = scores.filter(score => score >= 80 && score < 90).length;
        const averageCount = scores.filter(score => score >= 70 && score < 80).length;

        return {
            totalStudents,
            averageScore: Math.round(averageScore * 10) / 10,
            maxScore,
            minScore,
            passRate: Math.round((passCount / totalStudents) * 100),
            excellentRate: Math.round((excellentCount / totalStudents) * 100),
            goodRate: Math.round((goodCount / totalStudents) * 100),
            averageRate: Math.round((averageCount / totalStudents) * 100)
        };
    },

    /**
     * 检测成绩异常
     */
    detectAnomalies(gradeData) {
        const anomalies = [];
        const stats = gradeData.statistics;

        // 检测优秀率过高
        if (stats.excellentRate > 90) {
            anomalies.push({
                type: 'high_excellent',
                description: '优秀率过高',
                threshold: 90,
                actual: stats.excellentRate
            });
        }

        // 检测及格率过低
        if (stats.passRate < 60) {
            anomalies.push({
                type: 'low_pass',
                description: '及格率过低',
                threshold: 60,
                actual: stats.passRate
            });
        }

        return anomalies;
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gradesData, anomalyStudentsData, auditRecordsData, publishRecordsData, GradesModule };
}