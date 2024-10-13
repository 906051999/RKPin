import React, { useEffect, useRef, useState } from 'react';
import Card from './Card';

const TimeLine = ({ messages, isComplete, onLoadMore, isLoading }) => {
  const [activeId, setActiveId] = useState(null);
  const observerRef = useRef(null);

  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedMessages).sort((a, b) => new Date(b) - new Date(a));

  const getPreviewContent = (message) => {
    switch (message.type) {
      case 'Bilibili':
      case 'GitHub':
        return message.parsedContent?.title || '无标题';
      case 'Telegram':
        return message.parsedContent?.message?.substring(0, 30) + '...' || '无内容';
      default:
        return message.title || '无标题';
    }
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    const cards = document.querySelectorAll('.message-card');
    cards.forEach((card) => observerRef.current.observe(card));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [messages]);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* 时间纵贯线 */}
      <div className="w-1/4 lg:w-1/5 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-white shadow-md flex flex-col">
        <nav className="p-4 flex-grow">
          <h2 className="text-xl font-bold mb-4 text-gray-800">时间线</h2>
          <ul className="space-y-6">
            {sortedDates.map((date) => (
              <li key={date} className="relative">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <a href={`#${date}`} className="text-sm font-semibold text-gray-700 hover:text-blue-600">
                    {date}
                  </a>
                </div>
                <ul className="space-y-1 ml-5 border-l border-gray-300 pl-3">
                  {groupedMessages[date].map((message) => (
                    <li key={message.messageId}>
                      <a 
                        href={`#${message.messageId}`} 
                        className={`text-xs ${activeId === message.messageId ? 'text-blue-600 font-semibold' : 'text-gray-600'} hover:text-blue-500 truncate block py-1`}
                      >
                        {getPreviewContent(message)}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {!isComplete ? (
              <button
                onClick={onLoadMore}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center"
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
            ) : (
              <p className="text-center text-gray-500">无更多内容</p>
            )}
          </div>
        </nav>
      </div>
      
      {/* 主要内容区域 */}
      <div className="w-3/4 lg:w-4/5 p-6 space-y-8">
        {sortedDates.map((date) => (
          <section key={date} id={date} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 sticky top-16 bg-white py-4 z-10">
              {date}
            </h2>
            <div className="space-y-6">
              {groupedMessages[date].map((message) => (
                <div id={message.messageId} key={message.messageId} className="message-card">
                  <Card message={message} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default TimeLine;
