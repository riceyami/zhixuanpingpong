'use client';

import { Button, Row, Col, Card } from 'antd';
import { VideoCameraOutlined, BarChartOutlined, RocketOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            让每一板球都有迹可循
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            智旋 Zhuxuan：基于 AI 视觉技术的乒乓球专业训练分析平台。
            上传你的训练视频，获取球速、轨迹与落点深度分析。
          </p>
          <div className="flex justify-center gap-4">
            <Button type="primary" size="large" icon={<RocketOutlined />} onClick={() => router.push('/auth')}>
              立即开始训练
            </Button>
            <Button size="large" onClick={() => router.push('/video')}>
              查看演示视频
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">核心功能模块</h2>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card 
                hoverable 
                className="h-full border-none bg-blue-50"
                cover={<div className="flex justify-center pt-10"><VideoCameraOutlined className="text-6xl text-blue-500" /></div>}
                onClick={() => router.push('/video')}
              >
                <Card.Meta 
                  title={<span className="text-xl">训练视频分析</span>}
                  description="支持手机拍摄视频上传，AI 自动提取球路轨迹、球速及落点分布，多角度复盘你的每一记回击。"
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card 
                hoverable 
                className="h-full border-none bg-green-50"
                cover={<div className="flex justify-center pt-10"><BarChartOutlined className="text-6xl text-green-500" /></div>}
                onClick={() => router.push('/dashboard')}
              >
                <Card.Meta 
                  title={<span className="text-xl">个人数据看板</span>}
                  description="多维度的训练统计，追踪你的成长轨迹。每日打卡、周度报告、时长统计，让进步清晰可见。"
                />
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t text-center text-gray-500">
        <p>© 2026 智旋 Zhuxuan - 打造最专业的乒乓球 AI 助手</p>
      </footer>
    </div>
  );
}
