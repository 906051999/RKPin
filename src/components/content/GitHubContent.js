import React, { useState } from 'react';
import getGitHubReadme from '@/lib/get/getGitHubContent';
import ChatCard from '@/components/ChatCard';
import { abortChat } from '@/lib/llm/chat';

const GitHubContent = ({ content }) => {
  const [showChatCard, setShowChatCard] = useState(false);
  const [readmeContent, setReadmeContent] = useState('');
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);

  const handleAISummary = async () => {
    if (isProcessing) {
      // 如果正在处理，则中断所有进程
      abortChat();
      setIsProcessing(false);
      setStatus('已中断');
      setShowChatCard(false);  // 隐藏 ChatCard
      return;
    }

    if (showChatCard) {
      // 如果对话框已存在，重置对话
      setShowChatCard(false);
      setReadmeContent('');
      setStatus('');
      return;
    }

    setIsProcessing(true);
    setStatus('获取README信息');
    try {
      const readme = await getGitHubReadme(content.link);
      setReadmeContent(readme);
      setStatus('正在提问');
      setShowChatCard(true);  // 显示 ChatCard
    } catch (error) {
      console.error('Error fetching README:', error);
      setStatus('获取失败');
      setIsProcessing(false);
      setShowChatCard(false);  // 出错时隐藏 ChatCard
    }
  };

  const handleChatComplete = () => {
    setStatus('回复完成');
    setIsProcessing(false);
  };

  return (
    <div className="github-content">
      <h3 className="text-lg font-semibold">{content.title}</h3>
      <p className="text-sm text-gray-600">{content.previewDescription}</p>
      {content.previewImage && (
        <img src={content.previewImage} alt={content.title} className="mt-2 max-w-full h-auto" />
      )}
      <div className="flex justify-between items-center mt-2">
        <a href={content.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-block">
          查看仓库
        </a>
        <div className="flex items-center">
          <label className="flex items-center mr-2">
            <input
              type="checkbox"
              checked={useWebSearch}
              onChange={(e) => setUseWebSearch(e.target.checked)}
              className="mr-1"
            />
            <span className="text-sm">联网搜索</span>
          </label>
          {status && <span className="text-sm text-gray-600 mr-2">{status}</span>}
          <button
            onClick={handleAISummary}
            className={`${
              isProcessing ? 'bg-red-500 hover:bg-red-600' : 
              showChatCard ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
            } text-white font-semibold py-1 px-2 rounded text-sm transition duration-300 ease-in-out`}
          >
            {isProcessing ? '停止' : showChatCard ? '重置对话' : 'AI总结'}
          </button>
        </div>
      </div>
      {showChatCard && (
        <div className="mt-4">
          <ChatCard 
            initialMessage={`请总结以下GitHub项目的README内容，尽可能用中文回复：\n\n${readmeContent}`} 
            onComplete={handleChatComplete}
            setStatus={setStatus}
            useWebSearch={useWebSearch}
          />
        </div>
      )}
    </div>
  );
};

export default GitHubContent;
