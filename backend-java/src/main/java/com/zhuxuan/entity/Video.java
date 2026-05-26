package com.zhuxuan.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 训练视频实体类
 * 遵循 DATA_DICTIONARY.md 规范
 */
@Data
@Entity
@Table(name = "video")
public class Video {

    @Id
    @Column(name = "video_id", length = 64)
    private String videoId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "cover_url")
    private String coverUrl;

    private Integer duration = 0;

    /**
     * 状态: 0-上传中, 1-已上传, 2-分析中, 3-分析完成, 4-分析失败
     */
    private Integer status = 0;

    @CreationTimestamp
    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;
}
