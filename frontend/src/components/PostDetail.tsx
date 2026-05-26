'use client';

import React, { useEffect, useState } from 'react';
import { Drawer, Avatar, Typography, Space, Divider, List, Input, Button, message, Spin } from 'antd';
import { UserOutlined, SendOutlined } from '@ant-design/icons';
import LikeButton from '@/components/LikeButton';
import { getPostDetail, fetchComments, addComment } from '@/api/community';
import type { Post, Comment } from '@/types';
import { format } from 'date-fns';

const { Text, Title, Paragraph } = Typography;

interface PostDetailProps {
  postId: number | null;
  open: boolean;
  onClose: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ postId, open, onClose }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!postId || !open) return;
    setLoading(true);
    Promise.all([getPostDetail(postId), fetchComments(postId)])
      .then(([p, c]) => { setPost(p); setComments(c); })
      .catch(() => message.error('加载详情失败'))
      .finally(() => setLoading(false));
  }, [postId, open]);

  const handleComment = async () => {
    if (!commentText.trim() || !postId) return;
    setSubmitting(true);
    try {
      const newComment = await addComment(postId, { content: commentText.trim() });
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
      message.success('评论成功');
    } catch {
      message.error('评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      title="帖子详情"
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {post && (
          <div>
            <Space className="mb-4">
              <Avatar src={post.avatar} icon={<UserOutlined />} />
              <div>
                <Text strong>{post.nickname}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {format(new Date(post.createTime), 'yyyy-MM-dd HH:mm')}
                </Text>
              </div>
            </Space>
            <Title level={4}>{post.title}</Title>
            <Paragraph className="text-gray-700 whitespace-pre-wrap">{post.content}</Paragraph>
            <LikeButton postId={post.postId} isLiked={post.isLiked} likeCount={post.likeCount} />

            <Divider />
            <Title level={5}>评论 ({comments.length})</Title>

            <List
              dataSource={comments}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} icon={<UserOutlined />} size="small" />}
                    title={
                      <Space>
                        <Text strong style={{ fontSize: 13 }}>{item.nickname}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {format(new Date(item.createTime), 'MM-dd HH:mm')}
                        </Text>
                      </Space>
                    }
                    description={<Text style={{ fontSize: 13 }}>{item.content}</Text>}
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无评论' }}
            />

            <div className="flex gap-2 mt-4">
              <Input
                placeholder="输入评论..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onPressEnter={handleComment}
                maxLength={500}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={submitting}
                onClick={handleComment}
                disabled={!commentText.trim()}
              />
            </div>
          </div>
        )}
      </Spin>
    </Drawer>
  );
};

export default PostDetail;
