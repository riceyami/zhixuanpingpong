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
}
