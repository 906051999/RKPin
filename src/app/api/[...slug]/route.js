import { getChannelContent } from '@/lib/get/getChannelContent';

export async function GET(request, { params }) {
  const { slug } = params;
  const { searchParams } = new URL(request.url);
  const before = searchParams.get('before') || '';
  const updateStatus = (status) => console.log(status);

  if (slug[0] === 'refresh' || slug[0] === 'content') {
    const { content: newContent, isComplete } = await getChannelContent(updateStatus, before);
    return Response.json({
      content: newContent,
      isComplete,
    });
  }

  return Response.json({ error: 'Invalid route' }, { status: 400 });
}
