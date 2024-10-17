import React, { createContext, useState, useEffect, useCallback } from 'react';
import ProcessManager from '@/utils/ProcessManager';
import { saveChannelData, getChannelData, clearChannelData } from '@/utils/storageManager';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [channelUrl, setChannelUrl] = useState(() => {
    // 从 localStorage 中获取上次选中的频道，如果没有则使用默认频道
    return localStorage.getItem('lastSelectedChannel') || process.env.TELEGRAM_CHANNEL_URL;
  });
  const [shouldAutoLoad, setShouldAutoLoad] = useState(true);

  const fetchContent = useCallback(async (refresh = false) => {
    if (!channelUrl) return;
    setIsLoading(true);

    const fetchProcess = {
      cancel: () => {
        setIsLoading(false);
      }
    };

    ProcessManager.startProcess(channelUrl, fetchProcess);

    try {
      let storedContent = getChannelData(channelUrl) || [];
      
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
      saveChannelData(channelUrl, sortedContent);
      setContent(sortedContent);
      setTotalMessages(sortedContent.length);
      setIsComplete(complete);
      
      if (sortedContent.length > 0) {
        setLastMessageId(sortedContent[sortedContent.length - 1].messageId);
      }

      setShouldAutoLoad(false);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
      ProcessManager.cancelProcess(channelUrl);
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
      clearChannelData(channelUrl);
      setContent([]);
      setTotalMessages(0);
      setIsComplete(false);
      setLastMessageId(null);
      setShouldAutoLoad(true);
    }
  }, [channelUrl]);

  const selectChannel = useCallback((newChannelUrl) => {
    ProcessManager.cancelAllProcesses();
    setChannelUrl(newChannelUrl);
    localStorage.setItem('lastSelectedChannel', newChannelUrl); // 保存选中的频道到 localStorage
    const storedContent = getChannelData(newChannelUrl);
    if (storedContent) {
      setContent(storedContent);
      setTotalMessages(storedContent.length);
      setIsComplete(false);
      setLastMessageId(storedContent[storedContent.length - 1]?.messageId || null);
      setShouldAutoLoad(false);
    } else {
      setContent([]);
      setTotalMessages(0);
      setIsComplete(false);
      setLastMessageId(null);
      setShouldAutoLoad(true);
    }
  }, []);

  useEffect(() => {
    // 页面刷新时加载上次选中的频道
    selectChannel(channelUrl);
  }, [selectChannel, channelUrl]);

  useEffect(() => {
    if (shouldAutoLoad) {
      fetchContent(true).catch(() => {
        // 如果加载失败，切换回默认频道
        const defaultChannel = process.env.TELEGRAM_CHANNEL_URL;
        if (channelUrl !== defaultChannel) {
          alert('加载频道数据失败，已切换回默认频道。');
          selectChannel(defaultChannel);
        }
      });
    }
  }, [fetchContent, shouldAutoLoad, channelUrl, selectChannel]);

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
    selectChannel,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
