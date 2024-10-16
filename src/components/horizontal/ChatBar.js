import { useState, useRef, useEffect, useCallback } from 'react';
import { chatWithGLM4, abortChat } from '@/lib/llm/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

export default function ChatBar() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const [systemMessage, setSystemMessage] = useState(`你是一名精通苏格拉底式方法的辅导员，旨在让我就我选择的主题进行深入而反思的对话。`);
  const readerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    setMessages([
      {
        role: 'system',
        content: systemMessage
      }
    ]);
  }, [systemMessage]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, currentAssistantMessage]);

  const handleDirectQuestion = async (retryMessage = null) => {
    const questionContent = typeof retryMessage === 'string' ? retryMessage : input;
    if (!questionContent || typeof questionContent !== 'string' || !questionContent.trim()) return;
    setIsLoading(true);
    setIsStreaming(true);
    const userMessage = { role: 'user', content: questionContent };
    setMessages(prev => [...prev, userMessage]);
    setCurrentAssistantMessage('');
    setInput('');

    try {
      const stream = await chatWithGLM4([...messages, userMessage], useWebSearch, null, true);
      const reader = stream.getReader();
      readerRef.current = reader;

      let fullMessage = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              if (fullMessage) {
                setMessages(prev => [...prev, { role: 'assistant', content: fullMessage }]);
                setCurrentAssistantMessage('');
              }
            } else {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0].delta.content || '';
                if (content) {
                  fullMessage += content;
                  setCurrentAssistantMessage(fullMessage);
                }
              } catch (error) {
                console.error('Error parsing JSON:', error);
              }
            }
          }
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Chat error:', error);
        setMessages(prev => [...prev, { role: 'system', content: '对话出错,请稍后再试。' }]);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleStopStreaming = () => {
    abortChat();
    setIsStreaming(false);
    setIsLoading(false);
    // 保留当前的流式传输内容
    if (currentAssistantMessage) {
      setMessages(prev => [...prev, { role: 'assistant', content: currentAssistantMessage }]);
      setCurrentAssistantMessage('');
    }
  };

  const handleRetry = (messageContent) => {
    handleDirectQuestion(messageContent);
  };

  const renderMessage = (msg, index) => {
    const label = msg.role === 'user' ? '用户' : msg.role === 'assistant' ? 'AI' : '系统';
    return (
      <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className={`inline-block p-3 rounded-lg ${
          msg.role === 'user' ? 'bg-blue-100' : 
          msg.role === 'assistant' ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
        {msg.role === 'user' && (
          <button
            onClick={() => handleRetry(msg.content)}
            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
          >
            重试
          </button>
        )}
      </div>
    );
  };

  const handleResetConversation = () => {
    if (isDebugMode) {
      setLogs([]);
    } else {
      setMessages([{ role: 'system', content: systemMessage }]);
      setCurrentAssistantMessage('');
      setInput('');
    }
  };

  const handleAISummary = async (readmeContent, repoTitle) => {
    setIsLoading(true);
    setIsStreaming(true);
    const userMessage = { 
      role: 'user', 
      content: `请总结以下GitHub项目的README内容，重点概括项目的主要功能、特性和用途：\n\n项目名称：${repoTitle}\n\nREADME内容：\n${readmeContent}` 
    };
    setMessages(prev => [...prev, userMessage]);
    setCurrentAssistantMessage('');
    setInput('');

    try {
      const stream = await chatWithGLM4([...messages, userMessage], false);
      const reader = stream.getReader();
      readerRef.current = reader;

      let fullMessage = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              if (fullMessage) {
                setMessages(prev => [...prev, { role: 'assistant', content: fullMessage }]);
                setCurrentAssistantMessage('');
              }
            } else {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0].delta.content || '';
                if (content) {
                  fullMessage += content;
                  setCurrentAssistantMessage(fullMessage);
                }
              } catch (error) {
                console.error('Error parsing JSON:', error);
              }
            }
          }
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Chat error:', error);
        setMessages(prev => [...prev, { role: 'system', content: '对话出错,请稍后再试。' }]);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // Add this function to handle logging
  const handleLog = useCallback((message) => {
    if (isDebugMode) {
      setLogs(prevLogs => [...prevLogs, { type: 'log', content: message }]);
    }
  }, [isDebugMode]);

  // Override console.log
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      handleLog(args.join(' '));
    };
    return () => {
      console.log = originalLog;
    };
  }, [handleLog]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">AI 助手</h2>
        <div className="flex items-center space-x-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isDebugMode}
              onChange={(e) => setIsDebugMode(e.target.checked)}
              className="mr-2"
            />
            调试模式
          </label>
          <button
            onClick={handleResetConversation}
            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-300"
          >
            {isDebugMode ? '清理日志' : '重置对话'}
          </button>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">系统消息</label>
        <textarea
          value={systemMessage}
          onChange={(e) => setSystemMessage(e.target.value)}
          className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
          rows="2"
        />
      </div>
      <div 
        ref={chatContainerRef} 
        className="h-[calc(100vh-400px)] min-h-[300px] overflow-y-auto mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50"
      >
        {messages.slice(1).map(renderMessage)}
        {currentAssistantMessage && renderMessage({ role: 'assistant', content: currentAssistantMessage }, messages.length)}
        {isLoading && <div className="text-center text-gray-500">正在思考...</div>}
        {/* Add this section to display logs */}
        {isDebugMode && logs.map((log, index) => (
          <div key={index} className="text-xs text-gray-500 mb-1">
            {log.content}
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow border border-gray-300 rounded-md p-2 text-sm"
          placeholder="输入你的问题..."
          disabled={isLoading}
        />
        {isStreaming ? (
          <button
            onClick={handleStopStreaming}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300"
          >
            停止
          </button>
        ) : (
          <button
            onClick={handleDirectQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 disabled:bg-blue-300"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? '处理中...' : '提问'}
          </button>
        )}
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={useWebSearch}
            onChange={(e) => setUseWebSearch(e.target.checked)}
            className="mr-2"
          />
          启用联网搜索
        </label>
      </div>
    </div>
  );
}
