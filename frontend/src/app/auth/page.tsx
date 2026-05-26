'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 登录处理
  const onLogin = async (values: any) => {
    setLoading(true);
    try {
      const res = await api.post('/api/user/login', {
        username: values.username,
        password: values.password,
        type: 'phone'
      });
      
      const { accessToken, refreshToken, userInfo } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      message.success('登录成功！');
      router.push('/dashboard');
    } catch (err: any) {
      message.error(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 注册处理
  const onRegister = async (values: any) => {
    setLoading(true);
    try {
      await api.post('/api/user/register', {
        phone: values.phone,
        password: values.password,
        nickname: values.nickname
      });
      message.success('注册成功，请登录！');
      // 注册成功后可以切换到登录页签或自动登录
    } catch (err: any) {
      message.error(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">智旋 Zhuxuan</h1>
          <p className="text-gray-500 mt-2">乒乓球训练 AI 分析平台</p>
        </div>

        <Tabs
          centered
          defaultActiveKey="login"
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form onFinish={onLogin} layout="vertical" size="large">
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: '请输入手机号' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="手机号" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                      立即登录
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form onFinish={onRegister} layout="vertical" size="large">
                  <Form.Item
                    name="nickname"
                    rules={[{ required: true, message: '请输入昵称' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="昵称 (2-16字符)" />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
                    ]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="手机号" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                      注册账号
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default AuthPage;
