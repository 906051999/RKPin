import { parseFile } from 'music-metadata';
import path from 'path';
import fs from 'fs/promises';
import { marked } from 'marked';

function parseLRC(lrcContent) {
  const lines = lrcContent.split('\n');
  return lines
    .map(line => {
      const match = line.match(/^\[(\d{2}:\d{2}\.\d{2})\](.*)/);
      if (match) {
        return {
          time: match[1],
          text: match[2].trim()
        };
      }
      return null;
    })
    .filter(line => line !== null);
}

export default async function musicParser(mdContent, fileName) {
  // 从文件名中提取艺术家和标题
  const [artist, title] = fileName.replace('.md', '').split(' - ');

  console.log(`Processing file: ${fileName}`);

  // 解析 Markdown 内容
  const sections = mdContent.split('\n## ');
  const pinContentSection = sections.find(s => s.startsWith('PinContent'));
  const pinContent = pinContentSection 
    ? pinContentSection.replace('PinContent\n', '').trim()
    : '';

  const pinTagsSection = sections.find(s => s.startsWith('PinTag'));
  const pinTags = pinTagsSection
    ? pinTagsSection.replace('PinTag\n', '').trim().split('\n').map(line => line.trim().replace('#', ''))
    : [];

  console.log('Parsed Markdown content:');
  console.log('PinContent:', pinContent.substring(0, 100) + '...'); // 只打印前100个字符
  console.log('PinTags:', pinTags);

  // 解析音乐文件元数据
  const musicFilePath = path.join(process.cwd(), 'public', 'music', `${artist} - ${title}.mp3`);
  
  try {
    console.log(`Attempting to parse music file: ${musicFilePath}`);
    const metadata = await parseFile(musicFilePath);

    console.log('Music metadata:');
    console.log('Artist:', metadata.common.artist);
    console.log('Title:', metadata.common.title);
    console.log('Album:', metadata.common.album);

    // 处理封面图片
    let coverUrl = null;
    const apicTag = metadata.native['ID3v2.3'].find(tag => tag.id === 'APIC');
    if (apicTag) {
      console.log('Cover image found in APIC tag');
      const imageBuffer = Buffer.from(apicTag.value.data);
      coverUrl = `data:${apicTag.value.format};base64,${imageBuffer.toString('base64')}`;
      console.log('Cover URL:', coverUrl.substring(0, 100) + '...'); // 只打印前100个字符，避免日志过长
    } else {
      console.log('No cover image found in metadata');
    }

    // 处理歌词
    const usltTag = metadata.native['ID3v2.3'].find(tag => tag.id === 'USLT');
    const lrcContent = usltTag ? usltTag.value.text : '';
    console.log('Lyrics found:', !!lrcContent);

    const processedLyrics = parseLRC(lrcContent);

    const result = {
      artist: metadata.common.artist || artist,
      title: metadata.common.title || title,
      album: metadata.common.album,
      coverUrl,
      pinContent,
      pinTags,
      lyrics: processedLyrics
    };

    console.log('Parsed result:', {
      ...result,
      coverUrl: result.coverUrl ? result.coverUrl.substring(0, 100) + '...' : null,
      lyrics: result.lyrics.slice(0, 3) // 只打印前3行歌词
    });

    return result;
  } catch (error) {
    console.error(`Error parsing music file: ${musicFilePath}`, error);
    return {
      artist,
      title,
      album: '',
      coverUrl: null,
      pinContent,
      pinTags,
      lyrics: []
    };
  }
}