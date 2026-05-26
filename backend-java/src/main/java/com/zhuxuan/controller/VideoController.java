package com.zhuxuan.controller;

import com.zhuxuan.dto.AnalyzeRequest;
import com.zhuxuan.dto.AnalyzeResult;
import com.zhuxuan.dto.OssPolicyResponse;
import com.zhuxuan.dto.Result;
import com.zhuxuan.entity.Video;
import com.zhuxuan.service.VideoService;
import com.zhuxuan.service.impl.VideoAnalysisTask;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/video")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;
    private final VideoAnalysisTask videoAnalysisTask;

    /**
     * 从 SecurityContext 安全地获取当前登录用户 ID
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new RuntimeException("用户未认证");
        }
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof Long)) {
            throw new RuntimeException("认证信息异常: principal 类型不匹配");
        }
        return (Long) principal;
    }

    /**
     * 获取 OSS 上传签名策略
     */
    @GetMapping("/upload/token")
    public Result<OssPolicyResponse> getUploadToken() {
        return Result.success(videoService.getOssPolicy());
    }

    /**
     * 上传成功后保存视频元数据
     */
    @PostMapping("/save")
    public Result<Video> saveVideo(@RequestBody Video video) {
        Long userId = getCurrentUserId();
        video.setUserId(userId);
        video.setVideoId(UUID.randomUUID().toString().replace("-", ""));
        video.setStatus(1);
        return Result.success(videoService.saveVideo(video));
    }

    /**
     * 获取当前用户的视频列表
     */
    @GetMapping("/list")
    public Result<List<Video>> getMyVideos() {
        Long userId = getCurrentUserId();
        return Result.success(videoService.getUserVideos(userId));
    }

    /**
     * 提交 AI 分析任务（同步标记 + 异步执行）
     */
    @PostMapping("/analyze")
    public Result<Void> submitAnalyze(@RequestBody AnalyzeRequest request) {
        Long userId = getCurrentUserId();
        videoService.startAnalysis(request.getVideoId(), userId);
        videoAnalysisTask.runAsync(request.getVideoId());
        return Result.success(null);
    }

    /**
     * 查询 AI 分析结果 (含落点数据)
     */
    @GetMapping("/result/{videoId}")
    public Result<AnalyzeResult> getAnalyzeResult(@PathVariable String videoId) {
        Long userId = getCurrentUserId();
        return Result.success(videoService.getAnalyzeResult(videoId, userId));
    }

    /**
     * 删除视频 (同时删除 OSS 文件与数据库记录)
     */
    @DeleteMapping("/{videoId}")
    public Result<Void> deleteVideo(@PathVariable String videoId) {
        Long userId = getCurrentUserId();
        try {
            videoService.deleteVideo(videoId, userId);
            return Result.success(null);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }
}
