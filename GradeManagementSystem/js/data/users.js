// 用户数据模拟
const users = [
    {
        id: 'user_001',
        username: 'admin',
        password: 'admin123',
        name: '系统管理员',
        email: 'admin@grademanagement.com',
        role: 'admin',
        avatar: '../public/images/icons/user.svg',
        lastLogin: '2024-12-17 10:30:00',
        status: 'active'
    },
    {
        id: 'user_002',
        username: 'teaching_admin',
        password: 'teaching123',
        name: '教学管理员',
        email: 'teaching@grademanagement.com',
        role: 'teaching_admin',
        avatar: '../public/images/icons/user.svg',
        lastLogin: '2024-12-17 11:00:00',
        status: 'active'
    },
    {
        id: 'user_003',
        username: 'teacher1',
        password: 'teacher123',
        name: '张老师',
        email: 'zhang@grademanagement.com',
        role: 'teacher',
        avatar: '../public/images/icons/user.svg',
        lastLogin: '2024-12-16 15:20:00',
        status: 'active'
    },
    {
        id: 'user_004',
        username: 'teacher2',
        password: 'teacher123',
        name: '李老师',
        email: 'li@grademanagement.com',
        role: 'teacher',
        avatar: '../public/images/icons/user.svg',
        lastLogin: '2024-12-15 09:10:00',
        status: 'active'
    },
    {
        id: 'user_005',
        username: 'student1',
        password: 'student123',
        name: '王同学',
        email: 'wang@grademanagement.com',
        role: 'student',
        avatar: '../public/images/icons/user.svg',
        lastLogin: '2024-12-17 14:45:00',
        status: 'active'
    }
];

// 用户数据操作函数
const userService = {
    /**
     * 根据用户名和密码验证用户
     * @param {string} username 用户名
     * @param {string} password 密码
     * @returns {object|null} 用户信息或null
     */
    authenticate: function(username, password) {
        return users.find(user => 
            user.username === username && 
            user.password === password && 
            user.status === 'active'
        ) || null;
    },

    /**
     * 根据ID获取用户信息
     * @param {string} userId 用户ID
     * @returns {object|null} 用户信息或null
     */
    getUserById: function(userId) {
        return users.find(user => user.id === userId) || null;
    },

    /**
     * 获取所有用户
     * @returns {array} 用户列表
     */
    getAllUsers: function() {
        return users.filter(user => user.status === 'active');
    },

    /**
     * 根据角色获取用户
     * @param {string} role 角色
     * @returns {array} 用户列表
     */
    getUsersByRole: function(role) {
        return users.filter(user => user.role === role && user.status === 'active');
    },

    /**
     * 添加新用户
     * @param {object} userData 用户数据
     * @returns {object} 新用户信息
     */
    addUser: function(userData) {
        const newUser = {
            id: 'user_' + Date.now(),
            username: userData.username,
            password: userData.password,
            name: userData.name,
            email: userData.email,
            role: userData.role || 'student',
            avatar: '../public/images/icons/user.svg',
            lastLogin: null,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        return newUser;
    },

    /**
     * 更新用户信息
     * @param {string} userId 用户ID
     * @param {object} updates 更新数据
     * @returns {object|null} 更新后的用户信息或null
     */
    updateUser: function(userId, updates) {
        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) return null;
        
        users[userIndex] = { ...users[userIndex], ...updates };
        return users[userIndex];
    },

    /**
     * 删除用户（软删除）
     * @param {string} userId 用户ID
     * @returns {boolean} 是否删除成功
     */
    deleteUser: function(userId) {
        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) return false;
        
        users[userIndex].status = 'deleted';
        return true;
    },

    /**
     * 检查用户名是否已存在
     * @param {string} username 用户名
     * @returns {boolean} 是否存在
     */
    isUsernameExists: function(username) {
        return users.some(user => user.username === username && user.status === 'active');
    },

    /**
     * 检查邮箱是否已存在
     * @param {string} email 邮箱
     * @returns {boolean} 是否存在
     */
    isEmailExists: function(email) {
        return users.some(user => user.email === email && user.status === 'active');
    }
};

// 导出用户数据和服务
window.UserData = {
    users,
    userService
};