import axios from 'axios';
import { ApiResponse } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动注入 AccessToken
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一错误处理与 Token 刷新逻辑
api.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse<any>;
    if (res.code !== 200) {
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 如果是 401 错误且未重试过，尝试刷新 Token (Issue 3)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        // 调用刷新接口
        const res = await axios.post('http://localhost:8080/api/user/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        // 更新本地存储
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // 重新发起原始请求
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // 刷新失败，清空并跳转登录
        localStorage.clear();
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
