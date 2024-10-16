import React from 'react';

const TelegramContent = ({ content }) => {
  const proxyImageUrl = (url) => `/api/image?url=${encodeURIComponent(url)}`;

  return (
    <div className="telegram-content">
      {content.forwardFrom && (
        <p className="text-sm text-gray-500 mb-2">{content.forwardFrom}</p>
      )}
      {content.message && (
        <div 
          className="text-sm mb-2" 
          dangerouslySetInnerHTML={{ __html: content.message }}
        />
      )}
      {content.previewImage && (
        <img src={proxyImageUrl(content.previewImage)} alt="Telegram preview" className="mt-2 max-w-full h-auto rounded-lg" />
      )}
    </div>
  );
};

export default TelegramContent;