import React from 'react';

const GitHubContent = ({ content }) => {
  const proxyImageUrl = (url) => `/api/image?url=${encodeURIComponent(url)}`;

  return (
    <div className="github-content">
      <h3 className="text-lg font-semibold">{content.title}</h3>
      <p className="text-sm text-gray-600">{content.previewDescription}</p>
      {content.previewImage && (
        <img src={proxyImageUrl(content.previewImage)} alt={content.title} className="mt-2 max-w-full h-auto" />
      )}
      <div className="mt-2">
        <a href={content.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-block">
          查看仓库
        </a>
      </div>
    </div>
  );
};

export default GitHubContent;
