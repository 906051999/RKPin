'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import TimeLine from '../components/TimeLine';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const lastMessageElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMoreMessages();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchMessages = async (beforeId = null) => {
    try {
      const url = beforeId ? `/api/messages?beforeId=${beforeId}` : '/api/messages';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      return data.messages || [];
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  const fetchMoreMessages = async () => {
    setLoading(true);
    const oldestMessage = messages[messages.length - 1];
    const newMessages = await fetchMessages(oldestMessage?.messageId);
    if (newMessages.length === 0) {
      setHasMore(false);
    } else {
      setMessages(prevMessages => {
        const mergedMessages = [...prevMessages, ...newMessages];
        const uniqueMessages = Array.from(new Map(mergedMessages.map(item => [item.messageId, item])).values());
        return uniqueMessages.sort((a, b) => b.messageId - a.messageId);
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    async function initialFetch() {
      const initialMessages = await fetchMessages();
      setMessages(initialMessages.sort((a, b) => b.messageId - a.messageId));
      setLoading(false);
    }
    initialFetch();
  }, []);

  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">RKPin Channel Messages</h1>
      <TimeLine messages={messages} lastMessageRef={lastMessageElementRef} />
      {loading && <div className="text-center p-4">Loading more messages...</div>}
      {!hasMore && <div className="text-center p-4">No more messages to load</div>}
    </main>
  );
};
