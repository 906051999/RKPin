import React from 'react';

const GitHubContent = ({ content }) => {
  return (
    <div className="github-content">
      <h3 className="text-lg font-semibold">{content.title}</h3>
      <p className="text-sm text-gray-600">{content.previewDescription}</p>
      {content.previewImage && (
        <img src={content.previewImage} alt={content.title} className="mt-2 max-w-full h-auto" />
      )}
      <a href={content.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-2 inline-block">
        查看仓库
      </a>
    </div>
  );
};

export default GitHubContent;
