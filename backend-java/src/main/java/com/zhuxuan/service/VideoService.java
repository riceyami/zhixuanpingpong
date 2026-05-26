package com.zhuxuan.service;

import com.zhuxuan.dto.AnalyzeResult;
import com.zhuxuan.dto.OssPolicyResponse;
import com.zhuxuan.entity.Video;

import java.util.List;

public interface VideoService {
    /**
     * 获取 OSS 上传签名策略
     */
    OssPolicyResponse getOssPolicy();

    /**
     * 保存视频元数据
     */
    Video saveVideo(Video video);

    /**
     * 获取用户的视频列表
     */
    List<Video> getUserVideos(Long userId);

    /**
     * 删除视频 (从 OSS 和数据库中删除)
     */
    void deleteVideo(String videoId, Long userId);

    /**
     * 获取视频 AI 分析结果
     */
    AnalyzeResult getAnalyzeResult(String videoId, Long userId);

    /**
     * 标记视频为分析中状态（异步任务触发前同步执行）
     */
    void startAnalysis(String videoId, Long userId);
}
