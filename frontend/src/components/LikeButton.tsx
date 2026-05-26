'use client';

import React from 'react';
import { Button } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useLike } from '@/hooks/useLike';

interface LikeButtonProps {
  postId: number;
  isLiked: boolean;
  likeCount: number;
}

const LikeButton: React.FC<LikeButtonProps> = ({ postId, isLiked, likeCount }) => {
  const { toggle, loadingId } = useLike();

  return (
    <Button
      type="text"
      size="small"
      icon={isLiked ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
      loading={loadingId === postId}
      onClick={() => toggle(postId, isLiked)}
    >
      {likeCount}
    </Button>
  );
};

export default LikeButton;
