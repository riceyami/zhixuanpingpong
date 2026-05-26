package com.zhuxuan.service.impl;

import com.zhuxuan.dto.LoginRequest;
import com.zhuxuan.dto.LoginResponse;
import com.zhuxuan.dto.RegisterRequest;
import com.zhuxuan.dto.UserResponse;
import com.zhuxuan.entity.User;
import com.zhuxuan.repository.UserRepository;
import com.zhuxuan.service.UserService;
import com.zhuxuan.util.JwtUtils;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 用户业务实现类
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        // ... (保持原有代码不变)
        // 1. 校验手机号是否已存在
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("该手机号已被注册");
        }

        // 2. 创建用户实体
        User user = new User();
        BeanUtils.copyProperties(request, user);
        
        // 3. 密码加密
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // 4. 保存到数据库
        User savedUser = userRepository.save(user);

        // 5. 返回响应 DTO
        UserResponse response = new UserResponse();
        BeanUtils.copyProperties(savedUser, response);
        return response;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // 1. 查找用户 (支持手机号或邮箱登录)
        User user = userRepository.findByPhone(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 2. 校验密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        // 3. 校验账号状态
        if (user.getStatus() == 0) {
            throw new RuntimeException("账号已被禁用");
        }

        // 4. 生成 Token
        String accessToken = jwtUtils.generateAccessToken(user.getUserId(), String.valueOf(user.getRole()));
        String refreshToken = jwtUtils.generateRefreshToken(user.getUserId());

        // 5. 封装响应
        UserResponse userResponse = new UserResponse();
        BeanUtils.copyProperties(user, userResponse);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userInfo(userResponse)
                .build();
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        if (!jwtUtils.validateToken(refreshToken)) {
            throw new RuntimeException("RefreshToken 已过期或无效，请重新登录");
        }

        Long userId = jwtUtils.getUserId(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        String newAccessToken = jwtUtils.generateAccessToken(user.getUserId(), String.valueOf(user.getRole()));
        String newRefreshToken = jwtUtils.generateRefreshToken(user.getUserId());

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }
}
