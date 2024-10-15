'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import TimeLine from '@/components/TimeLine';
import MessageList from '@/components/MessageList';
import ChatBar from '@/components/ChatBar';

export default function Home() {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

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
    fetchTotalMessages(); // 初始加载时获取总消息数
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

  const [activeId, setActiveId] = useState(null);
  const contentRef = useRef(null);

  const groupedMessages = content.reduce((groups, message) => {
    const date = new Date(message.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedMessages).sort((a, b) => new Date(b) - new Date(a));

  const handleTimelineClick = (id) => {
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCardFocus = (id) => {
    setActiveId(id);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">RKPin</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">加载消息 {totalMessages} 条</span>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              刷新内容
            </button>
          </div>
        </div>
      </header>
      <div className="flex flex-col lg:flex-row flex-grow max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 lg:space-y-0 lg:space-x-8">
        <main className="flex-grow overflow-hidden order-2 lg:order-1">
          {isLoading && content.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="flex bg-gray-100 h-[calc(100vh-6rem)]">
              <TimeLine 
                groupedMessages={groupedMessages}
                sortedDates={sortedDates}
                activeId={activeId}
                onTimelineClick={handleTimelineClick}
                isComplete={isComplete}
                onLoadMore={handleLoadMore}
                isLoading={isLoading}
              />
              <MessageList 
                ref={contentRef}
                groupedMessages={groupedMessages}
                sortedDates={sortedDates}
                onCardFocus={handleCardFocus}
              />
            </div>
          )}
        </main>
        <aside className="w-full lg:w-1/3 lg:min-w-[300px] lg:max-w-[400px] order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <ChatBar />
          </div>
        </aside>
      </div>
    </div>
  );
}
