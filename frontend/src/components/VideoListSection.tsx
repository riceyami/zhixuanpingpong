'use client';

import React, { useEffect, useState } from 'react';
import { Card, Tag, Button, Empty, Typography, Modal, Spin, Statistic, Row, Col, Descriptions, message } from 'antd';
import { PlayCircleOutlined, BarChartOutlined, VideoCameraOutlined } from '@ant-design/icons';
import api from '@/services/api';
import type { Video, AnalyzeResult } from '@/types';
import TableCourt from '@/components/TableCourt';

const { Text } = Typography;
const PAGE_SIZE = 6;

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '上传中', color: 'default' },
  1: { label: '已上传', color: 'blue' },
  2: { label: '分析中', color: 'orange' },
  3: { label: '已完成', color: 'green' },
  4: { label: '分析失败', color: 'red' },
};

const VideoListSection = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeModalVisible, setAnalyzeModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const fetchVideos = async (pageNum: number, append: boolean) => {
    setLoading(true);
    try {
      const res = await api.get('/api/video/list', { params: { page: pageNum, size: PAGE_SIZE } });
      const data = res.data.data;
      const newVideos = data.content as Video[];
      if (append) {
        setVideos((prev) => [...prev, ...newVideos]);
      } else {
        setVideos(newVideos);
      }
      setHasMore(pageNum + 1 < data.totalPages);
    } catch {
      if (!append) setVideos([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(0, false);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVideos(nextPage, true);
  };

  const handleViewAnalysis = async (video: Video) => {
    setSelectedVideo(video);
    setAnalyzeModalVisible(true);
    setAnalyzeLoading(true);
    setAnalyzeResult(null);
    try {
      const res = await api.get(`/api/video/result/${video.videoId}`);
      setAnalyzeResult(res.data.data);
    } catch {
    } finally {
      setAnalyzeLoading(false);
    }
  };

  if (initialLoading) {
    return null;
  }

  if (videos.length === 0) {
    return (
      <div className="py-12">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="还没有上传视频"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((video) => {
          const statusInfo = statusMap[video.status] || { label: '未知', color: 'default' };
          return (
            <Card
              key={video.videoId}
              size="small"
              className="shadow-sm"
              cover={
                <div className="bg-gray-100 flex items-center justify-center h-32 rounded-t-lg">
                  <VideoCameraOutlined className="text-4xl text-gray-300" />
                </div>
              }
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(video.createTime).toLocaleDateString()}
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="link"
                    size="small"
                    icon={<PlayCircleOutlined />}
                    onClick={() => window.open(video.fileUrl)}
                  >
                    播放
                  </Button>
                  {video.status >= 3 && (
                    <Button
                      type="link"
                      size="small"
                      icon={<BarChartOutlined />}
                      onClick={() => handleViewAnalysis(video)}
                    >
                      查看分析结果
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {hasMore && (
        <div className="text-center mt-4">
          <Button type="default" loading={loading} onClick={handleLoadMore}>
            加载更多
          </Button>
        </div>
      )}

      <Modal
        title={selectedVideo ? `分析结果 - ${selectedVideo.videoId.slice(0, 8)}...` : '分析结果'}
        open={analyzeModalVisible}
        onCancel={() => setAnalyzeModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Spin spinning={analyzeLoading} tip="加载分析结果...">
          {analyzeResult && (
            <div className="py-4">
              <Row gutter={[16, 16]} className="mb-6">
                <Col span={6}>
                  <Card size="small" className="text-center">
                    <Statistic title="击球次数" value={analyzeResult.hitCount} suffix="次" />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small" className="text-center">
                    <Statistic title="平均球速" value={analyzeResult.ballSpeed.avg} suffix="m/s" precision={1} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small" className="text-center">
                    <Statistic title="最高球速" value={analyzeResult.ballSpeed.max} suffix="m/s" precision={1} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small" className="text-center">
                    <Statistic title="分析耗时" value={analyzeResult.analyzeTime / 1000} suffix="s" precision={1} />
                  </Card>
                </Col>
              </Row>

              <div className="flex justify-center mb-6">
                <TableCourt landingPoints={analyzeResult.landingPoints} width={520} />
              </div>

              <Descriptions title="球速明细" column={1} size="small" bordered>
                <Descriptions.Item label="速度序列 (m/s)">
                  <div className="flex flex-wrap gap-1">
                    {analyzeResult.ballSpeed.sequence.map((s, i) => (
                      <Tag key={i} color={s >= analyzeResult.ballSpeed.avg ? '#ef4444' : '#3b82f6'}>
                        {s.toFixed(1)}
                      </Tag>
                    ))}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default VideoListSection;
