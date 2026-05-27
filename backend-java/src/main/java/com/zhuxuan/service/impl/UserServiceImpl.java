package com.zhuxuan.service.impl;

import com.zhuxuan.dto.*;
import com.zhuxuan.entity.User;
import com.zhuxuan.exception.BusinessException;
import com.zhuxuan.repository.UserRepository;
import com.zhuxuan.service.UserService;
import com.zhuxuan.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        if (userRepository.existsByPhone(request.getPhone())) {
            throw BusinessException.badRequest("该手机号已被注册");
        }

        User user = new User();
        BeanUtils.copyProperties(request, user);

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse();
        BeanUtils.copyProperties(savedUser, response);
        return response;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByPhone(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> BusinessException.notFound("用户不存在"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw BusinessException.badRequest("密码错误");
        }

        if (user.getStatus() == 0) {
            throw BusinessException.badRequest("账号已被禁用");
        }

        String accessToken = jwtUtils.generateAccessToken(user.getUserId(), String.valueOf(user.getRole()));
        String refreshToken = jwtUtils.generateRefreshToken(user.getUserId());

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
            throw BusinessException.unauthorized("RefreshToken 已过期或无效，请重新登录");
        }

        Long userId = jwtUtils.getUserId(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("用户不存在"));

        String newAccessToken = jwtUtils.generateAccessToken(user.getUserId(), String.valueOf(user.getRole()));
        String newRefreshToken = jwtUtils.generateRefreshToken(user.getUserId());

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Override
    public ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("用户不存在"));
        return toProfileResponse(user);
    }

    @Override
    @Transactional
    public ProfileResponse updateNickname(Long userId, String nickname) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("用户不存在"));
        user.setNickname(nickname);
        userRepository.save(user);
        return toProfileResponse(user);
    }

    @Override
    @Transactional
    public ProfileResponse updateAvatar(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("用户不存在"));
        user.setAvatar(avatarUrl);
        userRepository.save(user);
        return toProfileResponse(user);
    }

    private ProfileResponse toProfileResponse(User user) {
        String phone = user.getPhone();
        String phoneMasked = null;
        if (phone != null && phone.length() >= 11) {
            phoneMasked = phone.substring(0, 3) + "****" + phone.substring(7);
        }
        return ProfileResponse.builder()
                .userId(user.getUserId())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .phoneMasked(phoneMasked)
                .build();
    }

    @Override
    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("用户不存在"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw BusinessException.badRequest("旧密码错误");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
