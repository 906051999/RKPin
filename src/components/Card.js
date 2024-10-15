import React, { useState } from 'react';
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

const Card = ({ message }) => {
  const [showChatCard, setShowChatCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [useWebSearch, setUseWebSearch] = useState(false);

  const handleAIChat = () => {
    if (isProcessing) {
      abortChat();
      setIsProcessing(false);
      setStatus('已中断');
      setShowChatCard(false);
      return;
    }

    if (showChatCard) {
      setShowChatCard(false);
      setStatus('');
      return;
    }

    setIsProcessing(true);
    setStatus('准备对话');
    setShowChatCard(true);
  };

  const handleChatComplete = () => {
    setStatus('回复完成');
    setIsProcessing(false);
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
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center">
          <label className="flex items-center mr-2">
            <input
              type="checkbox"
              checked={useWebSearch}
              onChange={(e) => setUseWebSearch(e.target.checked)}
              className="mr-1"
            />
            <span className="text-sm">联网搜索</span>
          </label>
          {status && <span className="text-sm text-gray-600 mr-2">{status}</span>}
        </div>
        <button
          onClick={handleAIChat}
          className={`${
            isProcessing ? 'bg-red-500 hover:bg-red-600' : 
            showChatCard ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
          } text-white font-semibold py-1 px-2 rounded text-sm transition duration-300 ease-in-out`}
        >
          {isProcessing ? '停止' : showChatCard ? '关闭对话' : 'AI对话'}
        </button>
      </div>
      {showChatCard && (
        <div className="mt-4">
          <ChatCard 
            content={message.parsedContent}
            contentType={message.type}
            onComplete={handleChatComplete}
            setStatus={setStatus}
            useWebSearch={useWebSearch}
            presetTags={getPresetTags()}
          />
        </div>
      )}
    </div>
  );
};

export default Card;
