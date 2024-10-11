import { useState } from 'react';

export default function DevStatus({ status, error, logs }) {
  const [showLogs, setShowLogs] = useState(false);

  return (
    <div className="mb-4">
      <div 
        className="p-4 bg-gray-100 rounded-lg cursor-pointer"
        onClick={() => setShowLogs(!showLogs)}
      >
        <h2 className="text-lg font-semibold mb-2">请求状态：</h2>
        <p>{status}</p>
        {error && <p className="text-red-500">错误：{error}</p>}
        <p className="text-sm text-gray-500 mt-2">
          {showLogs ? '点击隐藏调试日志' : '点击显示调试日志'}
        </p>
      </div>
      {showLogs && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">调试日志：</h2>
          <ul>
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}