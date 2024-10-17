import React from 'react';

const DotIndicator = ({ messages, activeUniqueId, handleDotClick }) => (
  <div className="flex justify-center bg-gray-50 py-2">
    {messages.map((message) => (
      <button
        key={message.uniqueId}
        onClick={() => handleDotClick(message.uniqueId)}
        className={`mx-1 w-2 h-2 rounded-full transition-all duration-300 ${
          message.uniqueId === activeUniqueId
            ? 'bg-blue-600 w-4'
            : 'bg-gray-300'
        }`}
      />
    ))}
  </div>
);

export default DotIndicator;
