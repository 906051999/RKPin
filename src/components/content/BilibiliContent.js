import React from 'react';

const BilibiliContent = ({ content }) => {
  return (
    <div className="bilibili-content">
      <h3 className="text-lg font-semibold">{content.title || '无标题'}</h3>
      {content.previewImage && (
        <img src={content.previewImage} alt={content.title} className="mt-2 max-w-full h-auto" />
      )}
      <p className="text-sm text-gray-600">{content.description || '无描述'}</p>

      {content.stats && (
        <p className="text-xs text-gray-500 mt-1">{content.stats}</p>
      )}
      {content.author && (
        <p className="text-sm font-medium mt-1">作者: {content.author}</p>
      )}
      {content.authorDescription && (
        <p className="text-xs text-gray-600 mt-1">作者简介: {content.authorDescription}</p>
      )}
      {content.link && (
        <a href={content.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-2 inline-block">
          查看视频
        </a>
      )}
    </div>
  );
};

export default BilibiliContent;
