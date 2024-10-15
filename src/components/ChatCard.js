import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatWithGLM4, abortChat } from '@/lib/llm/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

const ChatCard = ({ initialMessage, onComplete, setStatus, useWebSearch }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const chatContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const initialMessageSentRef = useRef(false);
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

  const handleSendMessage = useCallback(async (message, isInitial = false) => {
    if (isLoading) {
      console.log('已有请求正在进行，请等待完成');
      return;
    }

    setIsLoading(true);
    setStatus('等待回复');
    setElapsedTime(0);
    const newMessages = isInitial ? [] : [...messages, { role: 'user', content: message }];
    if (!isInitial) {
      setMessages(newMessages);
    }
    setInputMessage('');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await chatWithGLM4([...newMessages, { role: 'user', content: message }], useWebSearch, null, false);
      
      if (response.choices && response.choices.length > 0 && response.choices[0].message) {
        const assistantMessage = response.choices[0].message.content;
        setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
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
      onComplete();
    }
  }, [messages, onComplete, setStatus, isLoading, useWebSearch]);

  useEffect(() => {
    if (initialMessage && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      handleSendMessage(initialMessage, true);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [handleSendMessage, initialMessage]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStatus('请求已中止');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-h-96 flex flex-col">
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
    </div>
  );
};

export default ChatCard;
