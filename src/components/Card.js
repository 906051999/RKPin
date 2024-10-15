import React, { useState, useEffect } from 'react';
import BilibiliContent from './content/BilibiliContent';
import GitHubContent from './content/GitHubContent';
import TelegramContent from './content/TelegramContent';
import ChatCard from './ChatCard';
import { abortChat } from '@/lib/llm/chat';

const presetTagConfig = {
  GitHub: ['项目总结', '技术分析'],
  Bilibili: ['视频摘要', '观点评析'],
  Telegram: ['消息总结', '话题分析'],
};

const Card = ({ message, isVertical }) => {
  const [showChatCard, setShowChatCard] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    // 从 localStorage 加载对话内容
    const storedMessages = localStorage.getItem(`chat_${message.messageId}`);
    if (storedMessages) {
      const parsedMessages = JSON.parse(storedMessages);
      setChatMessages(parsedMessages);
      setHasHistory(parsedMessages.length > 0);
    }
  }, [message.messageId]);

  const handleAIChat = () => {
    setShowChatCard(!showChatCard);
  };

  const handleClearChat = () => {
    // 清除 localStorage 中的对话内容
    localStorage.removeItem(`chat_${message.messageId}`);
    setChatMessages([]);
    setHasHistory(false);
  };

  const handleUpdateChat = (newMessages) => {
    // 更新 localStorage 中的对话内容
    localStorage.setItem(`chat_${message.messageId}`, JSON.stringify(newMessages));
    setChatMessages(newMessages);
    setHasHistory(newMessages.length > 0);
  };

  const renderContent = () => {
    if (!message.parsedContent) {
      return <p className="text-gray-700">{message.content || '无内容'}</p>;
    }

    switch (message.type) {
      case 'Bilibili':
        return <BilibiliContent content={message.parsedContent} />;
      case 'GitHub':
        return <GitHubContent content={message.parsedContent} />;
      case 'Telegram':
        return <TelegramContent content={message.parsedContent} />;
      default:
        return <p className="text-gray-700">{JSON.stringify(message.parsedContent)}</p>;
    }
  };

  const getPresetTags = () => {
    return presetTagConfig[message.type] || [];
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-gray-900">{message.author}</span>
        <span className="text-sm text-gray-500">
          {new Date(message.date).toLocaleString('zh-CN')}
        </span>
      </div>
      <div className="text-sm text-gray-600 mb-3">类型: {message.type}</div>
      {renderContent()}
      {message.replyId && (
        <div className="text-sm text-gray-500 mt-4">
          回复消息ID: {message.replyId}
        </div>
      )}
      
      {!isVertical && (
        <div className="flex justify-end items-center mt-4">
          <button
            onClick={handleAIChat}
            className={`${
              showChatCard ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
            } text-white font-semibold py-1 px-2 rounded text-sm transition duration-300 ease-in-out flex items-center`}
          >
            {showChatCard ? '关闭对话' : 'AI对话'}
            {hasHistory && !showChatCard && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
            )}
          </button>
        </div>
      )}
      
      {(showChatCard || isVertical) && (
        <div className={isVertical ? "mt-4" : "mt-4"}>
          <ChatCard 
            content={message.parsedContent}
            contentType={message.type}
            presetTags={getPresetTags()}
            messages={chatMessages}
            onUpdateMessages={handleUpdateChat}
            onClearChat={handleClearChat}
          />
        </div>
      )}
    </div>
  );
};

export default Card;
