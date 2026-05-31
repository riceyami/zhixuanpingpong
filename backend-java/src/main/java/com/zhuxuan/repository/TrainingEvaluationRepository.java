package com.zhuxuan.repository;

import com.zhuxuan.entity.TrainingEvaluation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TrainingEvaluationRepository extends JpaRepository<TrainingEvaluation, Long> {

    Optional<TrainingEvaluation> findByUserIdAndTrainDate(Long userId, LocalDate trainDate);

    Page<TrainingEvaluation> findByUserIdAndTrainDateBetweenOrderByTrainDateDesc(
            Long userId, LocalDate startDate, LocalDate endDate, Pageable pageable);
}
