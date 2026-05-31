package com.zhuxuan.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalRequest {
    private Integer weeklyCheckinTarget;
    private Integer monthlyCheckinTarget;
}
