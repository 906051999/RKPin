import React, { useRef } from 'react';

const TimeLine = ({ groupedMessages, sortedDates, activeId, onTimelineClick, isComplete }) => {
  const timelineRef = useRef(null);

  const getPreviewContent = (message) => {
    switch (message.type) {
      case 'Bilibili':
      case 'GitHub':
        return message.parsedContent?.title || '无标题';
      case 'Telegram':
        return message.parsedContent?.message?.substring(0, 30) + '...' || '无内容';
      default:
        return message.title || '无标题';
    }
  };

  return (
    <div ref={timelineRef} className="w-1/4 lg:w-1/5 h-full overflow-y-auto bg-white shadow-md flex flex-col">
      <nav className="p-4 flex-grow">
        <h2 className="text-xl font-bold mb-4 text-gray-800 sticky top-0 bg-white z-10 py-2">时间线</h2>
        <ul className="space-y-4">
          {sortedDates.map((date) => (
            <li key={date} className="relative">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <button 
                  onClick={() => onTimelineClick(date)}
                  className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition duration-300"
                >
                  {date}
                </button>
              </div>
              <ul className="space-y-1 ml-4 border-l border-gray-200 pl-2">
                {groupedMessages[date].map((message) => (
                  <li key={message.messageId}>
                    <button 
                      onClick={() => onTimelineClick(message.messageId)}
                      className={`text-xs ${activeId === message.messageId ? 'text-blue-600 font-semibold' : 'text-gray-600'} hover:text-blue-500 truncate block py-1 text-left w-full transition duration-300`}
                    >
                      {getPreviewContent(message)}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TimeLine;
