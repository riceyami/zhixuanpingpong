package com.zhuxuan.controller;

import com.zhuxuan.dto.CreatePostRequest;
import com.zhuxuan.dto.PostDTO;
import com.zhuxuan.dto.Result;
import com.zhuxuan.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new RuntimeException("用户未认证");
        }
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof Long)) {
            throw new RuntimeException("认证信息异常");
        }
        return (Long) principal;
    }

    @PostMapping
    public Result<PostDTO> createPost(@RequestBody CreatePostRequest request) {
        Long userId = getCurrentUserId();
        return Result.success(postService.createPost(userId, request.getTitle(), request.getContent()));
    }

    @GetMapping
    public Result<Page<PostDTO>> getPostList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = getCurrentUserId();
        return Result.success(postService.getPostList(page, pageSize, userId));
    }

    @GetMapping("/{postId}")
    public Result<PostDTO> getPostDetail(@PathVariable Long postId) {
        Long userId = getCurrentUserId();
        return Result.success(postService.getPostDetail(postId, userId));
    }

    @DeleteMapping("/{postId}")
    public Result<Void> deletePost(@PathVariable Long postId) {
        Long userId = getCurrentUserId();
        try {
            postService.deletePost(postId, userId);
            return Result.success(null);
        } catch (RuntimeException e) {
            return Result.error(401, e.getMessage());
        }
    }
}
