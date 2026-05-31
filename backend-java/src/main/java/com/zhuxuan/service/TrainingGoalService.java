package com.zhuxuan.service;

import com.zhuxuan.dto.GoalProgressResponse;
import com.zhuxuan.dto.GoalRequest;
import com.zhuxuan.dto.GoalResponse;

public interface TrainingGoalService {

    GoalResponse createOrUpdateGoal(Long userId, GoalRequest request);

    GoalResponse getGoal(Long userId);

    GoalProgressResponse getProgress(Long userId, String type);
}
