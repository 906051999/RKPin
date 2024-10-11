import React from 'react';
import Card from './Card';

const TimeLine = ({ messages, lastMessageRef }) => {
  const groupedMessages = messages.reduce((acc, message) => {
    const date = new Date(message.date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {});

  // 将日期组按照日期降序排序
  const sortedDates = Object.keys(groupedMessages).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="max-w-4xl mx-auto px-4">
      {sortedDates.map((date, groupIndex) => (
        <div key={date} className="timeline-group mb-8">
          <h2 className="timeline-date text-xl font-bold mb-4">{date}</h2>
          {groupedMessages[date].map((message, index) => (
            <div
              key={message.messageId}
              ref={groupIndex === 0 && index === groupedMessages[date].length - 1 ? lastMessageRef : null}
            >
              <Card rawHtml={message.rawHtml} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TimeLine;