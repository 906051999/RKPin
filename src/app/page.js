'use client';

import { useState, useEffect, useCallback } from 'react';
import Horizontal from '@/components/layout/Horizontal';
import Vertical from '@/components/layout/Vertical';

export default function Home() {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [isVertical, setIsVertical] = useState(false);

  const fetchTotalMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/total');
      if (!response.ok) throw new Error('Failed to fetch total messages');
      const { totalMessages } = await response.json();
      setTotalMessages(totalMessages);
    } catch (error) {
      console.error('Error fetching total messages:', error);
    }
  }, []);

  const fetchContent = useCallback(async (refresh = false) => {
    setIsLoading(true);
    try {
      const lastMessageId = content.length > 0 ? content[content.length - 1].messageId : '';
      const url = `/api/${refresh ? 'refresh' : 'content'}${!refresh && lastMessageId ? `?before=${lastMessageId}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const { content: newContent, isComplete: complete, totalMessages } = await response.json();
      
      if (Array.isArray(newContent)) {
        setContent(prevContent => {
          const uniqueData = refresh ? newContent : [...prevContent, ...newContent];
          return Array.from(new Map(uniqueData.map(item => [item.messageId, item])).values());
        });
        setIsComplete(complete);
        setTotalMessages(totalMessages);
      } else {
        console.error('Received invalid content format:', newContent);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  useEffect(() => {
    fetchContent();
    fetchTotalMessages();
    
    const checkOrientation = () => {
      setIsVertical(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const handleRefresh = () => {
    fetchContent(true);
    fetchTotalMessages(); // 刷新时更新总消息数
  };

  const handleLoadMore = () => {
    if (!isComplete && !isLoading) {
      fetchContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">RKPin</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">加载消息 {totalMessages} 条</span>
            {isComplete ? (
              <button
                onClick={handleRefresh}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                刷新内容
              </button>
            ) : (
              <button
                onClick={handleLoadMore}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isLoading ? '加载中...' : '加载更多'}
              </button>
            )}
          </div>
        </div>
      </header>
      {isVertical ? (
        <Vertical 
          content={content}
          isLoading={isLoading}
          isComplete={isComplete}
          totalMessages={totalMessages}
        />
      ) : (
        <Horizontal 
          content={content}
          isLoading={isLoading}
          isComplete={isComplete}
          totalMessages={totalMessages}
          fetchContent={fetchContent}
          fetchTotalMessages={fetchTotalMessages}
          handleRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
