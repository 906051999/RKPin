import fs from 'fs/promises';
import path from 'path';
import parserFactory from './parserFactory';

const markdownLoader = async (category) => {
  const categoryPath = path.join(process.cwd(), 'data', category);
  
  try {
    const files = await fs.readdir(categoryPath);
    const mdFiles = files.filter(file => file.endsWith('.md'));

    const parser = parserFactory(category);

    const items = await Promise.all(
      mdFiles.map(async (file) => {
        const filePath = path.join(categoryPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsedData = await parser(content, file);
        return {
          ...parsedData,
          id: file.replace('.md', ''),
        };
      })
    );

    return items;
  } catch (error) {
    console.error(`Error loading markdown files from ${categoryPath}:`, error);
    return [];
  }
};

export default markdownLoader;