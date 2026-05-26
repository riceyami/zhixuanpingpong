package com.zhuxuan.repository;

import com.zhuxuan.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video, String> {
    List<Video> findByUserIdOrderByCreateTimeDesc(Long userId);
}
