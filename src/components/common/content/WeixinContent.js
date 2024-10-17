import React from 'react';

const WeixinContent = ({ content }) => {
  const proxyImageUrl = (url) => url ? `/api/image?url=${encodeURIComponent(url)}` : '';

  return (
    <div className="weixin-content">
      {content.title && (
        <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
      )}
      {content.link && (
        <a href={content.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mb-2 block">
          阅读全文
        </a>
      )}
      {content.previewImage && (
        <img src={proxyImageUrl(content.previewImage)} alt="Weixin preview" className="mt-2 max-w-full h-auto rounded-lg" />
      )}
      {!content.title && !content.link && !content.previewImage && (
        <p className="text-gray-500">无可用内容</p>
      )}
    </div>
  );
};

export default WeixinContent;
