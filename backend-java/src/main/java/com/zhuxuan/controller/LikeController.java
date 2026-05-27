package com.zhuxuan.controller;

import com.zhuxuan.dto.LikeResult;
import com.zhuxuan.dto.Result;
import com.zhuxuan.exception.BusinessException;
import com.zhuxuan.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/like")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) throw BusinessException.unauthorized("用户未认证");
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof Long)) throw BusinessException.unauthorized("认证信息异常");
        return (Long) principal;
    }

    @PostMapping
    public Result<LikeResult> toggleLike(@PathVariable Long postId) {
        Long userId = getCurrentUserId();
        return Result.success(likeService.toggleLike(postId, userId));
    }
}
