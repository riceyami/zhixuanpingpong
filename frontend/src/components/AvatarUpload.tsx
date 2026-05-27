'use client';

import React, { useState } from 'react';
import { Avatar, Upload, message } from 'antd';
import { UserOutlined, LoadingOutlined } from '@ant-design/icons';
import { useProfileStore } from '@/stores/profileStore';
import { updateAvatar } from '@/api/profile';
import api from '@/services/api';
import type { OssPolicyResponse } from '@/types';
import axios from 'axios';

const AvatarUpload: React.FC = () => {
  const { avatar, nickname, updateAvatar: storeUpdateAvatar } = useProfileStore();
  const [uploading, setUploading] = useState(false);

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const policyRes = await api.get('/api/video/upload/token');
      const policy: OssPolicyResponse = policyRes.data.data;
      const formData = new FormData();
      formData.append('key', policy.dir + Date.now() + '-' + (file as File).name);
      formData.append('policy', policy.policy);
      formData.append('OSSAccessKeyId', policy.accessId);
      formData.append('signature', policy.signature);
      formData.append('success_action_status', '200');
      formData.append('file', file as File);

      await axios.post(policy.host, formData);
      const avatarUrl = policy.host + '/' + policy.dir + Date.now() + '-' + (file as File).name;

      const profile = await updateAvatar(avatarUrl);
      storeUpdateAvatar(profile.avatar);
      message.success('头像更新成功');
      onSuccess?.(null);
    } catch (err: any) {
      message.error('头像上传失败');
      onError?.(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Upload
      showUploadList={false}
      customRequest={customRequest}
      accept="image/*"
    >
      <Avatar
        size={80}
        src={avatar}
        icon={!avatar ? <UserOutlined /> : undefined}
        className="cursor-pointer ring-2 ring-white hover:ring-blue-400 transition-all"
        style={{ border: '3px solid #e5e7eb' }}
      >
        {uploading ? <LoadingOutlined /> : null}
      </Avatar>
    </Upload>
  );
};

export default AvatarUpload;
