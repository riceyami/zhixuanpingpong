# 智旋 (Zhuxuan) - 项目规范说明书 (SPEC)

## 1. 项目概述
**智旋** 是一款面向乒乓球爱好者的全方位服务平台。系统通过 AI 视觉技术分析用户上传的训练视频，提供专业的运动数据反馈，并结合社交与 LBS 功能，打造“训练-分析-展示-约球”的闭环生态。

### 核心功能
- **AI 训练分析**：视频轨迹识别、球速计算、落点统计。
- **数据可视化**：训练看板、3D 球路、成长报告。
- **社交互动**：社区发帖、排行榜、即时通讯。


---

## 2. 技术栈 (Tech Stack)

### 前端 (Frontend)
- **框架**: React 18 + Next.js 14 (App Router)
- **语言**: TypeScript 5.x
- **UI 组件库**: Ant Design 5 + Tailwind CSS 3
- **状态管理**: React Context / Zustand
- **可视化**: ECharts
- **构建工具**: Vite 5 / Turbopack

### 后端 (Backend)
- **业务服务**: Java 17 + Spring Boot 3.x
- **AI 算法服务**: Python 3.10 + FastAPI
- **AI 库**: OpenCV 4.8, TensorFlow 2.15, CUDA 11.8

### 基础设施 (Infrastructure)
- **数据库**: 
  - MySQL 8.0 (结构化业务数据)
  - MongoDB (非结构化分析结果、富文本)
  - Redis 7.0 (缓存、排行榜、实时消息)
- **存储**: 阿里云 OSS + CDN
- **协议**: RESTful API, WebSocket (WSS), HLS

---

## 3. 核心模块划分

### M1: 用户认证与权限 (Auth Module)
- **功能**: 手机号登录、JWT 鉴权、RBAC 权限（用户/教练/管理员）、器材配置。
- **规范**: 密码 BCrypt 加密，AccessToken (2h) + RefreshToken (30d)。

### M2: 视频上传与 AI 分析 (Video & AI Module)
- **功能**: 分片上传、断点续传、AI 轨迹提取、球速计算。
- **规范**: 
  - 单函数 ≤ 80 行。
  - AI 准确率目标 ≥ 85%。
  - 结果存储于 MongoDB。

### M3: 数据可视化 (Stats Module)
- **功能**: 训练 Dashboard、轨迹展示、PDF 报告导出。
- **规范**: ECharts 响应式适配，热点数据 Redis 缓存。

### M4: 社交互动 (Social Module)
- **功能**: 发帖、评论、点赞、排行榜、私信 (Socket.io)。
- **规范**: 虚拟滚动优化长列表，XSS 过滤。


---

## 4. 关键规范 (Guidelines)

### 命名规范
- **变量/函数**: `camelCase` (例如 `getUserInfo`, `isBallDetected`)
- **组件/类**: `PascalCase` (例如 `VideoPlayer`, `AuthService`)
- **常量**: `UPPER_SNAKE_CASE` (例如 `MAX_VIDEO_SIZE`)

### 核心定义
- **数据字典**: 详见 [DATA_DICTIONARY.md](file:///D:/下载/zhuxuan_code/DATA_DICTIONARY.md)
- **接口字典**: 详见 [API_DICTIONARY.md](file:///D:/下载/zhuxuan_code/API_DICTIONARY.md)

### 代码质量
- **单一职责**: 一个函数只做一件事。
- **行数限制**: 单函数原则上不超过 80 行。
- **注释**: 复杂逻辑必须包含 JSDoc/Docstring。

### 接口规范
- **通用返回格式**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {},
    "timestamp": 1672531200000
  }
  ```

---

## 5. 开发路线图 (Roadmap)
- **Phase 1**: 基础环境搭建、用户认证系统。
- **Phase 2**: 视频上传逻辑、AI 分析算法集成。
- **Phase 3**: 数据看板渲染、轨迹可视化。
- **Phase 4**: 社区功能
- **Phase 5**: 性能优化（CDN, Redis）、整体联调。
