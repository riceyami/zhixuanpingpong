package com.zhuxuan.repository;

import com.zhuxuan.entity.TrainingGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainingGoalRepository extends JpaRepository<TrainingGoal, Long> {

    Optional<TrainingGoal> findByUserId(Long userId);
}
