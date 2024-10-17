const MAX_CHANNELS = 5;

export const saveChannelData = (channelUrl, data) => {
  if (!isClientSide()) return;
  const channels = getChannelStack();
  const index = channels.indexOf(channelUrl);

  if (index !== -1) {
    channels.splice(index, 1);
  }

  channels.unshift(channelUrl);

  if (channels.length > MAX_CHANNELS) {
    const removedChannel = channels.pop();
    localStorage.removeItem(`channel_${removedChannel}`);
  }

  setChannelStack(channels);
  localStorage.setItem(`channel_${channelUrl}`, JSON.stringify(data));
};

export const getChannelData = (channelUrl) => {
  if (!isClientSide()) return null;
  return JSON.parse(localStorage.getItem(`channel_${channelUrl}`) || 'null');
};

export const clearChannelData = (channelUrl) => {
  if (!isClientSide()) return;
  localStorage.removeItem(`channel_${channelUrl}`);
};

export const getChannelStack = () => {
  if (!isClientSide()) return [];
  return JSON.parse(localStorage.getItem('channelStack') || '[]');
};

export const setChannelStack = (channels) => {
  if (!isClientSide()) return;
  localStorage.setItem('channelStack', JSON.stringify(channels));
};

export const getLastSelectedChannel = () => {
  if (!isClientSide()) return process.env.TELEGRAM_CHANNEL_URL;
  return localStorage.getItem('lastSelectedChannel') || process.env.TELEGRAM_CHANNEL_URL;
};

export const setLastSelectedChannel = (channelUrl) => {
  if (!isClientSide()) return;
  localStorage.setItem('lastSelectedChannel', channelUrl);
};

export const isClientSide = () => {
  return typeof window !== 'undefined';
};

export const initializeStorage = () => {
  if (!isClientSide()) return;
  if (!localStorage.getItem('channelStack')) {
    setChannelStack([]);
  }
  if (!localStorage.getItem('lastSelectedChannel')) {
    setLastSelectedChannel(process.env.TELEGRAM_CHANNEL_URL);
  }
};

export const getChatMessages = (uniqueId) => {
  if (!isClientSide()) return [];
  return JSON.parse(localStorage.getItem(`chat_${uniqueId}`) || '[]');
};

export const setChatMessages = (uniqueId, messages) => {
  if (!isClientSide()) return;
  localStorage.setItem(`chat_${uniqueId}`, JSON.stringify(messages));
};

export const clearChatMessages = (uniqueId) => {
  if (!isClientSide()) return;
  localStorage.removeItem(`chat_${uniqueId}`);
};
