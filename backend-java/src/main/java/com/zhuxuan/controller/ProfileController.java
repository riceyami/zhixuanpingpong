package com.zhuxuan.controller;

import com.zhuxuan.dto.*;
import com.zhuxuan.exception.BusinessException;
import com.zhuxuan.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) throw BusinessException.unauthorized("用户未认证");
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof Long)) throw BusinessException.unauthorized("认证信息异常");
        return (Long) principal;
    }

    @GetMapping("/me")
    public Result<ProfileResponse> getProfile() {
        Long userId = getCurrentUserId();
        return Result.success(userService.getProfile(userId));
    }

    @PutMapping("/me")
    public Result<ProfileResponse> updateNickname(@RequestBody UpdateNicknameRequest request) {
        Long userId = getCurrentUserId();
        return Result.success(userService.updateNickname(userId, request.getNickname()));
    }

    @PutMapping("/avatar")
    public Result<ProfileResponse> updateAvatar(@RequestBody UpdateAvatarRequest request) {
        Long userId = getCurrentUserId();
        return Result.success(userService.updateAvatar(userId, request.getAvatarUrl()));
    }

    @PutMapping("/password")
    public Result<Void> changePassword(@RequestBody ChangePasswordRequest request) {
        Long userId = getCurrentUserId();
        try {
            userService.changePassword(userId, request.getOldPassword(), request.getNewPassword());
            return Result.success(null);
        } catch (RuntimeException e) {
            return Result.error(400, e.getMessage());
        }
    }
}
