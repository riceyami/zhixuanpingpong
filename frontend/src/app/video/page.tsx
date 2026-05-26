'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Button, Card, Table, Tag, message, Space, Typography, Modal } from 'antd';
import { InboxOutlined, PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@/services/api';
import type { Video, OssPolicyResponse } from '@/types';
import axios from 'axios';

const { Dragger } = Upload;
const { Title } = Typography;

const VideoPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取视频列表
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/video/list');
      setVideos(res.data.data);
    } catch (err: any) {
      message.error('加载视频列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // 删除视频
  const handleDelete = async (videoId: string) => {
    try {
      await api.delete(`/api/video/${videoId}`);
      message.success('删除成功');
      fetchVideos();
    } catch (err: any) {
      message.error('删除失败: ' + (err.response?.data?.message || err.message));
    }
  };
  const customRequest = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    
    try {
      console.log('1. 开始获取上传凭证...');
      const policyRes = await api.get('/api/video/upload/token');
      const policy: OssPolicyResponse = policyRes.data.data;
      console.log('2. 获取凭证成功:', policy);

      const formData = new FormData();
      const fileName = `${Date.now()}-${file.name}`;
      const key = `${policy.dir}${fileName}`;

      formData.append('key', key);
      formData.append('policy', policy.policy);
      formData.append('OSSAccessKeyId', policy.accessId);
      formData.append('success_action_status', '200');
      formData.append('signature', policy.signature);
      formData.append('x-oss-object-acl', policy.acl);
      formData.append('file', file);

      console.log('3. 开始直传 OSS, 目标地址:', policy.host);
      await axios.post(policy.host, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            onProgress({ percent: (event.loaded / event.total) * 100 });
          }
        },
      });
      console.log('4. OSS 上传成功');

      console.log('5. 开始保存元数据到后端...');
      const fileUrl = `${policy.host}/${key}`;
      await api.post('/api/video/save', {
        fileUrl: fileUrl,
        duration: 0,
      });
      console.log('6. 元数据保存成功');

      onSuccess('ok');
      message.success(`${file.name} 上传成功`);
      fetchVideos();
    } catch (err: any) {
      console.error('上传过程中发生错误:', err);
      if (err.response) {
        console.error('错误状态码:', err.response.status);
        console.error('错误详情:', err.response.data);
      }
      onError(err);
      message.error(`${file.name} 上传失败 (状态码: ${err.response?.status || 'unknown'})`);
    }
  };

  const columns = [
    {
      title: '视频 ID',
      dataIndex: 'videoId',
      key: 'videoId',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const statusMap: any = {
          0: <Tag color="default">上传中</Tag>,
          1: <Tag color="blue">已上传</Tag>,
          2: <Tag color="orange">分析中</Tag>,
          3: <Tag color="green">分析完成</Tag>,
          4: <Tag color="red">分析失败</Tag>,
        };
        return statusMap[status] || <Tag>未知</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Video) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<PlayCircleOutlined />} 
            onClick={() => window.open(record.fileUrl)}
          >
            播放
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: `确定要删除此视频吗？`,
              onOk: () => handleDelete(record.videoId),
            });
          }}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Title level={2} className="mb-8">训练视频管理</Title>
      
      <Card className="mb-8 shadow-sm">
        <Dragger 
          customRequest={customRequest} 
          showUploadList={false}
          accept="video/*"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined className="text-blue-500" />
          </p>
          <p className="ant-upload-text text-lg">点击或拖拽视频文件至此上传</p>
          <p className="ant-upload-hint text-gray-500">
            支持 MP4, MOV 等格式，单个文件不超过 1GB。视频将自动存储至阿里云 OSS 并进入 AI 分析队列。
          </p>
        </Dragger>
      </Card>

      <Card title="视频历史" className="shadow-sm">
        <Table 
          columns={columns} 
          dataSource={videos} 
          rowKey="videoId" 
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default VideoPage;
