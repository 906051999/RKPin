import fs from 'fs/promises';
import path from 'path';
import { getChannelContent } from './telegramPublic';

const jsonPath = path.join(process.cwd(), 'public', 'channel_content.json');

async function ensureFileExists() {
  try {
    await fs.access(jsonPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(jsonPath, '[]');
    } else {
      throw error;
    }
  }
}

export async function getMessageCount() {
  try {
    await ensureFileExists();
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.length;
  } catch (err) {
    console.error('Error reading message count:', err);
    return 0;
  }
}

export async function getMessageById(messageId) {
  try {
    await ensureFileExists();
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(fileContent);
    const message = data.find(msg => msg.messageId === messageId);
    
    if (!message) {
      // 如果消息不存在，触发获取新内容
      const newMessages = await getChannelContent(() => {}, messageId);
      if (newMessages.length > 0) {
        return newMessages.find(msg => msg.messageId === messageId);
      }
    }
    
    return message;
  } catch (err) {
    console.error('Error getting message by ID:', err);
    return null;
  }
}