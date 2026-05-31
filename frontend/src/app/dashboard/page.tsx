'use client';

import React from 'react';
import { Card, Typography } from 'antd';
import { CheckCircleOutlined, CalendarOutlined, FlagOutlined, BarChartOutlined, EditOutlined, UnorderedListOutlined, VideoCameraOutlined } from '@ant-design/icons';
import CheckInButton from '@/components/CheckInButton';
import CheckInCalendar from '@/components/CheckInCalendar';
import GoalSetting from '@/components/GoalSetting';
import GoalProgress from '@/components/GoalProgress';
import EvaluationForm from '@/components/EvaluationForm';
import EvaluationList from '@/components/EvaluationList';
import VideoListSection from '@/components/VideoListSection';

const { Title } = Typography;

const DashboardPage = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Title level={2} className="mb-8">个人数据看板</Title>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title={<span><FlagOutlined className="mr-2" />训练目标</span>}
          className="shadow-sm"
        >
          <GoalSetting />
        </Card>

        <Card
          title={<span><BarChartOutlined className="mr-2" />目标进度</span>}
          className="shadow-sm"
        >
          <GoalProgress />
        </Card>

        <Card
          title={<span><CheckCircleOutlined className="mr-2" />每日打卡</span>}
          className="shadow-sm"
        >
          <div className="flex flex-col items-center py-8">
            <CheckInButton />
          </div>
        </Card>

        <Card
          title={<span><CalendarOutlined className="mr-2" />打卡日历</span>}
          className="shadow-sm"
        >
          <CheckInCalendar />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card
          title={<span><EditOutlined className="mr-2" />训练自我评价</span>}
          className="shadow-sm"
        >
          <EvaluationForm />
        </Card>

        <Card
          title={<span><UnorderedListOutlined className="mr-2" />近期评价</span>}
          className="shadow-sm"
        >
          <EvaluationList />
        </Card>
      </div>

      <Card
        title={<span><VideoCameraOutlined className="mr-2" />我的视频</span>}
        className="shadow-sm mt-6"
      >
        <VideoListSection />
      </Card>
    </div>
  );
};

export default DashboardPage;
