'use client';

import React, { useState } from 'react';
import { Modal, Input, Form, message } from 'antd';
import { useCreatePost } from '@/hooks/useCreatePost';

const { TextArea } = Input;

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const { submit, loading } = useCreatePost();
  const [submitted, setSubmitted] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitted(true);
      await submit({ title: values.title, content: values.content });
      message.success('发布成功');
      form.resetFields();
      onClose();
    } catch (err: any) {
      if (err.message) message.error(err.message);
    } finally {
      setSubmitted(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="发布新帖"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={submitted || loading}
      okText="发布"
      cancelText="取消"
      destroyOnClose
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          name="title"
          label="标题"
          rules={[
            { required: true, message: '请输入标题' },
            { max: 200, message: '标题不超过 200 字' },
          ]}
        >
          <Input placeholder="输入帖子标题" maxLength={200} showCount />
        </Form.Item>
        <Form.Item
          name="content"
          label="内容"
          rules={[
            { required: true, message: '请输入内容' },
            { min: 2, message: '内容至少 2 个字' },
          ]}
        >
          <TextArea rows={6} placeholder="写点什么..." maxLength={5000} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePostModal;
