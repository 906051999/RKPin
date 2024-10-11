'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('正在加载...');
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setStatus('开始请求频道内容...');
        const response = await fetch('/api/channel-content');
        if (!response.ok) {
          throw new Error(`HTTP 状态码: ${response.status}`);
        }
        const data = await response.json();
        setMessages(data.messages);
        setLogs(data.logs);
        setStatus('数据加载完成');
      } catch (err) {
        setError(err.message);
        setStatus('加载失败');
      }
    }
    fetchData();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">RKPin Channel Messages</h1>
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">请求状态：</h2>
        <p>{status}</p>
        {error && <p className="text-red-500">错误：{error}</p>}
      </div>
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">调试日志：</h2>
        <ul>
          {logs.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>
      <ul>
        {messages.map((message, index) => (
          <li key={index} className="mb-8 border p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">消息 {index + 1}</h3>
            <div className="mb-2">
              <strong>ID:</strong> {message.messageId}
            </div>
            <div className="mb-2">
              <strong>日期:</strong> {new Date(message.date).toLocaleString()}
            </div>
            <div className="mb-2">
              <strong>文本内容:</strong>
              <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">{message.text}</pre>
            </div>
            {message.html && (
              <div className="mb-2">
                <strong>HTML 内容:</strong>
                <div className="bg-gray-100 p-2 rounded" dangerouslySetInnerHTML={{ __html: message.html }} />
              </div>
            )}
            <div className="mb-2">
              <strong>原始数据:</strong>
              <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">{JSON.stringify(message, null, 2)}</pre>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
