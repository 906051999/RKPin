import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [channelUrl, setChannelUrl] = useState(process.env.TELEGRAM_CHANNEL_URL);

  const fetchContent = useCallback(async (refresh = false) => {
    if (!channelUrl) return;
    setIsLoading(true);
    try {
      const channelName = new URL(channelUrl).pathname.split('/')[2];
      let storedContent = JSON.parse(localStorage.getItem(`parsed_content_${channelName}`) || '[]');
      
      if (refresh) {
        storedContent = [];
        setLastMessageId(null);
      }

      const url = refresh || storedContent.length === 0
        ? `/api/refresh?channelUrl=${encodeURIComponent(channelUrl)}`
        : `/api/content?before=${lastMessageId}&channelUrl=${encodeURIComponent(channelUrl)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const { content: newContent, isComplete: complete } = await response.json();
      
      const uniqueContent = [...storedContent, ...newContent].reduce((acc, current) => {
        const x = acc.find(item => item.uniqueId === current.uniqueId);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      const sortedContent = uniqueContent.sort((a, b) => parseInt(b.messageId) - parseInt(a.messageId));
      localStorage.setItem(`parsed_content_${channelName}`, JSON.stringify(sortedContent));
      setContent(sortedContent);
      setTotalMessages(sortedContent.length);
      setIsComplete(complete);
      
      if (sortedContent.length > 0) {
        setLastMessageId(sortedContent[sortedContent.length - 1].messageId);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  }, [lastMessageId, channelUrl]);

  const handleRefresh = useCallback(() => {
    fetchContent(true);
  }, [fetchContent]);

  const handleLoadMore = useCallback(() => {
    if (!isComplete && !isLoading) {
      fetchContent(false);
    }
  }, [isComplete, isLoading, fetchContent]);

  const handleClearLocalStorage = useCallback(() => {
    if (channelUrl) {
      const channelName = new URL(channelUrl).pathname.split('/')[2];
      localStorage.removeItem(`parsed_content_${channelName}`);
      setContent([]);
      setTotalMessages(0);
      setIsComplete(false);
      setLastMessageId(null);
    }
  }, [channelUrl]);

  useEffect(() => {
    const channelName = new URL(channelUrl).pathname.split('/')[2];
    const storedContent = JSON.parse(localStorage.getItem(`parsed_content_${channelName}`) || '[]');
    if (storedContent.length > 0) {
      setContent(storedContent);
      setTotalMessages(storedContent.length);
      setLastMessageId(storedContent[storedContent.length - 1].messageId);
    } else {
      fetchContent(true);
    }
  }, [channelUrl, fetchContent]);

  const value = {
    content,
    isLoading,
    isComplete,
    totalMessages,
    fetchContent,
    handleRefresh,
    handleLoadMore,
    handleClearLocalStorage,
    channelUrl,
    setChannelUrl,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
