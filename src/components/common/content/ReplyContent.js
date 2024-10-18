import React from 'react';

const ReplyContent = ({ content }) => {
  if (!content) return null;

  return (
    <div className="bg-gray-100 p-3 rounded-md mt-2 mb-4 text-sm">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default ReplyContent;
