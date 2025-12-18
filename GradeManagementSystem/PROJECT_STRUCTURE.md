# GradeManagementSystem 项目目录结构说明

## 项目概述

GradeManagementSystem 是一个纯前端成绩管理系统，使用 HTML5、CSS3 和原生 JavaScript 技术栈开发，不依赖任何前端框架。项目采用模块化设计。

## 完整目录结构

```
GradeManagementSystem/
├── index.html                      # 登录页入口
├── public/                         # 静态资源文件夹
│   ├── images/                    # 图片资源
│   │   ├── logo.png               # 网站Logo
│   │   ├── favicon.ico            # 网站图标
│   │   ├── background.jpg         # 背景图片
│   │   └── icons/                 # 图标文件夹
│   │       ├── user.svg
│   │       ├── grade.svg
│   │       └── dashboard.svg
│   └── fonts/                     # 字体文件
│       ├── inter-regular.woff2
│       └── inter-bold.woff2
├── css/                           # 样式文件夹
│   ├── base.css                   # 全局重置和CSS变量
│   ├── layout.css                 # 布局样式
│   └── modules/                   # 模块样式文件夹
│       ├── login.css              # 登录页面样式
│       ├── dashboard.css          # 仪表板样式
│       ├── student.css            # 学生管理样式
│       ├── grade.css              # 成绩管理样式
│       ├── common.css             # 通用组件样式
│       └── responsive.css         # 响应式样式
├── js/                            # JavaScript文件夹
│   ├── utils.js                   # 工具函数库
│   ├── data/                      # 模拟数据文件夹
│   │   ├── users.js               # 用户数据
│   │   ├── students.js            # 学生数据
│   │   ├── grades.js              # 成绩数据
│   │   └── courses.js             # 课程数据
│   ├── pages/                     # 页面逻辑文件夹
│   │   ├── login.js               # 登录页面逻辑
│   │   ├── dashboard.js           # 仪表板页面逻辑
│   │   ├── student.js             # 学生管理页面逻辑
│   │   └── grade.js               # 成绩管理页面逻辑
│   ├── components/                # 组件文件夹
│   │   ├── modal.js               # 模态框组件
│   │   ├── table.js               # 表格组件
│   │   ├── form.js                # 表单组件
│   │   └── pagination.js          # 分页组件
│   └── services/                  # 服务层文件夹
│       ├── auth.js                # 认证服务
│       ├── student.js              # 学生服务
│       └── grade.js               # 成绩服务
└── pages/                         # HTML页面文件夹
    ├── dashboard.html             # 仪表板页面
    ├── student.html               # 学生管理页面
    └── grade.html                 # 成绩管理页面
```

## 目录详细说明

### 1. 根目录文件

- **index.html** - 登录页面入口，包含登录表单和基础页面结构

### 2. 静态资源 (public/)

- **images/** - 存放所有图片资源
  - **icons/** - SVG图标文件夹，便于样式控制
- **fonts/** - 存放自定义字体文件，支持现代字体格式

### 3. 样式文件 (css/)

- **base.css** - 全局CSS重置、CSS变量定义、基础样式和动画
- **layout.css** - 页面布局相关样式（网格、弹性盒、响应式布局）
- **modules/** - 按功能模块划分的样式文件
  - **responsive.css** - 专门处理响应式布局的样式

### 4. JavaScript文件 (js/)

- **utils.js** - 通用工具函数（数据验证、格式化、日期处理、HTTP请求封装）
- **data/** - 模拟数据文件，用于开发阶段的数据模拟
- **pages/** - 各页面的业务逻辑代码，职责分离清晰
- **components/** - 可复用的UI组件逻辑，提高代码复用性
- **services/** - 服务层，处理业务逻辑和数据操作

### 5. 页面文件 (pages/)

- 除登录页外的其他页面HTML文件，便于模块化管理

## 技术特点

### 模块化设计
- 样式和逻辑按功能模块划分
- 每个模块独立，便于维护和扩展
- 支持多人并行开发

### 响应式布局
- 支持桌面端和移动端
- 使用CSS Grid和Flexbox布局
- 渐进式增强设计

### 原生JavaScript
- 不依赖任何框架
- 使用现代ES6+语法
- 模块化组织代码

## 协作开发分工

### 开发者A - 登录模块和仪表板
- `css/modules/login.css`, `css/modules/dashboard.css`
- `js/pages/login.js`, `js/pages/dashboard.js`
- `index.html`, `pages/dashboard.html`

### 开发者B - 学生管理模块
- `css/modules/student.css`
- `js/pages/student.js`, `js/services/student.js`
- `pages/student.html`

### 开发者C - 成绩管理模块
- `css/modules/grade.css`
- `js/pages/grade.js`, `js/services/grade.js`
- `pages/grade.html`

## 路径使用规范

所有文件路径使用相对路径：
- CSS引用：`../css/base.css`
- JS引用：`./js/utils.js`
- 图片引用：`../public/images/logo.png`

## 开发规范

### 代码风格
- 使用一致的命名规范（camelCase）
- 添加必要的注释说明
- 遵循语义化HTML结构

### 性能优化
- 图片资源优化
- CSS和JS文件压缩
- 懒加载实现

### 浏览器兼容性
- 支持现代浏览器（Chrome、Firefox、Safari、Edge）
- 渐进式降级策略

## 部署说明

项目可直接部署到任何静态文件服务器，无需后端支持。所有数据存储在浏览器的localStorage中，适合演示和教学使用。

---

*文档最后更新：2024年12月17日*