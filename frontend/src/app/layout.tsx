import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AuthInitializer from "@/components/AuthInitializer";
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "智旋 Zhuxuan - 乒乓球 AI 训练分析平台",
  description: "基于 AI 视觉技术的乒乓球专业训练分析系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}>
        <ConfigProvider locale={zhCN}>
          <AuthInitializer>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
          </AuthInitializer>
        </ConfigProvider>
      </body>
    </html>
  );
}
