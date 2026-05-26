package com.zhuxuan.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * OSS 上传凭证响应 DTO
 */
@Data
@Builder
public class OssPolicyResponse {
    private String accessId;
    private String policy;
    private String signature;
    private String dir;
    private String host;
    private String expire;
    private String acl;
}
