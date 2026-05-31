package com.zhuxuan.service.impl;

import com.zhuxuan.dto.GoalProgressResponse;
import com.zhuxuan.dto.GoalRequest;
import com.zhuxuan.dto.GoalResponse;
import com.zhuxuan.entity.TrainingGoal;
import com.zhuxuan.repository.TrainingGoalRepository;
import com.zhuxuan.repository.TrainingStatRepository;
import com.zhuxuan.service.TrainingGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

@Service
@RequiredArgsConstructor
public class TrainingGoalServiceImpl implements TrainingGoalService {

    private final TrainingGoalRepository trainingGoalRepository;
    private final TrainingStatRepository trainingStatRepository;

    @Override
    @Transactional
    public GoalResponse createOrUpdateGoal(Long userId, GoalRequest request) {
        TrainingGoal goal = trainingGoalRepository.findByUserId(userId)
                .orElseGet(() -> {
                    TrainingGoal g = new TrainingGoal();
                    g.setUserId(userId);
                    return g;
                });

        if (request.getWeeklyCheckinTarget() != null) {
            goal.setWeeklyCheckinTarget(request.getWeeklyCheckinTarget());
        }
        if (request.getMonthlyCheckinTarget() != null) {
            goal.setMonthlyCheckinTarget(request.getMonthlyCheckinTarget());
        }

        trainingGoalRepository.save(goal);
        return toResponse(goal);
    }

    @Override
    public GoalResponse getGoal(Long userId) {
        TrainingGoal goal = trainingGoalRepository.findByUserId(userId)
                .orElse(new TrainingGoal());
        return toResponse(goal);
    }

    @Override
    public GoalProgressResponse getProgress(Long userId, String type) {
        TrainingGoal goal = trainingGoalRepository.findByUserId(userId)
                .orElse(new TrainingGoal());

        LocalDate today = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;
        int target;

        if ("monthly".equals(type)) {
            startDate = today.withDayOfMonth(1);
            endDate = today.with(TemporalAdjusters.lastDayOfMonth());
            target = goal.getMonthlyCheckinTarget() != null ? goal.getMonthlyCheckinTarget() : 0;
        } else {
            startDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            endDate = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            target = goal.getWeeklyCheckinTarget() != null ? goal.getWeeklyCheckinTarget() : 0;
        }

        long current = trainingStatRepository.countByUserIdAndCheckinAndTrainDateBetween(
                userId, 1, startDate, endDate);

        double percentage = target > 0 ? Math.min(100.0, (double) current / target * 100) : 0;
        percentage = Math.round(percentage * 10.0) / 10.0;

        return GoalProgressResponse.builder()
                .target(target)
                .current((int) current)
                .percentage(percentage)
                .startDate(startDate.toString())
                .endDate(endDate.toString())
                .type(type)
                .build();
    }

    private GoalResponse toResponse(TrainingGoal goal) {
        return GoalResponse.builder()
                .id(goal.getId())
                .userId(goal.getUserId())
                .weeklyCheckinTarget(goal.getWeeklyCheckinTarget())
                .monthlyCheckinTarget(goal.getMonthlyCheckinTarget())
                .build();
    }
}
