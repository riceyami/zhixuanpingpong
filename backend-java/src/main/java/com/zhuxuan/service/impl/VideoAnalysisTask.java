package com.zhuxuan.service.impl;

import com.zhuxuan.entity.Video;
import com.zhuxuan.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class VideoAnalysisTask {

    private static final Logger log = LoggerFactory.getLogger(VideoAnalysisTask.class);

    @Value("${python.analyze-script-path:../../UpliftingTableTennis/analyze_cli.py}")
    private String analyzeScriptPath;

    @Value("${python.executable:python}")
    private String pythonExecutable;

    private final VideoRepository videoRepository;

    @Async("analysisExecutor")
    @Transactional
    public void runAsync(String videoId) {
        try {
            Video video = videoRepository.findById(videoId).orElse(null);
            if (video == null) {
                log.error("视频不存在: {}", videoId);
                return;
            }

            video.setStatus(2);
            videoRepository.save(video);
            log.info("开始分析视频: {}", videoId);

            String scriptPath = resolveScriptPath();
            String fileUrl = video.getFileUrl();

            ProcessBuilder pb = new ProcessBuilder(
                pythonExecutable, scriptPath, videoId, fileUrl
            );
            pb.redirectErrorStream(true);
            pb.environment().put("TF_ENABLE_ONEDNN_OPTS", "0");

            long t0 = System.currentTimeMillis();
            Process process = pb.start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.info("[PyAnalyze] {}", line);
                    output.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();
            long elapsed = System.currentTimeMillis() - t0;
            String outStr = output.toString();

            if (exitCode == 0 && outStr.contains("SUCCESS")) {
                video.setStatus(3);
                videoRepository.save(video);
                log.info("视频分析完成: {} ({}ms)", videoId, elapsed);
            } else {
                video.setStatus(4);
                videoRepository.save(video);
                log.error("视频分析失败: {} ({}ms) - {}", videoId, elapsed,
                        outStr.lines().filter(l -> l.contains("ERROR")).findFirst().orElse(outStr));
            }

        } catch (Exception e) {
            log.error("视频分析异常: {} - {}", videoId, e.getMessage());
            videoRepository.findById(videoId).ifPresent(v -> {
                v.setStatus(4);
                videoRepository.save(v);
            });
        }
    }

    private String resolveScriptPath() {
        File script = new File(analyzeScriptPath);
        if (script.isAbsolute() && script.exists()) {
            return script.getAbsolutePath();
        }
        // Try relative to working directory
        File cwdScript = new File(System.getProperty("user.dir"), analyzeScriptPath);
        if (cwdScript.exists()) {
            return cwdScript.getAbsolutePath();
        }
        // Try fallback path
        File fallback = new File("../UpliftingTableTennis/analyze_cli.py");
        if (fallback.exists()) {
            return fallback.getAbsolutePath();
        }
        return analyzeScriptPath;
    }
}
