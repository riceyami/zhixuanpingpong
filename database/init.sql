-- 智旋 (Zhuxuan) 数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS zhuxuan DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE zhuxuan;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `user_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户唯一标识',
    `phone` VARCHAR(11) UNIQUE COMMENT '手机号',
    `email` VARCHAR(100) UNIQUE COMMENT '邮箱',
    `password` VARCHAR(255) NOT NULL COMMENT 'BCrypt 加密后的密码',
    `nickname` VARCHAR(50) NOT NULL COMMENT '昵称 (2-16 字符)',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像 OSS URL',
    `role` TINYINT DEFAULT 0 COMMENT '角色: 0-普通用户, 1-教练, 2-管理员',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
    PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 球拍配置表
CREATE TABLE IF NOT EXISTS `racket_config` (
    `user_id` BIGINT NOT NULL COMMENT '用户 ID',
    `baseplate` VARCHAR(100) DEFAULT NULL COMMENT '底板型号',
    `rubber_forehand` VARCHAR(100) DEFAULT NULL COMMENT '正手胶皮',
    `rubber_backhand` VARCHAR(100) DEFAULT NULL COMMENT '反手胶皮',
    PRIMARY KEY (`user_id`),
    CONSTRAINT `fk_racket_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='球拍配置表';

-- 3. 训练视频表
CREATE TABLE IF NOT EXISTS `video` (
    `video_id` VARCHAR(64) NOT NULL COMMENT '视频唯一 ID',
    `user_id` BIGINT NOT NULL COMMENT '所属用户',
    `file_url` VARCHAR(255) NOT NULL COMMENT 'OSS 存储路径',
    `cover_url` VARCHAR(255) DEFAULT NULL COMMENT '视频封面 URL',
    `duration` INT DEFAULT 0 COMMENT '视频时长 (秒)',
    `status` TINYINT DEFAULT 0 COMMENT '状态: 0-上传中, 1-已上传, 2-分析中, 3-分析完成, 4-分析失败',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    PRIMARY KEY (`video_id`),
    INDEX `idx_user_video` (`user_id`),
    CONSTRAINT `fk_video_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='训练视频表';

-- 4. 训练统计表
CREATE TABLE IF NOT EXISTS `training_stat` (
    `stat_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '统计 ID',
    `user_id` BIGINT NOT NULL COMMENT '用户 ID',
    `train_date` DATE NOT NULL COMMENT '训练日期',
    `total_duration` INT DEFAULT 0 COMMENT '当日总时长 (秒)',
    `train_times` INT DEFAULT 0 COMMENT '当日训练次数',
    `checkin` TINYINT DEFAULT 0 COMMENT '是否打卡: 0-未打卡, 1-已打卡',
    PRIMARY KEY (`stat_id`),
    UNIQUE KEY `uk_user_date` (`user_id`, `train_date`),
    CONSTRAINT `fk_stat_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='训练统计表';

-- 5. 社区帖子表
CREATE TABLE IF NOT EXISTS `post` (
    `post_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '帖子 ID',
    `user_id` BIGINT NOT NULL COMMENT '作者 ID',
    `title` VARCHAR(200) NOT NULL COMMENT '标题',
    `content` TEXT NOT NULL COMMENT '帖子内容 (富文本)',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-屏蔽, 1-正常',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    PRIMARY KEY (`post_id`),
    INDEX `idx_user_post` (`user_id`),
    INDEX `idx_create_time` (`create_time`),
    CONSTRAINT `fk_post_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区帖子表';

-- 6. 评论表
CREATE TABLE IF NOT EXISTS `comment` (
    `comment_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评论 ID',
    `post_id` BIGINT NOT NULL COMMENT '所属帖子 ID',
    `user_id` BIGINT NOT NULL COMMENT '评论者 ID',
    `parent_id` BIGINT DEFAULT NULL COMMENT '父评论 ID (支持楼中楼)',
    `content` TEXT NOT NULL COMMENT '评论内容',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 0-屏蔽, 1-正常',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
    PRIMARY KEY (`comment_id`),
    INDEX `idx_post_comment` (`post_id`),
    INDEX `idx_user_comment` (`user_id`),
    CONSTRAINT `fk_comment_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
    CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_id`) REFERENCES `comment` (`comment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- 7. 帖子点赞表
CREATE TABLE IF NOT EXISTS `post_like` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    `post_id` BIGINT NOT NULL COMMENT '帖子 ID',
    `user_id` BIGINT NOT NULL COMMENT '点赞用户 ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_post_user` (`post_id`, `user_id`),
    INDEX `idx_post_like` (`post_id`),
    CONSTRAINT `fk_like_post` FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_like_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='帖子点赞表';
