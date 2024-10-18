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
  toggleChatBar,
  contentRef,
  newContentAvailable,
  onScrollToTop
}) {
  return isVertical ? (
    <Vertical
      content={content}
      isLoading={isLoading}
      isComplete={isComplete}
      totalMessages={totalMessages}
      newContentAvailable={newContentAvailable}
      onScrollToTop={onScrollToTop}
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
      contentRef={contentRef}
    />
  );
}
