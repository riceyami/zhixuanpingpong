'use client';

import { useState } from 'react';
import { useCommunityStore } from '@/stores/communityStore';
import { createPost } from '@/api/community';
import type { CreatePostRequest } from '@/types';

export const useCreatePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insertPost = useCommunityStore((s) => s.insertPost);

  const submit = async (data: CreatePostRequest) => {
    setLoading(true);
    setError(null);
    try {
      const post = await createPost(data);
      insertPost(post);
      return post;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '发布失败';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
};
