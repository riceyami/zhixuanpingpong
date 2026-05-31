package com.zhuxuan.service.impl;

import com.zhuxuan.dto.EvaluationResponse;
import com.zhuxuan.entity.TrainingEvaluation;
import com.zhuxuan.repository.TrainingEvaluationRepository;
import com.zhuxuan.service.TrainingEvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TrainingEvaluationServiceImpl implements TrainingEvaluationService {

    private final TrainingEvaluationRepository trainingEvaluationRepository;

    @Override
    @Transactional
    public EvaluationResponse saveEvaluation(Long userId, String trainDate, String content) {
        LocalDate date = LocalDate.parse(trainDate);
        TrainingEvaluation evaluation = trainingEvaluationRepository
                .findByUserIdAndTrainDate(userId, date)
                .orElseGet(() -> {
                    TrainingEvaluation e = new TrainingEvaluation();
                    e.setUserId(userId);
                    e.setTrainDate(date);
                    return e;
                });
        evaluation.setContent(content);
        trainingEvaluationRepository.save(evaluation);
        return toResponse(evaluation);
    }

    @Override
    public EvaluationResponse getEvaluation(Long userId, String trainDate) {
        LocalDate date = LocalDate.parse(trainDate);
        return trainingEvaluationRepository.findByUserIdAndTrainDate(userId, date)
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    public Page<EvaluationResponse> listEvaluations(Long userId, String startDate, String endDate, int page, int size) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return trainingEvaluationRepository
                .findByUserIdAndTrainDateBetweenOrderByTrainDateDesc(userId, start, end, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    private EvaluationResponse toResponse(TrainingEvaluation e) {
        return EvaluationResponse.builder()
                .id(e.getId())
                .trainDate(e.getTrainDate().toString())
                .content(e.getContent())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .build();
    }
}
