package com.zhuxuan.service.impl;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.common.utils.BinaryUtil;
import com.aliyun.oss.model.MatchMode;
import com.aliyun.oss.model.PolicyConditions;
import com.zhuxuan.dto.AnalyzeResult;
import com.zhuxuan.dto.OssPolicyResponse;
import com.zhuxuan.entity.Video;
import com.zhuxuan.repository.VideoRepository;
import com.zhuxuan.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VideoServiceImpl implements VideoService {

    @Value("${aliyun.oss.access-key-id}")
    private String accessId;

    @Value("${aliyun.oss.access-key-secret}")
    private String accessKey;

    @Value("${aliyun.oss.endpoint}")
    private String endpoint;

    @Value("${aliyun.oss.bucket-name}")
    private String bucket;

    private final VideoRepository videoRepository;

    @Override
    public OssPolicyResponse getOssPolicy() {
        String host = "https://" + bucket + "." + endpoint;
        String dir = "videos/"; // 视频存储目录
        
        OSS ossClient = new OSSClientBuilder().build(endpoint, accessId, accessKey);
        try {
            long expireTime = 300; // 5分钟过期
            long expireEndTime = System.currentTimeMillis() + expireTime * 1000;
            Date expiration = new Date(expireEndTime);
            
            PolicyConditions policyConds = new PolicyConditions();
            policyConds.addConditionItem(PolicyConditions.COND_CONTENT_LENGTH_RANGE, 0, 1048576000); // 限制1GB
            policyConds.addConditionItem(MatchMode.StartWith, PolicyConditions.COND_KEY, dir);
            // 允许设置文件公开读
            policyConds.addConditionItem("x-oss-object-acl", "public-read");

            String postPolicy = ossClient.generatePostPolicy(expiration, policyConds);
            byte[] binaryData = postPolicy.getBytes(StandardCharsets.UTF_8);
            String encodedPolicy = BinaryUtil.toBase64String(binaryData);
            String postSignature = ossClient.calculatePostSignature(postPolicy);

            return OssPolicyResponse.builder()
                    .accessId(accessId)
                    .policy(encodedPolicy)
                    .signature(postSignature)
                    .dir(dir)
                    .host(host)
                    .expire(String.valueOf(expireEndTime / 1000))
                    .acl("public-read")
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("生成 OSS 策略失败: " + e.getMessage());
        } finally {
            ossClient.shutdown();
        }
    }

    @Override
    public Video saveVideo(Video video) {
        return videoRepository.save(video);
    }

    @Override
    public List<Video> getUserVideos(Long userId) {
        return videoRepository.findByUserIdOrderByCreateTimeDesc(userId);
    }

    @Override
    public void deleteVideo(String videoId, Long userId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("视频不存在"));

        if (!video.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此视频");
        }

        // 从 OSS 删除文件
        OSS ossClient = new OSSClientBuilder().build(endpoint, accessId, accessKey);
        try {
            String key = video.getFileUrl().substring(video.getFileUrl().indexOf("videos/"));
            ossClient.deleteObject(bucket, key);
        } catch (Exception e) {
            // OSS 删除失败不阻塞数据库删除
            System.err.println("OSS 删除文件失败: " + e.getMessage());
        } finally {
            ossClient.shutdown();
        }

        // 从数据库删除记录
        videoRepository.delete(video);
    }

    @Override
    public AnalyzeResult getAnalyzeResult(String videoId, Long userId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("视频不存在"));

        if (!video.getUserId().equals(userId)) {
            throw new RuntimeException("无权访问此视频的分析结果");
        }

        // 如果视频状态不是分析完成，抛出异常
        if (video.getStatus() < 3) {
            throw new RuntimeException("视频尚未完成分析");
        }

        // 返回模拟分析结果（后续将从 MongoDB 读取真实数据）
        return AnalyzeResult.builder()
                .resultId("mock-result-" + videoId)
                .videoId(videoId)
                .hitCount(24)
                .analyzeTime(3520L)
                .ballSpeed(AnalyzeResult.BallSpeed.builder()
                        .avg(8.5)
                        .max(12.3)
                        .sequence(List.of(7.2, 8.1, 9.5, 10.2, 11.8, 12.3, 11.5, 10.8, 9.2, 8.7, 7.5, 6.8, 7.9, 8.5, 9.1, 10.5, 11.2, 12.1, 11.0, 10.5, 9.8, 8.2, 7.8, 6.5))
                        .build())
                .trackData(List.of(
                        new AnalyzeResult.TrackPoint(150, 300, 0),
                        new AnalyzeResult.TrackPoint(155, 290, 40),
                        new AnalyzeResult.TrackPoint(160, 275, 80),
                        new AnalyzeResult.TrackPoint(168, 260, 120),
                        new AnalyzeResult.TrackPoint(175, 240, 160),
                        new AnalyzeResult.TrackPoint(185, 220, 200),
                        new AnalyzeResult.TrackPoint(195, 205, 240),
                        new AnalyzeResult.TrackPoint(210, 195, 280),
                        new AnalyzeResult.TrackPoint(225, 190, 320),
                        new AnalyzeResult.TrackPoint(240, 188, 360)
                ))
                .landingPoints(List.of(
                        // === 远台（对方半场，y < 150）12 个落点 ===
                        new AnalyzeResult.LandingPoint(50, 30),
                        new AnalyzeResult.LandingPoint(190, 35),
                        new AnalyzeResult.LandingPoint(120, 55),
                        new AnalyzeResult.LandingPoint(220, 60),
                        new AnalyzeResult.LandingPoint(80, 80),
                        new AnalyzeResult.LandingPoint(160, 85),
                        new AnalyzeResult.LandingPoint(240, 90),
                        new AnalyzeResult.LandingPoint(40, 105),
                        new AnalyzeResult.LandingPoint(200, 110),
                        new AnalyzeResult.LandingPoint(100, 120),
                        new AnalyzeResult.LandingPoint(180, 125),
                        new AnalyzeResult.LandingPoint(60, 135),
                        // === 近台（我方半场，y > 150）12 个落点 ===
                        new AnalyzeResult.LandingPoint(230, 170),
                        new AnalyzeResult.LandingPoint(70, 175),
                        new AnalyzeResult.LandingPoint(150, 185),
                        new AnalyzeResult.LandingPoint(200, 195),
                        new AnalyzeResult.LandingPoint(50, 210),
                        new AnalyzeResult.LandingPoint(180, 215),
                        new AnalyzeResult.LandingPoint(110, 230),
                        new AnalyzeResult.LandingPoint(240, 235),
                        new AnalyzeResult.LandingPoint(80, 250),
                        new AnalyzeResult.LandingPoint(210, 260),
                        new AnalyzeResult.LandingPoint(130, 275),
                        new AnalyzeResult.LandingPoint(190, 285)
                ))
                .build();
    }

    @Override
    @Transactional
    public void startAnalysis(String videoId, Long userId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("视频不存在"));

        if (!video.getUserId().equals(userId)) {
            throw new RuntimeException("无权分析此视频");
        }

        if (video.getStatus() != 1) {
            throw new RuntimeException("当前视频状态不允许分析");
        }

        video.setStatus(2);
        videoRepository.save(video);
    }
}
