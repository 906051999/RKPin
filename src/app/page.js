'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import { AppContext, AppProvider } from '@/context/AppContext';
import Layout from '@/components/layout/Layout';
import Header from '@/components/common/Header';
import { usePathname } from 'next/navigation';

const Home = () => {
  const [isVertical, setIsVertical] = useState(false);
  const [layoutDetermined, setLayoutDetermined] = useState(false);
  const [showChatBar, setShowChatBar] = useState(false);
  const pathname = usePathname();
  const channelName = pathname.slice(1); // 移除开头的 '/'
  const contentRef = useRef(null);

  const {
    content,
    isLoading,
    isComplete,
    totalMessages,
    handleRefresh,
    handleLoadMore,
    handleClearLocalStorage,
    setChannelUrl,
    fetchContent
  } = useContext(AppContext);

  useEffect(() => {
    const checkOrientation = () => {
      setIsVertical(window.innerHeight > window.innerWidth);
      setLayoutDetermined(true);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    if (channelName) {
      setChannelUrl(`https://t.me/s/${channelName}`);
    } else {
      // 如果没有后缀，使用默认频道 URL
      setChannelUrl(process.env.TELEGRAM_CHANNEL_URL);
    }
  }, [channelName, setChannelUrl]);

  useEffect(() => {
    if (content.length === 0) {
      fetchContent(true);
    }
  }, [content.length, fetchContent]);

  useEffect(() => {
    if (contentRef.current && content.length > 0) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content]);

  const toggleChatBar = () => {
    setShowChatBar(prev => !prev);
  };

  if (!layoutDetermined) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header
        totalMessages={totalMessages}
        isComplete={isComplete}
        isLoading={isLoading}
        handleRefresh={handleRefresh}
        handleLoadMore={handleLoadMore}
        handleClearLocalStorage={handleClearLocalStorage}
      />
      <Layout
        isVertical={isVertical}
        content={content}
        isLoading={isLoading}
        isComplete={isComplete}
        totalMessages={totalMessages}
        showChatBar={showChatBar}
        toggleChatBar={toggleChatBar}
        contentRef={contentRef}
      />
    </div>
  );
};

export default function HomeWrapper() {
  return (
    <AppProvider>
      <Home />
    </AppProvider>
  );
}
