import React, { useRef } from 'react';
import HorizontalCard from './HorizontalCard';

const MessageList = React.forwardRef(({ groupedMessages, sortedDates, onCardFocus, className }, ref) => {
  const messageRefs = useRef({});

  const handleCardInteraction = (uniqueId) => {
    onCardFocus(uniqueId);
  };

  return (
    <div ref={ref} className={`p-4 space-y-6 overflow-y-auto ${className}`}>
      {sortedDates.map((date) => (
        <section key={date} id={date} className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4 sticky top-0 bg-white py-2 z-10">
            {date}
          </h2>
          <div className="space-y-4">
            {groupedMessages[date].map((message) => (
              <div 
                id={message.uniqueId} 
                key={message.uniqueId} 
                className="message-card transition duration-300 hover:shadow-md"
                ref={el => messageRefs.current[message.uniqueId] = el}
                onMouseEnter={() => handleCardInteraction(message.uniqueId)}
                onClick={() => handleCardInteraction(message.uniqueId)}
                onTouchStart={() => handleCardInteraction(message.uniqueId)}
              >
                <HorizontalCard message={message} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
