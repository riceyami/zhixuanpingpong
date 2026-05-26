package com.zhuxuan.dto;

import lombok.Builder;
import lombok.Data;

/**
 * 登录成功后的响应数据
 */
@Data
@Builder
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private UserResponse userInfo;
}
