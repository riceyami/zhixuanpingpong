package com.zhuxuan.service.impl;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.common.utils.BinaryUtil;
import com.aliyun.oss.model.MatchMode;
import com.aliyun.oss.model.PolicyConditions;
import com.zhuxuan.dto.OssPolicyResponse;
import com.zhuxuan.entity.Video;
import com.zhuxuan.repository.VideoRepository;
import com.zhuxuan.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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
}
