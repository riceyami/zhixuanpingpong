package com.zhuxuan.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 登录请求 DTO
 */
@Data
public class LoginRequest {
    
    @NotBlank(message = "账号不能为空")
    private String username; // 手机号或邮箱
    
    @NotBlank(message = "密码不能为空")
    private String password;
}
