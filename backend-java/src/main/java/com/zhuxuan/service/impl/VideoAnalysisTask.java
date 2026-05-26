package com.zhuxuan.service.impl;

import com.zhuxuan.entity.Video;
import com.zhuxuan.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class VideoAnalysisTask {

    private final VideoRepository videoRepository;

    @Async("analysisExecutor")
    @Transactional
    public void runAsync(String videoId) {
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        Video video = videoRepository.findById(videoId).orElse(null);
        if (video != null && video.getStatus() == 2) {
            video.setStatus(3);
            videoRepository.save(video);
        }
    }
}
