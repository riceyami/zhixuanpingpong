package com.zhuxuan.service;

import com.zhuxuan.dto.EvaluationResponse;
import org.springframework.data.domain.Page;

public interface TrainingEvaluationService {

    EvaluationResponse saveEvaluation(Long userId, String trainDate, String content);

    EvaluationResponse getEvaluation(Long userId, String trainDate);

    Page<EvaluationResponse> listEvaluations(Long userId, String startDate, String endDate, int page, int size);
}
