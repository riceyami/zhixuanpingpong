package com.zhuxuan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * AI 分析结果 DTO
 * 遵循 DATA_DICTIONARY.md 与前端 AnalyzeResult 类型定义
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeResult {
    private String resultId;
    private String videoId;
    private List<TrackPoint> trackData;
    private BallSpeed ballSpeed;
    private List<LandingPoint> landingPoints;
    private Integer hitCount;
    private Long analyzeTime;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrackPoint {
        private double x;
        private double y;
        private long t;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LandingPoint {
        private double x;
        private double y;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BallSpeed {
        private double avg;
        private double max;
        private List<Double> sequence;
    }
}
