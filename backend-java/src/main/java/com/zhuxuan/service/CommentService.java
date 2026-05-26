package com.zhuxuan.service;

import com.zhuxuan.dto.CommentDTO;

import java.util.List;

public interface CommentService {
    CommentDTO addComment(Long postId, Long userId, Long parentId, String content);
    List<CommentDTO> getCommentsByPostId(Long postId);
}
