'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import { UserOutlined, VideoCameraOutlined, BarChartOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@/types';

const { Header } = Layout;

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 监听本地存储变化或初始化加载
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse userInfo');
      }
    }
  }, [pathname]); // 切换路由时重新检查登录状态

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    setUser(null);
    router.push('/');
  };

  const userMenuItems = [
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
        {user ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors">
              <Avatar icon={<UserOutlined />} src={user.avatar} />
              <span className="font-medium">{user.nickname}</span>
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
