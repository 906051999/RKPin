import React, { useRef } from 'react';
import Card from './Card';

const MessageList = React.forwardRef(({ groupedMessages, sortedDates, onCardFocus }, ref) => {
  const messageRefs = useRef({});

  const handleCardInteraction = (messageId) => {
    onCardFocus(messageId);
  };

  return (
    <div ref={ref} className="w-3/4 lg:w-4/5 p-4 space-y-6 overflow-y-auto">
      {sortedDates.map((date) => (
        <section key={date} id={date} className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4 sticky top-0 bg-white py-2 z-10">
            {date}
          </h2>
          <div className="space-y-4">
            {groupedMessages[date].map((message) => (
              <div 
                id={message.messageId} 
                key={message.messageId} 
                className="message-card transition duration-300 hover:shadow-md"
                ref={el => messageRefs.current[message.messageId] = el}
                onMouseEnter={() => handleCardInteraction(message.messageId)}
                onClick={() => handleCardInteraction(message.messageId)}
                onTouchStart={() => handleCardInteraction(message.messageId)}
              >
                <Card message={message} />
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