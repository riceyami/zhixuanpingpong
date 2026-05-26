package com.zhuxuan.repository;

import com.zhuxuan.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 用户数据访问层
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByPhone(String phone);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByPhone(String phone);
    
    boolean existsByEmail(String email);
}
