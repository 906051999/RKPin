import React, { useState, useRef, useEffect } from 'react';
import CardBase from '../common/CardBase';
import ChatPart from '../common/CardChatPart';
import ReplyContent from '../common/content/ReplyContent';

const VerticalCard = ({ message }) => {
  const [showChatPart, setShowChatPart] = useState(false);
  const chatPartRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (showChatPart && chatPartRef.current) {
      const cardBottom = cardRef.current.getBoundingClientRect().bottom;
      const viewportHeight = window.innerHeight;
      const remainingSpace = viewportHeight - cardBottom;
      const chatPartHeight = chatPartRef.current.offsetHeight;

      if (remainingSpace < chatPartHeight) {
        chatPartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [showChatPart]);

  return (
    <CardBase message={message} isVertical={true}>
      {({
        hasHistory,
        handleAIChat,
        renderContent,
        renderAuthor,
        getPresetTags,
        handleUpdateChat,
        handleClearChat,
        chatMessages,
      }) => (
        <div ref={cardRef} className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span 
              className="font-semibold text-gray-900"
              dangerouslySetInnerHTML={renderAuthor()}
            />
            <span className="text-sm text-gray-500">
              {new Date(message.date).toLocaleString('zh-CN')}
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-3">类型: {message.type}</div>
          
          {message.replyContent && <ReplyContent content={message.replyContent} />}
          
          {renderContent()}
          
          {message.replyId && (
            <div className="text-sm text-gray-500 mt-4">
              回复消息ID: {message.replyId}
            </div>
          )}
          
          <div className="flex justify-end items-center mt-4">
            <button
              onClick={() => {
                handleAIChat();
                setShowChatPart(!showChatPart);
              }}
              className={`${
                showChatPart ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
              } text-white font-semibold py-1 px-2 rounded text-sm transition duration-300 ease-in-out flex items-center`}
            >
              {showChatPart ? '关闭对话' : 'AI对话'}
              {hasHistory && !showChatPart && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
              )}
            </button>
          </div>
          
          {showChatPart && (
            <div ref={chatPartRef} className="mt-4">
              <ChatPart 
                content={message.parsedContent}
                contentType={message.type}
                presetTags={getPresetTags()}
                messages={chatMessages}
                onUpdateMessages={handleUpdateChat}
                onClearChat={handleClearChat}
              />
            </div>
          )}
        </div>
      )}
    </CardBase>
  );
};

export default VerticalCard;
