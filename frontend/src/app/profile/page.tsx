'use client';

import React, { useEffect } from 'react';
import { Card, Typography, Space, Divider, Button, Descriptions, message } from 'antd';
import { UserOutlined, FileTextOutlined, VideoCameraOutlined, SafetyOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AvatarUpload from '@/components/AvatarUpload';
import EditNickname from '@/components/EditNickname';
import ChangePassword from '@/components/ChangePassword';
import { useProfileStore } from '@/stores/profileStore';
import { fetchProfile } from '@/api/profile';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const router = useRouter();
  const { userId, nickname, avatar, phoneMasked, setProfile, resetProfile } = useProfileStore();

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch((err) => {
        if (err.response?.status === 401) {
          router.push('/auth');
        }
      });
  }, [setProfile, router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    resetProfile();
    message.success('已退出登录');
    router.push('/');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* 顶部卡片 —— 头像 + 昵称 + 手机号 */}
      <Card className="mb-6 shadow-sm">
        <div className="flex flex-col items-center py-4">
          <AvatarUpload />
          <div className="mt-4">
            <EditNickname />
          </div>
          {phoneMasked && (
            <Text type="secondary" className="mt-1">{phoneMasked}</Text>
          )}
        </div>
      </Card>

      {/* 我的内容 */}
      <Card title="我的内容" className="mb-6 shadow-sm">
        <div className="flex gap-4">
          <Link
            href={`/social?authorId=${userId}`}
            className="flex-1 flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <FileTextOutlined className="text-2xl text-blue-500" />
            <div>
              <div className="font-medium">我的帖子</div>
              <Text type="secondary" style={{ fontSize: 12 }}>查看你发布的所有帖子</Text>
            </div>
          </Link>
          <Link
            href="/video"
            className="flex-1 flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <VideoCameraOutlined className="text-2xl text-green-500" />
            <div>
              <div className="font-medium">我的视频</div>
              <Text type="secondary" style={{ fontSize: 12 }}>查看你的训练视频</Text>
            </div>
          </Link>
        </div>
      </Card>

      {/* 账号设置 */}
      <Card title={<span><SafetyOutlined className="mr-2" />账号设置</span>} className="mb-6 shadow-sm">
        <ChangePassword />
        <Divider />
        <Button type="primary" danger ghost onClick={handleLogout}>
          退出登录
        </Button>
      </Card>
    </div>
  );
};

export default ProfilePage;
