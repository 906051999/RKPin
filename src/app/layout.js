import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "RKPin | AI增强内容聚合平台",
  description: "RKPin是一个内容聚合平台，智能聚合用户定制内容，提供AI实时互动和个性化推荐",
  keywords: "内容聚合, Telegram频道, RSS订阅, AI助手, 智能推荐, 个性化阅读, 实时互动, 信息流, 内容管理 智能分析",
  icons: {
    icon: './favicon.ico'
  },
  openGraph: {
    title: "RKPin | AI增强内容聚合平台",
    description: "智能聚合用户定制内容，提供AI实时互动和个性化推荐",
    type: "website",
    locale: "zh_CN",
    siteName: "RKPin",
    images: ['./favicon.ico']
  },
  twitter: {
    card: "summary_large_image",
    title: "RKPin | AI增强内容聚合平台",
    description: "智能聚合用户定制内容，提供AI实时互动和个性化推荐",
    images: ['./favicon.ico']
  },
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: "https://rkpin.site"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
