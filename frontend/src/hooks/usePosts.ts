'use client';

import { useState, useCallback } from 'react';
import { useCommunityStore } from '@/stores/communityStore';
import { fetchPosts } from '@/api/community';

export const usePosts = () => {
  const { posts, totalPages, currentPage, setPosts, appendPosts } = useCommunityStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPosts(page);
      if (page === 0) {
        setPosts(data.content, data.totalPages, data.number);
      } else {
        appendPosts(data.content, data.totalPages, data.number);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '加载帖子失败');
    } finally {
      setLoading(false);
    }
  }, [setPosts, appendPosts]);

  const refresh = useCallback(() => loadPosts(0), [loadPosts]);
  const loadMore = useCallback(
    () => { if (currentPage < totalPages - 1) loadPosts(currentPage + 1); },
    [currentPage, totalPages, loadPosts]
  );

  const hasMore = currentPage < totalPages - 1;

  return { posts, loading, error, hasMore, refresh, loadMore };
};
