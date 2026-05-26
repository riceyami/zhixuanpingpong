package com.zhuxuan.service.impl;

import com.zhuxuan.dto.CommentDTO;
import com.zhuxuan.entity.Comment;
import com.zhuxuan.entity.User;
import com.zhuxuan.repository.CommentRepository;
import com.zhuxuan.repository.PostRepository;
import com.zhuxuan.repository.UserRepository;
import com.zhuxuan.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CommentDTO addComment(Long postId, Long userId, Long parentId, String content) {
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("帖子不存在");
        }

        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setParentId(parentId);
        comment.setContent(content);
        comment.setStatus(1);
        comment = commentRepository.save(comment);
        return toDTO(comment);
    }

    @Override
    public List<CommentDTO> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostIdOrderByCreateTimeAsc(postId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private CommentDTO toDTO(Comment comment) {
        User user = userRepository.findById(comment.getUserId()).orElse(null);
        return CommentDTO.builder()
                .commentId(comment.getCommentId())
                .postId(comment.getPostId())
                .userId(comment.getUserId())
                .parentId(comment.getParentId())
                .nickname(user != null ? user.getNickname() : "未知用户")
                .avatar(user != null ? user.getAvatar() : null)
                .content(comment.getContent())
                .createTime(comment.getCreateTime())
                .build();
    }
}
