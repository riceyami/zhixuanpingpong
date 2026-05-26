package com.zhuxuan.service;

import com.zhuxuan.dto.PostDTO;
import org.springframework.data.domain.Page;

public interface PostService {
    PostDTO createPost(Long userId, String title, String content);
    Page<PostDTO> getPostList(int page, int pageSize, Long userId);
    PostDTO getPostDetail(Long postId, Long userId);
    void deletePost(Long postId, Long userId);
}
