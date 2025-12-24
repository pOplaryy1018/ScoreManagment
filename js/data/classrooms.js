/**
 * 教室数据文件
 * 包含教室基本信息和使用状态
 */

(function() {
    'use strict';

    // 教室数据
    const classroomsData = [
        {
            id: 'A101',
            name: 'A栋101教室',
            building: 'A',
            floor: '1',
            type: 'lecture',
            capacity: 120,
            hasProjector: true,
            hasComputer: false,
            hasMicrophone: true,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 40,
            equipment: ['投影仪', '麦克风', '空调'],
            description: '大型阶梯教室，适合上大课'
        },
        {
            id: 'A102',
            name: 'A栋102教室',
            building: 'A',
            floor: '1',
            type: 'lecture',
            capacity: 100,
            hasProjector: true,
            hasComputer: false,
            hasMicrophone: true,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 40,
            equipment: ['投影仪', '麦克风', '空调'],
            description: '中型阶梯教室'
        },
        {
            id: 'A201',
            name: 'A栋201教室',
            building: 'A',
            floor: '2',
            type: 'regular',
            capacity: 60,
            hasProjector: true,
            hasComputer: true,
            hasMicrophone: false,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 40,
            equipment: ['投影仪', '电脑', '空调'],
            description: '标准多媒体教室'
        },
        {
            id: 'A202',
            name: 'A栋202教室',
            building: 'A',
            floor: '2',
            type: 'regular',
            capacity: 60,
            hasProjector: true,
            hasComputer: true,
            hasMicrophone: false,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 40,
            equipment: ['投影仪', '电脑', '空调'],
            description: '标准多媒体教室'
        },
        {
            id: 'B201',
            name: 'B栋201实验室',
            building: 'B',
            floor: '2',
            type: 'lab',
            capacity: 40,
            hasProjector: true,
            hasComputer: true,
            hasMicrophone: false,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 35,
            equipment: ['投影仪', '电脑', '空调', '实验设备'],
            description: '计算机实验室，配备40台电脑'
        },
        {
            id: 'B202',
            name: 'B栋202实验室',
            building: 'B',
            floor: '2',
            type: 'lab',
            capacity: 40,
            hasProjector: true,
            hasComputer: true,
            hasMicrophone: false,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 35,
            equipment: ['投影仪', '电脑', '空调', '实验设备'],
            description: '计算机实验室'
        },
        {
            id: 'B301',
            name: 'B栋301实验室',
            building: 'B',
            floor: '3',
            type: 'lab',
            capacity: 30,
            hasProjector: true,
            hasComputer: true,
            hasMicrophone: false,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 35,
            equipment: ['投影仪', '电脑', '空调', '专业实验设备'],
            description: '专业实验室'
        },
        {
            id: 'C101',
            name: 'C栋101教室',
            building: 'C',
            floor: '1',
            type: 'regular',
            capacity: 50,
            hasProjector: true,
            hasComputer: false,
            hasMicrophone: false,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 40,
            equipment: ['投影仪', '空调'],
            description: '普通教室'
        },
        {
            id: 'C102',
            name: 'C栋102教室',
            building: 'C',
            floor: '1',
            type: 'regular',
            capacity: 50,
            hasProjector: true,
            hasComputer: false,
            hasMicrophone: false,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 40,
            equipment: ['投影仪', '空调'],
            description: '普通教室'
        },
        {
            id: 'C201',
            name: 'C栋201教室',
            building: 'C',
            floor: '2',
            type: 'regular',
            capacity: 40,
            hasProjector: true,
            hasComputer: false,
            hasMicrophone: false,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 40,
            equipment: ['投影仪', '空调'],
            description: '小型教室'
        },
        {
            id: 'D101',
            name: 'D栋101教室',
            building: 'D',
            floor: '1',
            type: 'lecture',
            capacity: 80,
            hasProjector: true,
            hasComputer: false,
            hasMicrophone: true,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 40,
            equipment: ['投影仪', '麦克风', '空调'],
            description: '中型阶梯教室'
        },
        {
            id: 'D201',
            name: 'D栋201教室',
            building: 'D',
            floor: '2',
            type: 'regular',
            capacity: 45,
            hasProjector: true,
            hasComputer: true,
            hasMicrophone: false,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 40,
            equipment: ['投影仪', '电脑', '空调'],
            description: '多媒体教室'
        },
        {
            id: 'D202',
            name: 'D栋202教室',
            building: 'D',
            floor: '2',
            type: 'regular',
            capacity: 45,
            hasProjector: true,
            hasComputer: true,
            hasMicrophone: false,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 40,
            equipment: ['投影仪', '电脑', '空调'],
            description: '多媒体教室'
        },
        {
            id: 'E101',
            name: 'E栋101语音室',
            building: 'E',
            floor: '1',
            type: 'lab',
            capacity: 35,
            hasProjector: true,
            hasComputer: true,
            hasMicrophone: true,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 35,
            equipment: ['投影仪', '电脑', '空调', '语音设备'],
            description: '语音实验室'
        },
        {
            id: 'E201',
            name: 'E栋201绘画室',
            building: 'E',
            floor: '2',
            type: 'lab',
            capacity: 25,
            hasProjector: false,
            hasComputer: false,
            hasMicrophone: false,
            hasAirConditioner: true,
            status: 'available',
            currentUsage: 0,
            maxUsage: 30,
            equipment: ['空调', '绘画设备'],
            description: '艺术绘画室'
        }
    ];

    // 教室数据管理模块
    const ClassroomsModule = {
        /**
         * 获取所有教室数据
         */
        getAllClassrooms() {
            return classroomsData;
        },

        /**
         * 根据教室ID获取教室信息
         */
        getClassroomById(classroomId) {
            return classroomsData.find(classroom => classroom.id === classroomId);
        },

        /**
         * 根据教学楼获取教室列表
         */
        getClassroomsByBuilding(building) {
            return classroomsData.filter(classroom => classroom.building === building);
        },

        /**
         * 根据类型获取教室列表
         */
        getClassroomsByType(type) {
            return classroomsData.filter(classroom => classroom.type === type);
        },

        /**
         * 根据容量范围获取教室列表
         */
        getClassroomsByCapacity(minCapacity, maxCapacity) {
            return classroomsData.filter(classroom => 
                classroom.capacity >= minCapacity && classroom.capacity <= maxCapacity
            );
        },

        /**
         * 搜索教室
         */
        searchClassrooms(keyword) {
            const lowerKeyword = keyword.toLowerCase();
            return classroomsData.filter(classroom => 
                classroom.id.toLowerCase().includes(lowerKeyword) ||
                classroom.name.toLowerCase().includes(lowerKeyword) ||
                classroom.building.toLowerCase().includes(lowerKeyword) ||
                classroom.type.toLowerCase().includes(lowerKeyword) ||
                classroom.description.toLowerCase().includes(lowerKeyword)
            );
        },

        /**
         * 获取可用教室
         */
        getAvailableClassrooms(timeSlot, dayOfWeek, requiredCapacity = 0) {
            return classroomsData.filter(classroom => {
                // 检查教室状态
                if (classroom.status !== 'available') return false;
                
                // 检查容量
                if (requiredCapacity > 0 && classroom.capacity < requiredCapacity) return false;
                
                // 检查使用率
                if (classroom.currentUsage >= classroom.maxUsage) return false;
                
                // 这里应该检查时间冲突
                // 暂时返回所有可用教室
                return true;
            });
        },

        /**
         * 获取推荐教室
         */
        getRecommendedClassrooms(requirements) {
            const {
                capacity = 0,
                type = null,
                building = null,
                equipment = [],
                timeSlot = null,
                dayOfWeek = null
            } = requirements;

            let recommended = classroomsData.filter(classroom => {
                // 基本条件检查
                if (classroom.status !== 'available') return false;
                if (capacity > 0 && classroom.capacity < capacity) return false;
                if (type && classroom.type !== type) return false;
                if (building && classroom.building !== building) return false;
                
                // 设备检查
                if (equipment.length > 0) {
                    const hasAllEquipment = equipment.every(eq => 
                        classroom.equipment.includes(eq) || 
                        (eq === '投影仪' && classroom.hasProjector) ||
                        (eq === '电脑' && classroom.hasComputer) ||
                        (eq === '麦克风' && classroom.hasMicrophone) ||
                        (eq === '空调' && classroom.hasAirConditioner)
                    );
                    if (!hasAllEquipment) return false;
                }
                
                return true;
            });

            // 按匹配度排序
            recommended.sort((a, b) => {
                // 优先选择容量最接近的
                const aCapacityDiff = Math.abs(a.capacity - capacity);
                const bCapacityDiff = Math.abs(b.capacity - capacity);
                
                if (aCapacityDiff !== bCapacityDiff) {
                    return aCapacityDiff - bCapacityDiff;
                }
                
                // 然后按使用率排序
                return a.currentUsage - b.currentUsage;
            });

            return recommended.slice(0, 5); // 返回前5个推荐
        },

        /**
         * 获取教学楼统计信息
         */
        getBuildingStatistics() {
            const stats = {};
            classroomsData.forEach(classroom => {
                if (!stats[classroom.building]) {
                    stats[classroom.building] = {
                        total: 0,
                        lecture: 0,
                        lab: 0,
                        regular: 0,
                        totalCapacity: 0,
                        available: 0,
                        totalUsage: 0
                    };
                }
                
                stats[classroom.building].total++;
                stats[classroom.building][classroom.type]++;
                stats[classroom.building].totalCapacity += classroom.capacity;
                
                if (classroom.status === 'available') {
                    stats[classroom.building].available++;
                }
                
                stats[classroom.building].totalUsage += classroom.currentUsage;
            });

            // 计算平均使用率
            Object.keys(stats).forEach(building => {
                const buildingClassrooms = this.getClassroomsByBuilding(building);
                const maxTotalUsage = buildingClassrooms.reduce((sum, room) => sum + room.maxUsage, 0);
                stats[building].utilizationRate = maxTotalUsage > 0 ? 
                    Math.round((stats[building].totalUsage / maxTotalUsage) * 100) : 0;
            });

            return stats;
        },

        /**
         * 获取教室类型统计
         */
        getTypeStatistics() {
            const stats = {
                total: classroomsData.length,
                lecture: { count: 0, capacity: 0, available: 0 },
                lab: { count: 0, capacity: 0, available: 0 },
                regular: { count: 0, capacity: 0, available: 0 }
            };

            classroomsData.forEach(classroom => {
                stats[classroom.type].count++;
                stats[classroom.type].capacity += classroom.capacity;
                if (classroom.status === 'available') {
                    stats[classroom.type].available++;
                }
            });

            return stats;
        },

        /**
         * 获取使用率统计
         */
        getUsageStatistics() {
            const stats = {
                total: classroomsData.length,
                available: 0,
                inUse: 0,
                maintenance: 0,
                averageUsage: 0,
                highUsage: 0,
                lowUsage: 0
            };

            let totalUsage = 0;
            let totalMaxUsage = 0;

            classroomsData.forEach(classroom => {
                if (classroom.status === 'available') {
                    stats.available++;
                } else if (classroom.status === 'inUse') {
                    stats.inUse++;
                } else if (classroom.status === 'maintenance') {
                    stats.maintenance++;
                }

                totalUsage += classroom.currentUsage;
                totalMaxUsage += classroom.maxUsage;

                const usageRate = (classroom.currentUsage / classroom.maxUsage) * 100;
                if (usageRate >= 80) {
                    stats.highUsage++;
                } else if (usageRate <= 30) {
                    stats.lowUsage++;
                }
            });

            stats.averageUsage = totalMaxUsage > 0 ? 
                Math.round((totalUsage / totalMaxUsage) * 100) : 0;

            return stats;
        },

        /**
         * 添加新教室
         */
        addClassroom(classroom) {
            classroomsData.push({
                ...classroom,
                status: 'available',
                currentUsage: 0,
                equipment: classroom.equipment || []
            });
            return true;
        },

        /**
         * 更新教室信息
         */
        updateClassroom(classroomId, updates) {
            const index = classroomsData.findIndex(classroom => classroom.id === classroomId);
            if (index !== -1) {
                classroomsData[index] = { ...classroomsData[index], ...updates };
                return true;
            }
            return false;
        },

        /**
         * 删除教室
         */
        deleteClassroom(classroomId) {
            const index = classroomsData.findIndex(classroom => classroom.id === classroomId);
            if (index !== -1) {
                classroomsData.splice(index, 1);
                return true;
            }
            return false;
        },

        /**
         * 检查教室时间冲突
         */
        checkTimeConflict(classroomId, timeSlot, dayOfWeek) {
            // 这里应该检查教室的使用时间表
            // 暂时返回无冲突
            return { hasConflict: false };
        },

        /**
         * 预订教室
         */
        bookClassroom(classroomId, timeSlot, dayOfWeek, courseInfo) {
            const classroom = this.getClassroomById(classroomId);
            if (!classroom) {
                return { success: false, error: '教室不存在' };
            }

            if (classroom.status !== 'available') {
                return { success: false, error: '教室不可用' };
            }

            // 检查时间冲突
            const conflict = this.checkTimeConflict(classroomId, timeSlot, dayOfWeek);
            if (conflict.hasConflict) {
                return { success: false, error: '时间冲突' };
            }

            // 增加使用率
            classroom.currentUsage += 1;

            // 这里应该保存预订信息
            return { success: true };
        },

        /**
         * 取消教室预订
         */
        cancelBooking(classroomId, timeSlot, dayOfWeek) {
            const classroom = this.getClassroomById(classroomId);
            if (!classroom) {
                return { success: false, error: '教室不存在' };
            }

            // 减少使用率
            classroom.currentUsage = Math.max(0, classroom.currentUsage - 1);

            // 这里应该删除预订信息
            return { success: true };
        },

        /**
         * 获取教室使用时间表
         */
        getClassroomTimetable(classroomId) {
            const classroom = this.getClassroomById(classroomId);
            if (!classroom) return null;

            // 这里应该从预订数据中获取
            // 暂时返回模拟数据
            return {
                classroomId: classroomId,
                classroomName: classroom.name,
                semester: '2024-1',
                timetable: []
            };
        }
    };

    // 全局暴露
    window.ClassroomsModule = ClassroomsModule;

})();