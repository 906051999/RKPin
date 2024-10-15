import { useState, useEffect, useCallback, useRef } from 'react';
import TimeLine from '@/components/TimeLine';
import MessageList from '@/components/MessageList';
import ChatBar from '@/components/ChatBar';

export default function Horizontal({ content, isLoading, isComplete, totalMessages, fetchContent, fetchTotalMessages, handleRefresh, showChatBar, toggleChatBar }) {
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
          <button
            onClick={toggleChatBar}
            className="w-full mb-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            {showChatBar ? '隐藏聊天栏' : '显示聊天栏'}
          </button>
          {showChatBar && <ChatBar />}
        </div>
      </aside>
    </div>
  );
}
