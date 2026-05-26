# 智旋 (Zhuxuan) - 数据字典 (Data Dictionary)

本仓库所有开发任务必须遵循本数据字典定义的字段命名、类型与约束。

## 1. MySQL (关系型数据库) - 业务核心数据

### 1.1 `user` (用户表)
| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| `user_id` | BIGINT | PK, Auto Inc | 用户唯一标识 |
| `phone` | VARCHAR(11) | Unique, Nullable | 手机号 (正则: ^1[3-9]\d{9}$) |
| `password` | VARCHAR(255) | Not Null | BCrypt 加密后的密码 |
| `nickname` | VARCHAR(50) | Not Null | 昵称 (2-16 字符) |
| `avatar` | VARCHAR(255) | - | 头像 OSS URL |
| `role` | TINYINT | Default 0 | 角色: 0-普通用户, 1-教练, 2-管理员 |
| `status` | TINYINT | Default 1 | 状态: 0-禁用, 1-正常 |
| `create_time` | DATETIME | Default Now | 注册时间 |
| `update_time` | DATETIME | Default Now | 最后更新时间 |

### 1.2 `racket_config` (球拍配置表)
| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| `user_id` | BIGINT | PK, FK(user.user_id) | 用户 ID |
| `baseplate` | VARCHAR(100) | - | 底板型号 |
| `rubber_forehand` | VARCHAR(100) | - | 正手胶皮 |
| `rubber_backhand` | VARCHAR(100) | - | 反手胶皮 |

### 1.3 `video` (训练视频表)
| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| `video_id` | VARCHAR(64) | PK | 视频唯一 ID (UUID/Snowflake) |
| `user_id` | BIGINT | FK(user.user_id) | 所属用户 |
| `file_url` | VARCHAR(255) | Not Null | OSS 存储路径 |
| `cover_url` | VARCHAR(255) | - | 视频封面 URL |
| `duration` | INT | - | 视频时长 (秒) |
| `status` | TINYINT | Default 0 | 状态: 0-上传中, 1-已上传, 2-分析中, 3-分析完成, 4-分析失败 |
| `create_time` | DATETIME | Default Now | 上传时间 |

### 1.4 `training_stat` (训练统计表)
| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| `stat_id` | BIGINT | PK, Auto Inc | 统计 ID |
| `user_id` | BIGINT | FK(user.user_id) | 用户 ID |
| `train_date` | DATE | Not Null | 训练日期 |
| `total_duration` | INT | Default 0 | 当日总时长 (秒) |
| `train_times` | INT | Default 0 | 当日训练次数 |
| `checkin` | TINYINT | Default 0 | 是否打卡: 0-未打卡, 1-已打卡 |

### 1.5 `post` (社区帖子表)
| 字段名 | 类型 | 约束 | 说明 |
| :--- | :--- | :--- | :--- |
| `post_id` | BIGINT | PK, Auto Inc | 帖子 ID |
| `user_id` | BIGINT | FK(user.user_id) | 作者 ID |
| `title` | VARCHAR(200) | Not Null | 标题 |
| `content` | TEXT | Not Null | 帖子内容 (富文本) |
| `like_count` | INT | Default 0 | 点赞数 |
| `comment_count` | INT | Default 0 | 评论数 |
| `status` | TINYINT | Default 1 | 状态: 0-屏蔽, 1-正常 |
| `create_time` | DATETIME | Default Now | 发布时间 |

---

## 2. MongoDB (非结构化) - 算法与元数据

### 2.1 `analysis_result` (分析结果集合)
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| `_id` | ObjectId | 结果唯一 ID |
| `video_id` | String | 关联视频 ID |
| `track_data` | Array | 轨迹点序列: `[{x, y, t}, ...]` |
| `ball_speed` | Object | 速度统计: `{avg, max, sequence: [...]}` |
| `landing_points` | Array | 落点坐标: `[{x, y}, ...]` |
| `hit_count` | Int | 总击球次数 |
| `analyze_time` | Int | 算法耗时 (ms) |

---

## 3. Redis (缓存与实时)

| Key 模式 | 类型 | 过期时间 | 说明 |
| :--- | :--- | :--- | :--- |
| `user:token:{token}` | String | 2h | 存储用户信息 (Session) |
| `user:refresh_token:{token}` | String | 30d | 用于刷新 AccessToken |
| `video:upload:{video_id}` | String | 24h | 分片上传进度/状态 |
| `ranking:duration:{daily|weekly}` | ZSet | - | 训练时长排行榜 |
| `limit:ip:{ip}` | String | 1m | 接口限流计数 |
