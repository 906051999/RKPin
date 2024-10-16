import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [lastMessageId, setLastMessageId] = useState(null);

  const fetchTotalMessages = useCallback(() => {
    const storedContent = JSON.parse(localStorage.getItem('parsed_content') || '[]');
    setTotalMessages(storedContent.length);
  }, []);

  const fetchContent = useCallback(async (refresh = false) => {
    setIsLoading(true);
    try {
      let storedContent = JSON.parse(localStorage.getItem('parsed_content') || '[]');
      
      if (refresh) {
        storedContent = [];
        setLastMessageId(null);
      }

      const url = refresh || storedContent.length === 0
        ? '/api/refresh'
        : `/api/content?before=${lastMessageId}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const { content: newContent, isComplete: complete } = await response.json();
      
      // 去重处理
      const uniqueContent = [...storedContent, ...newContent].reduce((acc, current) => {
        const x = acc.find(item => item.messageId === current.messageId);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      const sortedContent = uniqueContent.sort((a, b) => parseInt(b.messageId) - parseInt(a.messageId));
      localStorage.setItem('parsed_content', JSON.stringify(sortedContent));
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
  }, [lastMessageId]);

  const handleRefresh = useCallback(() => {
    fetchContent(true);
  }, [fetchContent]);

  const handleLoadMore = useCallback(() => {
    if (!isComplete && !isLoading) {
      fetchContent(false);
    }
  }, [isComplete, isLoading, fetchContent]);

  const handleClearLocalStorage = useCallback(() => {
    localStorage.removeItem('parsed_content');
    setContent([]);
    setTotalMessages(0);
    setIsComplete(false);
  }, []);

  useEffect(() => {
    fetchContent();
    fetchTotalMessages();
  }, [fetchContent, fetchTotalMessages]);

  const value = {
    content,
    isLoading,
    isComplete,
    totalMessages,
    fetchContent,
    fetchTotalMessages,
    handleRefresh,
    handleLoadMore,
    handleClearLocalStorage
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

