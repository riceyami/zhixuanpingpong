package com.zhuxuan.service.impl;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.common.utils.BinaryUtil;
import com.aliyun.oss.model.MatchMode;
import com.aliyun.oss.model.PolicyConditions;
import com.zhuxuan.dto.AnalyzeResult;
import com.zhuxuan.dto.OssPolicyResponse;
import com.zhuxuan.entity.Video;
import com.zhuxuan.exception.BusinessException;
import com.zhuxuan.repository.VideoRepository;
import com.zhuxuan.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    private final MongoTemplate mongoTemplate;

    @Autowired
    private VideoAnalysisTask videoAnalysisTask;

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
    public Page<Video> getUserVideos(Long userId, int page, int size) {
        return videoRepository.findByUserIdOrderByCreateTimeDesc(userId, PageRequest.of(page, size));
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

        // 从 MongoDB 读取真实分析结果
        Query query = new Query(Criteria.where("videoId").is(videoId));
        Map<String, Object> analysisDoc = mongoTemplate.findOne(query, Map.class, "analysis_result");

        if (analysisDoc == null) {
            throw new BusinessException(601, "分析结果不存在，请稍后再试");
        }

        Number ballSpeedAvgNum = (Number) analysisDoc.get("ballSpeedAvg");
        double ballSpeedAvg = ballSpeedAvgNum != null ? ballSpeedAvgNum.doubleValue() : 0.0;

        Number ballSpeedMaxNum = (Number) analysisDoc.get("ballSpeedMax");
        double ballSpeedMax = ballSpeedMaxNum != null ? ballSpeedMaxNum.doubleValue() : ballSpeedAvg;

        Number hitCountNum = (Number) analysisDoc.get("hitCount");
        int hitCount = hitCountNum != null ? hitCountNum.intValue() : 0;

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> trajectoryRaw = (List<Map<String, Object>>) analysisDoc.getOrDefault("trajectory", Collections.emptyList());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> landingRaw = (List<Map<String, Object>>) analysisDoc.getOrDefault("landingPoints", Collections.emptyList());

        @SuppressWarnings("unchecked")
        List<Number> speedSeqRaw = (List<Number>) analysisDoc.getOrDefault("ballSpeedSequence", Collections.emptyList());
        List<Double> speedSequence = speedSeqRaw.stream()
                .map(Number::doubleValue)
                .collect(Collectors.toList());

        List<AnalyzeResult.TrackPoint> trackData = trajectoryRaw.stream()
                .map(p -> new AnalyzeResult.TrackPoint(
                        ((Number) p.get("x")).doubleValue(),
                        ((Number) p.get("y")).doubleValue(),
                        ((Number) p.get("t")).longValue()))
                .collect(Collectors.toList());

        List<AnalyzeResult.LandingPoint> landingPoints = landingRaw.stream()
                .map(p -> new AnalyzeResult.LandingPoint(
                        ((Number) p.get("x")).doubleValue(),
                        ((Number) p.get("y")).doubleValue()))
                .collect(Collectors.toList());

        AnalyzeResult.BallSpeed ballSpeed = AnalyzeResult.BallSpeed.builder()
                .avg(ballSpeedAvg)
                .max(ballSpeedMax)
                .sequence(speedSequence)
                .build();

        return AnalyzeResult.builder()
                .resultId(videoId)
                .videoId(videoId)
                .hitCount(hitCount)
                .analyzeTime(0L)
                .ballSpeed(ballSpeed)
                .trackData(trackData)
                .landingPoints(landingPoints)
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

        videoAnalysisTask.runAsync(video.getVideoId());
    }
}
