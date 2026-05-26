'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Button, Space } from 'antd';
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';
import PostList from '@/components/PostList';
import PostDetail from '@/components/PostDetail';
import CreatePostModal from '@/components/CreatePostModal';
import type { User } from '@/types';

const { Title } = Typography;

const SocialPage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [detailPostId, setDetailPostId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const handlePostClick = (postId: number) => {
    setDetailPostId(postId);
    setDetailOpen(true);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Space>
          <TeamOutlined className="text-2xl text-blue-500" />
          <Title level={2} className="mb-0">社区</Title>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          发布新帖
        </Button>
      </div>

      <PostList
        currentUserId={currentUser?.userId ?? 0}
        onPostClick={handlePostClick}
      />

      <PostDetail
        postId={detailPostId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
};

export default SocialPage;
