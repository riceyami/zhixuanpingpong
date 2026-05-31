'use client';

import React, { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { CheckCircleOutlined, CheckOutlined } from '@ant-design/icons';
import { fetchTodayCheckin, doCheckin } from '@/api/dashboard';
import { useDashboardStore } from '@/stores/dashboardStore';

const CheckInButton = () => {
  const { todayCheckedIn, setTodayCheckedIn } = useDashboardStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodayCheckin()
      .then((res) => setTodayCheckedIn(res.checkin))
      .catch(() => {});
  }, [setTodayCheckedIn]);

  const handleCheckin = () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    doCheckin(today)
      .then(() => {
        setTodayCheckedIn(true);
        message.success('打卡成功');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  if (todayCheckedIn) {
    return (
      <Button
        type="default"
        size="large"
        icon={<CheckCircleOutlined />}
        disabled
        className="!bg-green-50 !text-green-600 !border-green-300 !cursor-default"
      >
        今日已打卡
      </Button>
    );
  }

  return (
    <Button
      type="primary"
      size="large"
      icon={<CheckOutlined />}
      loading={loading}
      onClick={handleCheckin}
    >
      打卡
    </Button>
  );
};

export default CheckInButton;
