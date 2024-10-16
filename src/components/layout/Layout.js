import React from 'react';
import Horizontal from './HorizontalLayout';
import Vertical from './VerticalLayout';

export default function Layout({
  isVertical,
  content,
  isLoading,
  isComplete,
  totalMessages,
  fetchContent,
  fetchTotalMessages,
  handleRefresh,
  showChatBar,
  toggleChatBar
}) {
  return isVertical ? (
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
      showChatBar={showChatBar}
      toggleChatBar={toggleChatBar}
    />
  );
}