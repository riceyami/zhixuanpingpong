'use client';

import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import { UserOutlined, VideoCameraOutlined, HomeOutlined, LogoutOutlined, TeamOutlined, ProfileOutlined, BarChartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profileStore';

const { Header } = Layout;

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { nickname, avatar, resetProfile } = useProfileStore();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    resetProfile();
    router.push('/');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: <Link href="/profile">个人主页</Link>,
      icon: <ProfileOutlined />,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const navItems = [
    {
      key: '/',
      label: <Link href="/">首页</Link>,
      icon: <HomeOutlined />,
    },
    {
      key: '/video',
      label: <Link href="/video">训练视频</Link>,
      icon: <VideoCameraOutlined />,
    },
    {
      key: '/dashboard',
      label: <Link href="/dashboard">数据看板</Link>,
      icon: <BarChartOutlined />,
    },
    {
      key: '/social',
      label: <Link href="/social">社区</Link>,
      icon: <TeamOutlined />,
    },
  ];

  return (
    <Header className="bg-white border-b flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-8">
        <div className="text-2xl font-bold text-blue-600">智旋 Zhuxuan</div>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={navItems}
          className="border-none min-w-[300px]"
        />
      </div>

      <div className="flex items-center">
        {nickname ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors">
              <Avatar icon={<UserOutlined />} src={avatar} />
              <span className="font-medium">{nickname}</span>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Button type="text" onClick={() => router.push('/auth')}>登录</Button>
            <Button type="primary" onClick={() => router.push('/auth?tab=register')}>注册</Button>
          </Space>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
