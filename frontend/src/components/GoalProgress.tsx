'use client';

import React, { useEffect } from 'react';
import { Progress, Typography, Space } from 'antd';
import { fetchGoalProgress } from '@/api/dashboard';
import { useDashboardStore } from '@/stores/dashboardStore';

const { Text } = Typography;

const GoalProgress = () => {
  const { weeklyProgress, monthlyProgress, setWeeklyProgress, setMonthlyProgress, refreshKey } = useDashboardStore();

  useEffect(() => {
    fetchGoalProgress('weekly')
      .then((res) => setWeeklyProgress(res))
      .catch((e) => { console.error('fetchGoalProgress weekly failed:', e); });
    fetchGoalProgress('monthly')
      .then((res) => setMonthlyProgress(res))
      .catch((e) => { console.error('fetchGoalProgress monthly failed:', e); });
  }, [refreshKey, setWeeklyProgress, setMonthlyProgress]);

  const renderProgress = (
    label: string,
    progress: { target: number; current: number; percentage: number } | null,
  ) => {
    if (!progress || progress.target === 0) {
      return (
        <div className="mb-4">
          <Text type="secondary" className="block mb-1">{label}：未设置目标</Text>
          <Progress percent={0} showInfo={false} size="small" />
        </div>
      );
    }

    const status = progress.current >= progress.target ? 'success' as const : 'active' as const;

    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <Text strong>{label}</Text>
          <Text type="secondary">
            {progress.current} / {progress.target} 次
          </Text>
        </div>
        <Progress percent={Math.round(progress.percentage * 10) / 10} status={status} size="small" />
      </div>
    );
  };

  return (
    <div>
      {renderProgress('本周进度', weeklyProgress)}
      {renderProgress('本月进度', monthlyProgress)}
    </div>
  );
};

export default GoalProgress;
