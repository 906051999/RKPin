import React, { useState, useEffect } from 'react';
import { getChatMessages, setChatMessages, clearChatMessages, isClientSide } from '@/utils/storageManager';
import BilibiliContent from './content/BilibiliContent';
import LinkContent from './content/LinkContent';
import TelegramContent from './content/TelegramContent';
import WeixinContent from './content/WeixinContent';
import WeiboContent from './content/WeiboContent';
import ReplyContent from './content/ReplyContent';
import ChatPart from './CardChatPart';

const presetTagConfig = {
    GitHub: ['项目总结', '技术分析'],
    Bilibili: ['视频摘要', '观点评析'],
    Telegram: ['消息总结', '话题分析'],
    Weixin: ['内容总结', '观点分析'],
    'Weixin Official Accounts Platform': ['内容总结', '观点分析'],
    Weibo: ['内容摘要', '话题评析'],
    Link: ['网站总结', '类型分析'],
    UnsupportedMedia: ['内容描述', '媒体类型'],
};  

const CardBase = ({ message, isVertical, children }) => {
  const [showChatPart, setShowChatPart] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    if (isClientSide()) {
      const storedMessages = getChatMessages(message.uniqueId);
      setChatMessages(storedMessages);
      setHasHistory(storedMessages.length > 0);
    }
  }, [message.uniqueId]);

  const handleAIChat = () => {
    setShowChatPart(!showChatPart);
  };

  const handleClearChat = () => {
    clearChatMessages(message.uniqueId);
    setChatMessages([]);
    setHasHistory(false);
  };

  const handleUpdateChat = (newMessages) => {
    setChatMessages(message.uniqueId, newMessages);
    setChatMessages(newMessages);
    setHasHistory(newMessages.length > 0);
  };

  const renderContent = () => {
    if (!message.parsedContent) {
      return <p className="text-gray-700">{message.content || '无内容'}</p>;
    }

    console.log('Rendering content for type:', message.type, 'Content:', message.parsedContent);

    switch (message.type.toLowerCase()) {
      case 'bilibili':
        return <BilibiliContent content={message.parsedContent} />;
      case 'link':
      case 'github':
        return <LinkContent content={message.parsedContent} />;
      case 'telegram':
        return <TelegramContent content={message.parsedContent} />;
      case 'weixin':
      case 'weixin official accounts platform':
        return <WeixinContent content={message.parsedContent} />;
      case 'weibo':
        return <WeiboContent content={message.parsedContent} />;
      case 'unsupportedmedia':
        return (
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-gray-700 mb-2">{message.parsedContent.label}</p>
            <a
              href={message.parsedContent.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              在 Telegram 中查看
            </a>
          </div>
        );
      default:
        return <p className="text-gray-700">{JSON.stringify(message.parsedContent)}</p>;
    }
  };

  const getPresetTags = () => {
    return presetTagConfig[message.type] || [];
  };

  const renderAuthor = () => {
    return { __html: message.author };
  };

  return children({
    showChatPart,
    hasHistory,
    handleAIChat,
    renderContent,
    renderAuthor,
    getPresetTags,
    handleUpdateChat,
    handleClearChat,
    chatMessages,
  });
};

export default CardBase;
