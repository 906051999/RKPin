import React from 'react';
import BilibiliContent from './content/BilibiliContent';
import GitHubContent from './content/GitHubContent';
import TelegramContent from './content/TelegramContent';

const Card = ({ message }) => {
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
    </div>
  );
};

export default Card;
