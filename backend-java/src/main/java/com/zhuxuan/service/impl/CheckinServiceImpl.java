package com.zhuxuan.service.impl;

import com.zhuxuan.dto.CheckinResponse;
import com.zhuxuan.dto.CalendarDayDTO;
import com.zhuxuan.entity.TrainingStat;
import com.zhuxuan.repository.TrainingStatRepository;
import com.zhuxuan.service.CheckinService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckinServiceImpl implements CheckinService {

    private final TrainingStatRepository trainingStatRepository;

    @Override
    @Transactional
    public CheckinResponse checkin(Long userId, String trainDate) {
        LocalDate date = LocalDate.parse(trainDate);
        trainingStatRepository.upsertCheckin(userId, date);
        return CheckinResponse.builder()
                .checkin(true)
                .trainDate(trainDate)
                .build();
    }

    @Override
    public CheckinResponse getTodayStatus(Long userId) {
        LocalDate today = LocalDate.now();
        Optional<TrainingStat> stat = trainingStatRepository.findByUserIdAndTrainDate(userId, today);
        boolean checkedIn = stat.isPresent() && stat.get().getCheckin() == 1;
        return CheckinResponse.builder()
                .checkin(checkedIn)
                .trainDate(today.toString())
                .build();
    }

    @Override
    public List<CalendarDayDTO> getCalendar(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<TrainingStat> stats = trainingStatRepository
                .findByUserIdAndTrainDateBetween(userId, startDate, endDate);

        Map<LocalDate, Boolean> checkinMap = stats.stream()
                .collect(Collectors.toMap(
                        TrainingStat::getTrainDate,
                        s -> s.getCheckin() == 1
                ));

        List<CalendarDayDTO> result = new ArrayList<>();
        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            LocalDate date = yearMonth.atDay(day);
            result.add(CalendarDayDTO.builder()
                    .date(date.toString())
                    .checkin(checkinMap.getOrDefault(date, false))
                    .build());
        }
        return result;
    }
}
