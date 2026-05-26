# 智旋 (Zhuxuan) - 接口字典 (API Dictionary)

本仓库所有 API 开发必须遵循本字典定义的路径、请求方式与数据契约。

## 1. 通用响应格式 (Common Response)
所有接口必须返回以下结构的 JSON：
```json
{
  "code": 200,      // 200-成功, 400-参数错误, 401-未授权, 500-系统错误
  "message": "描述", 
  "data": {},       // 具体的业务数据
  "timestamp": 1672531200000
}
```

---

## 2. 用户认证模块 (Auth - M1)

### 2.0 用户注册
- **路径**: `POST /api/user/register`
- **入参**: `{ "phone": "", "password": "", "nickname": "" }`
- **出参**: `{ "userId": "", "phone": "", "nickname": "", ... }`

### 2.1 用户登录
- **路径**: `POST /api/user/login`
- **入参**: `{ "type": "phone|email", "phone": "", "code": "", "password": "" }`
- **出参**: `{ "accessToken": "", "refreshToken": "", "userInfo": {} }`

### 2.2 获取个人资料
- **路径**: `GET /api/user/profile`
- **鉴权**: 必须
- **出参**: 包含用户基础信息与 `racketConfig`。

### 2.3 更新器材配置
- **路径**: `PUT /api/user/racket`
- **入参**: `{ "baseplate": "", "rubberForehand": "", "rubberBackhand": "" }`

---

## 3. 视频与 AI 模块 (Video & AI - M2)

### 3.1 获取 OSS 上传凭证
- **路径**: `GET /api/video/upload/token`
- **出参**: `{ "uploadId": "", "ossUrl": "", "policy": "", "signature": "" }`

### 3.2 提交分析任务
- **路径**: `POST /api/video/analyze`
- **入参**: `{ "videoId": "" }`
- **出参**: `{ "taskId": "", "status": "pending" }`

### 3.3 查询分析结果
- **路径**: `GET /api/video/result/{videoId}`
- **出参**: 包含轨迹、速度、落点等详细算法数据。

---

## 4. 训练统计模块 (Stats - M3)

### 4.1 获取训练看板数据
- **路径**: `GET /api/stat/dashboard`
- **参数**: `range=daily|weekly|monthly`
- **出参**: 聚合后的时长、次数、打卡状态。

### 4.2 导出训练报告
- **路径**: `GET /api/stat/report/export`
- **参数**: `startDate`, `endDate`
- **返回**: PDF 文件流。

---

## 5. 社交互动模块 (Social - M4)

### 5.1 获取帖子列表
- **路径**: `GET /api/post/list`
- **参数**: `page`, `pageSize`, `tab=newest|hottest`

### 5.2 发布帖子
- **路径**: `POST /api/post/create`
- **入参**: `{ "title": "", "content": "", "images": [] }`

### 5.3 获取排行榜
- **路径**: `GET /api/social/ranking`
- **参数**: `type=daily|weekly`

---

