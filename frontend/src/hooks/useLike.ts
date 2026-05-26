'use client';

import { useState } from 'react';
import { useCommunityStore } from '@/stores/communityStore';
import { toggleLike } from '@/api/community';

export const useLike = () => {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const updatePostLike = useCommunityStore((s) => s.updatePostLike);

  const toggle = async (postId: number, currentLiked: boolean) => {
    updatePostLike(postId, !currentLiked, currentLiked ? 0 : 0);
    setLoadingId(postId);
    try {
      const result = await toggleLike(postId);
      updatePostLike(postId, result.isLiked, result.likeCount);
    } catch {
      updatePostLike(postId, currentLiked, 0);
    } finally {
      setLoadingId(null);
    }
  };

  return { toggle, loadingId };
};
