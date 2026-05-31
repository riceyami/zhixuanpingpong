package com.zhuxuan.repository;

import com.zhuxuan.entity.TrainingStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingStatRepository extends JpaRepository<TrainingStat, Long> {

    Optional<TrainingStat> findByUserIdAndTrainDate(Long userId, LocalDate trainDate);

    List<TrainingStat> findByUserIdAndTrainDateBetween(Long userId, LocalDate start, LocalDate end);

    @Modifying
    @Query(value = "INSERT INTO training_stat (user_id, train_date, checkin) VALUES (:userId, :trainDate, 1) " +
                   "ON DUPLICATE KEY UPDATE checkin = 1", nativeQuery = true)
    void upsertCheckin(@Param("userId") Long userId, @Param("trainDate") LocalDate trainDate);

    long countByUserIdAndCheckinAndTrainDateBetween(Long userId, Integer checkin, LocalDate start, LocalDate end);
}
