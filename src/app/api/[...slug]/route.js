import { getChannelContent } from '../../../lib/telegramPublic';
import { NextResponse } from 'next/server';

export async function GET() {
  const logs = [];
  try {
    const messages = await getChannelContent((status) => {
      console.log(status);
      logs.push(status);
    });
    return NextResponse.json({ messages, logs });
  } catch (error) {
    return NextResponse.json({ error: error.message, logs }, { status: 500 });
  }
}