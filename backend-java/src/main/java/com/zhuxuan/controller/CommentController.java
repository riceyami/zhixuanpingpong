package com.zhuxuan.controller;

import com.zhuxuan.dto.AddCommentRequest;
import com.zhuxuan.dto.CommentDTO;
import com.zhuxuan.dto.Result;
import com.zhuxuan.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

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

    @GetMapping
    public Result<List<CommentDTO>> getComments(@PathVariable Long postId) {
        return Result.success(commentService.getCommentsByPostId(postId));
    }

    @PostMapping
    public Result<CommentDTO> addComment(@PathVariable Long postId, @RequestBody AddCommentRequest request) {
        Long userId = getCurrentUserId();
        return Result.success(commentService.addComment(postId, userId, request.getParentId(), request.getContent()));
    }
}
