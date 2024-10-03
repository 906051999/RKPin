import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import markdownLoader from '@/lib/markdownLoader';

export async function GET(request, { params }) {
  const { slug } = params;

  if (slug[0] === 'categories') {
    const dataPath = path.join(process.cwd(), 'data');
    const categories = fs.readdirSync(dataPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        const categoryPath = path.join(dataPath, dirent.name);
        const fileCount = fs.readdirSync(categoryPath).filter(file => file.endsWith('.md')).length;
        return { name: dirent.name, count: fileCount };
      });

    return NextResponse.json(categories);
  } else {
    // 处理获取特定类别数据的请求
    const category = slug[0];

    try {
      const data = await markdownLoader(category);
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}