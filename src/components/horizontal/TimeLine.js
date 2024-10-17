import React, { useRef } from 'react';
import DOMPurify from 'dompurify';

const TimeLine = ({ groupedMessages, sortedDates, activeId, onTimelineClick, isComplete }) => {
  const timelineRef = useRef(null);

  const getPreviewContent = (message) => {
    let content = '';
    switch (message.type) {
      case 'Link':
      case 'Weibo':
      case 'Weixin':
      case 'Weixin Official Accounts Platform':
      case 'Bilibili':
      case 'GitHub':
        content = message.parsedContent?.title || '无标题';
        break;
      case 'Telegram':
        content = message.parsedContent?.message || '⚠️ 无法解析内容，请打开 Telegram 查看 ⚠️';
        break;
      default:
        content = message.title || '无标题';
    }

    // 移除所有 HTML 标签，保留纯文本
    const stripHtml = (html) => {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };

    // 提取纯文本内容
    const plainContent = stripHtml(content);

    // 如果纯文本内容为空，返回默认文本
    if (!plainContent.trim()) {
      return '无内容';
    }

    // 提取有意义的第一行内容
    const lines = plainContent.split(/\r?\n|\r|\n/).filter(line => line.trim());
    const firstMeaningfulLine = lines[0] || '';

    // 如果内容过长，截断并添加省略号
    return firstMeaningfulLine.length > 30 
      ? firstMeaningfulLine.substring(0, 30) + '...' 
      : firstMeaningfulLine;
  };

  const renderHTML = (content) => {
    return { __html: DOMPurify.sanitize(content) };
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
                      <span dangerouslySetInnerHTML={renderHTML(getPreviewContent(message))} />
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
