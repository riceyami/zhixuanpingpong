'use client';

import React, { useState, useRef } from 'react';
import { Input, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useProfileStore } from '@/stores/profileStore';
import { updateNickname } from '@/api/profile';

const EditNickname: React.FC = () => {
  const { nickname, updateNickname: storeUpdateNickname } = useProfileStore();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(nickname);
  const inputRef = useRef<any>(null);

  const handleConfirm = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      message.warning('昵称不能为空');
      return;
    }
    if (trimmed === nickname) {
      setEditing(false);
      return;
    }
    try {
      const profile = await updateNickname(trimmed);
      storeUpdateNickname(profile.nickname);
      message.success('昵称已更新');
      setEditing(false);
    } catch (err: any) {
      message.error('更新失败: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = () => {
    setValue(nickname);
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPressEnter={handleConfirm}
        onBlur={handleConfirm}
        onKeyDown={(e) => { if (e.key === 'Escape') handleCancel(); }}
        maxLength={20}
        autoFocus
        style={{ width: 200 }}
        size="large"
      />
    );
  }

  return (
    <span
      className="inline-flex items-center gap-2 cursor-pointer group hover:text-blue-500 transition-colors"
      onClick={() => { setValue(nickname); setEditing(true); }}
    >
      <span className="text-xl font-semibold">{nickname}</span>
      <EditOutlined className="text-gray-400 group-hover:text-blue-500 text-sm" />
    </span>
  );
};

export default EditNickname;
