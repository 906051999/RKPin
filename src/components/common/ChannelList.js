import React, { useState, useEffect, useContext, useRef } from 'react';
import { AppContext } from '@/context/AppContext';
import { getChannelStack, setChannelStack, getChannelData, isClientSide } from '@/utils/storageManager';
import DOMPurify from 'dompurify';

const ChannelList = ({ onClose }) => {
  const { channelUrl, selectChannel } = useContext(AppContext);
  const [channels, setChannels] = useState([]);
  const [newChannel, setNewChannel] = useState('');
  const [error, setError] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const newChannelRef = useRef(null);

  useEffect(() => {
    if (isClientSide()) {
      const storedChannels = getChannelStack();
      const channelsWithInfo = storedChannels.map(channel => {
        const data = getChannelData(channel);
        const author = data && data.length > 0 ? data[0].author : '';
        return { url: channel, author };
      });
      setChannels(channelsWithInfo);
    }
  }, []);

  const addChannel = () => {
    let formattedChannel = newChannel.trim();
    
    // 处理纯频道名称格式
    if (/^[a-zA-Z0-9_]+$/.test(formattedChannel)) {
      formattedChannel = `https://t.me/s/${formattedChannel}`;
    }
    
    // 处理不带 s/ 的链接
    if (formattedChannel.match(/^(https?:\/\/)?t\.me\/[a-zA-Z0-9_]+$/)) {
      formattedChannel = formattedChannel.replace(/^(https?:\/\/)?t\.me\//, 'https://t.me/s/');
    }

    // 处理带 s/ 的链接
    if (formattedChannel.match(/^(https?:\/\/)?t\.me\/s\/[a-zA-Z0-9_]+$/)) {
      formattedChannel = formattedChannel.replace(/^(https?:\/\/)?t\.me\//, 'https://t.me/');
    }

    // 最终验证
    if (!formattedChannel.match(/^https:\/\/t\.me\/s\/[a-zA-Z0-9_]+$/)) {
      setError('无效的频道链接。支持的格式：\n- https://t.me/s/ChannelName\n- https://t.me/ChannelName\n- ChannelName');
      return;
    }

    if (channels.some(channel => channel.url === formattedChannel)) {
      setError('该频道已存在于列表中。');
      return;
    }

    const updatedChannels = [{ url: formattedChannel, author: '' }, ...channels];
    setChannels(updatedChannels);
    if (isClientSide()) {
      setChannelStack(updatedChannels.map(channel => channel.url));
    }
    setNewChannel('');
    setError('');

    // 当频道数量达到 10 个时显示警告
    if (updatedChannels.length >= 10 && !showWarning) {
      setShowWarning(true);
    }

    // 使用 setTimeout 确保在 DOM 更新后滚动
    setTimeout(() => {
      if (newChannelRef.current) {
        newChannelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  };

  const handleSelectChannel = (channelUrl) => {
    selectChannel(channelUrl);
    onClose();
  };

  const removeChannel = (channelUrl) => {
    const updatedChannels = channels.filter(channel => channel.url !== channelUrl);
    setChannels(updatedChannels);
    if (isClientSide()) {
      setChannelStack(updatedChannels.map(channel => channel.url));
    }
  };

  const renderChannelInfo = (channel) => {
    return (
      <>
        {channel.author && (
          <div 
            className="text-gray-500"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(channel.author) }}
          />
        )}
        <div className="text-sm">{channel.url}</div>
      </>
    );
  };

  const isDefaultChannel = (url) => url === process.env.TELEGRAM_CHANNEL_URL;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">频道列表</h2>
        <div className="mb-4">
          <input
            type="text"
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            placeholder="输入新频道 URL"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={addChannel}
            className="mt-2 w-full bg-blue-500 text-white p-2 rounded"
          >
            添加频道
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {showWarning && (
            <p className="text-yellow-500 mt-2">
              警告：添加过多频道可能会影响性能。请谨慎添加。
            </p>
          )}
        </div>
        <ul className="max-h-60 overflow-y-auto">
          {channels.map((channel, index) => (
            <li
              key={index}
              ref={index === 0 ? newChannelRef : null}
              className={`cursor-pointer p-2 hover:bg-gray-100 rounded flex justify-between items-center ${
                channel.url === channelUrl ? 'bg-blue-100 border-l-4 border-blue-500' : ''
              }`}
            >
              <div onClick={() => handleSelectChannel(channel.url)} className="flex-grow">
                {renderChannelInfo(channel)}
              </div>
              {!isDefaultChannel(channel.url) && (
                <button
                  onClick={() => removeChannel(channel.url)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200 ml-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 text-black p-2 rounded"
        >
          关闭
        </button>
      </div>
    </div>
  );
};

export default ChannelList;
