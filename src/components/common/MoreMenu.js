import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import ChannelList from './ChannelList';

export default function MoreMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showChannelList, setShowChannelList] = useState(false);
  const menuRef = useRef(null);
  const { handleClearLocalStorage } = useContext(AppContext);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => {
                handleClearLocalStorage();
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              清除缓存
            </button>
            <button
              onClick={() => {
                setShowChannelList(true);
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              频道列表
            </button>
          </div>
        </div>
      )}
      {showChannelList && (
        <ChannelList onClose={() => setShowChannelList(false)} />
      )}
    </div>
  );
}
