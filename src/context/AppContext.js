import React, { createContext, useState, useEffect, useCallback } from 'react';
import ProcessManager from '@/utils/ProcessManager';
import { saveChannelData, getChannelData, clearChannelData, getLastSelectedChannel, setLastSelectedChannel, isClientSide, initializeStorage } from '@/utils/storageManager';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [channelUrl, setChannelUrl] = useState(process.env.TELEGRAM_CHANNEL_URL);
  const [shouldAutoLoad, setShouldAutoLoad] = useState(true);
  const [oldestMessageId, setOldestMessageId] = useState(null);

  useEffect(() => {
    if (isClientSide()) {
      initializeStorage();
      setChannelUrl(getLastSelectedChannel());
    }
  }, []);

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
      
      // 如果是刷新或首次加载，从最新的消息开始获取
      // 如果是加载更多，则使用最老的消息ID
      const url = `/api/refresh?channelUrl=${encodeURIComponent(channelUrl)}${!refresh && oldestMessageId ? `&before=${oldestMessageId}` : ''}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const { content: newContent, isComplete: complete } = await response.json();
      
      // 合并新旧内容，保留最新版本
      const mergedContent = mergeContent(storedContent, newContent);

      saveChannelData(channelUrl, mergedContent);
      setContent(mergedContent);
      setTotalMessages(mergedContent.length);
      setIsComplete(complete);
      
      if (mergedContent.length > 0) {
        setLastMessageId(mergedContent[0].messageId);
        setOldestMessageId(mergedContent[mergedContent.length - 1].messageId);
      }

      setShouldAutoLoad(false);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
      ProcessManager.cancelProcess(channelUrl);
    }
  }, [channelUrl, oldestMessageId]);

  // 合并新旧内容的函数保持不变
  const mergeContent = (oldContent, newContent) => {
    const contentMap = new Map();
    
    // 先添加旧内容
    oldContent.forEach(item => {
      contentMap.set(item.uniqueId, item);
    });

    // 用新内容更新或添加
    newContent.forEach(item => {
      contentMap.set(item.uniqueId, item);
    });

    // 转换回数组并排序
    return Array.from(contentMap.values())
      .sort((a, b) => parseInt(b.messageId) - parseInt(a.messageId));
  };

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
      setOldestMessageId(null);
      setShouldAutoLoad(true);
    }
  }, [channelUrl]);

  const selectChannel = useCallback((newChannelUrl) => {
    ProcessManager.cancelAllProcesses();
    setChannelUrl(newChannelUrl);
    if (isClientSide()) {
      setLastSelectedChannel(newChannelUrl);
      setContent([]);
      setTotalMessages(0);
      setIsComplete(false);
      setLastMessageId(null);
      setOldestMessageId(null);
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
