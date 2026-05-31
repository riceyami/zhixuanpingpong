package com.zhuxuan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalProgressResponse {
    private int target;
    private int current;
    private double percentage;
    private String startDate;
    private String endDate;
    private String type;
}
