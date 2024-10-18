'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import { AppContext, AppProvider } from '@/context/AppContext';
import Layout from '@/components/layout/Layout';
import Header from '@/components/common/Header';

const Home = () => {
  const [isVertical, setIsVertical] = useState(false);
  const [layoutDetermined, setLayoutDetermined] = useState(false);
  const [showChatBar, setShowChatBar] = useState(false);
  const [newContentAvailable, setNewContentAvailable] = useState(false);
  const contentRef = useRef(null);

  const {
    content,
    isLoading,
    isComplete,
    totalMessages,
    handleRefresh,
    handleLoadMore,
    handleClearLocalStorage,
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
    if (content.length > 0) {
      setNewContentAvailable(true);
    }
  }, [content]);

  const toggleChatBar = () => {
    setShowChatBar(prev => !prev);
  };

  const handleScrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
      setNewContentAvailable(false);
    }
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
        isHorizontal={!isVertical}
        toggleChatBar={toggleChatBar}
        showChatBar={showChatBar}
        newContentAvailable={newContentAvailable}
        onScrollToTop={handleScrollToTop}
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
        newContentAvailable={newContentAvailable}
        onScrollToTop={handleScrollToTop}
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
