'use client';

import React, { useEffect, useState } from 'react';
import { List, Typography, Empty } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchEvaluationList, EvaluationResponse } from '@/api/evaluation';
import { useDashboardStore } from '@/stores/dashboardStore';

const { Text } = Typography;

const EvaluationList = () => {
  const [evaluations, setEvaluations] = useState<EvaluationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const { refreshKey } = useDashboardStore();

  useEffect(() => {
    setLoading(true);
    const endDate = dayjs().format('YYYY-MM-DD');
    const startDate = dayjs().subtract(3, 'month').format('YYYY-MM-DD');
    fetchEvaluationList(startDate, endDate, 0, 10)
      .then((res) => setEvaluations(res.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="max-h-80 overflow-y-auto">
      {evaluations.length === 0 && !loading ? (
        <Empty description="暂无训练评价" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          loading={loading}
          dataSource={evaluations}
          renderItem={(item) => (
            <List.Item className="!px-0">
              <div className="w-full">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarOutlined className="text-blue-500" />
                  <Text strong style={{ fontSize: 13 }}>{item.trainDate}</Text>
                </div>
                <Text className="block whitespace-pre-wrap text-gray-600" style={{ fontSize: 13, lineHeight: 1.6 }}>
                  {item.content}
                </Text>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default EvaluationList;
