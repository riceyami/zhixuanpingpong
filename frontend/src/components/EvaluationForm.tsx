'use client';

import React, { useEffect, useState } from 'react';
import { Input, Button, DatePicker, message, Typography } from 'antd';
import { SaveOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchEvaluation, saveEvaluation } from '@/api/evaluation';
import { useDashboardStore } from '@/stores/dashboardStore';

const { TextArea } = Input;
const { Text } = Typography;

const EvaluationForm = () => {
  const { triggerRefresh } = useDashboardStore();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    fetchEvaluation(dateStr)
      .then((res) => {
        if (res) {
          setContent(res.content);
          setSavedContent(res.content);
        } else {
          setContent('');
          setSavedContent(null);
        }
      })
      .catch(() => {});
  }, [selectedDate]);

  const handleSave = () => {
    if (!content.trim()) {
      message.warning('请输入评价内容');
      return;
    }
    setLoading(true);
    const dateStr = selectedDate.format('YYYY-MM-DD');
    saveEvaluation(dateStr, content)
      .then(() => {
        setSavedContent(content);
        triggerRefresh();
        message.success('评价已保存');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const hasChanged = content !== savedContent;

  return (
    <div>
      <div className="mb-3">
        <Text strong className="block mb-1">选择日期</Text>
        <DatePicker
          value={selectedDate}
          onChange={(date) => date && setSelectedDate(date)}
          allowClear={false}
          className="w-full"
        />
      </div>
      <div className="mb-3">
        <Text strong className="block mb-1">训练得失 / 感想 / 技术问题</Text>
        <TextArea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="记录今天的训练感受、技术问题或收获..."
        />
      </div>
      <Button
        type="primary"
        icon={<SaveOutlined />}
        loading={loading}
        onClick={handleSave}
        disabled={!hasChanged || !content.trim()}
        block
      >
        {savedContent ? '更新评价' : '保存评价'}
      </Button>
    </div>
  );
};

export default EvaluationForm;
