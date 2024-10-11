import { getChannelContent } from '../../../lib/telegramPublic';
import { getMessageCount, getMessageById } from '../../../lib/dataParser';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const beforeId = searchParams.get('beforeId');
  const messageId = searchParams.get('messageId');
  const logs = [];

  try {
    if (messageId) {
      // 获取特定消息
      const message = await getMessageById(messageId);
      if (message) {
        return NextResponse.json(message);
      } else {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }
    } else {
      // 获取所有消息或特定 ID 之前的消息
      const messages = await getChannelContent((status) => {
        console.log(status);
        logs.push(status);
      }, beforeId);
      return NextResponse.json({ messages, logs });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: error.message, logs }, { status: 500 });
  }
}