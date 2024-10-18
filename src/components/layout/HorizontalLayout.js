import { useState } from 'react';
import TimeLine from '@/components/horizontal/TimeLine';
import MessageList from '@/components/horizontal/MessageList';
import ChatBar from '@/components/horizontal/ChatBar';

export default function Horizontal({ 
  content, 
  isLoading, 
  isComplete, 
  totalMessages, 
  fetchContent, 
  fetchTotalMessages, 
  handleRefresh, 
  contentRef,
  showChatBar,
  newContentAvailable,
  onScrollToTop
}) {
  const [activeId, setActiveId] = useState(null);

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
    <div className="flex h-[calc(100vh-4rem)]">
      <TimeLine 
        groupedMessages={groupedMessages}
        sortedDates={sortedDates}
        activeId={activeId}
        onTimelineClick={handleTimelineClick}
        isComplete={isComplete}
        newContentAvailable={newContentAvailable}
        onScrollToTop={onScrollToTop}
      />
      <MessageList 
        ref={contentRef}
        groupedMessages={groupedMessages}
        sortedDates={sortedDates}
        onCardFocus={handleCardFocus}
        className={`flex-grow ${!showChatBar ? 'w-full' : ''}`}
      />
      {showChatBar && (
        <ChatBar />
      )}
    </div>
  );
}
