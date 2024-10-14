import React, { useRef, useState } from 'react';
import MessageList from './MessageList';

const TimeLine = ({ messages, isComplete, onLoadMore, isLoading }) => {
  const [activeId, setActiveId] = useState(null);
  const timelineRef = useRef(null);
  const contentRef = useRef(null);

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
    <div className="flex bg-gray-100 h-[calc(100vh-6rem)]">
      {/* 时间纵贯线 */}
      <div ref={timelineRef} className="w-1/4 lg:w-1/5 h-full overflow-y-auto bg-white shadow-md flex flex-col">
        <nav className="p-4 flex-grow">
          <h2 className="text-xl font-bold mb-4 text-gray-800 sticky top-0 bg-white z-10 py-2">时间线</h2>
          <ul className="space-y-4">
            {sortedDates.map((date) => (
              <li key={date} className="relative">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <button 
                    onClick={() => handleTimelineClick(date)}
                    className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition duration-300"
                  >
                    {date}
                  </button>
                </div>
                <ul className="space-y-1 ml-4 border-l border-gray-200 pl-2">
                  {groupedMessages[date].map((message) => (
                    <li key={message.messageId}>
                      <button 
                        onClick={() => handleTimelineClick(message.messageId)}
                        className={`text-xs ${activeId === message.messageId ? 'text-blue-600 font-semibold' : 'text-gray-600'} hover:text-blue-500 truncate block py-1 text-left w-full transition duration-300`}
                      >
                        {getPreviewContent(message)}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div className="mt-4 sticky bottom-0 bg-white py-3">
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
              <p className="text-center text-gray-500 text-sm">无更多内容</p>
            )}
          </div>
        </nav>
      </div>
      
      {/* 主要内容区域 */}
      <MessageList 
        ref={contentRef}
        groupedMessages={groupedMessages}
        sortedDates={sortedDates}
        onCardFocus={handleCardFocus}
      />
    </div>
  );
};

export default TimeLine;
