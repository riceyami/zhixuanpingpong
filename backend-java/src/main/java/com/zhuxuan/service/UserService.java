package com.zhuxuan.service;

import com.zhuxuan.dto.RegisterRequest;
import com.zhuxuan.dto.UserResponse;

/**
 * 用户业务接口
 */
public interface UserService {
    
    /**
     * 用户注册
     * @param request 注册信息
     * @return 注册成功的用户信息
     */
    UserResponse register(RegisterRequest request);

    /**
     * 用户登录
     * @param request 登录信息
     * @return 包含 Token 的登录响应
     */
    com.zhuxuan.dto.LoginResponse login(com.zhuxuan.dto.LoginRequest request);

    /**
     * 刷新 Token
     * @param refreshToken 旧的刷新令牌
     * @return 新的令牌对
     */
    com.zhuxuan.dto.LoginResponse refreshToken(String refreshToken);

    /**
     * 获取个人资料
     */
    com.zhuxuan.dto.ProfileResponse getProfile(Long userId);

    /**
     * 更新昵称
     */
    com.zhuxuan.dto.ProfileResponse updateNickname(Long userId, String nickname);

    /**
     * 更新头像
     */
    com.zhuxuan.dto.ProfileResponse updateAvatar(Long userId, String avatarUrl);

    /**
     * 修改密码
     */
    void changePassword(Long userId, String oldPassword, String newPassword);
}
