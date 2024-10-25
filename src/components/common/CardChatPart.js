import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatWithGLM4, abortChat } from '@/lib/llm/chat';
import getGitHubReadme from '@/lib/get/getGitHubContent';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

const presetTagConfig = {
  GitHub: [
    { tag: '项目总结', prompt: '请对以下GitHub项目进行简要总结，包括其主要功能、技术特点和潜在应用场景：' },
    { tag: '技术分析', prompt: '请分析以下GitHub项目使用的主要技术栈，并评估其技术选型的优劣：' },
  ],
  Bilibili: [
    { tag: '视频摘要', prompt: '请为以下Bilibili视频内容提供一个简洁的摘要，包括主要话题和关键点：' },
    { tag: '观点评析', prompt: '请分析并评价以下Bilibili视频中表达的主要观点，指出其优点和可能的争议之处：' },
  ],
  Telegram: [
    { tag: '消息总结', prompt: '请总结以下Telegram消息的主要内容，提炼出核心信息：' },
    { tag: '话题分析', prompt: '请分析以下Telegram消息涉及的主要话题，并探讨其潜在的社会影响：' },
  ],
  Weixin: [
    { tag: '内容总结', prompt: '请对以下微信公众号文章进行简要总结，包括主要主题和关键信息：' },
    { tag: '观点分析', prompt: '请分析以下微信公众号文章中表达的主要观点，评估其可信度和潜在影响：' },
  ],
  'Weixin Official Accounts Platform': [
    { tag: '内容总结', prompt: '请对以下微信公众号文章进行简要总结，包括主要主题和关键信息：' },
    { tag: '观点分析', prompt: '请分析以下微信公众号文章中表达的主要观点，评估其可信度和潜在影响：' },
  ],
  Weibo: [
    { tag: '内容摘要', prompt: '请为以下微博内容提供一个简洁的摘要，包括主要话题和关键点：' },
    { tag: '话题评析', prompt: '请分析以下微博内容涉及的主要话题，并探讨其在社交媒体上的传播影响：' },
  ],
  Link: [
    { tag: '网站总结', prompt: '请对以下网站内容进行简要总结，包括主要功能和关键特点：' },
    { tag: '类型分析', prompt: '请分析该网站的类型和定位，评估其在相关领域的影响力和特色：' },
  ],
};

