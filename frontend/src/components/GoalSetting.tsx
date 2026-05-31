'use client';

import React, { useEffect, useState } from 'react';
import { InputNumber, Button, Form, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { fetchGoal, saveGoal } from '@/api/dashboard';
import { useDashboardStore } from '@/stores/dashboardStore';

const GoalSetting = () => {
  const { goal, setGoal, triggerRefresh } = useDashboardStore();
  const [weekly, setWeekly] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGoal()
      .then((res) => {
        setGoal(res);
        setWeekly(res.weeklyCheckinTarget);
        setMonthly(res.monthlyCheckinTarget);
      })
      .catch((e) => { console.error('fetchGoal failed:', e); });
  }, [setGoal]);

  const handleSave = () => {
    setLoading(true);
    saveGoal({ weeklyCheckinTarget: weekly ?? 0, monthlyCheckinTarget: monthly ?? 0 })
      .then((res) => {
        setGoal(res);
        triggerRefresh();
        message.success('目标已保存');
      })
      .catch((e) => { console.error('saveGoal failed:', e); })
      .finally(() => setLoading(false));
  };

  return (
    <Form layout="vertical" className="max-w-xs">
      <Form.Item label="每周打卡目标（次）">
        <InputNumber
          min={0}
          max={50}
          value={weekly}
          onChange={(val) => setWeekly(val)}
          className="w-full"
          placeholder="例如 5"
        />
      </Form.Item>
      <Form.Item label="每月打卡目标（次）">
        <InputNumber
          min={0}
          max={200}
          value={monthly}
          onChange={(val) => setMonthly(val)}
          className="w-full"
          placeholder="例如 20"
        />
      </Form.Item>
      <Button
        type="primary"
        icon={<SaveOutlined />}
        loading={loading}
        onClick={handleSave}
        block
      >
        保存目标
      </Button>
    </Form>
  );
};

export default GoalSetting;
