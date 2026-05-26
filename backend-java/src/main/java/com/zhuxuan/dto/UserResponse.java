package com.zhuxuan.dto;

import lombok.Data;

/**
 * 用户信息响应 DTO
 */
@Data
public class UserResponse {
    private Long userId;
    private String phone;
    private String email;
    private String nickname;
    private String avatar;
    private Integer role;
}