const ChatPart = ({ content, contentType, presetTags, messages, onUpdateMessages, onClearChat }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [status, setStatus] = useState('');
  const [useWebSearch, setUseWebSearch] = useState(false);
  const chatContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const startTimeRef = useRef(null);

  const updateElapsedTime = useCallback(() => {
    if (startTimeRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setElapsedTime(elapsed);
    }
  }, []);

  useEffect(() => {
    let intervalId;
    if (isLoading) {
      startTimeRef.current = Date.now();
      intervalId = setInterval(updateElapsedTime, 10); // 更新频率为10毫秒
    } else {
      startTimeRef.current = null;
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading, updateElapsedTime]);

  const handleSendMessage = useCallback(async (message) => {
    if (isLoading) {
      console.log('已有请求正在进行，请等待完成');
      return;
    }

    setIsLoading(true);
    setStatus('等待回复');
    setElapsedTime(0);
    const systemPrompt = { role: 'system', content: '你是一个智能助手，能够理解并回答各种问题。请尽可能提供准确、有帮助的回答。' };
    const newMessages = [systemPrompt, ...messages, { role: 'user', content: message }];
    onUpdateMessages(newMessages);
    setInputMessage('');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await chatWithGLM4(newMessages, useWebSearch, null, false);
      
      if (response.choices && response.choices.length > 0 && response.choices[0].message) {
        const assistantMessage = response.choices[0].message.content;
        const updatedMessages = [...newMessages, { role: 'assistant', content: assistantMessage }];
        onUpdateMessages(updatedMessages);
        setStatus('回复完成');
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('请求被中止');
        setStatus('请求被中止');
      } else {
        console.error('聊天错误:', error);
        setStatus('回复失败');
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, setStatus, isLoading, useWebSearch, onUpdateMessages]);

  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStatus('请求已中止');
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    onClearChat();
    setInputMessage('');
    setStatus('');
  };

  const handlePresetTag = async (tag) => {
    const config = presetTagConfig[contentType]?.find(item => item.tag === tag);
    if (!config) {
      console.error('未找到匹配的预设标签配置');
      return;
    }

    let message = config.prompt + '\n\n';

    switch (contentType) {
      case 'Link':
        message += `网站标题：${content.title}\n\n`;
        message += `网站描述：${content.previewDescription}\n\n`;
        message += `网站链接：${content.link}\n\n`;
        break;
      case 'GitHub':
        try {
          setStatus('正在获取 README...');
          const readme = await getGitHubReadme(content.link);
          message += `项目名称：${content.title}\n\n`;
          message += `项目描述：${content.previewDescription}\n\n`;
          message += `项目链接：${content.link}\n\n`;
          message += `README内容：\n${readme}\n`;
        } catch (error) {
          console.error('获取 README 失败:', error);
          message += `项目名称：${content.title}\n\n`;
          message += `项目描述：${content.previewDescription}\n\n`;
          message += `项目链接：${content.link}\n\n`;
          message += `注意：无法获取 README 内容，请基于可用信息进行分析。`;
        }
        break;
      case 'Bilibili':
        message += `视频标题：${content.title}\n`;
        message += `视频描述：${content.description}\n\n`;
        message += `视频链接：${content.link}\n\n`;
        message += `视频统计：${content.stats}\n\n`;
        message += `作者：${content.author}\n\n`;
        message += `作者描述：${content.authorDescription}\n\n`;
        break;
      case 'Telegram':
        message += `消息内容：${content.message}\n`;
        if (content.forwardFrom) {
          message += `转发自：${content.forwardFrom}\n\n`;
        }
        break;
      case 'Weixin':
      case 'Weixin Official Accounts Platform':
          message += `文章标题：${content.title}\n\n`;
          message += `文章链接：${content.link}\n\n`;
          message += `注意：无法获取完整文章内容，请基于可用信息进行分析。`;
        break;
      case 'Weibo':
        message += `微博标题：${content.title}\n\n`;
        if (content.previewDescription) {
          message += `微博内容：${content.previewDescription}\n\n`;
        }
        message += `微博链接：${content.link}\n\n`;
        break;
      default:
        message += `${JSON.stringify(content)}`;
    }

    handleSendMessage(message);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-h-96 flex flex-col">
      <div className="mb-2 flex flex-wrap justify-between items-center">
        <div>
          {presetTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => handlePresetTag(tag)}
              className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 mb-2 px-2.5 py-0.5 rounded"
            >
              {tag}
            </button>
          ))}
        </div>
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
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="bg-red-500 text-white px-2 py-1 rounded text-sm"
            >
              清空对话
            </button>
          )}
        </div>
      </div>
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <pre className={`language-${match[1]} p-2 rounded`}>
                        <code className={`language-${match[1]}`} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="text-center">
            AI已经思考了 {elapsedTime.toFixed(3)} 秒...
          </div>
        )}
      </div>
      <div className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage(inputMessage)}
          className="flex-grow border rounded-l-lg px-2 py-1"
          placeholder="输入消息..."
          disabled={isLoading}
        />
        {isLoading ? (
          <button
            onClick={handleAbort}
            className="bg-red-500 text-white px-4 py-1 rounded-r-lg"
          >
            停止
          </button>
        ) : (
          <button
            onClick={() => handleSendMessage(inputMessage)}
            className="bg-blue-500 text-white px-4 py-1 rounded-r-lg"
            disabled={isLoading}
          >
            发送
          </button>
        )}
      </div>
      {status && <div className="text-sm text-gray-600 mt-2">{status}</div>}
    </div>
  );
};

export default ChatPart;
