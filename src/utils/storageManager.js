const MAX_CHANNELS = 5;

export const saveChannelData = (channelUrl, data) => {
  const channels = JSON.parse(localStorage.getItem('channelStack') || '[]');
  const index = channels.indexOf(channelUrl);

  if (index !== -1) {
    channels.splice(index, 1);
  }

  channels.unshift(channelUrl);

  if (channels.length > MAX_CHANNELS) {
    const removedChannel = channels.pop();
    localStorage.removeItem(`channel_${removedChannel}`);
  }

  localStorage.setItem('channelStack', JSON.stringify(channels));
  localStorage.setItem(`channel_${channelUrl}`, JSON.stringify(data));
};

export const getChannelData = (channelUrl) => {
  return JSON.parse(localStorage.getItem(`channel_${channelUrl}`) || 'null');
};

export const clearChannelData = (channelUrl) => {
  localStorage.removeItem(`channel_${channelUrl}`);
};
