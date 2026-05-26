package com.zhuxuan.controller;

import com.zhuxuan.dto.OssPolicyResponse;
import com.zhuxuan.dto.Result;
import com.zhuxuan.entity.Video;
import com.zhuxuan.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/video")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

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
        // 从 SecurityContext 获取当前登录用户 ID
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        video.setUserId(userId);
        video.setVideoId(UUID.randomUUID().toString().replace("-", ""));
        video.setStatus(1); // 已上传
        return Result.success(videoService.saveVideo(video));
    }

    /**
     * 获取当前用户的视频列表
     */
    @GetMapping("/list")
    public Result<List<Video>> getMyVideos() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Result.success(videoService.getUserVideos(userId));
    }

    /**
     * 删除视频 (同时删除 OSS 文件与数据库记录)
     */
    @DeleteMapping("/{videoId}")
    public Result<Void> deleteVideo(@PathVariable String videoId) {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        try {
            videoService.deleteVideo(videoId, userId);
            return Result.success(null);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }
}
