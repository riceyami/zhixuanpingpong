package com.zhuxuan.service;

import com.zhuxuan.dto.LikeResult;

public interface LikeService {
    LikeResult toggleLike(Long postId, Long userId);
}
