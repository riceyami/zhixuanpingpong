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
public class CommentDTO {
    private Long commentId;
    private Long postId;
    private Long userId;
    private Long parentId;
    private String nickname;
    private String avatar;
    private String content;
    private LocalDateTime createTime;
}
