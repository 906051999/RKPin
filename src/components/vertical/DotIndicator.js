import React from 'react';

const DotIndicator = ({ messages, activeSlideIndex, handleDotClick }) => (
  <div className="flex justify-center bg-gray-50 py-2">
    {messages.map((_, index) => (
      <button
        key={index}
        onClick={() => handleDotClick(index)}
        className={`mx-1 w-2 h-2 rounded-full transition-all duration-300 ${
          index === activeSlideIndex
            ? 'bg-blue-600 w-4'
            : 'bg-gray-300'
        }`}
      />
    ))}
  </div>
);

export default DotIndicator;
