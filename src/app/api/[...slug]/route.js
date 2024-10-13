import { getChannelContent } from '@/lib/getChannelContent';
import fs from 'fs/promises';
import path from 'path';

const JSON_FILE_PATH = path.join(process.cwd(), 'public', 'parsed_content.json');

export async function GET(request, { params }) {
  const { slug } = params;
  const { searchParams } = new URL(request.url);
  const before = searchParams.get('before') || '';
  const updateStatus = (status) => console.log(status);

  if (slug[0] === 'refresh') {
    await fs.unlink(JSON_FILE_PATH).catch(() => {});
    const refreshedContent = await getChannelContent(updateStatus);
    return Response.json({
      content: refreshedContent.content,
      isComplete: refreshedContent.isComplete,
      totalMessages: refreshedContent.content.length
    });
  } else if (slug[0] === 'content') {
    try {
      const fileContent = await fs.readFile(JSON_FILE_PATH, 'utf-8');
      const parsedContent = JSON.parse(fileContent);
      
      if (before) {
        const { content: newContent, isComplete } = await getChannelContent(updateStatus, before);
        return Response.json({
          content: newContent,
          isComplete,
          totalMessages: parsedContent.length
        });
      }
      
      return Response.json({
        content: parsedContent,
        isComplete: parsedContent.some(msg => msg.messageId === '1'),
        totalMessages: parsedContent.length
      });
    } catch (error) {
      const { content: newContent, isComplete } = await getChannelContent(updateStatus);
      return Response.json({
        content: newContent,
        isComplete,
        totalMessages: newContent.length
      });
    }
  }

  return Response.json({ error: 'Invalid route' }, { status: 400 });
}
