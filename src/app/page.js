'use client';

import { useState, useEffect, useCallback } from 'react';
import TimeLine from '@/components/TimeLine';

export default function Home() {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

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
        setTotalMessages(totalMessages); // 使用API返回的总消息数
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
  }, []);

  const handleRefresh = () => {
    fetchContent(true);
  };

  const handleLoadMore = () => {
    if (!isComplete && !isLoading) {
      fetchContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">RKPin</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">总消息数: {totalMessages}</span>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              刷新内容
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && content.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <TimeLine 
            messages={content} 
            isComplete={isComplete} 
            onLoadMore={handleLoadMore} 
            isLoading={isLoading} 
          />
        )}
      </main>
    </div>
  );
}
