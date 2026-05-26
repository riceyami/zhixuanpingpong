'use client';

import React from 'react';
import { Card, Avatar, Typography, Space, Popconfirm, message } from 'antd';
import { DeleteOutlined, UserOutlined } from '@ant-design/icons';
import LikeButton from '@/components/LikeButton';
import { deletePost } from '@/api/community';
import { useCommunityStore } from '@/stores/communityStore';
import type { Post } from '@/types';
import { format } from 'date-fns';

const { Text, Paragraph } = Typography;

interface PostCardProps {
  post: Post;
  currentUserId: number;
  onClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onClick }) => {
  const removePost = useCommunityStore((s) => s.removePost);

  const handleDelete = async () => {
    try {
      await deletePost(post.postId);
      removePost(post.postId);
      message.success('删除成功');
    } catch (err: any) {
      message.error('删除失败');
    }
  };

  return (
    <Card
      className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      actions={[
        <LikeButton key="like" postId={post.postId} isLiked={post.isLiked} likeCount={post.likeCount} />,
        <Text key="comment" type="secondary">{post.commentCount} 评论</Text>,
      ]}
    >
      <Card.Meta
        avatar={<Avatar src={post.avatar} icon={<UserOutlined />} />}
        title={
          <Space className="w-full justify-between">
            <Space>
              <Text strong>{post.nickname}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {format(new Date(post.createTime), 'MM-dd HH:mm')}
              </Text>
            </Space>
            {post.userId === currentUserId && (
              <Popconfirm title="确定删除？" onConfirm={(e) => { e?.stopPropagation(); handleDelete(); }} onCancel={(e) => e?.stopPropagation()}>
                <DeleteOutlined
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-400 hover:text-red-500"
                />
              </Popconfirm>
            )}
          </Space>
        }
        description={
          <div>
            <Text strong className="text-base block mb-1">{post.title}</Text>
            <Paragraph ellipsis={{ rows: 3 }} className="text-gray-600 mb-0">
              {post.content}
            </Paragraph>
          </div>
        }
      />
    </Card>
  );
};

export default PostCard;
