import React from 'react';

const WeiboContent = ({ content }) => {
  return (
    <div className="weibo-content">
      <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
      <div 
        className="text-sm mb-2" 
        dangerouslySetInnerHTML={{ __html: content.previewDescription }}
      />
      <a href={content.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
        查看微博
      </a>
    </div>
  );
};

export default WeiboContent;
