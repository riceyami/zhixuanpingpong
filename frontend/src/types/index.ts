/**
 * 智旋 (Zhuxuan) - 前端类型定义
 * 严格遵循 DATA_DICTIONARY.md 与 API_DICTIONARY.md 规范
 */

// --- 基础业务模型 ---

export interface User {
  userId: number;
  phone?: string;
  email?: string;
  nickname: string;
  avatar?: string;
  role: number; // 0-普通用户, 1-教练, 2-管理员
  status: number; // 0-禁用, 1-正常
}

export interface RacketConfig {
  userId: number;
  baseplate?: string;
  rubberForehand?: string;
  rubberBackhand?: string;
}

// --- API 响应标准格式 ---

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// --- 认证相关 DTO ---

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userInfo: User;
}

// --- 视频与 AI 相关 ---

export interface Video {
  videoId: string;
  userId: number;
  fileUrl: string;
  coverUrl?: string;
  duration: number;
  status: number; // 0-上传中, 1-已上传, 2-分析中, 3-分析完成, 4-分析失败
  createTime: string;
}

export interface AnalyzeResult {
  resultId: string;
  videoId: string;
  trackData: Array<{ x: number; y: number; t: number }>;
  ballSpeed: {
    avg: number;
    max: number;
    sequence: number[];
  };
  landingPoints: Array<{ x: number; y: number }>;
  hitCount: number;
  analyzeTime: number;
}

// --- OSS 上传凭证 ---

export interface OssPolicyResponse {
  accessId: string;
  policy: string;
  signature: string;
  dir: string;
  host: string;
  expire: string;
  acl: string;
}
