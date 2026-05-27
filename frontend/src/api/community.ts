import api from '@/services/api';
import type { Post, Comment, LikeResult, CreatePostRequest, AddCommentRequest, PageResponse } from '@/types';

export const fetchPosts = async (page: number = 0, pageSize: number = 20, authorId?: number) => {
  const params: Record<string, any> = { page, pageSize };
  if (authorId !== undefined) params.authorId = authorId;
  const res = await api.get<{ code: number; message: string; data: PageResponse<Post> }>(
    '/api/posts', { params }
  );
  return res.data.data;
};

export const createPost = async (data: CreatePostRequest) => {
  const res = await api.post<{ code: number; message: string; data: Post }>('/api/posts', data);
  return res.data.data;
};

export const getPostDetail = async (postId: number) => {
  const res = await api.get<{ code: number; message: string; data: Post }>(`/api/posts/${postId}`);
  return res.data.data;
};

export const deletePost = async (postId: number) => {
  await api.delete(`/api/posts/${postId}`);
};

export const fetchComments = async (postId: number) => {
  const res = await api.get<{ code: number; message: string; data: Comment[] }>(
    `/api/posts/${postId}/comments`
  );
  return res.data.data;
};

export const addComment = async (postId: number, data: AddCommentRequest) => {
  const res = await api.post<{ code: number; message: string; data: Comment }>(
    `/api/posts/${postId}/comments`, data
  );
  return res.data.data;
};

export const toggleLike = async (postId: number) => {
  const res = await api.post<{ code: number; message: string; data: LikeResult }>(
    `/api/posts/${postId}/like`
  );
  return res.data.data;
};
