import React, { useState, useEffect } from 'react';
import BilibiliContent from '../common/content/BilibiliContent';
import LinkContent from './content/LinkContent';
import TelegramContent from '../common/content/TelegramContent';
import WeixinContent from '../common/content/WeixinContent';
import WeiboContent from '../common/content/WeiboContent';
import ChatPart from './ChatPart';

const presetTagConfig = {
  GitHub: ['项目总结', '技术分析'],
  Bilibili: ['视频摘要', '观点评析'],
  Telegram: ['消息总结', '话题分析'],
  Weixin: ['内容总结', '观点分析'],
  'Weixin Official Accounts Platform': ['内容总结', '观点分析'],
  Weibo: ['内容摘要', '话题评析'],
  Link: ['网站总结', '类型分析'],
};

const Card = ({ message, isVertical }) => {
  const [showChatPart, setShowChatPart] = useState(false);
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
    setShowChatPart(!showChatPart);
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

    console.log('Rendering content for type:', message.type, 'Content:', message.parsedContent); // 添加日志

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
              showChatPart ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
            } text-white font-semibold py-1 px-2 rounded text-sm transition duration-300 ease-in-out flex items-center`}
          >
            {showChatPart ? '关闭对话' : 'AI对话'}
            {hasHistory && !showChatPart && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
            )}
          </button>
        </div>
      )}
      
      {(showChatPart || isVertical) && (
        <div className={isVertical ? "mt-4" : "mt-4"}>
          <ChatPart 
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
