package com.zhuxuan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {
    private Long id;
    private Long userId;
    private Integer weeklyCheckinTarget;
    private Integer monthlyCheckinTarget;
}
