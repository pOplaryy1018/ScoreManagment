/**
 * 成绩审核工作流模块
 */
const GradeAuditModule = {
    currentSection: 'anomaly-monitoring',
    currentReviewGradeId: null,
    selectedPublishGrades: new Set(),
    
    /**
     * 初始化模块
     */
    init() {
        this.bindEvents();
        this.loadCurrentUser();
        this.switchSection('anomaly-monitoring');
        this.initCharts();
    },
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 导航切换事件（与学生端侧边栏一致）
        document.querySelectorAll('.sidebar .nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.switchSection(section);
            });
        });
        
        // 退出登录事件
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
    },
    
    /**
     * 加载当前用户信息
     */
    loadCurrentUser() {
        const currentUser = window.Auth && typeof Auth.getCurrentUser === 'function'
            ? Auth.getCurrentUser()
            : null;
        if (currentUser) {
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = currentUser.name || '成绩管理员';
            }
        }
    },
    
    /**
     * 切换功能区域
     */
    switchSection(sectionId) {
        // 更新导航状态（侧边栏）
        document.querySelectorAll('.sidebar .nav-link[data-section]').forEach(item => {
            item.classList.remove('active');
            item.parentElement?.classList.remove('active');
        });
        const activeLink = document.querySelector(`.sidebar .nav-link[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.parentElement?.classList.add('active');
        }
        
        // 更新内容区域
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
        
        this.currentSection = sectionId;
        
        // 根据不同区域加载数据
        switch (sectionId) {
            case 'anomaly-monitoring':
                this.loadAnomalyMonitoring();
                break;
            case 'review-process':
                this.loadReviewProcess();
                break;
            case 'grade-publishing':
                this.loadGradePublishing();
                break;
        }
    },
    
    /**
     * 加载异常成绩监控数据
     */
    loadAnomalyMonitoring() {
        this.updateStatistics();
        this.renderAnomalyCourses();
        this.renderAnomalyStudents();
        this.renderCharts();
    },
    
    /**
     * 更新统计信息
     */
    updateStatistics() {
        const allGrades = GradesModule.getAllGrades();
        const anomalyGrades = GradesModule.getAnomalyGrades();
        const anomalyStudents = GradesModule.getAnomalyStudents();
        const pendingReviews = GradesModule.getGradesByAuditStatus('pending');
        
        this.updateElement('totalCourses', allGrades.length);
        this.updateElement('anomalyCourses', anomalyGrades.length);
        this.updateElement('anomalyStudents', anomalyStudents.length);
        this.updateElement('pendingReviews', pendingReviews.length);
    },
    
    /**
     * 渲染异常课程列表
     */
    renderAnomalyCourses() {
        const container = document.getElementById('anomalyCourseList');
        if (!container) return;
        
        const anomalyGrades = GradesModule.getAnomalyGrades();
        
        if (anomalyGrades.length === 0) {
            container.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #6c757d;">暂无异常课程</td></tr>';
            return;
        }
        
        container.innerHTML = anomalyGrades.map(grade => `
            <tr>
                <td>${grade.courseName}</td>
                <td>${grade.teacherName}</td>
                <td>${grade.statistics.totalStudents}</td>
                <td>${grade.statistics.excellentRate}%</td>
                <td>${grade.statistics.passRate}%</td>
                <td>
                    <span class="status-badge ${this.getAnomalyTypeClass(grade.anomalyType)}">
                        ${this.getAnomalyTypeName(grade.anomalyType)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${this.getAuditStatusClass(grade.auditStatus)}">
                        ${this.getAuditStatusName(grade.auditStatus)}
                    </span>
                </td>
                <td>
                    <div class="audit-actions">
                        <button class="btn btn-sm btn-primary" onclick="GradeAuditModule.viewGradeDetail('${grade.id}')">查看详情</button>
                        <button class="btn btn-sm btn-warning" onclick="GradeAuditModule.startReview('${grade.id}')">开始审核</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * 渲染异常学生列表
     */
    renderAnomalyStudents() {
        const container = document.getElementById('anomalyStudentList');
        if (!container) return;
        
        const anomalyStudents = GradesModule.getAnomalyStudents();
        
        if (anomalyStudents.length === 0) {
            container.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #6c757d;">暂无异常学生</td></tr>';
            return;
        }
        
        container.innerHTML = anomalyStudents.map(student => `
            <tr>
                <td>${student.studentName}</td>
                <td>${student.studentId}</td>
                <td>${student.courseName}</td>
                <td>${student.currentScore}</td>
                <td>${student.historicalAverage}</td>
                <td>
                    <span class="status-badge ${student.fluctuationRate > 0 ? 'status-approved' : 'status-rejected'}">
                        ${student.fluctuationRate > 0 ? '+' : ''}${student.fluctuationRate}%
                    </span>
                </td>
                <td>
                    <span class="status-badge ${this.getAnomalyStudentStatusClass(student.status)}">
                        ${this.getAnomalyStudentStatusName(student.status)}
                    </span>
                </td>
                <td>
                    <div class="audit-actions">
                        <button class="btn btn-sm btn-info" onclick="GradeAuditModule.viewStudentHistory('${student.studentId}')">查看历史</button>
                        <button class="btn btn-sm btn-warning" onclick="GradeAuditModule.reviewStudent('${student.id}')">审核</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * 加载审核流程数据
     */
    loadReviewProcess() {
        this.renderPendingReviews();
        this.renderReviewHistory();
    },
    
    /**
     * 渲染待审核成绩列表
     */
    renderPendingReviews() {
        const container = document.getElementById('pendingReviewList');
        if (!container) return;
        
        const pendingGrades = GradesModule.getGradesByAuditStatus('pending');
        
        if (pendingGrades.length === 0) {
            container.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #6c757d;">暂无待审核成绩</td></tr>';
            return;
        }
        
        container.innerHTML = pendingGrades.map(grade => `
            <tr>
                <td>${grade.courseName}</td>
                <td>${grade.teacherName}</td>
                <td>${grade.statistics.totalStudents}</td>
                <td>${new Date(grade.submitTime).toLocaleString()}</td>
                <td>
                    <span class="status-badge ${this.getAuditStatusClass(grade.auditStatus)}">
                        ${this.getAuditStatusName(grade.auditStatus)}
                    </span>
                </td>
                <td>待分配</td>
                <td>
                    <div class="audit-actions">
                        <button class="btn btn-sm btn-primary" onclick="GradeAuditModule.startReview('${grade.id}')">开始审核</button>
                        <button class="btn btn-sm btn-info" onclick="GradeAuditModule.viewGradeDetail('${grade.id}')">查看详情</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * 渲染审核历史记录
     */
    renderReviewHistory() {
        const container = document.getElementById('reviewHistoryList');
        if (!container) return;
        
        const auditRecords = GradesModule.getAuditRecords();
        
        if (auditRecords.length === 0) {
            container.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #6c757d;">暂无审核记录</td></tr>';
            return;
        }
        
        container.innerHTML = auditRecords.map(record => `
            <tr>
                <td>${record.courseName}</td>
                <td>${record.reviewerName}</td>
                <td>${new Date(record.reviewTime).toLocaleString()}</td>
                <td>
                    <span class="status-badge ${this.getAuditResultClass(record.reviewResult)}">
                        ${this.getAuditResultName(record.reviewResult)}
                    </span>
                </td>
                <td>${record.reviewComment}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="GradeAuditModule.viewAuditDetail('${record.id}')">查看详情</button>
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * 加载成绩发布数据
     */
    loadGradePublishing() {
        this.updatePublishStatistics();
        this.renderPublishStatus();
        this.renderPublishHistory();
    },
    
    /**
     * 更新发布统计信息
     */
    updatePublishStatistics() {
        const allGrades = GradesModule.getAllGrades();
        const approvedGrades = GradesModule.getGradesByAuditStatus('approved');
        const publishedGrades = GradesModule.getGradesByPublishStatus('published');
        const pendingPublish = approvedGrades.filter(g => g.publishStatus !== 'published');
        
        this.updateElement('approvedGrades', approvedGrades.length);
        this.updateElement('publishedGrades', publishedGrades.length);
        this.updateElement('pendingPublish', pendingPublish.length);
        
        const publishRate = allGrades.length > 0 ? Math.round((publishedGrades.length / allGrades.length) * 100) : 0;
        this.updateElement('publishRate', publishRate + '%');
    },
    
    /**
     * 渲染发布状态列表
     */
    renderPublishStatus() {
        const container = document.getElementById('publishStatusList');
        if (!container) return;
        
        const allGrades = GradesModule.getAllGrades();
        
        if (allGrades.length === 0) {
            container.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #6c757d;">暂无成绩数据</td></tr>';
            return;
        }
        
        container.innerHTML = allGrades.map(grade => `
            <tr>
                <td>
                    <input type="checkbox" 
                           class="publish-checkbox" 
                           data-grade-id="${grade.id}"
                           ${grade.auditStatus === 'approved' && grade.publishStatus !== 'published' ? '' : 'disabled'}
                           onchange="GradeAuditModule.toggleGradeSelection('${grade.id}')">
                </td>
                <td>${grade.courseName}</td>
                <td>${grade.teacherName}</td>
                <td>${grade.statistics.totalStudents}</td>
                <td>
                    <span class="status-badge ${this.getAuditStatusClass(grade.auditStatus)}">
                        ${this.getAuditStatusName(grade.auditStatus)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${this.getPublishStatusClass(grade.publishStatus)}">
                        ${this.getPublishStatusName(grade.publishStatus)}
                    </span>
                </td>
                <td>${grade.publishTime ? new Date(grade.publishTime).toLocaleString() : '-'}</td>
                <td>
                    <div class="audit-actions">
                        ${grade.auditStatus === 'approved' && grade.publishStatus !== 'published' ? 
                            `<button class="btn btn-sm btn-success" onclick="GradeAuditModule.publishGrade('${grade.id}')">发布</button>` : ''}
                        ${grade.publishStatus === 'published' ? 
                            `<button class="btn btn-sm btn-warning" onclick="GradeAuditModule.withdrawGrade('${grade.id}')">撤回</button>` : ''}
                        <button class="btn btn-sm btn-info" onclick="GradeAuditModule.viewGradeDetail('${grade.id}')">查看详情</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * 渲染发布历史记录
     */
    renderPublishHistory() {
        const container = document.getElementById('publishHistoryList');
        if (!container) return;
        
        const publishRecords = GradesModule.getPublishRecords();
        
        if (publishRecords.length === 0) {
            container.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #6c757d;">暂无发布记录</td></tr>';
            return;
        }
        
        container.innerHTML = publishRecords.map(record => `
            <tr>
                <td>${record.courseName}</td>
                <td>${record.publisherName}</td>
                <td>${new Date(record.publishTime).toLocaleString()}</td>
                <td>
                    <span class="status-badge ${record.publishType === 'batch' ? 'status-approved' : 'status-pending'}">
                        ${record.publishType === 'batch' ? '批量发布' : '单个发布'}
                    </span>
                </td>
                <td>${record.affectedStudents}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="GradeAuditModule.viewPublishDetail('${record.id}')">查看详情</button>
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * 开始审核
     */
    startReview(gradeId) {
        this.currentReviewGradeId = gradeId;
        const grade = GradesModule.getGradeById(gradeId);
        
        if (!grade) {
            alert('成绩数据不存在');
            return;
        }
        
        // 填充审核表单
        document.getElementById('reviewCourseName').value = grade.courseName;
        document.getElementById('reviewTeacherName').value = grade.teacherName;
        document.getElementById('reviewStudentCount').value = grade.statistics.totalStudents;
        document.getElementById('reviewResult').value = '';
        document.getElementById('reviewComment').value = '';
        document.getElementById('nextReviewer').value = '';
        
        // 显示审核模态框
        document.getElementById('reviewModal').style.display = 'block';
    },
    
    /**
     * 提交审核
     */
    submitReview() {
        const result = document.getElementById('reviewResult').value;
        const comment = document.getElementById('reviewComment').value;
        const nextReviewer = document.getElementById('nextReviewer').value;
        
        if (!result || !comment) {
            alert('请填写完整的审核信息');
            return;
        }
        
        const currentUser = window.Auth && typeof Auth.getCurrentUser === 'function'
            ? Auth.getCurrentUser()
            : null;
        if (!currentUser) {
            alert('用户信息不存在，请重新登录');
            if (window.Auth && typeof Auth.logout === 'function') Auth.logout(true);
            return;
        }
        
        // 更新审核状态
        const success = GradesModule.updateAuditStatus(
            this.currentReviewGradeId,
            result,
            currentUser.id,
            currentUser.name,
            comment
        );
        
        if (success) {
            alert('审核提交成功');
            this.closeReviewModal();
            
            // 刷新当前页面数据
            if (this.currentSection === 'anomaly-monitoring') {
                this.loadAnomalyMonitoring();
            } else if (this.currentSection === 'review-process') {
                this.loadReviewProcess();
            } else if (this.currentSection === 'grade-publishing') {
                this.loadGradePublishing();
            }
        } else {
            alert('审核提交失败');
        }
    },
    
    /**
     * 关闭审核模态框
     */
    closeReviewModal() {
        document.getElementById('reviewModal').style.display = 'none';
        this.currentReviewGradeId = null;
    },
    
    /**
     * 查看成绩详情
     */
    viewGradeDetail(gradeId) {
        const grade = GradesModule.getGradeById(gradeId);
        if (!grade) {
            alert('成绩数据不存在');
            return;
        }
        
        // 更新详情统计
        document.getElementById('detailAvgScore').textContent = grade.statistics.averageScore;
        document.getElementById('detailMaxScore').textContent = grade.statistics.maxScore;
        document.getElementById('detailMinScore').textContent = grade.statistics.minScore;
        document.getElementById('detailPassRate').textContent = grade.statistics.passRate + '%';
        
        // 渲染学生成绩列表
        const container = document.getElementById('gradeDetailList');
        if (container) {
            container.innerHTML = grade.studentGrades.map(studentGrade => `
                <tr>
                    <td>${studentGrade.studentId}</td>
                    <td>${studentGrade.studentName}</td>
                    <td>${studentGrade.score}</td>
                    <td>${studentGrade.grade}</td>
                    <td>
                        <span class="status-badge ${this.getGradeStatusClass(studentGrade.status)}">
                            ${this.getGradeStatusName(studentGrade.status)}
                        </span>
                    </td>
                </tr>
            `).join('');
        }
        
        // 绘制成绩分布图
        this.drawGradeDistributionChart(grade.studentGrades);
        
        // 显示详情模态框
        document.getElementById('gradeDetailModal').style.display = 'block';
    },
    
    /**
     * 关闭成绩详情模态框
     */
    closeGradeDetailModal() {
        document.getElementById('gradeDetailModal').style.display = 'none';
    },
    
    /**
     * 发布成绩
     */
    publishGrade(gradeId) {
        if (!confirm('确定要发布这个成绩吗？发布后学生将可以查看。')) {
            return;
        }
        
        const currentUser = window.Auth && typeof Auth.getCurrentUser === 'function'
            ? Auth.getCurrentUser()
            : null;
        if (!currentUser) {
            alert('用户信息不存在，请重新登录');
            if (window.Auth && typeof Auth.logout === 'function') Auth.logout(true);
            return;
        }
        
        const success = GradesModule.updatePublishStatus(
            gradeId,
            'published',
            currentUser.id,
            currentUser.name
        );
        
        if (success) {
            alert('成绩发布成功');
            this.loadGradePublishing();
        } else {
            alert('成绩发布失败');
        }
    },
    
    /**
     * 撤回成绩
     */
    withdrawGrade(gradeId) {
        if (!confirm('确定要撤回这个成绩吗？撤回后学生将无法查看。')) {
            return;
        }
        
        const currentUser = window.Auth && typeof Auth.getCurrentUser === 'function'
            ? Auth.getCurrentUser()
            : null;
        if (!currentUser) {
            alert('用户信息不存在，请重新登录');
            if (window.Auth && typeof Auth.logout === 'function') Auth.logout(true);
            return;
        }
        
        const success = GradesModule.updatePublishStatus(
            gradeId,
            'unpublished',
            currentUser.id,
            currentUser.name
        );
        
        if (success) {
            alert('成绩撤回成功');
            this.loadGradePublishing();
        } else {
            alert('成绩撤回失败');
        }
    },
    
    /**
     * 批量发布
     */
    batchPublish() {
        if (this.selectedPublishGrades.size === 0) {
            alert('请选择要发布的成绩');
            return;
        }
        
        if (!confirm(`确定要发布选中的 ${this.selectedPublishGrades.size} 个成绩吗？`)) {
            return;
        }
        
        const currentUser = window.Auth && typeof Auth.getCurrentUser === 'function'
            ? Auth.getCurrentUser()
            : null;
        if (!currentUser) {
            alert('用户信息不存在，请重新登录');
            if (window.Auth && typeof Auth.logout === 'function') Auth.logout(true);
            return;
        }
        
        const gradeIds = Array.from(this.selectedPublishGrades);
        const results = GradesModule.batchPublishGrades(
            gradeIds,
            currentUser.id,
            currentUser.name
        );
        
        if (results.success.length > 0) {
            alert(`成功发布 ${results.success.length} 个成绩${results.failed.length > 0 ? `，失败 ${results.failed.length} 个` : ''}`);
            this.selectedPublishGrades.clear();
            this.loadGradePublishing();
        } else {
            alert('批量发布失败');
        }
    },
    
    /**
     * 批量撤回
     */
    batchWithdraw() {
        alert('批量撤回功能开发中...');
    },
    
    /**
     * 切换成绩选择状态
     */
    toggleGradeSelection(gradeId) {
        if (this.selectedPublishGrades.has(gradeId)) {
            this.selectedPublishGrades.delete(gradeId);
        } else {
            this.selectedPublishGrades.add(gradeId);
        }
    },
    
    /**
     * 全选/取消全选
     */
    toggleSelectAll() {
        const selectAll = document.getElementById('selectAllPublish');
        const checkboxes = document.querySelectorAll('.publish-checkbox:not(:disabled)');
        
        checkboxes.forEach(checkbox => {
            const gradeId = checkbox.dataset.gradeId;
            checkbox.checked = selectAll.checked;
            
            if (selectAll.checked) {
                this.selectedPublishGrades.add(gradeId);
            } else {
                this.selectedPublishGrades.delete(gradeId);
            }
        });
    },
    
    /**
     * 筛选异常
     */
    filterAnomalies() {
        const courseName = document.getElementById('courseNameFilter').value.toLowerCase();
        const anomalyType = document.getElementById('anomalyTypeFilter').value;
        
        const anomalyGrades = GradesModule.getAnomalyGrades();
        const filteredGrades = anomalyGrades.filter(grade => {
            const nameMatch = !courseName || grade.courseName.toLowerCase().includes(courseName);
            const typeMatch = !anomalyType || grade.anomalyType === anomalyType;
            return nameMatch && typeMatch;
        });
        
        // 重新渲染筛选后的结果
        const container = document.getElementById('anomalyCourseList');
        if (filteredGrades.length === 0) {
            container.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #6c757d;">没有找到符合条件的异常课程</td></tr>';
            return;
        }
        
        container.innerHTML = filteredGrades.map(grade => `
            <tr>
                <td>${grade.courseName}</td>
                <td>${grade.teacherName}</td>
                <td>${grade.statistics.totalStudents}</td>
                <td>${grade.statistics.excellentRate}%</td>
                <td>${grade.statistics.passRate}%</td>
                <td>
                    <span class="status-badge ${this.getAnomalyTypeClass(grade.anomalyType)}">
                        ${this.getAnomalyTypeName(grade.anomalyType)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${this.getAuditStatusClass(grade.auditStatus)}">
                        ${this.getAuditStatusName(grade.auditStatus)}
                    </span>
                </td>
                <td>
                    <div class="audit-actions">
                        <button class="btn btn-sm btn-primary" onclick="GradeAuditModule.viewGradeDetail('${grade.id}')">查看详情</button>
                        <button class="btn btn-sm btn-warning" onclick="GradeAuditModule.startReview('${grade.id}')">开始审核</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * 筛选审核记录
     */
    filterReviews() {
        alert('筛选功能开发中...');
    },
    
    /**
     * 初始化图表
     */
    initCharts() {
        // 这里可以集成Chart.js或其他图表库
        // 目前使用简单的Canvas绘制
    },
    
    /**
     * 渲染图表
     */
    renderCharts() {
        this.drawCourseDistributionChart();
        this.drawAnomalyTrendChart();
    },
    
    /**
     * 绘制课程分布图
     */
    drawCourseDistributionChart() {
        const canvas = document.getElementById('courseChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const grades = GradesModule.getAllGrades();
        
        // 简单的柱状图绘制
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const data = grades.map(grade => ({
            name: grade.courseName,
            excellentRate: grade.statistics.excellentRate,
            passRate: grade.statistics.passRate
        }));
        
        // 绘制坐标轴
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 20);
        ctx.lineTo(40, 260);
        ctx.lineTo(380, 260);
        ctx.stroke();
        
        // 绘制数据
        const barWidth = 60;
        const spacing = 20;
        let x = 60;
        
        data.forEach((item, index) => {
            // 优秀率柱子
            const excellentHeight = (item.excellentRate / 100) * 200;
            ctx.fillStyle = '#28a745';
            ctx.fillRect(x, 260 - excellentHeight, barWidth / 2 - 2, excellentHeight);
            
            // 及格率柱子
            const passHeight = (item.passRate / 100) * 200;
            ctx.fillStyle = '#007bff';
            ctx.fillRect(x + barWidth / 2 + 2, 260 - passHeight, barWidth / 2 - 2, passHeight);
            
            // 标签
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.name.substring(0, 6), x + barWidth / 2, 275);
            
            x += barWidth + spacing;
        });
        
        // 图例
        ctx.fillStyle = '#28a745';
        ctx.fillRect(300, 10, 15, 10);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('优秀率', 320, 19);
        
        ctx.fillStyle = '#007bff';
        ctx.fillRect(300, 25, 15, 10);
        ctx.fillStyle = '#333';
        ctx.fillText('及格率', 320, 34);
    },
    
    /**
     * 绘制异常趋势图
     */
    drawAnomalyTrendChart() {
        const canvas = document.getElementById('trendChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 模拟趋势数据
        const trendData = [
            { month: '1月', count: 2 },
            { month: '2月', count: 3 },
            { month: '3月', count: 1 },
            { month: '4月', count: 4 },
            { month: '5月', count: 2 },
            { month: '6月', count: 3 }
        ];
        
        // 绘制坐标轴
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 20);
        ctx.lineTo(40, 260);
        ctx.lineTo(380, 260);
        ctx.stroke();
        
        // 绘制折线图
        ctx.strokeStyle = '#dc3545';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const xStep = 320 / (trendData.length - 1);
        trendData.forEach((item, index) => {
            const x = 40 + index * xStep;
            const y = 260 - (item.count / 5) * 200;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // 绘制数据点
            ctx.fillStyle = '#dc3545';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // 标签
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.month, x, 275);
            ctx.fillText(item.count, x, y - 10);
        });
        
        ctx.stroke();
    },
    
    /**
     * 绘制成绩分布图
     */
    drawGradeDistributionChart(studentGrades) {
        const canvas = document.getElementById('gradeDetailChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 统计各分数段人数
        const ranges = [
            { label: '90-100', min: 90, max: 100, color: '#28a745' },
            { label: '80-89', min: 80, max: 89, color: '#007bff' },
            { label: '70-79', min: 70, max: 79, color: '#ffc107' },
            { label: '60-69', min: 60, max: 69, color: '#fd7e14' },
            { label: '0-59', min: 0, max: 59, color: '#dc3545' }
        ];
        
        const distribution = ranges.map(range => ({
            ...range,
            count: studentGrades.filter(sg => sg.score >= range.min && sg.score <= range.max).length
        }));
        
        // 绘制饼图
        const centerX = 300;
        const centerY = 200;
        const radius = 120;
        const total = studentGrades.length;
        
        let currentAngle = -Math.PI / 2;
        
        distribution.forEach(item => {
            if (item.count === 0) return;
            
            const sliceAngle = (item.count / total) * 2 * Math.PI;
            
            // 绘制扇形
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            // 绘制标签
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
            
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${item.label}: ${item.count}人`, labelX, labelY);
            
            currentAngle += sliceAngle;
        });
    },
    
    // 辅助方法
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    },
    
    getAnomalyTypeClass(type) {
        const classes = {
            'high_excellent': 'status-approved',
            'low_pass': 'status-rejected',
            'grade_fluctuation': 'status-pending'
        };
        return classes[type] || 'status-pending';
    },
    
    getAnomalyTypeName(type) {
        const names = {
            'high_excellent': '优秀率过高',
            'low_pass': '及格率过低',
            'grade_fluctuation': '成绩波动'
        };
        return names[type] || '未知异常';
    },
    
    getAuditStatusClass(status) {
        const classes = {
            'pending': 'status-pending',
            'approved': 'status-approved',
            'rejected': 'status-rejected',
            'need_revision': 'status-pending'
        };
        return classes[status] || 'status-pending';
    },
    
    getAuditStatusName(status) {
        const names = {
            'pending': '待审核',
            'approved': '已通过',
            'rejected': '已拒绝',
            'need_revision': '需修改'
        };
        return names[status] || '未知';
    },
    
    getAuditResultClass(result) {
        const classes = {
            'approved': 'status-approved',
            'rejected': 'status-rejected',
            'need_revision': 'status-pending'
        };
        return classes[result] || 'status-pending';
    },
    
    getAuditResultName(result) {
        const names = {
            'approved': '通过',
            'rejected': '拒绝',
            'need_revision': '需修改'
        };
        return names[result] || '未知';
    },
    
    getPublishStatusClass(status) {
        const classes = {
            'published': 'status-published',
            'unpublished': 'status-pending'
        };
        return classes[status] || 'status-pending';
    },
    
    getPublishStatusName(status) {
        const names = {
            'published': '已发布',
            'unpublished': '未发布'
        };
        return names[status] || '未知';
    },
    
    getGradeStatusClass(status) {
        const classes = {
            'published': 'status-published',
            'approved': 'status-approved',
            'pending': 'status-pending'
        };
        return classes[status] || 'status-pending';
    },
    
    getGradeStatusName(status) {
        const names = {
            'published': '已发布',
            'approved': '已审核',
            'pending': '待审核'
        };
        return names[status] || '未知';
    },
    
    getAnomalyStudentStatusClass(status) {
        const classes = {
            'pending': 'status-pending',
            'reviewed': 'status-approved',
            'resolved': 'status-published'
        };
        return classes[status] || 'status-pending';
    },
    
    getAnomalyStudentStatusName(status) {
        const names = {
            'pending': '待处理',
            'reviewed': '已审核',
            'resolved': '已解决'
        };
        return names[status] || '未知';
    },
    
    viewStudentHistory(studentId) {
        alert('查看学生历史成绩功能开发中...');
    },
    
    reviewStudent(anomalyId) {
        alert('审核学生异常功能开发中...');
    },
    
    viewAuditDetail(auditId) {
        alert('查看审核详情功能开发中...');
    },
    
    viewPublishDetail(publishId) {
        alert('查看发布详情功能开发中...');
    }
};

// 页面加载完成后初始化
 document.addEventListener('DOMContentLoaded', () => {
    if (window.Auth && !Auth.enforcePageAccess(['admin'])) {
        return;
    }
    GradeAuditModule.init();
});