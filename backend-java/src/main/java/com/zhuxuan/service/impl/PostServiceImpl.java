package com.zhuxuan.service.impl;

import com.zhuxuan.dto.PostDTO;
import com.zhuxuan.entity.Post;
import com.zhuxuan.entity.User;
import com.zhuxuan.repository.CommentRepository;
import com.zhuxuan.repository.PostLikeRepository;
import com.zhuxuan.repository.PostRepository;
import com.zhuxuan.repository.UserRepository;
import com.zhuxuan.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;

    @Override
    @Transactional
    public PostDTO createPost(Long userId, String title, String content) {
        Post post = new Post();
        post.setUserId(userId);
        post.setTitle(title);
        post.setContent(content);
        post.setStatus(1);
        post = postRepository.save(post);
        return toDTO(post, userId);
    }

    @Override
    public Page<PostDTO> getPostList(int page, int pageSize, Long userId, Long authorId) {
        PageRequest pageRequest = PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "createTime"));
        if (authorId != null) {
            return postRepository.findByUserIdAndStatusOrderByCreateTimeDesc(authorId, 1, pageRequest)
                    .map(post -> toDTO(post, userId));
        }
        return postRepository.findByStatusOrderByCreateTimeDesc(1, pageRequest)
                .map(post -> toDTO(post, userId));
    }

    @Override
    public PostDTO getPostDetail(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));
        return toDTO(post, userId);
    }

    @Override
    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));
        if (!post.getUserId().equals(userId)) {
            throw new RuntimeException("无权删除此帖子");
        }
        postRepository.delete(post);
    }

    private PostDTO toDTO(Post post, Long currentUserId) {
        Long likeCount = postLikeRepository.countByPostId(post.getPostId());
        Long commentCount = commentRepository.countByPostId(post.getPostId());
        boolean isLiked = postLikeRepository.existsByUserIdAndPostId(currentUserId, post.getPostId());

        User user = userRepository.findById(post.getUserId()).orElse(null);

        return PostDTO.builder()
                .postId(post.getPostId())
                .userId(post.getUserId())
                .nickname(user != null ? user.getNickname() : "未知用户")
                .avatar(user != null ? user.getAvatar() : null)
                .title(post.getTitle())
                .content(post.getContent())
                .status(post.getStatus())
                .likeCount(likeCount)
                .commentCount(commentCount)
                .isLiked(isLiked)
                .createTime(post.getCreateTime())
                .build();
    }
}
