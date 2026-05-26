'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { Spin, Empty, Button } from 'antd';
import PostCard from '@/components/PostCard';
import { usePosts } from '@/hooks/usePosts';

interface PostListProps {
  currentUserId: number;
  onPostClick: (postId: number) => void;
}

const PostList: React.FC<PostListProps> = ({ currentUserId, onPostClick }) => {
  const { posts, loading, error, hasMore, refresh, loadMore } = usePosts();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={refresh}>重试</Button>
      </div>
    );
  }

  if (!loading && posts.length === 0) {
    return <Empty description="暂无帖子，快去发布第一条吧" className="py-12" />;
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post.postId}
          post={post}
          currentUserId={currentUserId}
          onClick={() => onPostClick(post.postId)}
        />
      ))}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          <Spin />
        </div>
      )}
      {loading && posts.length === 0 && (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default PostList;
