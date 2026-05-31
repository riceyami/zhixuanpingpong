package com.zhuxuan.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "training_stat")
public class TrainingStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stat_id")
    private Long statId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "train_date", nullable = false)
    private LocalDate trainDate;

    @Column(name = "total_duration")
    private Integer totalDuration = 0;

    @Column(name = "train_times")
    private Integer trainTimes = 0;

    @Column(name = "checkin")
    private Integer checkin = 0;
}
