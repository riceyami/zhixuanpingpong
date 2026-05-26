package com.zhuxuan.service.impl;

import com.zhuxuan.dto.LikeResult;
import com.zhuxuan.entity.PostLike;
import com.zhuxuan.repository.PostLikeRepository;
import com.zhuxuan.repository.PostRepository;
import com.zhuxuan.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;

    @Override
    @Transactional
    public LikeResult toggleLike(Long postId, Long userId) {
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("帖子不存在");
        }

        boolean isLiked = postLikeRepository.existsByUserIdAndPostId(userId, postId);

        if (isLiked) {
            postLikeRepository.deleteByUserIdAndPostId(userId, postId);
        } else {
            PostLike postLike = new PostLike();
            postLike.setPostId(postId);
            postLike.setUserId(userId);
            postLikeRepository.save(postLike);
        }

        long likeCount = postLikeRepository.countByPostId(postId);

        return new LikeResult(!isLiked, likeCount);
    }
}
