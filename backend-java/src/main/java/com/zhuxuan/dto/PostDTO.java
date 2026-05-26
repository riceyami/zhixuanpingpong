package com.zhuxuan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Long postId;
    private Long userId;
    private String nickname;
    private String avatar;
    private String title;
    private String content;
    private Integer status;
    private Long likeCount;
    private Long commentCount;
    private Boolean isLiked;
    private LocalDateTime createTime;
}
