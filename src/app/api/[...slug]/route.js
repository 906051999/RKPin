import { getChannelContent } from '@/lib/get/getChannelContent';
import fs from 'fs/promises';
import path from 'path';

const JSON_FILE_PATH = path.join(process.cwd(), 'public', 'parsed_content.json');

export async function GET(request, { params }) {
  const { slug } = params;
  const { searchParams } = new URL(request.url);
  const before = searchParams.get('before') || '';
  const updateStatus = (status) => console.log(status);

  // 新增获取总消息数的函数
  const getTotalMessages = async () => {
    try {
      const fileContent = await fs.readFile(JSON_FILE_PATH, 'utf-8');
      const parsedContent = JSON.parse(fileContent);
      return parsedContent.length;
    } catch (error) {
      console.error('Error reading file:', error);
      return 0;
    }
  };

  if (slug[0] === 'refresh') {
    await fs.unlink(JSON_FILE_PATH).catch(() => {});
    const refreshedContent = await getChannelContent(updateStatus);
    const totalMessages = await getTotalMessages();
    return Response.json({
      content: refreshedContent.content,
      isComplete: refreshedContent.isComplete,
      totalMessages
    });
  } else if (slug[0] === 'content') {
    try {
      const fileContent = await fs.readFile(JSON_FILE_PATH, 'utf-8');
      const parsedContent = JSON.parse(fileContent);
      
      if (before) {
        const { content: newContent, isComplete } = await getChannelContent(updateStatus, before);
        const totalMessages = await getTotalMessages();
        return Response.json({
          content: newContent,
          isComplete,
          totalMessages
        });
      }
      
      const totalMessages = await getTotalMessages();
      return Response.json({
        content: parsedContent,
        isComplete: parsedContent.some(msg => msg.messageId === '1'),
        totalMessages
      });
    } catch (error) {
      const { content: newContent, isComplete } = await getChannelContent(updateStatus);
      const totalMessages = newContent.length;
      return Response.json({
        content: newContent,
        isComplete,
        totalMessages
      });
    }
  } else if (slug[0] === 'total') {
    const totalMessages = await getTotalMessages();
    return Response.json({ totalMessages });
  }

  return Response.json({ error: 'Invalid route' }, { status: 400 });
}
