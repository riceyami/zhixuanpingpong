'use client';

import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { changePassword } from '@/api/profile';

const ChangePassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.warning('两次输入的新密码不一致');
      return;
    }
    if (values.oldPassword === values.newPassword) {
      message.warning('新密码不能与旧密码相同');
      return;
    }
    setLoading(true);
    try {
      await changePassword(values.oldPassword, values.newPassword);
      message.success('密码修改成功');
      form.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.message || err.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
      <Form.Item
        name="oldPassword"
        label="旧密码"
        rules={[{ required: true, message: '请输入旧密码' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="输入旧密码" />
      </Form.Item>
      <Form.Item
        name="newPassword"
        label="新密码"
        rules={[
          { required: true, message: '请输入新密码' },
          { min: 6, message: '密码至少 6 位' },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="输入新密码" />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label="确认新密码"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: '请再次输入新密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
              return Promise.reject(new Error('两次输入的密码不一致'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="再次输入新密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          修改密码
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChangePassword;
