import React from 'react';
import MoreMenu from './MoreMenu';

export default function Header({
  totalMessages,
  isComplete,
  isLoading,
  handleRefresh,
  handleLoadMore,
  handleClearLocalStorage,
  isHorizontal,
  toggleChatBar,
  showChatBar,
  error,
  retryCount
}) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex-shrink-0">
          <a 
            href="https://github.com/906051999/rkpin" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-3xl font-bold text-gray-900 hover:text-blue-600 transition duration-300"
          >
            RKPin
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">加载消息 {totalMessages} 条</span>
          {error ? (
            <div className="text-red-500">
              错误: {error} {retryCount > 0 && `(重试中: ${retryCount}/3)`}
            </div>
          ) : isComplete ? (
            <button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              刷新内容
            </button>
          ) : (
            <button
              onClick={handleLoadMore}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? '加载中...' : '加载更多'}
            </button>
          )}
          <MoreMenu 
            handleClearLocalStorage={handleClearLocalStorage}
            isHorizontal={isHorizontal}
            toggleChatBar={toggleChatBar}
            showChatBar={showChatBar}
          />
        </div>
      </div>
    </header>
  );
}
